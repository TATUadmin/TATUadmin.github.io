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
  const validationResult = ValidationSchemas.PaymentIntent.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const { 
    appointmentId, 
    artistId, 
    amount,
    paymentMethodId
  } = validationResult.data

  // Verify appointment exists and belongs to user
  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      clientId: user.id,
      artistId: artistId,
      status: 'PENDING'
    },
    include: {
      artist: {
        include: { profile: true }
      }
    }
  })

  if (!appointment) {
    return ApiResponse.notFound('Appointment not found or not accessible', { requestId })
  }

  // Validate hold amount
  if (amount < STRIPE_CONFIG.minimumHoldAmount) {
    return ApiResponse.badRequest(
      `Minimum hold amount is $${STRIPE_CONFIG.minimumHoldAmount / 100}`,
      { minimumAmount: STRIPE_CONFIG.minimumHoldAmount },
      { requestId }
    )
  }

  try {
    // Create payment intent for hold
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: STRIPE_CONFIG.currency,
      payment_method: paymentMethodId,
      capture_method: 'manual', // Hold the funds without capturing
      confirmation_method: 'manual',
      confirm: true,
      metadata: {
        appointmentId,
        artistId,
        clientId: user.id,
        type: 'appointment_hold'
      },
      description: `Hold for appointment with ${appointment.artist.name || 'Artist'}`,
      return_url: `${process.env.NEXTAUTH_URL}/appointments/${appointmentId}?hold=success`
    })

    // Store payment intent in database
    const paymentRecord = await prisma.payment.create({
      data: {
        appointmentId,
        artistId,
        clientId: user.id,
        amount,
        currency: STRIPE_CONFIG.currency,
        status: 'HELD',
        stripePaymentIntentId: paymentIntent.id,
        type: 'APPOINTMENT_HOLD',
        metadata: {
          paymentIntentId: paymentIntent.id,
          holdAmount: amount
        }
      }
    })

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: 'CONFIRMED',
        paymentHoldId: paymentRecord.id
      }
    })

    // Log business event
    logger.logBusinessEvent('payment_hold_created', {
      paymentId: paymentRecord.id,
      appointmentId,
      artistId,
      clientId: user.id,
      amount,
      paymentIntentId: paymentIntent.id
    }, request)

    return ApiResponse.success({
      paymentId: paymentRecord.id,
      paymentIntentId: paymentIntent.id,
      amount,
      status: 'HELD',
      appointmentId,
      message: 'Card hold successful. Appointment confirmed.'
    }, 201, { requestId })

  } catch (error: any) {
    logger.error('Payment hold creation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      appointmentId,
      artistId,
      amount
    })

    return ApiResponse.internalError(
      'Failed to create payment hold',
      process.env.NODE_ENV === 'development' ? error : undefined,
      { requestId }
    )
  }
})

