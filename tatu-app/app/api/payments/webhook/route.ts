import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { paymentService } from '@/lib/payment'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }
      
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const { paymentId } = session.metadata || {}

    if (!paymentId) {
      console.error('No paymentId in session metadata')
      return
    }

    console.log('Checkout session completed:', {
      sessionId: session.id,
      paymentId,
      amount: session.amount_total
    })

    // Handle payment success
    if (session.payment_intent) {
      await paymentService.handlePaymentSuccess(session.payment_intent as string)
    }

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    })

    await paymentService.handlePaymentSuccess(paymentIntent.id)

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount
    })

    await paymentService.handlePaymentFailure(paymentIntent.id)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
} 