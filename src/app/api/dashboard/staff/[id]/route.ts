import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { deleteFromCloudinary } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const member = await prisma.staffMember.findUnique({
      where  : { id: Number(id) },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take   : 10,
          include: {
            patient : { select: { fullName: true, phone: true } },
            services: { include: { service: { select: { name: true } } } },
          },
        },
        salaryPayments: { orderBy: { year: 'desc' }, take: 12 },
        _count         : { select: { appointments: true } },
      },
    })
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err) {
    console.error('[staff GET id]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }   = await params
    const body     = await req.json()
    const {
      staffType, name, nameEn, phone, email, gender, dateOfBirth,
      nationalId, photo, bio, specialization, qualifications,
      experience, licenseNumber, status, hireDate, endDate,
      baseSalary, salaryType, commission,
      isPublic, isFeatured, instagramUrl, linkedinUrl,
      oldPhotoPublicId,
    } = body

    // Delete old Cloudinary photo if a new one was uploaded
    if (oldPhotoPublicId && photo && photo !== body.oldPhoto) {
      await deleteFromCloudinary(oldPhotoPublicId).catch(() => {})
    }

    const member = await prisma.staffMember.update({
      where: { id: Number(id) },
      data : {
        ...(staffType       !== undefined && { staffType }),
        ...(name            !== undefined && { name }),
        ...(nameEn          !== undefined && { nameEn          : nameEn          || null }),
        ...(phone           !== undefined && { phone           : phone           || null }),
        ...(email           !== undefined && { email           : email           || null }),
        ...(gender          !== undefined && { gender          : gender          || null }),
        ...(dateOfBirth     !== undefined && { dateOfBirth     : dateOfBirth     ? new Date(dateOfBirth)  : null }),
        ...(nationalId      !== undefined && { nationalId      : nationalId      || null }),
        ...(photo           !== undefined && { photo           : photo           || null }),
        ...(bio             !== undefined && { bio             : bio             || null }),
        ...(specialization  !== undefined && { specialization  : specialization  || null }),
        ...(qualifications  !== undefined && { qualifications  : qualifications  || null }),
        ...(experience      !== undefined && { experience      : experience      ? Number(experience)     : null }),
        ...(licenseNumber   !== undefined && { licenseNumber   : licenseNumber   || null }),
        ...(status          !== undefined && { status }),
        ...(hireDate        !== undefined && { hireDate        : hireDate        ? new Date(hireDate)     : null }),
        ...(endDate         !== undefined && { endDate         : endDate         ? new Date(endDate)      : null }),
        ...(baseSalary      !== undefined && { baseSalary      : baseSalary      ? Number(baseSalary)     : null }),
        ...(salaryType      !== undefined && { salaryType      : salaryType      || null }),
        ...(commission      !== undefined && { commission      : commission      ? Number(commission)     : null }),
        ...(isPublic        !== undefined && { isPublic }),
        ...(isFeatured      !== undefined && { isFeatured }),
        ...(instagramUrl    !== undefined && { instagramUrl    : instagramUrl    || null }),
        ...(linkedinUrl     !== undefined && { linkedinUrl     : linkedinUrl     || null }),
      },
    })

    return NextResponse.json({ member })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'National ID already exists' }, { status: 409 })
    }
    console.error('[staff PATCH]', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const member  = await prisma.staffMember.findUnique({
      where : { id: Number(id) },
      select: { photo: true },
    })

    // Best-effort delete Cloudinary photo
    if (member?.photo) {
      try {
        const parts    = member.photo.split('/')
        const fileName = parts[parts.length - 1].split('.')[0]
        const folder   = parts[parts.length - 2]
        if (folder && fileName) await deleteFromCloudinary(`${folder}/${fileName}`)
      } catch { /* silent */ }
    }

    await prisma.staffMember.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[staff DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
