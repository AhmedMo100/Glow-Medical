// app/api/dashboard/whatsapp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)
const FROM = process.env.TWILIO_WHATSAPP_FROM! // whatsapp:+14155238886

/* ── Variable substitution ──────────────────────────────── */
function fillTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

/* ── POST: Send single message ──────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      templateId,   // optional — if provided, use template body
      toPhone,      // required — patient phone (e.g. "+201001234567")
      toName,       // optional — patient name
      customBody,   // optional — override body
      language,     // 'ar' | 'en' — default 'ar'
      variables,    // Record<string, string> — substitution variables
      appointmentId,
    } = body

    if (!toPhone) return NextResponse.json({ error: 'toPhone required' }, { status: 400 })

    let messageBody = customBody

    // Use template if provided
    if (templateId && !customBody) {
      const template = await prisma.whatsAppTemplate.findUnique({ where: { id: Number(templateId) } })
      if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      const raw = language === 'en' ? template.bodyEn : template.bodyAr
      messageBody   = fillTemplate(raw, variables ?? {})
    }

    if (!messageBody?.trim()) return NextResponse.json({ error: 'No message body' }, { status: 400 })

    // Normalize phone — Twilio needs whatsapp:+XXXXXXXXXXX
    const normalizedPhone = toPhone.startsWith('whatsapp:') ? toPhone : `whatsapp:${toPhone.startsWith('+') ? toPhone : '+2' + toPhone}`

    let twilioSid: string | null = null
    let status: 'SENT' | 'FAILED' = 'SENT'
    let errorMessage: string | null = null

    try {
      const msg = await twilioClient.messages.create({
        from: FROM,
        to  : normalizedPhone,
        body: messageBody,
      })
      twilioSid = msg.sid
    } catch (twilioErr: any) {
      status       = 'FAILED'
      errorMessage = twilioErr?.message ?? 'Twilio error'
      console.error('[whatsapp send] Twilio error:', twilioErr)
    }

    // Log regardless of success/failure
    const log = await prisma.whatsAppLog.create({
      data: {
        templateId   : templateId    ? Number(templateId) : null,
        toPhone      : normalizedPhone,
        toName       : toName         || null,
        body         : messageBody,
        status,
        twilioSid,
        errorMessage,
        appointmentId: appointmentId ? Number(appointmentId) : null,
      },
    })

    if (status === 'FAILED') {
      return NextResponse.json({ error: errorMessage, log }, { status: 502 })
    }

    return NextResponse.json({ success: true, twilioSid, log })
  } catch (err: any) {
    console.error('[whatsapp send]', err)
    return NextResponse.json({ error: err?.message ?? 'Failed' }, { status: 500 })
  }
}
