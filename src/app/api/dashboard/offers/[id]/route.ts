// app/api/dashboard/offers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const offerId = Number(id)

    const {
      title, slug, description, type,
      imageUrl, originalPrice, finalPrice, discountPct,
      validFrom, validUntil, isActive, isFeatured,
      usageLimit, termsText, serviceIds,
    } = body

    // Rebuild services if provided
    if (serviceIds !== undefined) {
      await prisma.offerService.deleteMany({ where: { offerId } })
      if (serviceIds.length) {
        await prisma.offerService.createMany({
          data: serviceIds.map((sid: number) => ({ offerId, serviceId: sid })),
        })
      }
    }

    const offer = await prisma.offer.update({
      where: { id: offerId },
      data : {
        ...(title         !== undefined && { title }),
        ...(slug          !== undefined && { slug }),
        ...(description   !== undefined && { description:   description   || null }),
        ...(type          !== undefined && { type }),
        ...(imageUrl      !== undefined && { imageUrl:      imageUrl      || null }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(finalPrice    !== undefined && { finalPrice:    Number(finalPrice) }),
        ...(discountPct   !== undefined && { discountPct:   discountPct   ? Number(discountPct)  : null }),
        ...(validFrom     !== undefined && { validFrom:     validFrom     ? new Date(validFrom)  : null }),
        ...(validUntil    !== undefined && { validUntil:    validUntil    ? new Date(validUntil) : null }),
        ...(isActive      !== undefined && { isActive }),
        ...(isFeatured    !== undefined && { isFeatured }),
        ...(usageLimit    !== undefined && { usageLimit:    usageLimit    ? Number(usageLimit)   : null }),
        ...(termsText     !== undefined && { termsText:     termsText     || null }),
      },
      include: {
        services: { include: { service: { select: { id: true, name: true } } } },
      },
    })
    return NextResponse.json({ offer })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.offer.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
