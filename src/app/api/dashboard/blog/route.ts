// app/api/dashboard/blog/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/* ─────────────────── GET ─────────────────── */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search    = searchParams.get('search')    ?? ''
    const published = searchParams.get('published')
    const page      = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit     = Math.min(100, Number(searchParams.get('limit') ?? 12))

    const where: any = {}
    if (published !== null && published !== '') where.isPublished = published === 'true'
    if (search) {
      where.OR = [
        { title  : { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { author : { contains: search, mode: 'insensitive' } },
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip   : (page - 1) * limit,
        take   : limit,
        select : {
          id         : true,
          title      : true,
          slug       : true,
          excerpt    : true,
          coverImage : true,
          isPublished: true,
          isFeatured : true,
          author     : true,
          tags       : true,
          readTime   : true,
          publishedAt: true,
          createdAt  : true,
          updatedAt  : true,
          _count     : { select: { sections: true } },
        },
      }),
      prisma.blogPost.count({ where }),
    ])

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('[blog GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

/* ─────────────────── POST ────────────────── */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      title, slug, excerpt, content, seoTitle, seoDescription,
      coverImage, readTime, isPublished, isFeatured, author, tags, sections,
    } = body

    if (!title || !slug || !content)
      return NextResponse.json({ error: 'title, slug, content required' }, { status: 400 })

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt       : excerpt        || null,
        content,
        seoTitle      : seoTitle       || null,
        seoDescription: seoDescription || null,
        coverImage    : coverImage     || null,
        readTime      : readTime       ? Number(readTime) : null,
        isPublished   : isPublished    ?? false,
        isFeatured    : isFeatured     ?? false,
        author        : author         || 'Glow Medical Team',
        tags          : tags           || [],
        publishedAt   : isPublished    ? new Date() : null,
        sections      : sections?.length
          ? {
              create: sections.map((s: any, i: number) => ({
                heading : s.heading  || null,
                body    : s.body,
                imageUrl: s.imageUrl || null,
                imageAlt: s.imageAlt || null,
                order   : s.order    ?? i,
              })),
            }
          : undefined,
      },
      // ⚠️ NO images — BlogPost schema has no images relation
      include: { sections: { orderBy: { order: 'asc' } } },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('[blog POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
