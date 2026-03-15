// src/app/dashboard/layout.tsx
import type { Metadata } from 'next'
import '@/styles/dashboard.css'
import DashboardShell from '@/components/dashboard/layout/DashboardShell'

export const metadata: Metadata = {
  title : { default: 'Dashboard', template: '%s — Glow Admin' },
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
