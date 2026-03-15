// app/api/dashboard/settings/admin/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hash, compare } from 'bcryptjs'
import prisma from '@/lib/prisma'

/* ── GET: current admin profile ──────────────────────────── */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await prisma.adminUser.findUnique({
      where : { email: session.user.email },
      select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true, lastLoginAt: true, createdAt: true },
    })
    return NextResponse.json({ admin })
  } catch (err) {
    console.error('[settings/admin GET]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

/* ── PATCH: update profile / change password ─────────────── */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, avatar, currentPassword, newPassword } = body

    const admin = await prisma.adminUser.findUnique({ where: { email: session.user.email } })
    if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

    // Handle password change
    if (newPassword) {
      if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
      const match = await compare(currentPassword, admin.passwordHash)
      if (!match)            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      if (newPassword.length < 6) return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const updated = await prisma.adminUser.update({
      where: { id: admin.id },
      data : {
        ...(name        !== undefined && { name }),
        ...(avatar      !== undefined && { avatar: avatar || null }),
        ...(newPassword             && { passwordHash: await hash(newPassword, 12) }),
      },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    })

    return NextResponse.json({ admin: updated, message: newPassword ? 'Password changed successfully' : 'Profile updated' })
  } catch (err) {
    console.error('[settings/admin PATCH]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
