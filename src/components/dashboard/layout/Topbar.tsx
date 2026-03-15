'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Menu, Bell, Moon, Sun, ChevronDown,
  LogOut, Settings, FileBarChart2,
  CalendarDays, ClipboardList, Printer,
  BookmarkPlus,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */
type Notif = {
  id: number; type: string; title: string; body: string
  href: string | null; isUrgent: boolean; isRead: boolean; createdAt: string
}

interface TopbarProps {
  collapsed        : boolean
  darkMode         : boolean
  onToggleDark     : () => void
  onCollapseToggle : () => void
  onMenuClick      : () => void
}

/* ─── Small helpers ──────────────────────────────────────── */
const iconBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 36, height: 36, borderRadius: 9,
  border: '1px solid var(--border)', background: 'var(--surface-2)',
  color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
  transition: 'background 0.12s',
}

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ref, cb])
}

/* ─── Report Dropdown ────────────────────────────────────── */
function ReportDropdown() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref  = useRef<HTMLDivElement>(null)
  const router = useRouter()
  useOutsideClick(ref, () => setOpen(false))

  const viewReport = (period: string) => {
    router.push(`/dashboard/reports?period=${period}`)
    setOpen(false)
  }

  const saveReport = async (period: string) => {
    setSaving(true)
    try {
      const res  = await fetch('/api/dashboard/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ period }) })
      const data = await res.json()
      if (data.report) { router.push(`/dashboard/reports?saved=${data.report.id}`); setOpen(false) }
    } finally { setSaving(false) }
  }

  const ITEMS = [
    { label: "Today's Report",   icon: CalendarDays,   period: 'today' },
    { label: "Monthly Report",   icon: ClipboardList,  period: 'month' },
    { label: "Annual Report",    icon: FileBarChart2,  period: 'year'  },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        title="Reports"
        style={{
          ...iconBtn,
          background: open ? 'var(--primary)' : 'var(--surface-2)',
          color     : open ? '#fff'            : 'var(--text-muted)',
          border    : open ? '1px solid var(--primary)' : '1px solid var(--border)',
        }}
      >
        <FileBarChart2 size={16} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 220, padding: '0.4rem', zIndex: 300,
          animation: 'fadeDown 0.15s ease',
        }}>
          <p style={{ margin: '0.2rem 0.75rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>View Report</p>

          {ITEMS.map(item => (
            <div key={item.period} style={{ display: 'flex', alignItems: 'center', borderRadius: 8, overflow: 'hidden', marginBottom: 2 }}>
              <button
                onClick={() => viewReport(item.period)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.84rem', fontFamily: 'inherit', textAlign: 'left', borderRadius: 8, transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <item.icon size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                {item.label}
              </button>
              <button
                onClick={() => saveReport(item.period)}
                disabled={saving}
                title="Save snapshot"
                style={{ padding: '0.55rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', borderRadius: 8, transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
              >
                <BookmarkPlus size={13} />
              </button>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
            <button
              onClick={() => { router.push('/dashboard/reports'); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.55rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'inherit', borderRadius: 8, transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            >
              <Printer size={13} /> Saved Reports
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Notifications Bell ─────────────────────────────────── */
function NotificationsBell() {
  const [open,   setOpen]   = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const ref  = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard/admin-notifications?isRead=false&limit=12')
      const d = await r.json()
      setNotifs(d.notifications ?? [])
      setUnread(d.unreadCount   ?? 0)
    } catch { /* silent */ }
  }, [])

  useEffect(() => { load() }, [load])

  // Poll every 30s
  useEffect(() => {
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  const markRead = async (id: number) => {
    await fetch(`/api/dashboard/admin-notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) })
    load()
  }

  const markAll = async () => {
    await fetch('/api/dashboard/admin-notifications/read-all', { method: 'POST' })
    load()
  }

  const ICONS: Record<string, string> = {
    new_appointment: '📅',
    new_message    : '💬',
    new_review     : '⭐',
    low_stock      : '📦',
    system         : '🔔',
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setOpen(p => !p); if (!open) load() }}
        title="Notifications"
        style={{
          ...iconBtn,
          background: open ? 'var(--primary)' : 'var(--surface-2)',
          color     : open ? '#fff'            : 'var(--text-muted)',
          border    : open ? '1px solid var(--primary)' : '1px solid var(--border)',
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 5, right: 5,
            minWidth: 16, height: 16, borderRadius: 9,
            background: 'var(--danger)', color: '#fff',
            fontSize: '0.62rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--surface)',
            padding: '0 3px',
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          width: 340, zIndex: 300,
          animation: 'fadeDown 0.15s ease',
          display: 'flex', flexDirection: 'column', maxHeight: 480,
        }}>
          {/* Header */}
          <div style={{ padding: '0.85rem 1rem 0.6rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Notifications {unread > 0 && <span style={{ marginLeft: 6, padding: '2px 8px', background: 'var(--danger)', color: '#fff', borderRadius: 20, fontSize: '0.7rem' }}>{unread}</span>}</p>
            {unread > 0 && (
              <button onClick={markAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <p style={{ margin: 0 }}>All caught up!</p>
              </div>
            ) : notifs.map(n => (
              <div
                key={n.id}
                onClick={() => { markRead(n.id); if (n.href) window.location.href = n.href }}
                style={{
                  padding   : '0.75rem 1rem',
                  borderBottom: '1px solid var(--border)',
                  cursor    : 'pointer',
                  background: n.isRead ? 'transparent' : 'rgba(196,154,108,0.06)',
                  transition: 'background 0.1s',
                  display   : 'flex', gap: '0.7rem', alignItems: 'flex-start',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.isRead ? 'transparent' : 'rgba(196,154,108,0.06)'}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{ICONS[n.type] ?? '🔔'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <p style={{ margin: 0, fontWeight: n.isRead ? 400 : 600, fontSize: '0.83rem', color: 'var(--text)' }}>{n.title}</p>
                    {n.isUrgent && <span style={{ padding: '1px 6px', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', fontSize: '0.62rem', fontWeight: 700, borderRadius: 4 }}>URGENT</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.body}</p>
                  <p style={{ margin: '3px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', opacity: 0.7 }}>
                    {new Date(n.createdAt).toLocaleString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {!n.isRead && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 5 }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── User Dropdown ──────────────────────────────────────── */
function UserMenu({ darkMode, onToggleDark }: { darkMode: boolean; onToggleDark: () => void }) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const ref    = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))

  const initials = (session?.user?.name ?? 'AD').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const menuItem = (onClick: () => void, icon: React.ReactNode, label: string, danger = false) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
        padding: '0.55rem 0.85rem', borderRadius: 8, fontSize: '0.83rem',
        color: danger ? 'var(--danger)' : 'var(--text)',
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = danger ? 'rgba(239,68,68,.07)' : 'var(--surface-2)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
    >
      {icon} {label}
    </button>
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.6rem', borderRadius: 9,
          border: '1px solid var(--border)', background: 'var(--surface-2)',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '0.71rem', fontWeight: 700, flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ margin: 0, fontSize: '0.81rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
            {session?.user?.name ?? 'Admin'}
          </p>
          <p style={{ margin: 0, fontSize: '0.67rem', color: 'var(--text-muted)' }}>ADMIN</p>
        </div>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', marginLeft: 2 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 200, padding: '0.4rem', zIndex: 300,
          animation: 'fadeDown 0.15s ease',
        }}>
          {/* Name / email */}
          <div style={{ padding: '0.6rem 0.85rem 0.55rem', borderBottom: '1px solid var(--border)', marginBottom: '0.3rem' }}>
            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{session?.user?.name ?? 'Admin'}</p>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.71rem', color: 'var(--text-muted)' }}>{session?.user?.email ?? 'admin@glowmedical.com'}</p>
          </div>

          {menuItem(() => { router.push('/dashboard/settings'); setOpen(false) }, <Settings size={14} />, 'Clinic Settings')}
          {menuItem(onToggleDark, darkMode ? <Sun size={14} /> : <Moon size={14} />, darkMode ? 'Light Mode' : 'Dark Mode')}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.3rem', paddingTop: '0.3rem' }}>
            {menuItem(() => signOut({ callbackUrl: '/auth/login' }), <LogOut size={14} />, 'Sign Out', true)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main Topbar ────────────────────────────────────────── */
export default function Topbar({ collapsed, darkMode, onToggleDark, onCollapseToggle, onMenuClick }: TopbarProps) {
  return (
    <header style={{
      height      : 58,
      background  : 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display     : 'flex', alignItems: 'center',
      padding     : '0 1.1rem', gap: '0.6rem',
      flexShrink  : 0, position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Desktop collapse toggle */}
      <button onClick={onCollapseToggle} style={iconBtn} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="hidden-mobile">
        <Menu size={17} />
      </button>

      {/* Mobile hamburger */}
      <button onClick={onMenuClick} style={iconBtn} title="Open menu" className="hidden-desktop">
        <Menu size={17} />
      </button>

      {/* Spacer — pushes everything to the right */}
      <div style={{ flex: 1 }} />

      {/* ── Right actions ── */}
      <button onClick={onToggleDark} style={iconBtn} title="Toggle theme" className="hidden-mobile">
        {darkMode ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <ReportDropdown />
      <NotificationsBell />
      <UserMenu darkMode={darkMode} onToggleDark={onToggleDark} />
    </header>
  )
}
