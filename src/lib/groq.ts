// src/lib/groq.ts
// Groq API wrapper using fetch (no SDK needed)

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL    = 'llama-3.3-70b-versatile'

export async function groqChat(
  systemPrompt : string,
  userMessage  : string,
  maxTokens    : number = 3000,
): Promise<string> {
  const res = await fetch(GROQ_API, {
    method : 'POST',
    headers: {
      'Content-Type' : 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model      : MODEL,
      max_tokens : maxTokens,
      messages   : [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
