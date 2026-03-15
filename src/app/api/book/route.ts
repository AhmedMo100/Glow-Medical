// app/api/book/route.ts
// PUBLIC — no auth required
//
// DUPLICATE RULES (strict):
//   • Phone already has PENDING/CONFIRMED/IN_PROGRESS  → 409 duplicate
//   • Email already has PENDING/CONFIRMED/IN_PROGRESS  → 409 duplicate
//   • Phone exists AND status is COMPLETED/CANCELLED   → allow (new booking)
//
// On success:
//   1. Upsert patient  (by phone — same as dashboard auto-create)
//   2. Create Appointment + AppointmentService[] + AppointmentOffer[]
//   3. Increment offer usageCounts
//   4. Create AdminNotification
//   5. Send WhatsApp via Twilio → log to whatsapp_logs

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import twilio from 'twilio'
import { AppointmentStatus } from '@/generated/prisma'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
)
const TWILIO_FROM = process.env.TWILIO_WHATSAPP_FROM! // whatsapp:+14155238886

// ── Utilities ──────────────────────────────────────────────
function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`)
}

function normalizeWA(phone: string): string {
  const p = phone.trim().replace(/\s/g, '')
  if (p.startsWith('whatsapp:')) return p
  if (p.startsWith('+'))         return `whatsapp:${p}`
  if (p.startsWith('00'))        return `whatsapp:+${p.slice(2)}`
  if (p.startsWith('0'))         return `whatsapp:+2${p}`  // Egyptian 0xxx → +20xxx
  return `whatsapp:+2${p}`
}

function dateLong(d: Date) {
  return d.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

function timeShort(d: Date) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const ACTIVE_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS']

// ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName,    // string  required
      phone,       // string  required
      email,       // string  optional
      gender,      // string  optional
      date,        // YYYY-MM-DD  required
      time,        // HH:MM       required
      serviceIds,  // number[]
      offerIds,    // number[]
      notes,       // string  optional
    } = body

    // ── 1. Validate ────────────────────────────────────────
    if (!fullName?.trim())
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    if (!phone?.trim())
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
    if (!date || !time)
      return NextResponse.json({ error: 'Date and time are required.' }, { status: 400 })
    if (!serviceIds?.length && !offerIds?.length)
      return NextResponse.json({ error: 'Please select at least one service or offer.' }, { status: 400 })

    // ── 2. Duplicate check — PHONE ─────────────────────────
    const patientByPhone = await prisma.patient.findUnique({
      where  : { phone: phone.trim() },
      include: {
        appointments: {
          where  : { status: { in: ACTIVE_STATUSES } },
          orderBy: { appointmentDate: 'asc' },
          take   : 1,
          select : { id: true, appointmentDate: true, status: true },
        },
      },
    })

    if (patientByPhone?.appointments.length) {
      const appt = patientByPhone.appointments[0]
      return NextResponse.json({
        error      : 'duplicate_phone',
        message    : `This phone number already has an active appointment (${appt.status.toLowerCase()}) on ${dateLong(new Date(appt.appointmentDate))} at ${timeShort(new Date(appt.appointmentDate))}. Please wait until it is completed or cancelled before booking again.`,
        appointment: { id: appt.id, date: appt.appointmentDate, status: appt.status },
      }, { status: 409 })
    }

    // ── 3. Duplicate check — EMAIL ─────────────────────────
    if (email?.trim()) {
      const patientByEmail = await prisma.patient.findFirst({
        where  : { email: email.trim() },
        include: {
          appointments: {
            where  : { status: { in: ACTIVE_STATUSES } },
            orderBy: { appointmentDate: 'asc' },
            take   : 1,
            select : { id: true, appointmentDate: true, status: true },
          },
        },
      })

      if (patientByEmail?.appointments.length) {
        const appt = patientByEmail.appointments[0]
        return NextResponse.json({
          error      : 'duplicate_email',
          message    : `This email address is already registered with an active appointment (${appt.status.toLowerCase()}) on ${dateLong(new Date(appt.appointmentDate))} at ${timeShort(new Date(appt.appointmentDate))}.`,
          appointment: { id: appt.id, date: appt.appointmentDate, status: appt.status },
        }, { status: 409 })
      }
    }

    // ── 4. Build appointment datetime ──────────────────────
    const [yr, mo, dy] = date.split('-').map(Number)
    const [hr, mn]     = time.split(':').map(Number)
    const appointmentDate = new Date(yr, mo - 1, dy, hr, mn, 0)

    if (appointmentDate < new Date())
      return NextResponse.json({ error: 'Cannot book an appointment in the past.' }, { status: 400 })

    // ── 5. Race-condition slot guard ───────────────────────
    const windowStart = new Date(appointmentDate.getTime() -  5 * 60_000)
    const windowEnd   = new Date(appointmentDate.getTime() + 30 * 60_000)
    const slotTaken   = await prisma.appointment.findFirst({
      where: {
        appointmentDate: { gte: windowStart, lte: windowEnd },
        status         : { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    })
    if (slotTaken)
      return NextResponse.json({
        error  : 'slot_taken',
        message: 'This time slot was just booked by someone else. Please select a different time.',
      }, { status: 409 })

    // ── 6. Fetch services & offers ─────────────────────────
    const [services, offers] = await Promise.all([
      serviceIds?.length
        ? prisma.service.findMany({
            where : { id: { in: serviceIds }, isActive: true },
            select: { id: true, name: true, price: true, discountedPrice: true, duration: true },
          })
        : Promise.resolve([]),

      offerIds?.length
        ? prisma.offer.findMany({
            where: {
              id      : { in: offerIds },
              isActive: true,
              AND: [
                { OR: [{ validFrom:  null }, { validFrom:  { lte: new Date() } }] },
                { OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }] },
              ],
            },
            select: { id: true, title: true, finalPrice: true },
          })
        : Promise.resolve([]),
    ])

    // ── 7. Totals ──────────────────────────────────────────
    const totalAmount = [
      ...services.map(s => Number(s.discountedPrice ?? s.price)),
      ...offers.map(o => Number(o.finalPrice)),
    ].reduce((a, b) => a + b, 0)

    const totalDuration =
      services.reduce((s, sv) => s + (sv.duration ?? 30), 0) +
      offers.length * 30

    // ── 8. Upsert patient ──────────────────────────────────
    const patient = await prisma.patient.upsert({
      where : { phone: phone.trim() },
      create: {
        fullName      : fullName.trim(),
        phone         : phone.trim(),
        email         : email?.trim() || null,
        gender        : gender        || null,
        isAutoCreated : true,
        referralSource: 'WEBSITE',
        status        : 'ACTIVE',
      },
      update: {
        // Only fill blanks — never overwrite existing data
        ...(email && !patientByPhone?.email && { email: email.trim() }),
      },
    })

    // ── 9. Create appointment ──────────────────────────────
    const appointment = await prisma.appointment.create({
      data: {
        source          : 'WEBSITE',
        status          : 'PENDING',
        paymentStatus   : 'UNPAID',
        appointmentDate,
        durationMinutes : totalDuration || null,
        notes           : notes?.trim() || null,
        totalAmount,
        paidAmount      : 0,
        patientId       : patient.id,
        tempPatientName : null,
        tempPatientPhone: null,

        services: services.length
          ? { create: services.map(s => ({ serviceId: s.id, priceAtTime: Number(s.discountedPrice ?? s.price) })) }
          : undefined,

        offers: offers.length
          ? { create: offers.map(o => ({ offerId: o.id, priceAtTime: Number(o.finalPrice) })) }
          : undefined,
      },
      include: {
        patient : { select: { fullName: true, phone: true } },
        services: { include: { service: { select: { name: true } } } },
        offers  : { include: { offer:   { select: { title: true } } } },
      },
    })

    // ── 10. Increment offer usage ──────────────────────────
    if (offers.length)
      await prisma.offer.updateMany({
        where: { id: { in: offers.map(o => o.id) } },
        data : { usageCount: { increment: 1 } },
      })

    // ── 11. Admin notification ─────────────────────────────
    const itemNames = [
      ...appointment.services.map(s => s.service.name),
      ...appointment.offers.map(o => o.offer.title),
    ].join(', ')

    await prisma.adminNotification.create({
      data: {
        type    : 'new_appointment',
        title   : `New Appointment — ${patient.fullName}`,
        body    : `${itemNames} · ${dateLong(appointmentDate)} at ${timeShort(appointmentDate)}`,
        href    : '/dashboard/appointments',
        icon    : 'CalendarDays',
        isUrgent: false,
        meta    : { appointmentId: appointment.id, patientId: patient.id },
      },
    })

    // ── 12. WhatsApp confirmation ──────────────────────────
    let waStatus : 'SENT' | 'FAILED' | 'SKIPPED' = 'SKIPPED'
    let twilioSid: string | null = null
    let waError  : string | null = null

    try {
      const template = await prisma.whatsAppTemplate.findFirst({
        where: { type: 'APPOINTMENT_CONFIRMATION', isActive: true },
      })

      const vars: Record<string, string> = {
        name   : patient.fullName,
        date   : dateLong(appointmentDate),
        time   : timeShort(appointmentDate),
        service: itemNames || 'Selected service',
        clinic : 'Glow Medical',
        total  : `EGP ${totalAmount.toLocaleString('en-EG')}`,
      }

      const msgBody = template
        ? fillTemplate(template.bodyEn, vars)
        : `Hello ${vars.name} 🌟\n\nYour appointment at *Glow Medical* has been confirmed ✅\n\n📅 ${vars.date}\n⏰ ${vars.time}\n💆 ${vars.service}\n💰 Total: ${vars.total}\n\nWe'll reach out shortly to confirm your slot. Thank you for choosing Glow Medical! 💛`

      const msg = await twilioClient.messages.create({
        from: TWILIO_FROM,
        to  : normalizeWA(patient.phone),
        body: msgBody,
      })
      twilioSid = msg.sid
      waStatus  = 'SENT'

      await prisma.whatsAppLog.create({
        data: {
          templateId   : template?.id ?? null,
          toPhone      : normalizeWA(patient.phone),
          toName       : patient.fullName,
          body         : msgBody,
          status       : 'SENT',
          twilioSid,
          appointmentId: appointment.id,
        },
      })
    } catch (e: any) {
      waError  = e?.message ?? 'Twilio error'
      waStatus = 'FAILED'
      console.error('[/api/book] WhatsApp error:', e)
      await prisma.whatsAppLog.create({
        data: {
          toPhone      : normalizeWA(patient.phone),
          toName       : patient.fullName,
          body         : '— send failed —',
          status       : 'FAILED',
          errorMessage : waError,
          appointmentId: appointment.id,
        },
      }).catch(() => {})
    }

    // ── 13. Return ─────────────────────────────────────────
    return NextResponse.json({
      success    : true,
      appointment: {
        id           : appointment.id,
        date         : appointmentDate.toISOString(),
        dateFormatted: dateLong(appointmentDate),
        timeFormatted: timeShort(appointmentDate),
        services     : appointment.services.map(s => s.service.name),
        offers       : appointment.offers.map(o => o.offer.title),
        totalAmount,
        status       : appointment.status,
      },
      patient : { id: patient.id, name: patient.fullName, phone: patient.phone },
      whatsapp: { status: waStatus, twilioSid, error: waError },
    }, { status: 201 })

  } catch (err: any) {
    console.error('[/api/book POST]', err)
    return NextResponse.json({ error: err?.message ?? 'Booking failed.' }, { status: 500 })
  }
}
