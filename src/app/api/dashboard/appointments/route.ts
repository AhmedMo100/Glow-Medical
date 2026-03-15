// app/api/dashboard/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const status   = searchParams.get('status')   ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo')   ?? ''
    const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit    = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const skip     = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.appointmentDate = {}
      if (dateFrom) where.appointmentDate.gte = startOfDay(new Date(dateFrom))
      if (dateTo)   where.appointmentDate.lte = endOfDay(new Date(dateTo))
    }

    if (search) {
      where.OR = [
        { patient: { fullName : { contains: search, mode: 'insensitive' } } },
        { patient: { phone    : { contains: search } } },
        { tempPatientName     : { contains: search, mode: 'insensitive' } },
        { tempPatientPhone    : { contains: search } },
      ]
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        orderBy: { appointmentDate: 'desc' },
        skip,
        take: limit,
        include: {
          patient : { select: { id: true, fullName: true, phone: true, gender: true } },
          staff   : { select: { id: true, name: true, staffType: true, photo: true } },
          services: { include: { service: { select: { id: true, name: true, price: true } } } },
          offers  : { include: { offer: { select: { id: true, title: true, finalPrice: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ])

    return NextResponse.json({ appointments, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[appointments GET]', err)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      appointmentDate, durationMinutes, notes, internalNotes,
      source, status,
      patientId, tempPatientName, tempPatientPhone,
      staffId,
      serviceIds,   // number[]
      offerIds,     // number[]
      paymentStatus, paidAmount,
    } = body

    if (!appointmentDate) {
      return NextResponse.json({ error: 'appointmentDate is required' }, { status: 400 })
    }

    // ── Resolve patient ───────────────────────────────────
    let resolvedPatientId: number | null = patientId ?? null

    // If no patientId but tempPhone provided → auto-create patient
    if (!resolvedPatientId && tempPatientPhone) {
      const existing = await prisma.patient.findUnique({ where: { phone: tempPatientPhone } })
      if (existing) {
        resolvedPatientId = existing.id
      } else if (tempPatientName) {
        const created = await prisma.patient.create({
          data: {
            fullName     : tempPatientName,
            phone        : tempPatientPhone,
            isAutoCreated: true,
            status       : 'ACTIVE',
          },
        })
        resolvedPatientId = created.id
      }
    }

    // ── Fetch service/offer prices ────────────────────────
    const services = serviceIds?.length
      ? await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, price: true, discountedPrice: true } })
      : []

    const offers = offerIds?.length
      ? await prisma.offer.findMany({ where: { id: { in: offerIds } }, select: { id: true, finalPrice: true } })
      : []

    const totalAmount = [
      ...services.map((s: any) => Number(s.discountedPrice ?? s.price)),
      ...offers.map((o: any) => Number(o.finalPrice)),
    ].reduce((a, b) => a + b, 0)

    // ── Create appointment ────────────────────────────────
    const appointment = await prisma.appointment.create({
      data: {
        appointmentDate : new Date(appointmentDate),
        durationMinutes : durationMinutes  || null,
        notes           : notes           || null,
        internalNotes   : internalNotes   || null,
        source          : source          || 'WEBSITE',
        status          : status          || 'PENDING',
        paymentStatus   : paymentStatus   || 'UNPAID',
        totalAmount,
        paidAmount      : Number(paidAmount ?? 0),
        patientId       : resolvedPatientId,
        tempPatientName : resolvedPatientId ? null : (tempPatientName || null),
        tempPatientPhone: resolvedPatientId ? null : (tempPatientPhone || null),
        staffId         : staffId || null,
        services: {
          create: services.map((s: any) => ({
            serviceId  : s.id,
            priceAtTime: Number(s.discountedPrice ?? s.price),
          })),
        },
        offers: {
          create: offers.map((o: any) => ({
            offerId    : o.id,
            priceAtTime: Number(o.finalPrice),
          })),
        },
      },
      include: {
        patient : { select: { id: true, fullName: true, phone: true } },
        staff   : { select: { id: true, name: true } },
        services: { include: { service: { select: { id: true, name: true } } } },
        offers  : { include: { offer: { select: { id: true, title: true } } } },
      },
    })

    // ── Create notification ───────────────────────────────
    const patientName = appointment.patient?.fullName ?? tempPatientName ?? 'Unknown'
    await prisma.adminNotification.create({
      data: {
        type    : 'new_appointment',
        title   : 'New Appointment',
        body    : `${patientName} — ${new Date(appointmentDate).toLocaleString('en-EG', { dateStyle: 'medium', timeStyle: 'short' })}`,
        href    : `/dashboard/appointments`,
        isUrgent: false,
      },
    })

    return NextResponse.json({ appointment }, { status: 201 })
  } catch (err) {
    console.error('[appointments POST]', err)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
