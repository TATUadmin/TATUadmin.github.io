import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { securityHeaders, corsHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'

// Add paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/explore',
  '/artist',
  '/api/artists',
  '/api/auth',
  '/api/portfolio',
  '/api/search'
]

// Add paths that don't require profile completion
const noProfilePaths = [
  '/profile-setup',
  '/api/profile/setup',
  '/api/upload',
]

export default withAuth(
  function middleware(req) {
    const { nextUrl, nextauth } = req
    const isLoggedIn = !!nextauth?.token
    const path = nextUrl.pathname

    // Log request for monitoring
    logger.logRequest(req)

    // Apply security headers
    const securityResponse = securityHeaders(req)
    if (securityResponse) {
      return securityResponse
    }

    // Apply CORS headers
    const corsResponse = corsHeaders(req)
    if (corsResponse) {
      return corsResponse
    }

    // Allow public paths
    if (publicPaths.some(p => path.startsWith(p))) {
      return NextResponse.next()
    }

    // Check if user is logged in for protected routes
    if (!isLoggedIn && !publicPaths.some(p => path.startsWith(p))) {
      const redirectUrl = new URL('/login', nextUrl)
      redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Role-based access control for protected routes
    if (isLoggedIn && nextauth?.token) {
      const userRole = nextauth.token.role
      
      // Admin-only routes
      if (path.startsWith('/admin') && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
      }
      
      // Artist-only routes
      if (path.startsWith('/dashboard/portfolio') && userRole !== 'ARTIST') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
      }
      
      // Shop owner routes
      if (path.startsWith('/dashboard/shops') && userRole !== 'SHOP_OWNER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', nextUrl))
      }
      
      // Profile setup redirect for incomplete profiles
      if (path.startsWith('/dashboard') && !path.includes('/profile-setup')) {
        // Check if user needs to complete profile setup
        // This would typically check a database field
        // For now, we'll skip this check
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true, // Let the middleware function handle authorization
    },
  }
)

// Configure Middleware matching
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 