// ============================================================
//  GLOW MEDICAL — SHARED UTILITIES
// ============================================================

// ─── Slug ────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[\u0600-\u06ff]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

// ─── Currency ────────────────────────────────────────────────
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return '—'
  const num = Number(amount)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

// ─── Date helpers ─────────────────────────────────────────────
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const diff  = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return formatDate(date)
}

export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── API helpers (server-side only) ───────────────────────────
export function apiResponse<T>(data: T, status = 200): Response {
  return Response.json(data, { status })
}

export function apiError(message: string, status = 400): Response {
  return Response.json({ error: message }, { status })
}

// ─── Number helpers ───────────────────────────────────────────
export function toNumber(val: unknown): number {
  const n = Number(val)
  return isNaN(n) ? 0 : n
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// ─── String helpers ───────────────────────────────────────────
export function truncate(str: string | null | undefined, maxLen: number): string {
  if (!str) return ''
  return str.length <= maxLen ? str : str.slice(0, maxLen).trimEnd() + '…'
}

export function capitalize(str: string | null | undefined): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function enumLabel(val: string | null | undefined): string {
  if (!val) return ''
  return val.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

// ─── Array helpers ─────────────────────────────────────────────
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = String(item[key])
    acc[k] = acc[k] ? [...acc[k], item] : [item]
    return acc
  }, {} as Record<string, T[]>)
}

// ─── Validation ────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^(\+20|0)?1[0-2,5]\d{8}$/.test(phone.replace(/\s/g, ''))
}

// ─── Status colors ─────────────────────────────────────────────
export const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#10b981', CANCELLED: '#ef4444', NO_SHOW: '#6b7280',
  UNPAID: '#ef4444', PARTIAL: '#f59e0b', PAID: '#10b981', REFUNDED: '#6b7280',
  ACTIVE: '#10b981', INACTIVE: '#6b7280', ON_LEAVE: '#f59e0b', BLACKLISTED: '#ef4444',
  REVENUE: '#10b981', EXPENSE: '#ef4444', SALARY: '#f59e0b', REFUND: '#6b7280',
  IN_STOCK: '#10b981', LOW_STOCK: '#f59e0b', OUT_OF_STOCK: '#ef4444',
  EXPIRED: '#8b5cf6', DISCONTINUED: '#6b7280',
  UNREAD: '#ef4444', READ: '#6b7280', ARCHIVED: '#8b5cf6', REPLIED: '#10b981',
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? '#6b7280'
}

export function badgeStyle(status: string): Record<string, string | number> {
  const color = statusColor(status)
  return {
    display: 'inline-block',
    padding: '.2rem .65rem',
    borderRadius: 20,
    fontSize: '.72rem',
    fontWeight: 600,
    background: `${color}20`,
    color,
    whiteSpace: 'nowrap',
  }
}

// ─── Type coercion for Prisma (handles empty strings from HTML forms) ──────
/**
 * Safely parses any value to Int.
 * Returns null for empty strings, null, undefined, or NaN.
 * Use for all Prisma Int? fields coming from form inputs.
 */
export function toInt(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseInt(String(v), 10)
  return isNaN(n) ? null : n
}

/**
 * Safely parses any value to Float.
 * Returns null for empty strings, null, undefined, or NaN.
 * Use for all Prisma Decimal? fields coming from form inputs.
 */
export function toFloat(v: unknown): number | null {
  if (v === '' || v === null || v === undefined) return null
  const n = parseFloat(String(v))
  return isNaN(n) ? null : n
}
