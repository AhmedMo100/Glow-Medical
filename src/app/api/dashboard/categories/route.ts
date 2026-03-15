// app/api/dashboard/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const active = searchParams.get('active')

    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'
    if (search) where.OR = [
      { name       : { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]

    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { services: true } } },
    })

    return NextResponse.json({ categories })
  } catch (err) {
    console.error('[categories GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, description, icon, imageUrl, color, isActive, order } = body

    if (!name || !slug) return NextResponse.json({ error: 'name and slug required' }, { status: 400 })

    const category = await prisma.category.create({
      data: {
        name, slug,
        description: description || null,
        icon       : icon        || null,
        imageUrl   : imageUrl    || null,
        color      : color       || null,
        isActive   : isActive    ?? true,
        order      : order       ?? 0,
      },
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    console.error('[categories POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
