import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'

export const dynamic = 'force-dynamic'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

const prisma = new PrismaClient()

export const POST = withErrorHandling(async (request: NextRequest) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/payments/donation',
    },
    async (span: any) => {
      // Rate limiting
      const rateLimitResult = await rateLimiters.payment.check(request)
      if (!rateLimitResult.allowed) {
        span.setAttribute('rate_limited', true)
        return ApiResponse.rateLimited('Too many payment requests', rateLimitResult.retryAfter)
      }

      // Authentication
      const authContext = await requireAuth(request)
      const { user, requestId } = authContext
      span.setAttribute('user_id', user.id)
      span.setAttribute('request_id', requestId)

      // Check if Stripe is configured
      if (!stripe) {
        span.setAttribute('stripe_not_configured', true)
        return ApiResponse.serviceUnavailable(
          'Payment processing is not configured. Please set up Stripe environment variables.',
          { requestId }
        )
      }

      // Validate request data
      const body = await request.json()
      const validationResult = ValidationSchemas.Donation.create.safeParse(body)
      
      if (!validationResult.success) {
        span.setAttribute('validation_failed', true)
        return ApiResponse.validationError(validationResult.error.errors, { requestId })
      }

      const { 
        amount,
        appointmentId,
        message,
        paymentMethodId
      } = validationResult.data

      span.setAttribute('amount', amount)
      span.setAttribute('appointment_id', appointmentId)

      // Validate donation amount
      if (!STRIPE_CONFIG.donationAmounts.includes(amount)) {
        span.setAttribute('invalid_amount', true)
        return ApiResponse.badRequest(
          'Invalid donation amount',
          { validAmounts: STRIPE_CONFIG.donationAmounts },
          { requestId }
        )
      }

      // Verify appointment exists and is completed
      const appointment = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'Find Completed Appointment',
        },
        async (appointmentSpan: any) => {
          appointmentSpan.setAttribute('appointment_id', appointmentId)
          appointmentSpan.setAttribute('client_id', user.id)
          return await prisma.appointment.findFirst({
            where: {
              id: appointmentId,
              clientId: user.id,
              status: 'COMPLETED'
            },
            include: {
              artist: {
                include: { artistProfile: true }
              }
            }
          })
        }
      )

      if (!appointment) {
        span.setAttribute('appointment_not_found', true)
        return ApiResponse.notFound('Completed appointment not found', { requestId })
      }

      span.setAttribute('artist_id', appointment.artistId)

      // Check if donation already exists for this appointment
      const existingDonation = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'Check Existing Donation',
        },
        async (checkSpan: any) => {
          checkSpan.setAttribute('appointment_id', appointmentId)
          return await prisma.donation.findFirst({
            where: {
              appointmentId,
              clientId: user.id
            }
          })
        }
      )

      if (existingDonation) {
        span.setAttribute('donation_exists', true)
        span.setAttribute('existing_donation_id', existingDonation.id)
        return ApiResponse.conflict(
          'Donation already made for this appointment',
          { existingDonationId: existingDonation.id },
          { requestId }
        )
      }

      try {
        // Create payment intent
        const paymentIntent = await Sentry.startSpan(
          {
            op: 'http.client',
            name: 'Create Stripe Payment Intent',
          },
          async (stripeSpan: any) => {
            stripeSpan.setAttribute('amount', amount)
            stripeSpan.setAttribute('currency', STRIPE_CONFIG.currency)
            stripeSpan.setAttribute('appointment_id', appointmentId)
            return await stripe.paymentIntents.create({
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
          }
        )

        span.setAttribute('payment_intent_id', paymentIntent.id)
        span.setAttribute('payment_status', paymentIntent.status)

        // Store donation in database
        const donation = await Sentry.startSpan(
          {
            op: 'db.query',
            name: 'Create Donation Record',
          },
          async (donationSpan: any) => {
            donationSpan.setAttribute('appointment_id', appointmentId)
            donationSpan.setAttribute('amount', amount)
            return await prisma.donation.create({
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
          }
        )

        span.setAttribute('donation_id', donation.id)

        // Log business event
        logger.logBusinessEvent('donation_made', {
          donationId: donation.id,
          appointmentId,
          artistId: appointment.artistId,
          clientId: user.id,
          amount,
          paymentIntentId: paymentIntent.id
        }, request)

        span.setAttribute('status', 'success')
        return ApiResponse.success({
          donationId: donation.id,
          paymentIntentId: paymentIntent.id,
          amount,
          status: 'COMPLETED',
          message: 'Thank you for your donation to TATU!',
          appointmentId
        }, 201, { requestId })

      } catch (error: any) {
        // Capture exception in Sentry
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          level: 'error',
          tags: {
            error_type: 'donation_processing_failed',
            appointment_id: appointmentId,
            user_id: user.id
          },
          extra: {
            amount,
            payment_method_id: paymentMethodId,
            error_message: error instanceof Error ? error.message : String(error)
          }
        })

        logger.error('Donation processing failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: user.id,
          appointmentId,
          amount
        })

        span.setAttribute('status', 'error')
        span.setAttribute('error', error instanceof Error ? error.message : 'Unknown error')
        return ApiResponse.internalError(
          'Failed to process donation',
          process.env.NODE_ENV === 'development' ? error : undefined,
          { requestId }
        )
      }
    }
  )
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


