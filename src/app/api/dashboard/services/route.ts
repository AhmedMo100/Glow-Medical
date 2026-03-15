// app/api/dashboard/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const active = searchParams.get('active')
    const catId  = searchParams.get('categoryId')
    const page   = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit  = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'
    if (catId)  where.categoryId = Number(catId)
    if (search) where.OR = [
      { name       : { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        skip   : (page - 1) * limit,
        take   : limit,
        include: {
          category: { select: { id: true, name: true, color: true } },
          _count  : { select: { appointmentServices: true } },
        },
      }),
      prisma.service.count({ where }),
    ])

    return NextResponse.json({ services, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[services GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, slug, description, shortDescription,
      price, discountedPrice, duration,
      imageUrl, isActive, isFeatured, order, categoryId,
    } = body

    if (!name || !slug || !price || !categoryId)
      return NextResponse.json({ error: 'name, slug, price, categoryId required' }, { status: 400 })

    const service = await prisma.service.create({
      data: {
        name, slug,
        description     : description      || null,
        shortDescription: shortDescription || null,
        price           : Number(price),
        discountedPrice : discountedPrice ? Number(discountedPrice) : null,
        duration        : duration        ? Number(duration)        : null,
        imageUrl        : imageUrl        || null,
        isActive        : isActive        ?? true,
        isFeatured      : isFeatured      ?? false,
        order           : order           ?? 0,
        categoryId      : Number(categoryId),
      },
      include: { category: { select: { id: true, name: true, color: true } } },
    })
    return NextResponse.json({ service }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('[services POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
