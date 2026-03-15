// app/api/dashboard/faq/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const { question, answer, category, order, isActive, isFeatured } = body

    const faq = await prisma.fAQ.update({
      where: { id: Number(id) },
      data : {
        ...(question   !== undefined && { question }),
        ...(answer     !== undefined && { answer }),
        ...(category   !== undefined && { category:   category || null }),
        ...(order      !== undefined && { order }),
        ...(isActive   !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
    })
    return NextResponse.json({ faq })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.fAQ.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
