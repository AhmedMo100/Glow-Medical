'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Menu, Search, ChevronDown, Moon, Sun, LogOut, User } from 'lucide-react'

interface TopbarProps {
  onMenuClick:      () => void
  onCollapseToggle: () => void
  collapsed:        boolean
  darkMode:         boolean
  onToggleDark:     () => void
}

const btn: React.CSSProperties = {
  display:'flex', alignItems:'center', justifyContent:'center',
  width:36, height:36, borderRadius:9,
  border:'1px solid var(--border)', background:'var(--surface-2)',
  color:'var(--text-muted)', cursor:'pointer', flexShrink:0,
}

export default function Topbar({ onMenuClick, onCollapseToggle, darkMode, onToggleDark }: TopbarProps) {
  const { data: session } = useSession()
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'AD'

  return (
    <header style={{
      height:60, background:'var(--surface)', borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', padding:'0 1.25rem', gap:'.75rem',
      flexShrink:0, position:'sticky', top:0, zIndex:50,
    }}>
      <button onClick={onCollapseToggle} style={btn}><Menu size={18} /></button>
      <button onClick={onMenuClick} style={{ ...btn, display:'none' }} className="mobile-menu-btn"><Menu size={18} /></button>

      {/* Search */}
      <div style={{ flex:1, maxWidth:380 }}>
        {searchOpen ? (
          <div style={{ position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:'.75rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
            <input autoFocus placeholder="Search patients, appointments…" onBlur={() => setSearchOpen(false)}
              style={{ width:'100%', padding:'.5rem 1rem .5rem 2.25rem', border:'1.5px solid var(--primary)', borderRadius:8, fontSize:'.875rem', background:'var(--surface)', color:'var(--text)', outline:'none', fontFamily:'inherit' }} />
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)}
            style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.45rem .75rem', border:'1px solid var(--border)', borderRadius:8, background:'var(--surface-2)', color:'var(--text-muted)', fontSize:'.82rem', cursor:'pointer', width:'100%', fontFamily:'inherit' }}>
            <Search size={14} /> Quick search…
            <kbd style={{ marginLeft:'auto', fontSize:'.68rem', padding:'.1rem .4rem', background:'var(--border)', borderRadius:4 }}>⌘K</kbd>
          </button>
        )}
      </div>

      <div style={{ flex:1 }} />

      {/* Dark mode */}
      <button onClick={onToggleDark} style={btn} title="Toggle dark mode">
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Notifications */}
      <button style={{ ...btn, position:'relative' }} title="Notifications">
        <Bell size={16} />
        <span style={{ position:'absolute', top:6, right:6, width:7, height:7, borderRadius:'50%', background:'var(--danger)', border:'2px solid var(--surface)' }} />
      </button>

      {/* User menu */}
      <div ref={menuRef} style={{ position:'relative' }}>
        <button onClick={() => setUserMenuOpen(p => !p)}
          style={{ display:'flex', alignItems:'center', gap:'.5rem', padding:'.35rem .6rem', borderRadius:9, border:'1px solid var(--border)', background:'var(--surface-2)', cursor:'pointer' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'.72rem', fontWeight:700, flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ textAlign:'left', display:'block' }}>
            <p style={{ fontSize:'.82rem', fontWeight:500, color:'var(--text)', lineHeight:1.2, whiteSpace:'nowrap' }}>{session?.user?.name ?? 'Admin'}</p>
            <p style={{ fontSize:'.68rem', color:'var(--text-muted)', lineHeight:1 }}>{(session?.user as any)?.role ?? 'ADMIN'}</p>
          </div>
          <ChevronDown size={13} style={{ color:'var(--text-muted)', transition:'transform .15s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
        </button>

        {userMenuOpen && (
          <div style={{
            position:'absolute', right:0, top:'calc(100% + .5rem)',
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:12, boxShadow:'var(--card-shadow)',
            minWidth:190, padding:'.4rem', zIndex:100,
            animation:'fadeUp .15s ease both',
          }}>
            <div style={{ padding:'.6rem .85rem .55rem', borderBottom:'1px solid var(--border)', marginBottom:'.3rem' }}>
              <p style={{ fontSize:'.82rem', fontWeight:600, color:'var(--text)' }}>{session?.user?.name}</p>
              <p style={{ fontSize:'.72rem', color:'var(--text-muted)', marginTop:'.15rem' }}>{session?.user?.email}</p>
            </div>
            <button style={{ display:'flex', alignItems:'center', gap:'.5rem', width:'100%', padding:'.55rem .85rem', borderRadius:8, fontSize:'.83rem', color:'var(--text)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
              <User size={14} /> My Profile
            </button>
            <div style={{ borderTop:'1px solid var(--border)', marginTop:'.3rem', paddingTop:'.3rem' }}>
              <button onClick={() => signOut({ callbackUrl: '/auth/login' })}
                style={{ display:'flex', alignItems:'center', gap:'.5rem', width:'100%', padding:'.55rem .85rem', borderRadius:8, fontSize:'.83rem', color:'var(--danger)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,.07)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
