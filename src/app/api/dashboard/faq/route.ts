// app/api/dashboard/faq/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') ?? ''
    const active = searchParams.get('active')
    const cat    = searchParams.get('category') ?? ''

    const where: any = {}
    if (active !== null && active !== '') where.isActive = active === 'true'
    if (cat)    where.category = cat
    if (search) where.OR = [
      { question: { contains: search, mode: 'insensitive' } },
      { answer  : { contains: search, mode: 'insensitive' } },
    ]

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    // distinct categories for filter
    const cats = await prisma.fAQ.findMany({
      select  : { category: true },
      distinct: ['category'],
      where   : { category: { not: null } },
    })

    return NextResponse.json({ faqs, categories: cats.map(c => c.category).filter(Boolean) })
  } catch (err) {
    console.error('[faq GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { question, answer, category, order, isActive, isFeatured } = body

    if (!question || !answer)
      return NextResponse.json({ error: 'question and answer required' }, { status: 400 })

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category  : category   || null,
        order     : order      ?? 0,
        isActive  : isActive   ?? true,
        isFeatured: isFeatured ?? false,
      },
    })
    return NextResponse.json({ faq }, { status: 201 })
  } catch (err) {
    console.error('[faq POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
