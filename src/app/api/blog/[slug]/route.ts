// app/api/public/blog/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    const post = await prisma.blogPost.findFirst({
      where  : { slug, isPublished: true },
      include: {
        sections: { orderBy: { order: 'asc' } },
      },
    })
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[public blog GET slug]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
