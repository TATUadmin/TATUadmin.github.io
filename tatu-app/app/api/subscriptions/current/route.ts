import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { subscriptionService } from '@/lib/subscription-service'
import * as Sentry from '@sentry/nextjs'

export const GET = withErrorHandling(async (request: NextRequest) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/subscriptions/current',
    },
    async (span: any) => {
      // Authentication
      const authContext = await requireAuth(request)
      const { user, requestId } = authContext
      span.setAttribute('user_id', user.id)
      span.setAttribute('request_id', requestId)

      // Get subscription
      const subscription = await subscriptionService.getSubscription(user.id)

      if (!subscription) {
        // Return default FREE subscription info
        return NextResponse.json({
          success: true,
          subscription: {
            tier: 'FREE',
            status: 'ACTIVE',
            features: require('@/lib/subscription-config').SUBSCRIPTION_TIERS.FREE.features,
          },
          requestId,
        })
      }

      span.setAttribute('subscription_tier', subscription.tier)
      span.setAttribute('subscription_status', subscription.status)

      return NextResponse.json({
        success: true,
        subscription,
        requestId,
      })
    }
  )
})

