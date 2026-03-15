// src/lib/api.ts
import { NextRequest, NextResponse } from 'next/server'

export const ok        = (data: unknown, status = 200) => NextResponse.json(data, { status })
export const err       = (message: string, status = 400) => NextResponse.json({ error: message }, { status })
export const notFound  = (msg = 'Not found') => err(msg, 404)
export const serverErr = (e: unknown) => {
  console.error(e)
  return err('Internal server error', 500)
}

export function pagination(req: NextRequest) {
  const url   = new URL(req.url)
  const page  = Math.max(1, parseInt(url.searchParams.get('page')  ?? '1'))
  const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get('limit') ?? '50')))
  const skip  = (page - 1) * limit
  return { page, limit, skip }
}

export const sp = (req: NextRequest, key: string): string | null =>
  new URL(req.url).searchParams.get(key)