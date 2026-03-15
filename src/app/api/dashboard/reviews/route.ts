// app/api/dashboard/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const approved = searchParams.get('approved') ?? ''
    const featured = searchParams.get('featured') ?? ''
    const source   = searchParams.get('source')   ?? ''
    const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit    = Math.min(50,  Number(searchParams.get('limit') ?? 16))

    const where: any = {}
    if (approved !== '') where.isApproved = approved === 'true'
    if (featured !== '') where.isFeatured = featured === 'true'
    if (source)          where.source     = source
    if (search)          where.OR = [
      { name  : { contains: search, mode: 'insensitive' } },
      { review: { contains: search, mode: 'insensitive' } },
    ]

    const [reviews, total] = await Promise.all([
      prisma.testimonial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip   : (page - 1) * limit,
        take   : limit,
        include: { images: { orderBy: { order: 'asc' } } },
      }),
      prisma.testimonial.count({ where }),
    ])

    const [pending, approved_count, featured_count] = await Promise.all([
      prisma.testimonial.count({ where: { isApproved: false } }),
      prisma.testimonial.count({ where: { isApproved: true  } }),
      prisma.testimonial.count({ where: { isFeatured: true  } }),
    ])

    return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit), counts: { pending, approved: approved_count, featured: featured_count } })
  } catch (err) {
    console.error('[reviews GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, review, rating, avatar, avatarPublicId,
      isApproved, isFeatured, source, serviceId, patientId,
      treatmentDate,
      images, // { url, publicId?, type, label?, order }[]
    } = body

    if (!name || !review) return NextResponse.json({ error: 'name and review required' }, { status: 400 })

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        review,
        rating         : Number(rating ?? 5),
        avatar         : avatar          || null,
        avatarPublicId : avatarPublicId  || null,
        isApproved     : isApproved      ?? false,
        isFeatured     : isFeatured      ?? false,
        source         : source          || null,
        serviceId      : serviceId       ? Number(serviceId)  : null,
        patientId      : patientId       ? Number(patientId)  : null,
        treatmentDate  : treatmentDate   ? new Date(treatmentDate) : null,
        images         : images?.length
          ? { create: images.map((img: any, i: number) => ({ url: img.url, publicId: img.publicId || null, type: img.type || 'before_after', label: img.label || null, order: img.order ?? i })) }
          : undefined,
      },
      include: { images: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ testimonial }, { status: 201 })
  } catch (err) {
    console.error('[reviews POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
