// app/api/dashboard/whatsapp/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const { name, type, bodyAr, bodyEn, variables, isActive, sendBefore } = body

    const template = await prisma.whatsAppTemplate.update({
      where: { id: Number(id) },
      data : {
        ...(name       !== undefined && { name }),
        ...(type       !== undefined && { type }),
        ...(bodyAr     !== undefined && { bodyAr }),
        ...(bodyEn     !== undefined && { bodyEn }),
        ...(variables  !== undefined && { variables }),
        ...(isActive   !== undefined && { isActive }),
        ...(sendBefore !== undefined && { sendBefore: sendBefore ? Number(sendBefore) : null }),
      },
    })
    return NextResponse.json({ template })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.whatsAppTemplate.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
