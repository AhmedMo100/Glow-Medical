// app/api/book/services/route.ts
// PUBLIC — no auth required
// Returns active services grouped by category + active valid offers

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    const [categories, offers] = await Promise.all([
      prisma.category.findMany({
        where  : { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          services: {
            where  : { isActive: true },
            orderBy: { order: 'asc' },
            select : {
              id              : true,
              name            : true,
              shortDescription: true,
              price           : true,
              discountedPrice : true,
              duration        : true,
              imageUrl        : true,
            },
          },
        },
      }),

      prisma.offer.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ validFrom:  null }, { validFrom:  { lte: now } }] },
            { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
            // Don't show offers that hit their usage limit
            { OR: [{ usageLimit: null }, { usageCount: { lt: prisma.offer.fields.usageLimit as any } }] },
          ],
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          services: {
            include: { service: { select: { id: true, name: true } } },
          },
        },
        // Workaround: fetch all and filter usageLimit in JS (Prisma can't compare two fields)
      }),
    ])

    // Filter usage limit in JS
    const validOffers = offers.filter(o =>
      o.usageLimit === null || o.usageCount < o.usageLimit
    )

    // Drop categories with no active services
    const filteredCategories = categories.filter(c => c.services.length > 0)

    return NextResponse.json({
      categories: filteredCategories,
      offers    : validOffers,
    })
  } catch (err) {
    console.error('[/api/book/services]', err)
    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 })
  }
}
