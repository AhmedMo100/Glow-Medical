// app/api/dashboard/admin-notifications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isRead  = searchParams.get('isRead')
    const limit   = Number(searchParams.get('limit') ?? 20)

    const where: any = {}
    if (isRead !== null && isRead !== '') where.isRead = isRead === 'true'

    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take   : limit,
      }),
      prisma.adminNotification.count({ where: { isRead: false } }),
    ])

    return NextResponse.json({ notifications, unreadCount })
  } catch (err) {
    console.error('[admin-notifs GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// ── app/api/dashboard/admin-notifications/[id]/route.ts ──
// PATCH to mark single notification read
//
// export async function PATCH(req, { params }) {
//   const { id } = await params
//   const body = await req.json()
//   const notif = await prisma.adminNotification.update({
//     where: { id: Number(id) },
//     data : { isRead: body.isRead },
//   })
//   return NextResponse.json({ notif })
// }

// ── app/api/dashboard/admin-notifications/read-all/route.ts ──
// POST to mark all notifications read
//
// export async function POST() {
//   await prisma.adminNotification.updateMany({
//     where: { isRead: false },
//     data : { isRead: true },
//   })
//   return NextResponse.json({ success: true })
// }
