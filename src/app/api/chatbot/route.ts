import Groq from 'groq-sdk'
import { NextRequest } from 'next/server'

if (!process.env.GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is not set in .env')
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const REDIRECT_TRIGGERS = [
  'book', 'appointment', 'price', 'cost', 'how much', 'available',
  'schedule', 'consult', 'visit', 'treatment plan', 'suitable for me',
  'can i get', 'الحجز', 'موعد', 'سعر', 'تكلفة', 'كام', 'متاح', 'مناسب',
]

const SYSTEM_PROMPT = `You are Glow Assistant — the friendly AI advisor for Glow Medical Clinic, a premium aesthetic and dermatology clinic.

YOUR ROLE:
- Answer questions about aesthetic treatments, skincare, and dermatology
- Give general skincare advice and tips
- Guide users toward the clinic for personalised consultations

TOPICS YOU COVER:
Laser treatments, Botox, dermal fillers, chemical peels, microneedling, body contouring, skincare routines, acne treatment, hyperpigmentation, anti-aging, sun protection, PRP therapy.

RULES:
1. Never give specific medical diagnoses
2. Never quote exact prices — always direct to clinic
3. Always recommend professional consultation for personalised advice
4. For serious medical conditions — recommend seeing a doctor immediately
5. Keep responses concise — 2-4 paragraphs max
6. Respond in the SAME LANGUAGE the user writes in (Arabic or English)

CLINIC CONTACT INFO:
- WhatsApp: +20 100 000 0000
- Phone: +20 100 000 0000
- Email: hello@glowmedical.com
- Book online: /contact#book
- Working hours: Sat-Thu 10am-9pm, Friday closed

When user asks about booking, pricing, suitability, or needs a personalised plan — warmly redirect them to the clinic.`

function sse(data: object): string {
  return 'data: ' + JSON.stringify(data) + '\n\n'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages = [] } = body

    if (!messages.length) {
      return Response.json({ error: 'Messages required' }, { status: 400 })
    }

    const lastMsg: string = messages.at(-1)?.content?.toLowerCase() ?? ''
    const shouldRedirect = REDIRECT_TRIGGERS.some(t => lastMsg.includes(t))

    const chatMessages = [
      {
        role: 'system' as const,
        content: shouldRedirect
          ? SYSTEM_PROMPT + '\n\nNOTE: After your answer, warmly suggest the user contact the clinic.'
          : SYSTEM_PROMPT,
      },
      ...messages.slice(-20).map((m: { role: string; content: string }) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const stream = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      messages:    chatMessages,
      max_tokens:  1024,
      temperature: 0.8,
      stream:      true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              controller.enqueue(encoder.encode(sse({ text })))
            }
          }
          if (shouldRedirect) {
            controller.enqueue(encoder.encode(sse({ redirect: true })))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  } catch (err: any) {
    console.error('Chatbot error:', err)
    return Response.json(
      { error: err?.message ?? 'Failed to get response' },
      { status: 500 }
    )
  }
}
