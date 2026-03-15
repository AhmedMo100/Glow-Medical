// app/api/dashboard/admin-notifications/read-all/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data : { isRead: true },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[read-all]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
