import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()

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
    const { appointmentId, artistId, paymentType } = session.metadata || {}

    if (!appointmentId) {
      console.error('No appointmentId in session metadata')
      return
    }

    console.log('Payment completed for appointment:', appointmentId, {
      sessionId: session.id,
      amount: session.amount_total,
      paymentType,
      artistId
    })

    // TODO: Update appointment status when Payment model is added
    // await prisma.appointment.update({
    //   where: { id: appointmentId },
    //   data: { 
    //     status: paymentType === 'CONSULTATION' ? 'CONFIRMED' : 'PAID'
    //   }
    // })

    // TODO: Send confirmation emails to artist and customer

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { appointmentId, paymentType } = paymentIntent.metadata || {}

    console.log('Payment succeeded:', {
      paymentIntentId: paymentIntent.id,
      appointmentId,
      amount: paymentIntent.amount,
      paymentType
    })

    // TODO: Additional post-payment processing

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { appointmentId } = paymentIntent.metadata || {}

    console.log('Payment failed:', {
      paymentIntentId: paymentIntent.id,
      appointmentId,
      amount: paymentIntent.amount
    })

    // TODO: Update appointment status to PAYMENT_FAILED
    // TODO: Send notification to customer about failed payment

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
} 