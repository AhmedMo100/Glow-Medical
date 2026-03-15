// src/lib/notify.ts
// Call this from any API route to push a notification to the admin feed
import { prisma } from '@/lib/prisma'

type NotifyInput = {
  type    : 'new_appointment' | 'new_message' | 'new_review' | 'low_stock' | 'system'
  title   : string
  body    : string
  href?   : string
  icon?   : string
  isUrgent?: boolean
  meta?   : Record<string, unknown>
}

export async function pushNotification(input: NotifyInput) {
  try {
    await prisma.adminNotification.create({ data: input })
  } catch {
    // Non-blocking — never crash the main request
  }
}
