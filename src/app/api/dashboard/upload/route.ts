// app/api/upload/route.ts
// ضع الملف ده في: src/app/api/upload/route.ts
// أو:             app/api/upload/route.ts
// حسب structure مشروعك

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key    : process.env.CLOUDINARY_API_KEY!,
  api_secret : process.env.CLOUDINARY_API_SECRET!,
})

// ── مهم: لازم تضيف ده في next.config.ts/js ──────────────
// export const config = {
//   api: { bodyParser: false },
// }
// ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file')   as File   | null
    const folder   = formData.get('folder') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5 MB' }, { status: 400 })
    }

    // Convert file to base64
    const bytes  = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder       : folder || 'glow-medical',
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
    })

    return NextResponse.json({
      url     : result.secure_url,
      publicId: result.public_id,
      width   : result.width,
      height  : result.height,
    })
  } catch (err: any) {
    console.error('[upload POST]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body     = await req.json()
    const publicId = body?.publicId as string | undefined

    if (!publicId) {
      return NextResponse.json({ error: 'publicId is required' }, { status: 400 })
    }

    await cloudinary.uploader.destroy(publicId)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[upload DELETE]', err)
    return NextResponse.json(
      { error: err?.message ?? 'Delete failed' },
      { status: 500 }
    )
  }
}
