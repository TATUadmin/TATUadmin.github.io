import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import { requireAuth, requireRole } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

const prisma = new PrismaClient()

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.payment.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many payment requests', rateLimitResult.retryAfter)
  }

  // Authentication - only artists can boost visibility
  const authContext = await requireRole(request, 'ARTIST')
  const { user, requestId } = authContext

  // Check if Stripe is configured
  if (!stripe) {
    return ApiResponse.serviceUnavailable(
      'Payment processing is not configured. Please set up Stripe environment variables.',
      { requestId }
    )
  }

  // Validate request data
  const body = await request.json()
  const validationResult = ValidationSchemas.VisibilityBoost.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const { 
    duration, // 'daily', 'weekly', 'monthly'
    paymentMethodId
  } = validationResult.data

  // Calculate amount based on duration
  let amount: number
  let durationDays: number
  
  switch (duration) {
    case 'daily':
      amount = STRIPE_CONFIG.visibilityBoostDaily
      durationDays = 1
      break
    case 'weekly':
      amount = STRIPE_CONFIG.visibilityBoostWeekly
      durationDays = 7
      break
    case 'monthly':
      amount = STRIPE_CONFIG.visibilityBoostMonthly
      durationDays = 30
      break
    default:
      return ApiResponse.badRequest('Invalid duration', { requestId })
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: STRIPE_CONFIG.currency,
      payment_method: paymentMethodId,
      capture_method: 'automatic',
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        artistId: user.id,
        type: 'visibility_boost',
        duration: duration
      },
      description: `Visibility boost for ${duration} - Artist: ${user.name || 'Unknown'}`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/portfolio?boost=success`
    })

    // Calculate boost end date
    const boostEndDate = new Date()
    boostEndDate.setDate(boostEndDate.getDate() + durationDays)

    // Store visibility boost in database
    const visibilityBoost = await prisma.visibilityBoost.create({
      data: {
        artistId: user.id,
        amount,
        duration: duration.toUpperCase(),
        durationDays,
        startDate: new Date(),
        endDate: boostEndDate,
        status: 'ACTIVE',
        stripePaymentIntentId: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          duration,
          amount
        }
      }
    })

    // Update artist's visibility boost status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        profile: {
          update: {
            visibilityBoostActive: true,
            visibilityBoostEndDate: boostEndDate
          }
        }
      }
    })

    // Invalidate search cache to reflect new visibility
    if (cacheService) {
      await cacheService.invalidateByTags([CacheTags.ARTIST, CacheTags.SEARCH])
    }

    // Log business event
    logger.logBusinessEvent('visibility_boost_purchased', {
      boostId: visibilityBoost.id,
      artistId: user.id,
      amount,
      duration,
      durationDays,
      paymentIntentId: paymentIntent.id
    }, request)

    return ApiResponse.success({
      boostId: visibilityBoost.id,
      paymentIntentId: paymentIntent.id,
      amount,
      duration,
      endDate: boostEndDate,
      status: 'ACTIVE',
      message: `Visibility boost activated for ${duration}`
    }, 201, { requestId })

  } catch (error: any) {
    logger.error('Visibility boost purchase failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      artistId: user.id,
      duration,
      amount
    })

    return ApiResponse.internalError(
      'Failed to purchase visibility boost',
      process.env.NODE_ENV === 'development' ? error : undefined,
      { requestId }
    )
  }
})

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Get artist's current visibility boost status
  const artist = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: {
        select: {
          visibilityBoostActive: true,
          visibilityBoostEndDate: true
        }
      },
      visibilityBoosts: {
        where: {
          status: 'ACTIVE',
          endDate: { gt: new Date() }
        },
        orderBy: { endDate: 'desc' },
        take: 1
      }
    }
  })

  if (!artist) {
    return ApiResponse.notFound('Artist not found', { requestId })
  }

  const currentBoost = artist.visibilityBoosts[0] || null

  return ApiResponse.success({
    isActive: artist.profile?.visibilityBoostActive || false,
    endDate: artist.profile?.visibilityBoostEndDate,
    currentBoost: currentBoost ? {
      id: currentBoost.id,
      duration: currentBoost.duration,
      endDate: currentBoost.endDate,
      daysRemaining: Math.ceil((currentBoost.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    } : null,
    pricing: {
      daily: STRIPE_CONFIG.visibilityBoostDaily,
      weekly: STRIPE_CONFIG.visibilityBoostWeekly,
      monthly: STRIPE_CONFIG.visibilityBoostMonthly
    }
  }, 200, { requestId })
})


