// app/api/dashboard/team/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const status   = searchParams.get('status')   ?? ''
    const type     = searchParams.get('type')     ?? ''
    const isPublic = searchParams.get('isPublic')
    const featured = searchParams.get('featured')
    const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit    = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)))
    const skip     = (page - 1) * limit

    const where: any = {}
    if (status)              where.status    = status
    if (type)                where.staffType = type
    if (isPublic !== null && isPublic !== '') where.isPublic  = isPublic  === 'true'
    if (featured !== null && featured !== '') where.isFeatured = featured === 'true'
    if (search) {
      where.OR = [
        { name          : { contains: search, mode: 'insensitive' } },
        { nameEn        : { contains: search, mode: 'insensitive' } },
        { email         : { contains: search, mode: 'insensitive' } },
        { phone         : { contains: search } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [staff, total] = await Promise.all([
      prisma.staffMember.findMany({
        where,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
        include: {
          _count: { select: { appointments: true } },
        },
      }),
      prisma.staffMember.count({ where }),
    ])

    return NextResponse.json({ staff, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[team GET]', err)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      staffType, name, nameEn, phone, email, gender, dateOfBirth,
      nationalId, photo, photoPublicId, bio, specialization, qualifications,
      experience, licenseNumber, status, hireDate, endDate,
      baseSalary, salaryType, commission,
      isPublic, isFeatured, instagramUrl, linkedinUrl,
    } = body

    if (!staffType || !name) {
      return NextResponse.json({ error: 'staffType and name are required' }, { status: 400 })
    }

    const member = await prisma.staffMember.create({
      data: {
        staffType,
        name,
        nameEn        : nameEn         || null,
        phone         : phone          || null,
        email         : email          || null,
        gender        : gender         || null,
        dateOfBirth   : dateOfBirth    ? new Date(dateOfBirth) : null,
        nationalId    : nationalId     || null,
        photo         : photo          || null,
        bio           : bio            || null,
        specialization: specialization || null,
        qualifications: qualifications || null,
        experience    : experience     ? Number(experience)    : null,
        licenseNumber : licenseNumber  || null,
        status        : status         || 'ACTIVE',
        hireDate      : hireDate       ? new Date(hireDate)    : null,
        endDate       : endDate        ? new Date(endDate)     : null,
        baseSalary    : baseSalary     ? Number(baseSalary)    : null,
        salaryType    : salaryType     || null,
        commission    : commission     ? Number(commission)    : null,
        isPublic      : isPublic       ?? true,
        isFeatured    : isFeatured     ?? false,
        instagramUrl  : instagramUrl   || null,
        linkedinUrl   : linkedinUrl    || null,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'National ID already exists' }, { status: 409 })
    }
    console.error('[team POST]', err)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
