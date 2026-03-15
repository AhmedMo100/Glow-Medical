// src/app/api/dashboard/upload/route.ts
// ⚠️ Disable Next.js body parser — required for FormData/multipart
export const config = { api: { bodyParser: false } }

import { NextRequest, NextResponse } from 'next/server'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file')   as File | null
    const folder   = (formData.get('folder') as string | null) ?? 'general'

    if (!file)
      return NextResponse.json({ error: 'لم يتم إرفاق ملف' }, { status: 400 })
    if (!file.type.startsWith('image/'))
      return NextResponse.json({ error: 'صور فقط (JPG, PNG, WebP)' }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'الحجم أكبر من 5 ميجا' }, { status: 400 })

    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const { url, publicId } = await uploadToCloudinary(buffer, folder)

    return NextResponse.json({ url, publicId })
  } catch (e) {
    console.error('[upload]', e)
    return NextResponse.json({ error: 'فشل رفع الصورة' }, { status: 500 })
  }
}
