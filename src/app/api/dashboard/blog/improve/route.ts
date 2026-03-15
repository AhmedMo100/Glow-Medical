// app/api/dashboard/blog/ai/improve/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { content, instruction } = await req.json()

    if (!content?.trim() || !instruction?.trim())
      return NextResponse.json({ error: 'content and instruction required' }, { status: 400 })

    const completion = await groq.chat.completions.create({
      model      : 'llama-3.3-70b-versatile',
      messages   : [
        { role: 'system', content: 'You are a professional medical content editor. Improve the given English text according to the instruction. Return ONLY the improved text, no explanations, no markdown.' },
        { role: 'user',   content: `Instruction: ${instruction}\n\nText:\n${content}` },
      ],
      temperature: 0.6,
      max_tokens : 2000,
    })

    const improved = completion.choices?.[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ improved })
  } catch (err) {
    console.error('[blog AI improve]', err)
    return NextResponse.json({ error: 'Improve failed' }, { status: 500 })
  }
}
