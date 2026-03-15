// src/app/api/dashboard/analytics/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, serverErr, sp } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const period = sp(req, 'period') ?? '30'   // days
    const days   = Math.min(365, Math.max(7, parseInt(period)))
    const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1_000)
    const today  = new Date(); today.setHours(0,0,0,0)
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)

    const [
      totalPatients,
      newPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      revenueResult,
      todayRevenue,
      topServices,
      topStaff,
      sourceBreakdown,
      statusBreakdown,
      dailyRevenue,
      lowStockCount,
      unreadMessages,
      pendingReviews,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: since } } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: since } } }),
      prisma.appointment.count({ where: { appointmentDate: { gte: today, lte: todayEnd } } }),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED', appointmentDate: { gte: since } } }),
      // Revenue for period
      prisma.transaction.aggregate({
        where: { type: 'REVENUE', transactionDate: { gte: since } },
        _sum : { amount: true },
      }),
      // Today revenue
      prisma.transaction.aggregate({
        where: { type: 'REVENUE', transactionDate: { gte: today, lte: todayEnd } },
        _sum : { amount: true },
      }),
      // Top 5 services by appointment count
      prisma.appointmentService.groupBy({
        by   : ['serviceId'],
        where: { appointment: { appointmentDate: { gte: since } } },
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take : 5,
      }),
      // Top staff by completed appointments
      prisma.appointment.groupBy({
        by   : ['staffId'],
        where: { status: 'COMPLETED', appointmentDate: { gte: since }, staffId: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take : 5,
      }),
      // Appointments by source
      prisma.appointment.groupBy({
        by    : ['source'],
        where : { appointmentDate: { gte: since } },
        _count: { id: true },
      }),
      // Appointments by status
      prisma.appointment.groupBy({
        by    : ['status'],
        _count: { id: true },
      }),
      // Daily revenue chart (last 30 days)
      prisma.$queryRaw<{ day: string; revenue: number }[]>`
        SELECT
          DATE(transaction_date)::text AS day,
          SUM(amount::numeric) AS revenue
        FROM transactions
        WHERE type = 'REVENUE' AND transaction_date >= ${since}
        GROUP BY day
        ORDER BY day
      `,
      prisma.inventoryItem.count({ where: { status: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] } } }),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.testimonial.count({ where: { isApproved: false } }),
    ])

    // Enrich top services with names
    const serviceIds = topServices.map(s => s.serviceId)
    const serviceNames = await prisma.service.findMany({
      where : { id: { in: serviceIds } },
      select: { id: true, name: true },
    })
    const topServicesEnriched = topServices.map(s => ({
      serviceId: s.serviceId,
      name     : serviceNames.find(n => n.id === s.serviceId)?.name ?? 'Unknown',
      count    : s._count.serviceId,
    }))

    // Enrich top staff with names
    const staffIds = topStaff.map(s => s.staffId).filter(Boolean) as number[]
    const staffNames = await prisma.staffMember.findMany({
      where : { id: { in: staffIds } },
      select: { id: true, name: true, staffType: true },
    })
    const topStaffEnriched = topStaff.map(s => ({
      staffId  : s.staffId,
      name     : staffNames.find(n => n.id === s.staffId)?.name ?? 'Unknown',
      staffType: staffNames.find(n => n.id === s.staffId)?.staffType,
      count    : s._count.id,
    }))

    return ok({
      kpis: {
        totalPatients,
        newPatients,
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        revenue     : parseFloat(String(revenueResult._sum.amount ?? 0)),
        todayRevenue: parseFloat(String(todayRevenue._sum.amount  ?? 0)),
        lowStockCount,
        unreadMessages,
        pendingReviews,
      },
      charts: {
        dailyRevenue,
        topServices : topServicesEnriched,
        topStaff    : topStaffEnriched,
        bySource    : sourceBreakdown.map(s => ({ source: s.source, count: s._count.id })),
        byStatus    : statusBreakdown.map(s => ({ status: s.status, count: s._count.id })),
      },
    })
  } catch (e) { return serverErr(e) }
}
