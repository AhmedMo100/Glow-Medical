'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed,   setCollapsed]   = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [darkMode,    setDarkMode]    = useState(false)

  // Persist theme
  useEffect(() => {
    const saved = localStorage.getItem('glow-theme')
    if (saved === 'dark') { setDarkMode(true); document.documentElement.setAttribute('data-theme','dark') }
  }, [])

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      localStorage.setItem('glow-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <Sidebar
        collapsed    = {collapsed}
        mobileOpen   = {mobileOpen}
        onMobileClose= {() => setMobileOpen(false)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar
          collapsed        = {collapsed}
          darkMode         = {darkMode}
          onToggleDark     = {toggleDark}
          onCollapseToggle = {() => setCollapsed(c => !c)}
          onMenuClick      = {() => setMobileOpen(true)}
        />
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
