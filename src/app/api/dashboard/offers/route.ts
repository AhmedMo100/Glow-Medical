// app/api/dashboard/offers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const active = searchParams.get('active')
    const page   = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit  = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'
    if (search) where.OR = [
      { title      : { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip   : (page - 1) * limit,
        take   : limit,
        include: {
          services: { include: { service: { select: { id: true, name: true, price: true } } } },
          _count  : { select: { appointmentOffers: true } },
        },
      }),
      prisma.offer.count({ where }),
    ])

    return NextResponse.json({ offers, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[offers GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, slug, description, type,
      imageUrl, originalPrice, finalPrice, discountPct,
      validFrom, validUntil, isActive, isFeatured,
      usageLimit, termsText,
      serviceIds, // number[]
    } = body

    if (!title || !slug || !originalPrice || !finalPrice)
      return NextResponse.json({ error: 'title, slug, prices required' }, { status: 400 })

    const offer = await prisma.offer.create({
      data: {
        title,
        slug,
        description  : description   || null,
        type         : type          || 'BUNDLE',
        imageUrl     : imageUrl      || null,
        originalPrice: Number(originalPrice),
        finalPrice   : Number(finalPrice),
        discountPct  : discountPct   ? Number(discountPct)                    : null,
        validFrom    : validFrom     ? new Date(validFrom)                    : null,
        validUntil   : validUntil    ? new Date(validUntil)                   : null,
        isActive     : isActive      ?? true,
        isFeatured   : isFeatured    ?? false,
        usageLimit   : usageLimit    ? Number(usageLimit)                     : null,
        termsText    : termsText     || null,
        services     : serviceIds?.length
          ? { create: serviceIds.map((sid: number) => ({ serviceId: sid })) }
          : undefined,
      },
      include: {
        services: { include: { service: { select: { id: true, name: true } } } },
      },
    })
    return NextResponse.json({ offer }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('[offers POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
