// app/api/dashboard/overview/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, subDays } from 'date-fns'

export async function GET() {
  try {
    const now       = new Date()
    const todayStart = startOfDay(now)
    const todayEnd   = endOfDay(now)
    const monthStart = startOfMonth(now)
    const monthEnd   = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd   = endOfMonth(subMonths(now, 1))

    // ── Today's appointments ──────────────────────────────
    const [todayAppts, monthAppts, lastMonthAppts] = await Promise.all([
      prisma.appointment.count({
        where: { appointmentDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { appointmentDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.appointment.count({
        where: { appointmentDate: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
    ])

    // ── Revenue ───────────────────────────────────────────
    const [revenueToday, revenueMonth, revenueLastMonth] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'REVENUE', transactionDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'REVENUE', transactionDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'REVENUE', transactionDate: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
    ])

    // ── Patients ──────────────────────────────────────────
    const [totalPatients, newPatientsMonth, newPatientsLastMonth] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: monthStart, lte: monthEnd } } }),
      prisma.patient.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } }),
    ])

    // ── Appointment statuses today ────────────────────────
    const statusCounts = await prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { appointmentDate: { gte: todayStart, lte: todayEnd } },
    })

    // ── Upcoming appointments (next 7 days) ───────────────
    const upcoming = await prisma.appointment.findMany({
      where: {
        appointmentDate: { gte: now, lte: endOfDay(subDays(now, -7)) },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        patient: { select: { fullName: true, phone: true } },
        staff: { select: { name: true } },
        services: { include: { service: { select: { name: true } } } },
      },
      orderBy: { appointmentDate: 'asc' },
      take: 10,
    })

    // ── Low stock items ───────────────────────────────────
    const lowStock = await prisma.inventoryItem.count({
      where: { status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } },
    })

    // ── Unread messages ───────────────────────────────────
    const unreadMessages = await prisma.contactMessage.count({
      where: { status: 'UNREAD' },
    })

    // ── Pending reviews ───────────────────────────────────
    const pendingReviews = await prisma.testimonial.count({
      where: { isApproved: false },
    })

    // ── Revenue last 7 days (chart) ───────────────────────
    const last7 = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i)
        return prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: 'REVENUE', transactionDate: { gte: startOfDay(d), lte: endOfDay(d) } },
        }).then(r => ({
          date   : d.toISOString().slice(0, 10),
          revenue: Number(r._sum.amount ?? 0),
        }))
      })
    )

    // ── Appointment source breakdown ──────────────────────
    const sourceCounts = await prisma.appointment.groupBy({
      by: ['source'],
      _count: { source: true },
      where: { appointmentDate: { gte: monthStart, lte: monthEnd } },
    })

    // ── Top services this month ───────────────────────────
    const topServices = await prisma.appointmentService.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      where: {
        appointment: { appointmentDate: { gte: monthStart, lte: monthEnd } },
      },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    })

    const topServicesWithNames = await Promise.all(
      topServices.map(async s => {
        const service = await prisma.service.findUnique({
          where: { id: s.serviceId },
          select: { name: true },
        })
        return { name: service?.name ?? 'Unknown', count: s._count.serviceId }
      })
    )

    // ── Build response ────────────────────────────────────
    const revMonthVal     = Number(revenueMonth._sum.amount ?? 0)
    const revLastMonthVal = Number(revenueLastMonth._sum.amount ?? 0)
    const apptChange = lastMonthAppts === 0 ? 0 : Math.round(((monthAppts - lastMonthAppts) / lastMonthAppts) * 100)
    const revChange  = revLastMonthVal === 0 ? 0 : Math.round(((revMonthVal - revLastMonthVal) / revLastMonthVal) * 100)
    const ptChange   = newPatientsLastMonth === 0 ? 0 : Math.round(((newPatientsMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100)

    const statusMap: Record<string, number> = {}
    statusCounts.forEach(s => { statusMap[s.status] = s._count.status })

    const sourceMap: Record<string, number> = {}
    sourceCounts.forEach(s => { sourceMap[s.source] = s._count.source })

    return NextResponse.json({
      kpis: {
        todayAppointments : { value: todayAppts,  change: 0 },
        monthAppointments : { value: monthAppts,  change: apptChange },
        monthRevenue      : { value: revMonthVal, change: revChange },
        totalPatients     : { value: totalPatients, change: ptChange },
      },
      alerts: { lowStock, unreadMessages, pendingReviews },
      todayStatus  : statusMap,
      revenueChart : last7,
      sourceChart  : sourceMap,
      topServices  : topServicesWithNames,
      upcoming,
    })
  } catch (err) {
    console.error('[overview]', err)
    return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 })
  }
}
