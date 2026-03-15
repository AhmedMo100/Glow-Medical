// app/api/dashboard/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(id) },
      include: {
        patient : true,
        staff   : { select: { id: true, name: true, staffType: true, photo: true, specialization: true } },
        services: { include: { service: true } },
        offers  : { include: { offer: true } },
        transactions: { orderBy: { transactionDate: 'desc' } },
        whatsappLogs: { orderBy: { sentAt: 'desc' }, take: 10 },
      },
    })
    if (!appointment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ appointment })
  } catch (err) {
    console.error('[appt GET id]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const apptId  = Number(id)

    const {
      appointmentDate, durationMinutes, notes, internalNotes,
      source, status, paymentStatus, paidAmount,
      staffId, serviceIds, offerIds,
    } = body

    // Recalculate total if services/offers changed
    let totalAmount: number | undefined
    if (serviceIds !== undefined || offerIds !== undefined) {
      const services = serviceIds?.length
        ? await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, price: true, discountedPrice: true } })
        : []
      const offers = offerIds?.length
        ? await prisma.offer.findMany({ where: { id: { in: offerIds } }, select: { id: true, finalPrice: true } })
        : []

      totalAmount = [
        ...services.map((s: any) => Number(s.discountedPrice ?? s.price)),
        ...offers.map((o: any) => Number(o.finalPrice)),
      ].reduce((a, b) => a + b, 0)

      // Delete old services/offers and recreate
      await prisma.appointmentService.deleteMany({ where: { appointmentId: apptId } })
      await prisma.appointmentOffer.deleteMany({ where: { appointmentId: apptId } })

      if (services.length) {
        await prisma.appointmentService.createMany({
          data: services.map((s: any) => ({
            appointmentId: apptId,
            serviceId    : s.id,
            priceAtTime  : Number(s.discountedPrice ?? s.price),
          })),
        })
      }
      if (offers.length) {
        await prisma.appointmentOffer.createMany({
          data: offers.map((o: any) => ({
            appointmentId: apptId,
            offerId      : o.id,
            priceAtTime  : Number(o.finalPrice),
          })),
        })
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: apptId },
      data: {
        ...(appointmentDate !== undefined && { appointmentDate: new Date(appointmentDate) }),
        ...(durationMinutes !== undefined && { durationMinutes }),
        ...(notes           !== undefined && { notes }),
        ...(internalNotes   !== undefined && { internalNotes }),
        ...(source          !== undefined && { source }),
        ...(status          !== undefined && { status }),
        ...(paymentStatus   !== undefined && { paymentStatus }),
        ...(paidAmount      !== undefined && { paidAmount: Number(paidAmount) }),
        ...(staffId         !== undefined && { staffId: staffId || null }),
        ...(totalAmount     !== undefined && { totalAmount }),
      },
      include: {
        patient : { select: { id: true, fullName: true, phone: true } },
        staff   : { select: { id: true, name: true } },
        services: { include: { service: { select: { id: true, name: true } } } },
        offers  : { include: { offer: { select: { id: true, title: true } } } },
      },
    })

    // Auto-create revenue transaction on payment
    if (paymentStatus === 'PAID' && paidAmount) {
      await prisma.transaction.upsert({
        where : { id: -1 }, // force create
        update: {},
        create: {
          type           : 'REVENUE',
          category       : 'APPOINTMENT_PAYMENT',
          amount         : Number(paidAmount),
          appointmentId  : apptId,
          description    : `Payment for appointment #${apptId}`,
          transactionDate: new Date(),
        },
      }).catch(() => {
        // upsert trick doesn't work — just create
        return prisma.transaction.create({
          data: {
            type           : 'REVENUE',
            category       : 'APPOINTMENT_PAYMENT',
            amount         : Number(paidAmount),
            appointmentId  : apptId,
            description    : `Payment for appointment #${apptId}`,
            transactionDate: new Date(),
          },
        })
      })
    }

    return NextResponse.json({ appointment })
  } catch (err) {
    console.error('[appt PATCH]', err)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.appointment.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[appt DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 })
  }
}
