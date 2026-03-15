// app/api/dashboard/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const view = searchParams.get('view') ?? 'templates' // 'templates' | 'logs'

    if (view === 'logs') {
      const page   = Math.max(1, Number(searchParams.get('page')  ?? 1))
      const limit  = Math.min(100, Number(searchParams.get('limit') ?? 20))
      const status = searchParams.get('status') ?? ''
      const phone  = searchParams.get('phone')  ?? ''

      const where: any = {}
      if (status) where.status  = status
      if (phone)  where.toPhone = { contains: phone }

      const [logs, total] = await Promise.all([
        prisma.whatsAppLog.findMany({
          where,
          orderBy: { sentAt: 'desc' },
          skip   : (page - 1) * limit,
          take   : limit,
          include: { template: { select: { name: true, type: true } } },
        }),
        prisma.whatsAppLog.count({ where }),
      ])

      const [sent, delivered, failed, pending] = await Promise.all([
        prisma.whatsAppLog.count({ where: { status: 'SENT'      } }),
        prisma.whatsAppLog.count({ where: { status: 'DELIVERED' } }),
        prisma.whatsAppLog.count({ where: { status: 'FAILED'    } }),
        prisma.whatsAppLog.count({ where: { status: 'PENDING'   } }),
      ])

      return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit), counts: { sent, delivered, failed, pending } })
    }

    // Default: templates
    const templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { type: 'asc' },
      include: { _count: { select: { logs: true } } },
    })
    return NextResponse.json({ templates })
  } catch (err) {
    console.error('[whatsapp GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, type, bodyAr, bodyEn, variables, isActive, sendBefore } = body

    if (!name || !type || !bodyAr || !bodyEn)
      return NextResponse.json({ error: 'name, type, bodyAr, bodyEn required' }, { status: 400 })

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        type,
        bodyAr,
        bodyEn,
        variables : variables   || [],
        isActive  : isActive    ?? true,
        sendBefore: sendBefore  ? Number(sendBefore) : null,
      },
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (err) {
    console.error('[whatsapp POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
