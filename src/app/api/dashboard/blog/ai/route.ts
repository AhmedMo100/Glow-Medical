// app/api/dashboard/blog/ai/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords, tone = 'professional', sections = 4, targetLength = 'medium' } = await req.json()

    if (!topic?.trim())
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })

    const wordTarget = targetLength === 'short' ? 500 : targetLength === 'long' ? 1200 : 800

    const prompt = `Write a professional medical blog article in English for an aesthetic clinic.

Topic: ${topic}
Tone: ${tone}
Target word count: ~${wordTarget} words across ${sections} sections
${keywords ? `Keywords to include: ${keywords}` : ''}

Return ONLY valid JSON (no markdown, no backticks, no explanation) with this exact structure:
{
  "title": "clear English title",
  "slug": "url-slug-latin-only",
  "excerpt": "2-3 sentence English summary",
  "content": "full article text in English",
  "seoTitle": "max 60 chars",
  "seoDescription": "max 160 chars",
  "tags": ["tag1", "tag2", "tag3"],
  "readTime": 5,
  "author": "Glow Medical Team",
  "sections": [
    { "heading": "Section Heading", "body": "Section paragraph text in English, no markdown." }
  ]
}`

    const completion = await groq.chat.completions.create({
      model      : 'llama-3.3-70b-versatile',
      messages   : [
        { role: 'system', content: 'You are a professional medical content writer. Always write in English. Return only valid JSON, no markdown or code fences.' },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.7,
      max_tokens : 4000,
    })

    const raw = completion.choices?.[0]?.message?.content ?? ''

    let parsed
    try {
      const clean = raw.replace(/```json|```/g, '').trim()
      parsed = JSON.parse(clean)
    } catch {
      console.error('[blog AI] Bad JSON:', raw.slice(0, 200))
      return NextResponse.json({ error: 'AI returned invalid JSON — please try again.' }, { status: 500 })
    }

    return NextResponse.json({ generated: parsed })
  } catch (err) {
    console.error('[blog AI POST]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
