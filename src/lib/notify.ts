// src/lib/notify.ts
import prisma from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'

type NotifyInput = {
  type: 'new_appointment' | 'new_message' | 'new_review' | 'low_stock' | 'system'
  title: string
  body: string
  href?: string
  icon?: string
  isUrgent?: boolean
  meta?: Record<string, unknown>
}

export async function pushNotification(input: NotifyInput) {
  try {
    await prisma.adminNotification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        href: input.href ?? null,
        icon: input.icon ?? null,
        isUrgent: input.isUrgent ?? false,
        meta: input.meta as Prisma.JsonObject | undefined,
      },
    })
  } catch {
    // Non-blocking — never crash the main request
  }
}
