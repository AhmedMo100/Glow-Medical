// app/api/dashboard/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const status = searchParams.get('status') ?? ''
    const page   = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit  = Math.min(50,  Number(searchParams.get('limit') ?? 20))

    const where: any = {}
    if (status) where.status = status
    if (search) where.OR = [
      { name   : { contains: search, mode: 'insensitive' } },
      { email  : { contains: search, mode: 'insensitive' } },
      { phone  : { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ]

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip   : (page - 1) * limit,
        take   : limit,
      }),
      prisma.contactMessage.count({ where }),
    ])

    // Counts per status
    const [unread, archived, replied] = await Promise.all([
      prisma.contactMessage.count({ where: { status: 'UNREAD'   } }),
      prisma.contactMessage.count({ where: { status: 'ARCHIVED' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED'  } }),
    ])

    return NextResponse.json({ messages, total, page, pages: Math.ceil(total / limit), counts: { unread, archived, replied, all: total } })
  } catch (err) {
    console.error('[messages GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
