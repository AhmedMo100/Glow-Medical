import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SessionProvider from '@/components/auth/SessionProvider'
import prisma from '@/lib/prisma'
import '@/styles/globals.css'

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.clinicSetting.findFirst()

  const favicon = settings?.faviconUrl || "/favicon.ico"

  return {
    title: {
      default: settings?.metaTitle || settings?.clinicName || 'Glow Medical',
      template: `%s | ${settings?.clinicName || 'Glow Medical'}`
    },
    description: settings?.metaDescription || undefined,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
