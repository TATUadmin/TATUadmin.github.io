import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { subscriptionService } from '@/lib/subscription-service'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

const createSubscriptionSchema = z.object({
  tier: z.enum(['FREE', 'PRO', 'STUDIO']),
  billingInterval: z.enum(['MONTHLY', 'YEARLY']),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().min(0).max(30).optional(),
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/subscriptions/create',
    },
    async (span: any) => {
      // Rate limiting
      const rateLimitResult = await rateLimiters.payment.check(request)
      if (!rateLimitResult.allowed) {
        span.setAttribute('rate_limited', true)
        return ApiResponse.rateLimited('Too many subscription requests', rateLimitResult.retryAfter)
      }

      // Authentication
      const authContext = await requireAuth(request)
      const { user, requestId } = authContext
      span.setAttribute('user_id', user.id)
      span.setAttribute('request_id', requestId)

      // Validate request
      const body = await request.json()
      const validationResult = createSubscriptionSchema.safeParse(body)

      if (!validationResult.success) {
        span.setAttribute('validation_failed', true)
        return ApiResponse.validationError(validationResult.error.errors, { requestId })
      }

      const { tier, billingInterval, paymentMethodId, trialDays } = validationResult.data

      // Create subscription
      const result = await subscriptionService.createSubscription({
        userId: user.id,
        tier,
        billingInterval,
        paymentMethodId,
        trialDays,
      })

      if (!result.success) {
        span.setAttribute('subscription_creation_failed', true)
        return ApiResponse.error(result.error || 'Failed to create subscription', 400, { requestId })
      }

      span.setAttribute('subscription_tier', tier)
      span.setAttribute('billing_interval', billingInterval)

      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        clientSecret: result.clientSecret,
        requestId,
      })
    }
  )
})

