// app/api/dashboard/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const patient = await prisma.patient.findUnique({
      where: { id: Number(id) },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 20,
          include: {
            staff   : { select: { name: true, staffType: true } },
            services: { include: { service: { select: { name: true, price: true } } } },
            offers  : { include: { offer: { select: { title: true, finalPrice: true } } } },
          },
        },
      },
    })
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    return NextResponse.json({ patient })
  } catch (err) {
    console.error('[patient GET id]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await req.json()

    const {
      fullName, phone, phone2, email, gender, dateOfBirth,
      nationalId, address, bloodType, allergies, medicalNotes,
      status, referralSource,
    } = body

    const patient = await prisma.patient.update({
      where: { id: Number(id) },
      data: {
        ...(fullName       !== undefined && { fullName }),
        ...(phone          !== undefined && { phone }),
        ...(phone2         !== undefined && { phone2: phone2 || null }),
        ...(email          !== undefined && { email: email || null }),
        ...(gender         !== undefined && { gender: gender || null }),
        ...(dateOfBirth    !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(nationalId     !== undefined && { nationalId: nationalId || null }),
        ...(address        !== undefined && { address: address || null }),
        ...(bloodType      !== undefined && { bloodType: bloodType || null }),
        ...(allergies      !== undefined && { allergies: allergies || null }),
        ...(medicalNotes   !== undefined && { medicalNotes: medicalNotes || null }),
        ...(status         !== undefined && { status }),
        ...(referralSource !== undefined && { referralSource: referralSource || null }),
      },
    })

    return NextResponse.json({ patient })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Phone or National ID already exists' }, { status: 409 })
    }
    console.error('[patient PATCH]', err)
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.patient.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[patient DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 })
  }
}
