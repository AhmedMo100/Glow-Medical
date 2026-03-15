// app/api/dashboard/finance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const type     = searchParams.get('type')     ?? ''
    const category = searchParams.get('category') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo')   ?? ''
    const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit    = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where: any = {}
    if (type)     where.type     = type
    if (category) where.category = category
    if (search)   where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { reference  : { contains: search, mode: 'insensitive' } },
    ]
    if (dateFrom || dateTo) {
      where.transactionDate = {}
      if (dateFrom) where.transactionDate.gte = new Date(dateFrom)
      if (dateTo)   where.transactionDate.lte = new Date(new Date(dateTo).setHours(23, 59, 59))
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' },
        skip   : (page - 1) * limit,
        take   : limit,
        include: { appointment: { select: { id: true, patient: { select: { fullName: true } } } } },
      }),
      prisma.transaction.count({ where }),
    ])

    // ── Summary for current period ──────────────────────────
    const periodWhere = dateFrom || dateTo ? { transactionDate: where.transactionDate } : {}

    const [revenue, expenses, salaries, refunds] = await Promise.all([
      prisma.transaction.aggregate({ where: { ...periodWhere, type: 'REVENUE' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...periodWhere, type: 'EXPENSE' }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...periodWhere, type: 'SALARY'  }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...periodWhere, type: 'REFUND'  }, _sum: { amount: true } }),
    ])

    const totalRevenue  = Number(revenue.  _sum.amount ?? 0)
    const totalExpenses = Number(expenses. _sum.amount ?? 0) + Number(salaries._sum.amount ?? 0) + Number(refunds._sum.amount ?? 0)
    const netProfit     = totalRevenue - totalExpenses

    // ── 30-day daily chart ──────────────────────────────────
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dailyTx = await prisma.transaction.findMany({
      where  : { transactionDate: { gte: thirtyDaysAgo } },
      select : { type: true, amount: true, transactionDate: true },
      orderBy: { transactionDate: 'asc' },
    })

    const chartMap: Record<string, { date: string; revenue: number; expenses: number }> = {}
    dailyTx.forEach(tx => {
      const d = tx.transactionDate.toISOString().slice(0, 10)
      if (!chartMap[d]) chartMap[d] = { date: d, revenue: 0, expenses: 0 }
      if (tx.type === 'REVENUE') chartMap[d].revenue  += Number(tx.amount)
      else                       chartMap[d].expenses += Number(tx.amount)
    })

    // ── Category breakdown ──────────────────────────────────
    const catBreakdown = await prisma.transaction.groupBy({
      by    : ['category'],
      where : periodWhere,
      _sum  : { amount: true },
      _count: { id: true },
    })

    return NextResponse.json({
      transactions,
      total,
      page,
      pages  : Math.ceil(total / limit),
      summary: { totalRevenue, totalExpenses, netProfit, refunds: Number(refunds._sum.amount ?? 0) },
      chart  : Object.values(chartMap),
      categoryBreakdown: catBreakdown.map(c => ({
        category: c.category,
        amount  : Number(c._sum.amount ?? 0),
        count   : c._count.id,
      })),
    })
  } catch (err) {
    console.error('[finance GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      type, category, amount, description, notes,
      receiptUrl, transactionDate, reference, appointmentId,
    } = body

    if (!type || !category || !amount)
      return NextResponse.json({ error: 'type, category, amount required' }, { status: 400 })

    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount        : Number(amount),
        description   : description    || null,
        notes         : notes          || null,
        receiptUrl    : receiptUrl     || null,
        transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
        reference     : reference      || null,
        appointmentId : appointmentId  ? Number(appointmentId) : null,
      },
    })
    return NextResponse.json({ transaction }, { status: 201 })
  } catch (err) {
    console.error('[finance POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
