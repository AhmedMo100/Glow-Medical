// src/lib/twilio.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
)

const FROM = process.env.TWILIO_WHATSAPP_FROM! // "whatsapp:+14155238886"

export async function sendWhatsApp(
  to      : string,   // "01XXXXXXXXX" or "+201XXXXXXXXX"
  body    : string,
): Promise<{ sid: string }> {
  // Normalize Egyptian number → whatsapp:+20XXXXXXXXXX
  const normalized = normalizePhone(to)

  const msg = await client.messages.create({
    from: FROM,
    to  : `whatsapp:${normalized}`,
    body,
  })

  return { sid: msg.sid }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0') && digits.length === 11) return `+2${digits}`
  if (digits.startsWith('20') && digits.length === 12) return `+${digits}`
  if (digits.startsWith('+')) return phone
  return `+${digits}`
}

export function fillTemplate(body: string, variables: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`)
}
