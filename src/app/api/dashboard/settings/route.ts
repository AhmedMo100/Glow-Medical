// app/api/dashboard/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import prisma from '@/lib/prisma'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key   : process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

/* ── GET: fetch settings (create if not exists) ──────────── */
export async function GET() {
  try {
    let settings = await prisma.clinicSetting.findFirst({
      include: { galleryImages: { orderBy: { order: 'asc' } } },
    })

    // Auto-create default settings row on first boot
    if (!settings) {
      settings = await prisma.clinicSetting.create({
        data   : { clinicName: 'Glow Medical' },
        include: { galleryImages: { orderBy: { order: 'asc' } } },
      })
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('[settings GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

/* ── PATCH: update settings fields ──────────────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      clinicName, tagline, phone, phone2, email,
      address, mapUrl, workingHours, whatsapp,
      facebook, instagram, twitter, tiktok,
      logoUrl, faviconUrl, aboutText,
      metaTitle, metaDescription,
      // Gallery actions
      galleryAdd,    // { url, alt?, order? }[]
      galleryRemove, // { id, publicId? }[]
      galleryReorder,// { id, order }[]
    } = body

    // Get existing settings
    let settings = await prisma.clinicSetting.findFirst()
    if (!settings) {
      settings = await prisma.clinicSetting.create({ data: { clinicName: 'Glow Medical' } })
    }

    // Handle gallery removals (delete from Cloudinary + DB)
    if (galleryRemove?.length) {
      for (const img of galleryRemove) {
        if (img.publicId) {
          try { await cloudinary.uploader.destroy(img.publicId) } catch {}
        }
      }
      await prisma.clinicImage.deleteMany({
        where: { id: { in: galleryRemove.map((i: any) => i.id) } },
      })
    }

    // Handle gallery additions
    if (galleryAdd?.length) {
      const maxOrder = await prisma.clinicImage.aggregate({
        where : { settingId: settings.id },
        _max  : { order: true },
      })
      const startOrder = (maxOrder._max.order ?? -1) + 1
      await prisma.clinicImage.createMany({
        data: galleryAdd.map((img: any, i: number) => ({
          settingId: settings!.id,
          url      : img.url,
          alt      : img.alt   || null,
          order    : img.order ?? startOrder + i,
        })),
      })
    }

    // Handle gallery reorder
    if (galleryReorder?.length) {
      await Promise.all(
        galleryReorder.map((item: { id: number; order: number }) =>
          prisma.clinicImage.update({ where: { id: item.id }, data: { order: item.order } })
        )
      )
    }

    // Update main settings fields
    const updated = await prisma.clinicSetting.update({
      where: { id: settings.id },
      data : {
        ...(clinicName      !== undefined && { clinicName      }),
        ...(tagline         !== undefined && { tagline         : tagline         || null }),
        ...(phone           !== undefined && { phone           : phone           || null }),
        ...(phone2          !== undefined && { phone2          : phone2          || null }),
        ...(email           !== undefined && { email           : email           || null }),
        ...(address         !== undefined && { address         : address         || null }),
        ...(mapUrl          !== undefined && { mapUrl          : mapUrl          || null }),
        ...(workingHours    !== undefined && { workingHours    : workingHours    || null }),
        ...(whatsapp        !== undefined && { whatsapp        : whatsapp        || null }),
        ...(facebook        !== undefined && { facebook        : facebook        || null }),
        ...(instagram       !== undefined && { instagram       : instagram       || null }),
        ...(twitter         !== undefined && { twitter         : twitter         || null }),
        ...(tiktok          !== undefined && { tiktok          : tiktok          || null }),
        ...(logoUrl         !== undefined && { logoUrl         : logoUrl         || null }),
        ...(faviconUrl      !== undefined && { faviconUrl      : faviconUrl      || null }),
        ...(aboutText       !== undefined && { aboutText       : aboutText       || null }),
        ...(metaTitle       !== undefined && { metaTitle       : metaTitle       || null }),
        ...(metaDescription !== undefined && { metaDescription : metaDescription || null }),
      },
      include: { galleryImages: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ settings: updated })
  } catch (err) {
    console.error('[settings PATCH]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
