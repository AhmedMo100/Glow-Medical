import type { Metadata } from 'next'
import LoginPage from '@/components/auth/LoginPage'

export const metadata: Metadata = {
  title: 'Sign In — Glow Medical',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <LoginPage />
}
