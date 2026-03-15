// app/api/dashboard/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search  = searchParams.get('search') ?? ''
    const status  = searchParams.get('status') ?? ''
    const page    = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit   = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const skip    = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { fullName : { contains: search, mode: 'insensitive' } },
        { phone    : { contains: search } },
        { email    : { contains: search, mode: 'insensitive' } },
        { nationalId: { contains: search } },
      ]
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { appointments: true } },
        },
      }),
      prisma.patient.count({ where }),
    ])

    return NextResponse.json({ patients, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[patients GET]', err)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      fullName, phone, phone2, email, gender, dateOfBirth,
      nationalId, address, bloodType, allergies, medicalNotes,
      status, referralSource,
    } = body

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }

    // Check duplicate phone
    const existing = await prisma.patient.findUnique({ where: { phone } })
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered', patient: existing }, { status: 409 })
    }

    const patient = await prisma.patient.create({
      data: {
        fullName,
        phone,
        phone2       : phone2    || null,
        email        : email     || null,
        gender       : gender    || null,
        dateOfBirth  : dateOfBirth ? new Date(dateOfBirth) : null,
        nationalId   : nationalId || null,
        address      : address   || null,
        bloodType    : bloodType || null,
        allergies    : allergies || null,
        medicalNotes : medicalNotes || null,
        status       : status    || 'ACTIVE',
        referralSource: referralSource || null,
      },
    })

    return NextResponse.json({ patient }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Phone or National ID already exists' }, { status: 409 })
    }
    console.error('[patients POST]', err)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
