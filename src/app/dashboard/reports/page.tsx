// app/dashboard/reports/page.tsx
import { Suspense } from 'react'
import ReportsPage from '@/components/dashboard/reports/ReportsPage'

export const metadata = { title: 'Reports — Glow Medical' }

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <ReportsPage />
    </Suspense>
  )
}
