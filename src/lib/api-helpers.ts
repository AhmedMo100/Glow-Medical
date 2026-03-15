import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return NextResponse.json({
    success: true,
    data,
    meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  })
}

export function getPagination(url: URL) {
  const page     = Math.max(1, parseInt(url.searchParams.get('page')     ?? '1'))
  const pageSize = Math.min(100, parseInt(url.searchParams.get('pageSize') ?? '20'))
  const skip     = (page - 1) * pageSize
  const search   = url.searchParams.get('q') ?? ''
  return { page, pageSize, skip, search }
}
