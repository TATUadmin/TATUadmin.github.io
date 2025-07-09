import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured. Please set up Stripe environment variables.' },
        { status: 503 }
      )
    }

    const { 
      appointmentId, 
      artistId, 
      amount, 
      paymentType, 
      description 
    } = await request.json()

    if (!appointmentId || !artistId || !amount || !paymentType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate minimum payment amount
    if (amount < STRIPE_CONFIG.minimumPayment) {
      return NextResponse.json(
        { error: `Minimum payment amount is ${STRIPE_CONFIG.minimumPayment / 100}` },
        { status: 400 }
      )
    }

    // Get artist and appointment details
    const [artist, appointment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: artistId },
        include: { profile: true }
      }),
      prisma.appointment.findUnique({
        where: { id: appointmentId }
      })
    ])

    if (!artist || !appointment) {
      return NextResponse.json(
        { error: 'Artist or appointment not found' },
        { status: 404 }
      )
    }

    // Calculate platform fee
    const platformFee = Math.round(amount * STRIPE_CONFIG.platformFeePercentage)
    const artistAmount = amount - platformFee

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: STRIPE_CONFIG.currency,
            product_data: {
              name: `${paymentType === 'consultation' ? 'Consultation' : 'Tattoo'} Payment`,
              description: description || `Payment for appointment ${appointmentId}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId,
        artistId,
        paymentType,
        platformFee: platformFee.toString(),
        artistAmount: artistAmount.toString(),
      },
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancelled`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        metadata: {
          appointmentId,
          artistId,
          paymentType,
        },
      },
    })

    // Store payment intent in database (TODO: Add Payment model to schema)
    console.log('Payment session created:', {
      sessionId: session.id,
      appointmentId,
      artistId,
      amount,
      platformFee,
      paymentType
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
} 