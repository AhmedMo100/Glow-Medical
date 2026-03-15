// app/api/dashboard/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const service = await prisma.service.findUnique({
      where  : { id: Number(id) },
      include: { category: true, _count: { select: { appointmentServices: true } } },
    })
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ service })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const {
      name, slug, description, shortDescription,
      price, discountedPrice, duration,
      imageUrl, isActive, isFeatured, order, categoryId,
    } = body

    const service = await prisma.service.update({
      where: { id: Number(id) },
      data : {
        ...(name             !== undefined && { name }),
        ...(slug             !== undefined && { slug }),
        ...(description      !== undefined && { description:      description      || null }),
        ...(shortDescription !== undefined && { shortDescription: shortDescription || null }),
        ...(price            !== undefined && { price:            Number(price) }),
        ...(discountedPrice  !== undefined && { discountedPrice:  discountedPrice ? Number(discountedPrice) : null }),
        ...(duration         !== undefined && { duration:         duration        ? Number(duration)        : null }),
        ...(imageUrl         !== undefined && { imageUrl:         imageUrl        || null }),
        ...(isActive         !== undefined && { isActive }),
        ...(isFeatured       !== undefined && { isFeatured }),
        ...(order            !== undefined && { order }),
        ...(categoryId       !== undefined && { categoryId: Number(categoryId) }),
      },
      include: { category: { select: { id: true, name: true, color: true } } },
    })
    return NextResponse.json({ service })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.service.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
