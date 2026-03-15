// app/api/dashboard/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subMonths, format,
} from 'date-fns'

/* ── helpers ─────────────────────────────────────────────── */
function periodRange(period: string, year?: number, month?: number) {
  const now = new Date()
  if (period === 'today') return { start: startOfDay(now),   end: endOfDay(now)   }
  if (period === 'month') {
    const d = year && month ? new Date(year, month - 1) : now
    return { start: startOfMonth(d), end: endOfMonth(d) }
  }
  if (period === 'year') {
    const d = year ? new Date(year, 0) : now
    return { start: startOfYear(d), end: endOfYear(d) }
  }
  return { start: startOfDay(now), end: endOfDay(now) }
}

async function buildReport(period: string, year?: number, month?: number) {
  const { start, end } = periodRange(period, year, month)
  const now = new Date()

  /* prev period for comparison */
  const prevStart = period === 'month' ? startOfMonth(subMonths(start, 1)) : start
  const prevEnd   = period === 'month' ? endOfMonth(subMonths(start, 1))   : end

  /* ── KPIs ──────────────────────────────────────────────── */
  const [
    totalAppts, prevAppts,
    revenueAgg, prevRevAgg,
    expenseAgg,
    newPatients, prevPatients,
    completedAppts,
    cancelledAppts,
    paidAppts,
  ] = await Promise.all([
    prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end } } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: prevStart, lte: prevEnd } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'REVENUE', transactionDate: { gte: start, lte: end } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'REVENUE', transactionDate: { gte: prevStart, lte: prevEnd } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE', transactionDate: { gte: start, lte: end } } }),
    prisma.patient.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.patient.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end }, status: 'COMPLETED' } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end }, status: 'CANCELLED' } }),
    prisma.appointment.count({ where: { appointmentDate: { gte: start, lte: end }, paymentStatus: 'PAID' } }),
  ])

  const revenue  = Number(revenueAgg._sum.amount ?? 0)
  const expenses = Number(expenseAgg._sum.amount ?? 0)
  const prevRev  = Number(prevRevAgg._sum.amount ?? 0)

  /* ── Revenue chart (daily buckets for month/today, monthly for year) ── */
  let revenueChart: { label: string; revenue: number; expenses: number }[] = []

  if (period === 'today') {
    // Hourly breakdown
    revenueChart = await Promise.all(
      Array.from({ length: 24 }, async (_, h) => {
        const hStart = new Date(start); hStart.setHours(h, 0, 0, 0)
        const hEnd   = new Date(start); hEnd.setHours(h, 59, 59, 999)
        const [r, e] = await Promise.all([
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'REVENUE', transactionDate: { gte: hStart, lte: hEnd } } }),
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE', transactionDate: { gte: hStart, lte: hEnd } } }),
        ])
        return { label: `${h}:00`, revenue: Number(r._sum.amount ?? 0), expenses: Number(e._sum.amount ?? 0) }
      })
    )
  } else if (period === 'month') {
    // Daily
    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
    revenueChart = await Promise.all(
      Array.from({ length: days }, async (_, i) => {
        const d      = new Date(start); d.setDate(start.getDate() + i)
        const dStart = startOfDay(d); const dEnd = endOfDay(d)
        const [r, e] = await Promise.all([
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'REVENUE', transactionDate: { gte: dStart, lte: dEnd } } }),
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE', transactionDate: { gte: dStart, lte: dEnd } } }),
        ])
        return { label: format(d, 'd MMM'), revenue: Number(r._sum.amount ?? 0), expenses: Number(e._sum.amount ?? 0) }
      })
    )
  } else {
    // Monthly
    revenueChart = await Promise.all(
      Array.from({ length: 12 }, async (_, m) => {
        const d      = new Date(start.getFullYear(), m)
        const mStart = startOfMonth(d); const mEnd = endOfMonth(d)
        const [r, e] = await Promise.all([
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'REVENUE', transactionDate: { gte: mStart, lte: mEnd } } }),
          prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE', transactionDate: { gte: mStart, lte: mEnd } } }),
        ])
        return { label: format(d, 'MMM'), revenue: Number(r._sum.amount ?? 0), expenses: Number(e._sum.amount ?? 0) }
      })
    )
  }

  /* ── Appointment status breakdown ──────────────────────── */
  const statusBreakdown = await prisma.appointment.groupBy({
    by: ['status'],
    _count: { status: true },
    where: { appointmentDate: { gte: start, lte: end } },
  })

  /* ── Source breakdown ──────────────────────────────────── */
  const sourceBreakdown = await prisma.appointment.groupBy({
    by: ['source'],
    _count: { source: true },
    where: { appointmentDate: { gte: start, lte: end } },
  })

  /* ── Payment breakdown ─────────────────────────────────── */
  const paymentBreakdown = await prisma.appointment.groupBy({
    by: ['paymentStatus'],
    _count: { paymentStatus: true },
    where: { appointmentDate: { gte: start, lte: end } },
  })

  /* ── Top services ───────────────────────────────────────── */
  const topServices = await prisma.appointmentService.groupBy({
    by: ['serviceId'],
    _count: { serviceId: true },
    where: { appointment: { appointmentDate: { gte: start, lte: end } } },
    orderBy: { _count: { serviceId: 'desc' } },
    take: 8,
  })
  const topServicesData = await Promise.all(
    topServices.map(async s => {
      const svc = await prisma.service.findUnique({ where: { id: s.serviceId }, select: { name: true } })
      return { name: svc?.name ?? 'Unknown', count: s._count.serviceId }
    })
  )

  /* ── Staff performance ──────────────────────────────────── */
  const staffPerf = await prisma.appointment.groupBy({
    by: ['staffId'],
    _count: { staffId: true },
    where: { appointmentDate: { gte: start, lte: end }, staffId: { not: null } },
    orderBy: { _count: { staffId: 'desc' } },
    take: 6,
  })
  const staffPerfData = await Promise.all(
    staffPerf.map(async s => {
      const staff = await prisma.staffMember.findUnique({ where: { id: s.staffId! }, select: { name: true, staffType: true } })
      return { name: staff?.name ?? 'Unknown', type: staff?.staffType ?? '', count: s._count.staffId }
    })
  )

  /* ── Expense categories ─────────────────────────────────── */
  const expenseByCategory = await prisma.transaction.groupBy({
    by: ['category'],
    _sum: { amount: true },
    where: { type: 'EXPENSE', transactionDate: { gte: start, lte: end } },
  })

  /* ── Recent transactions ────────────────────────────────── */
  const recentTransactions = await prisma.transaction.findMany({
    where: { transactionDate: { gte: start, lte: end } },
    orderBy: { transactionDate: 'desc' },
    take: 20,
    include: { appointment: { select: { id: true, patient: { select: { fullName: true } } } } },
  })

  /* ── Saved reports ──────────────────────────────────────── */
  const savedReports = await prisma.savedReport.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const pct = (curr: number, prev: number) =>
    prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100)

  return {
    period, start, end,
    generatedAt: now,
    kpis: {
      totalAppointments : { value: totalAppts,  prev: prevAppts,  change: pct(totalAppts, prevAppts) },
      completedAppts    : { value: completedAppts },
      cancelledAppts    : { value: cancelledAppts },
      paidAppts         : { value: paidAppts },
      revenue           : { value: revenue,      prev: prevRev,    change: pct(revenue, prevRev) },
      expenses          : { value: expenses },
      netProfit         : { value: revenue - expenses },
      newPatients       : { value: newPatients,  prev: prevPatients, change: pct(newPatients, prevPatients) },
      completionRate    : { value: totalAppts ? Math.round((completedAppts / totalAppts) * 100) : 0 },
      cancellationRate  : { value: totalAppts ? Math.round((cancelledAppts / totalAppts) * 100) : 0 },
      collectionRate    : { value: totalAppts ? Math.round((paidAppts / totalAppts) * 100) : 0 },
    },
    revenueChart,
    statusBreakdown  : statusBreakdown.map(s => ({ status: s.status, count: s._count.status })),
    sourceBreakdown  : sourceBreakdown.map(s => ({ source: s.source, count: s._count.source })),
    paymentBreakdown : paymentBreakdown.map(s => ({ status: s.paymentStatus, count: s._count.paymentStatus })),
    topServices      : topServicesData,
    staffPerformance : staffPerfData,
    expenseCategories: expenseByCategory.map(e => ({ category: e.category, amount: Number(e._sum.amount ?? 0) })),
    recentTransactions,
    savedReports,
  }
}

