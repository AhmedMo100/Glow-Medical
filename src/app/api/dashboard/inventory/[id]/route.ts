// app/api/dashboard/inventory/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// Auto-calculate status from quantity
function calcStatus(qty: number, min: number, expiry?: Date | null): string {
  if (expiry && expiry < new Date()) return 'EXPIRED'
  if (qty === 0) return 'OUT_OF_STOCK'
  if (qty <= min) return 'LOW_STOCK'
  return 'IN_STOCK'
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const item   = await prisma.inventoryItem.findUnique({
      where  : { id: Number(id) },
      include: {
        movements: { orderBy: { createdAt: 'desc' }, take: 30 },
        _count   : { select: { movements: true } },
      },
    })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ item })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const body    = await req.json()
    const itemId  = Number(id)

    // If this is a stock movement (restock / adjust)
    if (body.movementType !== undefined) {
      const { movementType, movementQty, notes, performedBy } = body
      const current = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
      if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      let newQty = current.quantity
      if (movementType === 'RESTOCK')    newQty += Number(movementQty)
      if (movementType === 'USED')       newQty  = Math.max(0, newQty - Number(movementQty))
      if (movementType === 'ADJUSTMENT') newQty  = Number(movementQty)

      const newStatus = calcStatus(newQty, current.minQuantity, current.expiryDate ?? null)

      const [item] = await prisma.$transaction([
        prisma.inventoryItem.update({
          where: { id: itemId },
          data : { quantity: newQty, status: newStatus as any, lastRestockedAt: movementType === 'RESTOCK' ? new Date() : undefined },
        }),
        prisma.inventoryMovement.create({
          data: { itemId, type: movementType, quantity: Number(movementQty), notes: notes || null, performedBy: performedBy || null },
        }),
      ])
      return NextResponse.json({ item })
    }

    // Regular field update
    const {
      name, sku, barcode, category, description, imageUrl,
      unit, minQuantity, reorderQuantity,
      costPrice, sellingPrice, supplier, supplierPhone,
      expiryDate, isActive, status,
    } = body

    const current = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const newMin    = minQuantity  !== undefined ? Number(minQuantity) : current.minQuantity
    const newExpiry = expiryDate   !== undefined ? (expiryDate ? new Date(expiryDate) : null) : current.expiryDate
    const newStatus = status ?? calcStatus(current.quantity, newMin, newExpiry)

    const item = await prisma.inventoryItem.update({
      where: { id: itemId },
      data : {
        ...(name            !== undefined && { name }),
        ...(sku             !== undefined && { sku:             sku             || null }),
        ...(barcode         !== undefined && { barcode:         barcode         || null }),
        ...(category        !== undefined && { category }),
        ...(description     !== undefined && { description:     description     || null }),
        ...(imageUrl        !== undefined && { imageUrl:        imageUrl        || null }),
        ...(unit            !== undefined && { unit }),
        ...(minQuantity     !== undefined && { minQuantity:     newMin }),
        ...(reorderQuantity !== undefined && { reorderQuantity: Number(reorderQuantity) }),
        ...(costPrice       !== undefined && { costPrice:       costPrice       ? Number(costPrice)    : null }),
        ...(sellingPrice    !== undefined && { sellingPrice:    sellingPrice    ? Number(sellingPrice) : null }),
        ...(supplier        !== undefined && { supplier:        supplier        || null }),
        ...(supplierPhone   !== undefined && { supplierPhone:   supplierPhone   || null }),
        ...(expiryDate      !== undefined && { expiryDate:      newExpiry }),
        ...(isActive        !== undefined && { isActive }),
        status: newStatus as any,
      },
    })
    return NextResponse.json({ item })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'SKU or barcode already exists' }, { status: 409 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.inventoryItem.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
