import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const postId  = Number(id)
    if (isNaN(postId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const post = await prisma.blogPost.findFirst({
      where  : { id: postId, isPublished: true },
      include: { sections: { orderBy: { order: 'asc' } } },
    })

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ post })
  } catch (err) {
    console.error('[public blog id]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
