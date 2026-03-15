// app/api/dashboard/whatsapp/cron/route.ts
// ─────────────────────────────────────────────────────────────────
// Called by a cron job (Vercel Cron / external cron) every ~15 min
// Sends WhatsApp reminders for appointments in the next 2 hours
//
// Setup in vercel.json:
// {
//   "crons": [{ "path": "/api/dashboard/whatsapp/cron", "schedule": "*/15 * * * *" }]
// }
//
// Or call from external cron with:
// GET /api/dashboard/whatsapp/cron?secret=YOUR_CRON_SECRET
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)
const FROM          = process.env.TWILIO_WHATSAPP_FROM!
const CRON_SECRET   = process.env.CRON_SECRET ?? 'glow-cron-secret-2025'
const REMINDER_MIN  = 120 // Send reminder 120 minutes (2 hours) before

function fillTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export async function GET(req: NextRequest) {
  // Auth check
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret') ?? req.headers.get('x-cron-secret')
  if (secret !== CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find the APPOINTMENT_REMINDER template that sends 120 min before (or closest)
    const reminderTemplate = await prisma.whatsAppTemplate.findFirst({
      where: { type: 'APPOINTMENT_REMINDER', isActive: true },
      orderBy: { sendBefore: 'asc' },
    })

    if (!reminderTemplate) {
      return NextResponse.json({ message: 'No active reminder template found', sent: 0 })
    }

    const minutesBefore = reminderTemplate.sendBefore ?? REMINDER_MIN

    // Window: appointments in [now + minutesBefore - 10, now + minutesBefore + 10]
    // 10-minute window to account for cron drift
    const now      = new Date()
    const windowMs = minutesBefore * 60 * 1000
    const margin   = 10 * 60 * 1000
    const rangeMin = new Date(now.getTime() + windowMs - margin)
    const rangeMax = new Date(now.getTime() + windowMs + margin)

    // Get upcoming confirmed/pending appointments in the window
    const appointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: rangeMin, lte: rangeMax },
        status         : { in: ['PENDING', 'CONFIRMED'] },
        // Exclude already-reminded appointments
        whatsappLogs   : {
          none: {
            templateId: reminderTemplate.id,
            sentAt    : { gte: new Date(now.getTime() - 60 * 60 * 1000) }, // not in last 1h
          },
        },
      },
      include: {
        patient: { select: { fullName: true, phone: true } },
        staff  : { select: { name: true, specialization: true } },
        services: { include: { service: { select: { name: true } } } },
      },
    })

    console.log(`[whatsapp-cron] Found ${appointments.length} appointments to remind`)

    const results = []

    for (const appt of appointments) {
      const phone    = appt.patient?.phone ?? appt.tempPatientPhone
      const name     = appt.patient?.fullName ?? appt.tempPatientName ?? 'عزيزنا المريض'
      const services = appt.services.map(s => s.service.name).join('، ')
      const doctor   = appt.staff?.name ?? 'الطاقم الطبي'

      if (!phone) {
        results.push({ appointmentId: appt.id, status: 'SKIPPED', reason: 'No phone' })
        continue
      }

      const vars: Record<string, string> = {
        name    : name,
        date    : formatDate(appt.appointmentDate),
        time    : formatTime(appt.appointmentDate),
        service : services || 'الخدمة المحددة',
        doctor  : doctor,
        clinic  : 'Glow Medical',
        phone   : '01000000000', // clinic phone
      }

      const messageBody = fillTemplate(reminderTemplate.bodyAr, vars)

      // Normalize phone
      let normalizedPhone = phone
      if (!normalizedPhone.startsWith('whatsapp:')) {
        normalizedPhone = `whatsapp:${normalizedPhone.startsWith('+') ? normalizedPhone : '+2' + normalizedPhone}`
      }

      let twilioSid: string | null = null
      let sendStatus: 'SENT' | 'FAILED' = 'SENT'
      let errorMessage: string | null   = null

      try {
        const msg = await twilioClient.messages.create({
          from: FROM,
          to  : normalizedPhone,
          body: messageBody,
        })
        twilioSid = msg.sid
        console.log(`[whatsapp-cron] Sent to ${normalizedPhone}: ${twilioSid}`)
      } catch (err: any) {
        sendStatus   = 'FAILED'
        errorMessage = err?.message ?? 'Twilio error'
        console.error(`[whatsapp-cron] Failed to send to ${normalizedPhone}:`, err)
      }

      // Log the attempt
      await prisma.whatsAppLog.create({
        data: {
          templateId   : reminderTemplate.id,
          toPhone      : normalizedPhone,
          toName       : name,
          body         : messageBody,
          status       : sendStatus,
          twilioSid,
          errorMessage,
          appointmentId: appt.id,
        },
      })

      results.push({
        appointmentId: appt.id,
        patient      : name,
        phone        : normalizedPhone,
        status       : sendStatus,
        twilioSid,
        errorMessage,
      })
    }

    const sent   = results.filter(r => r.status === 'SENT').length
    const failed = results.filter(r => r.status === 'FAILED').length

    return NextResponse.json({
      message  : `Cron completed — ${sent} sent, ${failed} failed`,
      sent,
      failed,
      skipped  : results.filter(r => r.status === 'SKIPPED').length,
      results,
      rangeMin : rangeMin.toISOString(),
      rangeMax : rangeMax.toISOString(),
    })
  } catch (err: any) {
    console.error('[whatsapp-cron]', err)
    return NextResponse.json({ error: err?.message ?? 'Cron failed' }, { status: 500 })
  }
}
