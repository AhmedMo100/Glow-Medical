// src/lib/notifications.ts
import prisma from './prisma'
import { Prisma } from '@/generated/prisma'

interface NotifInput {
  type    : string   // "new_appointment" | "new_message" | "new_review" | "low_stock" | "system"
  title   : string
  body    : string
  href?   : string
  icon?   : string
  isUrgent?: boolean
  meta?   : Record<string, unknown>
}

export async function pushNotification(n: NotifInput) {
  try {
    await prisma.adminNotification.create({
      data: {
        type    : n.type,
        title   : n.title,
        body    : n.body,
        href    : n.href    ?? null,
        icon    : n.icon    ?? null,
        isUrgent: n.isUrgent ?? false,
        meta: n.meta as Prisma.JsonObject | undefined,
      },
    })
  } catch (e) {
    console.error('[notifications] push failed:', e)
  }
}
