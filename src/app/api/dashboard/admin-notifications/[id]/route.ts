// app/api/dashboard/admin-notifications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const notif  = await prisma.adminNotification.update({
      where: { id: Number(id) },
      data : { isRead: body.isRead, ...(body.isUrgent !== undefined && { isUrgent: body.isUrgent }) },
    })
    return NextResponse.json({ notif })
  } catch (err) {
    console.error('[admin-notif PATCH]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.adminNotification.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin-notif DELETE]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
