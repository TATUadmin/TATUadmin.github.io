import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import { securityHeaders, corsHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'

// Add paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/auth/signin',
  '/auth/signup',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/terms',
  '/privacy',
  '/help',
  '/contact',
  '/about',
  '/how-it-works',
  '/explore',
  '/search',
  '/artist',
  '/styles',
  '/api/artists',
  '/api/auth',
  '/api/portfolio',
  '/api/search',
  '/api/shop',
  '/api/shops',
  '/_next',
  '/favicon.ico'
]

// Add paths that don't require profile completion
const noProfilePaths = [
  '/profile-setup',
  '/api/profile/setup',
  '/api/upload',
]

// Wrap middleware to handle NextAuth initialization errors gracefully
let middlewareHandler: any

try {
  middlewareHandler = withAuth(
    function middleware(req) {
      const { nextUrl, nextauth } = req
      const isLoggedIn = !!nextauth?.token
      const path = nextUrl.pathname

      // Allow public paths first - skip all middleware logic for public paths
      if (publicPaths.some(p => path.startsWith(p))) {
        // Still apply security headers for public paths
        const response = NextResponse.next()
        try {
          const securityResponse = securityHeaders(req)
          if (securityResponse) {
            return securityResponse
          }
        } catch (error) {
          // Ignore security header errors
        }
        return response
      }

      // Log request for monitoring (only for protected paths)
      try {
        logger.logRequest(req)
      } catch (error) {
        // Ignore logging errors to prevent redirect loops
      }

      // Apply security headers
      try {
        const securityResponse = securityHeaders(req)
        if (securityResponse) {
          return securityResponse
        }
      } catch (error) {
        // Ignore security header errors
      }

      // Apply CORS headers
      try {
        const corsResponse = corsHeaders(req)
        if (corsResponse) {
          return corsResponse
        }
      } catch (error) {
        // Ignore CORS errors
      }

      // Check if user is logged in for protected routes
      // If NextAuth isn't configured, allow access (fail open for now)
      if (!isLoggedIn && process.env.NEXTAUTH_SECRET) {
        const redirectUrl = new URL('/login', nextUrl.origin)
        redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      return NextResponse.next()
    },
    {
      callbacks: {
        authorized: () => true, // Let the middleware function handle authorization
      },
    }
  )
} catch (error) {
  // If NextAuth middleware fails to initialize, create a fallback middleware
  console.error('NextAuth middleware initialization error:', error)
  middlewareHandler = function fallbackMiddleware(req: any) {
    const { nextUrl } = req
    const path = nextUrl.pathname

    // Allow all paths if NextAuth isn't configured
    if (publicPaths.some(p => path.startsWith(p))) {
      return NextResponse.next()
    }

    // For protected paths, just allow access if NextAuth isn't configured
    // This prevents redirect loops
    return NextResponse.next()
  }
}

export default middlewareHandler

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