import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
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

  // Authentication
  const authContext = await requireAuth(request)
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
  const validationResult = ValidationSchemas.Donation.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const { 
    amount,
    appointmentId,
    message,
    paymentMethodId
  } = validationResult.data

  // Validate donation amount
  if (!STRIPE_CONFIG.donationAmounts.includes(amount)) {
    return ApiResponse.badRequest(
      'Invalid donation amount',
      { validAmounts: STRIPE_CONFIG.donationAmounts },
      { requestId }
    )
  }

  // Verify appointment exists and is completed
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      clientId: user.id,
      status: 'COMPLETED'
    },
    include: {
      artist: {
        include: { profile: true }
      }
    }
  })

  if (!appointment) {
    return ApiResponse.notFound('Completed appointment not found', { requestId })
  }

  // Check if donation already exists for this appointment
  const existingDonation = await prisma.donation.findFirst({
    where: {
      appointmentId,
      clientId: user.id
    }
  })

  if (existingDonation) {
    return ApiResponse.conflict(
      'Donation already made for this appointment',
      { existingDonationId: existingDonation.id },
      { requestId }
    )
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
        appointmentId,
        artistId: appointment.artistId,
        clientId: user.id,
        type: 'donation'
      },
      description: `Donation to TATU - Appointment ${appointmentId}`,
      return_url: `${process.env.NEXTAUTH_URL}/appointments/${appointmentId}?donation=success`
    })

    // Store donation in database
    const donation = await prisma.donation.create({
      data: {
        appointmentId,
        artistId: appointment.artistId,
        clientId: user.id,
        amount,
        currency: STRIPE_CONFIG.currency,
        message: message || null,
        status: 'COMPLETED',
        stripePaymentIntentId: paymentIntent.id,
        metadata: {
          paymentIntentId: paymentIntent.id,
          appointmentId,
          artistId: appointment.artistId
        }
      }
    })

    // Log business event
    logger.logBusinessEvent('donation_made', {
      donationId: donation.id,
      appointmentId,
      artistId: appointment.artistId,
      clientId: user.id,
      amount,
      paymentIntentId: paymentIntent.id
    }, request)

    return ApiResponse.success({
      donationId: donation.id,
      paymentIntentId: paymentIntent.id,
      amount,
      status: 'COMPLETED',
      message: 'Thank you for your donation to TATU!',
      appointmentId
    }, 201, { requestId })

  } catch (error: any) {
    logger.error('Donation processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      appointmentId,
      amount
    })

    return ApiResponse.internalError(
      'Failed to process donation',
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

  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('appointmentId')

  if (appointmentId) {
    // Check if donation exists for specific appointment
    const donation = await prisma.donation.findFirst({
      where: {
        appointmentId,
        clientId: user.id
      }
    })

    return ApiResponse.success({
      hasDonated: !!donation,
      donation: donation ? {
        id: donation.id,
        amount: donation.amount,
        message: donation.message,
        createdAt: donation.createdAt
      } : null
    }, 200, { requestId })
  }

  // Get user's donation history
  const donations = await prisma.donation.findMany({
    where: { clientId: user.id },
    include: {
      appointment: {
        select: {
          id: true,
          serviceType: true,
          preferredDate: true
        }
      },
      artist: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0)

  return ApiResponse.success({
    donations: donations.map(donation => ({
      id: donation.id,
      amount: donation.amount,
      message: donation.message,
      createdAt: donation.createdAt,
      appointment: donation.appointment,
      artist: donation.artist
    })),
    totalDonated,
    donationCount: donations.length
  }, 200, { requestId })
})


