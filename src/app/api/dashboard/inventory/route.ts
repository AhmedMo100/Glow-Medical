// app/api/dashboard/inventory/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search   = searchParams.get('search')   ?? ''
    const category = searchParams.get('category') ?? ''
    const status   = searchParams.get('status')   ?? ''
    const page     = Math.max(1, Number(searchParams.get('page')  ?? 1))
    const limit    = Math.min(100, Number(searchParams.get('limit') ?? 20))

    const where: any = {}
    if (category) where.category = category
    if (status)   where.status   = status
    if (search)   where.OR = [
      { name    : { contains: search, mode: 'insensitive' } },
      { sku     : { contains: search, mode: 'insensitive' } },
      { supplier: { contains: search, mode: 'insensitive' } },
    ]

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        orderBy: [{ status: 'asc' }, { name: 'asc' }],
        skip   : (page - 1) * limit,
        take   : limit,
        include: { _count: { select: { movements: true } } },
      }),
      prisma.inventoryItem.count({ where }),
    ])

    // Status summary counts
    const [inStock, lowStock, outOfStock, expired] = await Promise.all([
      prisma.inventoryItem.count({ where: { status: 'IN_STOCK'    } }),
      prisma.inventoryItem.count({ where: { status: 'LOW_STOCK'   } }),
      prisma.inventoryItem.count({ where: { status: 'OUT_OF_STOCK'} }),
      prisma.inventoryItem.count({ where: { status: 'EXPIRED'     } }),
    ])

    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit), summary: { inStock, lowStock, outOfStock, expired } })
  } catch (err) {
    console.error('[inventory GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, sku, barcode, category, description, imageUrl,
      unit, quantity, minQuantity, reorderQuantity,
      costPrice, sellingPrice, supplier, supplierPhone,
      expiryDate, isActive,
    } = body

    if (!name || !category) return NextResponse.json({ error: 'name and category required' }, { status: 400 })

    // Auto-determine status
    const qty = Number(quantity ?? 0)
    const min = Number(minQuantity ?? 5)
    let status = 'IN_STOCK'
    if (qty === 0) status = 'OUT_OF_STOCK'
    else if (qty <= min) status = 'LOW_STOCK'
    if (expiryDate && new Date(expiryDate) < new Date()) status = 'EXPIRED'

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        sku            : sku             || null,
        barcode        : barcode         || null,
        category,
        status,
        description    : description     || null,
        imageUrl       : imageUrl        || null,
        unit           : unit            || 'piece',
        quantity       : qty,
        minQuantity    : min,
        reorderQuantity: Number(reorderQuantity ?? 10),
        costPrice      : costPrice       ? Number(costPrice)    : null,
        sellingPrice   : sellingPrice    ? Number(sellingPrice) : null,
        supplier       : supplier        || null,
        supplierPhone  : supplierPhone   || null,
        expiryDate     : expiryDate      ? new Date(expiryDate) : null,
        isActive       : isActive        ?? true,
      },
    })

    // Log initial stock movement
    if (qty > 0) {
      await prisma.inventoryMovement.create({
        data: { itemId: item.id, type: 'RESTOCK', quantity: qty, notes: 'Initial stock' },
      })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'SKU or barcode already exists' }, { status: 409 })
    console.error('[inventory POST]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
