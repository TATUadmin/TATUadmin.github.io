import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { subscriptionService } from '@/lib/subscription-service'
import { logger } from '@/lib/monitoring'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * Stripe Webhook Handler for Subscription Events
 * 
 * This endpoint receives webhook events from Stripe to keep
 * subscription status in sync.
 * 
 * Important: This endpoint must be configured in Stripe Dashboard
 * URL: https://tatufortattoos.com/api/subscriptions/webhook
 */
export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    logger.warn('Webhook signature missing')
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS

  if (!webhookSecret) {
    logger.error('Webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    logger.info('Subscription webhook received', { 
      type: event.type,
      id: event.id 
    })

    // Handle the event
    await subscriptionService.handleWebhookEvent(event)

    return NextResponse.json({ received: true })

  } catch (error) {
    logger.error('Webhook error', { error })
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}

