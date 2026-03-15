// app/api/dashboard/finance/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body   = await req.json()
    const { type, category, amount, description, notes, receiptUrl, transactionDate, reference } = body

    const transaction = await prisma.transaction.update({
      where: { id: Number(id) },
      data : {
        ...(type            !== undefined && { type }),
        ...(category        !== undefined && { category }),
        ...(amount          !== undefined && { amount: Number(amount) }),
        ...(description     !== undefined && { description:     description     || null }),
        ...(notes           !== undefined && { notes:           notes           || null }),
        ...(receiptUrl      !== undefined && { receiptUrl:      receiptUrl      || null }),
        ...(transactionDate !== undefined && { transactionDate: transactionDate ? new Date(transactionDate) : new Date() }),
        ...(reference       !== undefined && { reference:       reference       || null }),
      },
    })
    return NextResponse.json({ transaction })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    await prisma.transaction.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
