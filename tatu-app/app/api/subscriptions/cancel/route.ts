import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { subscriptionService } from '@/lib/subscription-service'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'

const cancelSubscriptionSchema = z.object({
  immediately: z.boolean().optional().default(false),
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/subscriptions/cancel',
    },
    async (span: any) => {
      // Authentication
      const authContext = await requireAuth(request)
      const { user, requestId } = authContext
      span.setAttribute('user_id', user.id)
      span.setAttribute('request_id', requestId)

      // Validate request
      const body = await request.json()
      const validationResult = cancelSubscriptionSchema.safeParse(body)

      if (!validationResult.success) {
        span.setAttribute('validation_failed', true)
        return ApiResponse.validationError(validationResult.error.errors, { requestId })
      }

      const { immediately } = validationResult.data

      // Cancel subscription
      const result = await subscriptionService.cancelSubscription(user.id, immediately)

      if (!result.success) {
        span.setAttribute('cancellation_failed', true)
        return ApiResponse.error(result.error || 'Failed to cancel subscription', 400, { requestId })
      }

      span.setAttribute('cancelled_immediately', immediately)

      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        message: immediately 
          ? 'Subscription cancelled immediately' 
          : 'Subscription will cancel at the end of the billing period',
        requestId,
      })
    }
  )
})

