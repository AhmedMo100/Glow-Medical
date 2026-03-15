// app/api/dashboard/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const { status, replyText } = body

    const data: any = {}
    if (status    !== undefined) data.status    = status
    if (replyText !== undefined) {
      data.replyText  = replyText
      data.repliedAt  = new Date()
      data.status     = 'REPLIED'
    }

    const message = await prisma.contactMessage.update({
      where: { id: Number(id) },
      data,
    })
    return NextResponse.json({ message })
  } catch (err) {
    console.error('[messages PATCH]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.contactMessage.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