/* ── GET  /api/dashboard/reports?period=month&year=2025&month=3 ── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? 'month'
    const year   = searchParams.get('year')   ? Number(searchParams.get('year'))  : undefined
    const month  = searchParams.get('month')  ? Number(searchParams.get('month')) : undefined
    const saved  = searchParams.get('saved')

    // Return a specific saved report
    if (saved) {
      const report = await prisma.savedReport.findUnique({ where: { id: Number(saved) } })
      if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json({ report, reportData: report.reportData })
    }

    const data = await buildReport(period, year, month)
    return NextResponse.json(data)
  } catch (err) {
    console.error('[reports GET]', err)
    return NextResponse.json({ error: 'Failed to load report' }, { status: 500 })
  }
}

/* ── POST  /api/dashboard/reports  — save snapshot ── */
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const period = body.period ?? 'month'
    const year   = body.year  ?? new Date().getFullYear()
    const month  = body.month ?? new Date().getMonth() + 1

    const data   = await buildReport(period, year, month)

    const label  = period === 'today'
      ? `Today — ${format(new Date(), 'd MMM yyyy')}`
      : period === 'month'
        ? `Month — ${format(new Date(year, (month ?? 1) - 1), 'MMMM yyyy')}`
        : `Year — ${year}`

    const report = await prisma.savedReport.create({
      data: {
        name      : label,
        period,
        year,
        month     : period === 'month' ? month : null,
        reportData: data as any,
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (err) {
    console.error('[reports POST]', err)
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 })
  }
}
