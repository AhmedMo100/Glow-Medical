// app/api/book/availability/route.ts
// PUBLIC — no auth required
// GET ?date=YYYY-MM-DD → slots with availability status

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ── Clinic schedule — adjust to match your hours ───────────
// 0 = Sunday … 6 = Saturday   |   null = closed
const SCHEDULE: Record<number, { start: number; end: number; step: number } | null> = {
  0: null,                              // Sunday    — closed
  1: { start: 10, end: 21, step: 30 }, // Monday
  2: { start: 10, end: 21, step: 30 }, // Tuesday
  3: { start: 10, end: 21, step: 30 }, // Wednesday
  4: { start: 10, end: 21, step: 30 }, // Thursday
  5: { start: 10, end: 21, step: 30 }, // Friday
  6: { start: 10, end: 21, step: 30 }, // Saturday
}

function buildSlots(dateStr: string): string[] {
  const dow  = new Date(dateStr + 'T12:00:00').getDay()
  const rule = SCHEDULE[dow]
  if (!rule) return []
  const out: string[] = []
  for (let h = rule.start; h < rule.end; h++)
    for (let m = 0; m < 60; m += rule.step)
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  return out
}

export async function GET(req: NextRequest) {
  try {
    const date = new URL(req.url).searchParams.get('date')
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
      return NextResponse.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 })

    const dow      = new Date(date + 'T12:00:00').getDay()
    const isClosed = SCHEDULE[dow] === null
    if (isClosed)
      return NextResponse.json({ date, isClosed: true, slots: [], availableCount: 0 })

    // Fetch booked appointments for this day
    const booked = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: new Date(`${date}T00:00:00`),
          lte: new Date(`${date}T23:59:59`),
        },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      select: { appointmentDate: true },
    })

    const bookedTimes = new Set(
      booked.map(a => {
        const d = new Date(a.appointmentDate)
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      })
    )

    // Past-time buffer for today
    const now     = new Date()
    const isToday = date === now.toISOString().slice(0, 10)
    const nowMins = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1

    const slots = buildSlots(date).map(t => {
      const [h, m]   = t.split(':').map(Number)
      const isPast   = isToday && h * 60 + m <= nowMins
      const isBooked = bookedTimes.has(t)
      return { time: t, available: !isPast && !isBooked, isPast, isBooked }
    })

    return NextResponse.json({
      date,
      isClosed      : false,
      slots,
      availableCount: slots.filter(s => s.available).length,
    })
  } catch (err) {
    console.error('[/api/book/availability]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
