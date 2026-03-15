import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Redirect logged-in user away from login page
    if (pathname.startsWith('/auth/login') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl

        // Always allow public paths
        if (
          pathname.startsWith('/auth') ||
          pathname.startsWith('/api/auth') ||
          pathname.startsWith('/public') ||
          pathname.startsWith('/api/chatbot') ||
          pathname === '/'
        ) return true

        // Dashboard + API routes require login
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
          return !!token
        }

        return true
      },
    },
    pages: { signIn: '/auth/login' },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!auth|chatbot).)*', '/auth/:path*'],
}
