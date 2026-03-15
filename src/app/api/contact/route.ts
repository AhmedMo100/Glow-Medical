// app/api/contact/route.ts
// PUBLIC — no auth required
// Writes to the SAME contact_messages table that /api/dashboard/messages reads from

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, subject, message } = body

    if (!name?.trim())
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    if (!email?.trim())
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (!message?.trim())
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    if (message.trim().length < 10)
      return NextResponse.json({ error: 'Message must be at least 10 characters.' }, { status: 400 })
    if (message.trim().length > 2000)
      return NextResponse.json({ error: 'Message is too long (max 2000 characters).' }, { status: 400 })

    // Rate-limit: same email within last 10 min
    const recent = await prisma.contactMessage.findFirst({
      where: {
        email    : email.trim().toLowerCase(),
        createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
      },
    })
    if (recent)
      return NextResponse.json({
        error: 'You already sent a message recently. Please wait a few minutes before sending another.',
      }, { status: 429 })

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null

    const saved = await prisma.contactMessage.create({
      data: {
        name     : name.trim(),
        email    : email.trim().toLowerCase(),
        phone    : phone?.trim()   || null,
        subject  : subject?.trim() || null,
        message  : message.trim(),
        status   : 'UNREAD',
        ipAddress: ip,
      },
    })

    // Admin notification (non-blocking)
    await prisma.adminNotification.create({
      data: {
        type    : 'new_message',
        title   : `New message from ${saved.name}`,
        body    : saved.subject ? `Subject: ${saved.subject}` : saved.message.slice(0, 80),
        href    : '/dashboard/messages',
        icon    : 'MessageCircle',
        isUrgent: false,
        meta    : { messageId: saved.id },
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, id: saved.id }, { status: 201 })
  } catch (err) {
    console.error('[/api/contact POST]', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
