'use client'
// src/components/layout/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, UserRound, Users,
  Stethoscope, Tag, Gift, FileText, Sparkles, HelpCircle,
  DollarSign, Package, MessageSquare, Star, MessageCircle,
  Settings, ChevronRight, X,
} from 'lucide-react'

const NAV = [
  { label: 'Overview',       href: '/dashboard/overview',    icon: LayoutDashboard },
  { label: 'Appointments',   href: '/dashboard/appointments',icon: CalendarDays },
  { label: 'Patients',       href: '/dashboard/patients',    icon: UserRound },
  { label: 'Staff',          href: '/dashboard/staff',       icon: Users },
  { sep: 'CONTENT' },
  { label: 'Services',       href: '/dashboard/services',    icon: Stethoscope },
  { label: 'Categories',     href: '/dashboard/categories',  icon: Tag },
  { label: 'Offers',         href: '/dashboard/offers',      icon: Gift },
  { label: 'Blog',           href: '/dashboard/blog',        icon: FileText },
  { label: 'AI Blog Writer', href: '/dashboard/blog-ai',     icon: Sparkles },
  { label: 'FAQ',            href: '/dashboard/faq',         icon: HelpCircle },
  { sep: 'OPERATIONS' },
  { label: 'Finance',        href: '/dashboard/finance',     icon: DollarSign },
  { label: 'Inventory',      href: '/dashboard/inventory',   icon: Package },
  { label: 'Messages',       href: '/dashboard/messages',    icon: MessageSquare },
  { label: 'Reviews',        href: '/dashboard/reviews',     icon: Star },
  { label: 'WhatsApp',       href: '/dashboard/whatsapp',    icon: MessageCircle },
  { sep: 'SYSTEM' },
  { label: 'Settings',       href: '/dashboard/settings',    icon: Settings },
] as const

interface SidebarProps {
  collapsed    : boolean
  mobileOpen   : boolean
  onMobileClose: () => void
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const navContent = (
    <nav style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Logo ── */}
      <div style={{
        padding: collapsed ? '1.2rem 0' : '1.1rem 1rem 1.1rem 1.15rem',
        display: 'flex', alignItems: 'center', gap: '.75rem',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
        minHeight: 64,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(196,154,108,.15)',
          border: '1.5px solid rgba(196,154,108,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
            <rect x="10" y="4" width="4" height="16" rx="2" fill="#c49a6c" />
            <rect x="4" y="10" width="16" height="4" rx="2" fill="#c49a6c" />
          </svg>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '.95rem', color: 'var(--sidebar-text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Glow Medical</p>
            <p style={{ margin: '.1rem 0 0', fontSize: '.7rem', color: 'var(--sidebar-muted)', whiteSpace: 'nowrap' }}>Admin Dashboard</p>
          </div>
        )}
      </div>

      {/* ── Nav items ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '.5rem .4rem' : '.6rem .5rem', display: 'flex', flexDirection: 'column' }}>
        {NAV.map((item, i) => {
          if ('sep' in item) {
            if (collapsed) return <div key={i} style={{ height: 1, background: 'var(--sidebar-border)', margin: '.55rem .25rem' }} />
            return (
              <p key={i} style={{
                margin: '.85rem 0 .3rem .65rem',
                fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: 'var(--sidebar-muted)',
              }}>{item.sep}</p>
            )
          }

          const active = isActive(item.href)
          const Icon   = item.icon

          return (
            <Link
              key={item.href} href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : '.72rem',
                padding: collapsed ? '.68rem 0' : '.68rem .75rem',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 10,
                background: active
                  ? 'var(--sidebar-active-bg, rgba(8,43,86,.12))'
                  : 'transparent',
                color: active
                  ? 'var(--sidebar-active-text, var(--primary))'
                  : 'var(--sidebar-text)',
                fontSize: '.875rem',
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                transition: 'all .15s',
                position: 'relative',
                marginBottom: 1,
                minHeight: 44,    /* ← full-height items */
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover, rgba(255,255,255,.06))' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {/* Active indicator bar */}
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: '20%', bottom: '20%',
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: 'var(--primary)',
                }} />
              )}

              {/* Icon */}
              <Icon
                size={18}
                style={{
                  flexShrink: 0,
                  color: active ? 'var(--primary)' : 'var(--sidebar-muted, rgba(255,255,255,.45))',
                  transition: 'color .15s',
                }}
              />

              {/* Label + chevron */}
              {!collapsed && (
                <>
                  <span style={{
                    flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontSize: '.875rem', lineHeight: 1,
                  }}>
                    {item.label}
                  </span>
                  {active && <ChevronRight size={13} style={{ flexShrink: 0, opacity: .5 }} />}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )

  return (
    <>
      {/* ── Desktop ── */}
      <aside
        className="sidebar-desktop"
        style={{
          width: collapsed ? 60 : 240,
          flexShrink: 0, height: '100vh',
          position: 'sticky', top: 0,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'width .22s ease',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {navContent}
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          <div
            onClick={onMobileClose}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(3px)' }}
          />
          <aside style={{
            position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 201,
            width: 240,
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            display: 'flex', flexDirection: 'column',
            animation: 'slideInLeft .22s ease',
          }}>
            <button
              onClick={onMobileClose}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'var(--sidebar-hover, rgba(255,255,255,.08))',
                border: 'none', borderRadius: 7,
                width: 30, height: 30, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--sidebar-text)',
              }}
            ><X size={14} /></button>
            {navContent}
          </aside>
        </>
      )}
      <style>{`@keyframes slideInLeft{from{transform:translateX(-100%)}to{transform:none}}`}</style>
    </>
  )
}
