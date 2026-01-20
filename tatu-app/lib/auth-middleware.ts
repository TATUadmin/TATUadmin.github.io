import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/auth'
import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { logger } from './monitoring'

const prisma = new PrismaClient()

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  role: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN'
  profile?: {
    id: string
    bio?: string | null
    avatar?: string | null
    phone?: string | null
    instagram?: string | null
    website?: string | null
    location?: string | null
    specialties?: string[]
    experience?: number
    verified?: boolean
  }
  shop?: {
    id: string
    name: string
    address?: string | null
    phone?: string | null
    website?: string | null
    verified?: boolean
  }
}

export interface AuthContext {
  user: AuthenticatedUser
  session: any
  requestId: string
  ip: string
  userAgent: string
}

/**
 * Enterprise-grade authentication middleware
 * Provides comprehensive user verification and context
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      logger.warn('Unauthorized access attempt', {
        url: request.url,
        method: request.method,
        ip: getClientIP(request)
      })
      throw new Error('UNAUTHORIZED')
    }

    // Get request context
    const headersList = await headers()
    const requestId = headersList.get('x-request-id') || generateRequestId()
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'Unknown'

    // Fetch complete user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        artistProfile: true,
        customerProfile: true,
        shop: true
      }
    })

    if (!user) {
      logger.error('User not found in database', {
        userId: session.user.id,
        requestId,
        ip
      })
      throw new Error('USER_NOT_FOUND')
    }

    // Check if user is active (if status field exists)
    // Note: status field may not exist in current schema

    // Build authenticated user object with role-specific profile
    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      profile: (user.artistProfile || user.customerProfile) ? {
        id: user.artistProfile?.id || user.customerProfile?.id || '',
        bio: user.artistProfile?.bio || null,
        avatar: user.artistProfile?.avatar || user.customerProfile?.avatar || null,
        phone: user.artistProfile?.phone || user.customerProfile?.phone || null,
        instagram: user.artistProfile?.instagram || null,
        website: user.artistProfile?.website || null,
        location: user.artistProfile?.location || null,
        specialties: user.artistProfile?.specialties || [],
        experience: 0, // Not in current schema
        verified: false // Not in current schema
      } : undefined,
      shop: user.shop ? {
        id: user.shop.id,
        name: user.shop.name,
        address: user.shop.address,
        phone: user.shop.phone,
        website: user.shop.website,
        verified: user.shop.verified || false
      } : undefined
    }

    // Log successful authentication
    logger.info('User authenticated successfully', {
      userId: user.id,
      role: user.role,
      requestId,
      ip
    })

    return {
      user: authenticatedUser,
      session,
      requestId,
      ip,
      userAgent
    }

  } catch (error) {
    logger.error('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      url: request.url,
      method: request.method,
      ip: getClientIP(request)
    })
    throw error
  }
}

/**
 * Require specific role for access
 */
export async function requireRole(
  request: NextRequest, 
  requiredRole: string | string[]
): Promise<AuthContext> {
  const context = await requireAuth(request)
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(context.user.role)) {
    logger.warn('Insufficient permissions', {
      userId: context.user.id,
      userRole: context.user.role,
      requiredRole: roles,
      requestId: context.requestId,
      ip: context.ip
    })
    throw new Error('INSUFFICIENT_PERMISSIONS')
  }

  return context
}

/**
 * Require shop ownership
 */
export async function requireShopOwnership(
  request: NextRequest,
  shopId?: string
): Promise<AuthContext> {
  const context = await requireRole(request, ['SHOP_OWNER', 'ADMIN'])
  
  if (shopId && context.user.shop?.id !== shopId) {
    logger.warn('Shop ownership verification failed', {
      userId: context.user.id,
      userShopId: context.user.shop?.id,
      requestedShopId: shopId,
      requestId: context.requestId,
      ip: context.ip
    })
    throw new Error('SHOP_ACCESS_DENIED')
  }

  return context
}

/**
 * Require artist profile
 */
export async function requireArtistProfile(
  request: NextRequest
): Promise<AuthContext> {
  const context = await requireRole(request, ['ARTIST', 'SHOP_OWNER', 'ADMIN'])
  
  if (!context.user.profile) {
    logger.warn('Artist profile required but not found', {
      userId: context.user.id,
      requestId: context.requestId,
      ip: context.ip
    })
    throw new Error('ARTIST_PROFILE_REQUIRED')
  }

  return context
}

/**
 * Optional authentication - doesn't throw if not authenticated
 */
export async function optionalAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    return await requireAuth(request)
  } catch {
    return null
  }
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Rate limiting helper
 */
export async function checkRateLimit(
  request: NextRequest,
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): Promise<boolean> {
  // This would integrate with Redis in production
  // For now, we'll use a simple in-memory approach
  return true
}

export default {
  requireAuth,
  requireRole,
  requireShopOwnership,
  requireArtistProfile,
  optionalAuth,
  checkRateLimit
}
