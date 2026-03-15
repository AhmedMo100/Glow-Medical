// app/api/dashboard/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const { name, slug, description, icon, imageUrl, color, isActive, order } = body

    const category = await prisma.category.update({
      where: { id: Number(id) },
      data : {
        ...(name        !== undefined && { name }),
        ...(slug        !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(icon        !== undefined && { icon:        icon        || null }),
        ...(imageUrl    !== undefined && { imageUrl:    imageUrl    || null }),
        ...(color       !== undefined && { color:       color       || null }),
        ...(isActive    !== undefined && { isActive }),
        ...(order       !== undefined && { order }),
      },
    })
    return NextResponse.json({ category })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.category.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed — category may have services' }, { status: 500 })
  }
}
