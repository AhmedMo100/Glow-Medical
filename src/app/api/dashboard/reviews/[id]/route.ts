// app/api/dashboard/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key   : process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const review  = await prisma.testimonial.findUnique({
      where  : { id: Number(id) },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ review })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const revId  = Number(id)

    const {
      name, review, rating, avatar, avatarPublicId,
      isApproved, isFeatured, source, serviceId, patientId,
      treatmentDate, images,
    } = body

    // Rebuild images if provided
    if (images !== undefined) {
      // Delete removed images from Cloudinary
      const existing = await prisma.testimonialImage.findMany({ where: { testimonialId: revId } })
      const newUrls  = images.map((i: any) => i.url)
      const toDelete = existing.filter(e => !newUrls.includes(e.url))
      for (const img of toDelete) {
        if (img.publicId) {
          try { await cloudinary.uploader.destroy(img.publicId) } catch {}
        }
      }
      await prisma.testimonialImage.deleteMany({ where: { testimonialId: revId } })
      if (images.length) {
        await prisma.testimonialImage.createMany({
          data: images.map((img: any, i: number) => ({
            testimonialId: revId,
            url     : img.url,
            publicId: img.publicId  || null,
            type    : img.type      || 'before_after',
            label   : img.label     || null,
            order   : img.order     ?? i,
          })),
        })
      }
    }

    const testimonial = await prisma.testimonial.update({
      where: { id: revId },
      data : {
        ...(name          !== undefined && { name }),
        ...(review        !== undefined && { review }),
        ...(rating        !== undefined && { rating: Number(rating) }),
        ...(avatar        !== undefined && { avatar:         avatar         || null }),
        ...(avatarPublicId!== undefined && { avatarPublicId: avatarPublicId || null }),
        ...(isApproved    !== undefined && { isApproved }),
        ...(isFeatured    !== undefined && { isFeatured }),
        ...(source        !== undefined && { source:        source        || null }),
        ...(serviceId     !== undefined && { serviceId:     serviceId     ? Number(serviceId)  : null }),
        ...(patientId     !== undefined && { patientId:     patientId     ? Number(patientId)  : null }),
        ...(treatmentDate !== undefined && { treatmentDate: treatmentDate ? new Date(treatmentDate) : null }),
      },
      include: { images: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json({ testimonial })
  } catch (err) {
    console.error('[reviews PATCH]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const revId   = Number(id)

    // Delete images from Cloudinary
    const testimonial = await prisma.testimonial.findUnique({
      where  : { id: revId },
      include: { images: true },
    })
    if (testimonial) {
      if (testimonial.avatarPublicId) {
        try { await cloudinary.uploader.destroy(testimonial.avatarPublicId) } catch {}
      }
      for (const img of testimonial.images) {
        if (img.publicId) {
          try { await cloudinary.uploader.destroy(img.publicId) } catch {}
        }
      }
    }

    await prisma.testimonial.delete({ where: { id: revId } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
