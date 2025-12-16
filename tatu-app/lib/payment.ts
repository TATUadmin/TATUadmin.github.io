import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export interface CreatePaymentIntentData {
  appointmentId: string
  clientId: string
  artistId: string
  amount: number // in cents
  type: 'CONSULTATION' | 'DEPOSIT' | 'FULL_PAYMENT'
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  clientSecret?: string
  sessionUrl?: string
  error?: string
}

export class PaymentService {
  private stripe: Stripe | null = null

  constructor() {
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
        typescript: true,
      })
    } else {
      console.warn('STRIPE_SECRET_KEY is not set. Payment functionality will be disabled.')
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Payment functionality is disabled.')
    }
    return this.stripe
  }

  /**
   * Create a payment intent for immediate payment
   */
  async createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentResult> {
    try {
      // Calculate platform fee (10%)
      const platformFee = Math.round(data.amount * 0.10)
      const artistAmount = data.amount - platformFee

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          artistId: data.artistId,
          amount: data.amount,
          type: data.type,
          platformFee,
          artistAmount,
          description: data.description,
          metadata: data.metadata,
          status: 'PENDING'
        }
      })

      // Create Stripe payment intent
      const paymentIntent = await this.ensureStripe().paymentIntents.create({
        amount: data.amount,
        currency: 'usd',
        metadata: {
          paymentId: payment.id,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          artistId: data.artistId,
          type: data.type,
          platformFee: platformFee.toString(),
          artistAmount: artistAmount.toString(),
        },
        description: data.description || `Payment for ${data.type.toLowerCase()}`
      })

      // Update payment with Stripe payment intent ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          stripePaymentId: paymentIntent.id,
          status: 'PROCESSING'
        }
      })

      return {
        success: true,
        paymentId: payment.id,
        clientSecret: paymentIntent.client_secret
      }
    } catch (error) {
      console.error('Error creating payment intent:', error)
      return {
        success: false,
        error: 'Failed to create payment intent'
      }
    }
  }

  /**
   * Create a checkout session for redirect-based payment
   */
  async createCheckoutSession(data: CreatePaymentIntentData): Promise<PaymentResult> {
    try {
      // Calculate platform fee (10%)
      const platformFee = Math.round(data.amount * 0.10)
      const artistAmount = data.amount - platformFee

      // Create payment record in database
      const payment = await prisma.payment.create({
        data: {
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          artistId: data.artistId,
          amount: data.amount,
          type: data.type,
          platformFee,
          artistAmount,
          description: data.description,
          metadata: data.metadata,
          status: 'PENDING'
        }
      })

      // Create Stripe checkout session
      const session = await this.ensureStripe().checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${data.type === 'CONSULTATION' ? 'Consultation' : 'Tattoo'} Payment`,
                description: data.description || `Payment for appointment ${data.appointmentId}`,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          paymentId: payment.id,
          appointmentId: data.appointmentId,
          clientId: data.clientId,
          artistId: data.artistId,
          type: data.type,
          platformFee: platformFee.toString(),
          artistAmount: artistAmount.toString(),
        },
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/payment/cancelled`,
        payment_intent_data: {
          metadata: {
            paymentId: payment.id,
            appointmentId: data.appointmentId,
            clientId: data.clientId,
            artistId: data.artistId,
            type: data.type,
          },
        },
      })

      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          stripeSessionId: session.id,
          status: 'PROCESSING'
        }
      })

      return {
        success: true,
        paymentId: payment.id,
        sessionUrl: session.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return {
        success: false,
        error: 'Failed to create checkout session'
      }
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntentId }
      })

      if (!payment) {
        console.error('Payment not found for payment intent:', paymentIntentId)
        return
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })

      // Update appointment status if needed
      if (payment.appointmentId) {
        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: {
            status: payment.type === 'CONSULTATION' ? 'CONFIRMED' : 'PAID'
          }
        })
      }

      console.log('Payment completed successfully:', payment.id)
    } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: paymentIntentId }
      })

      if (!payment) {
        console.error('Payment not found for payment intent:', paymentIntentId)
        return
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      })

      console.log('Payment failed:', payment.id)
    } catch (error) {
      console.error('Error handling payment failure:', error)
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string) {
    return await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        client: { select: { id: true, name: true, email: true } },
        artist: { select: { id: true, name: true, email: true } },
        appointment: { select: { id: true, startTime: true, endTime: true } }
      }
    })
  }

  /**
   * Get payments for a user
   */
  async getUserPayments(userId: string, type?: 'client' | 'artist') {
    const where = type === 'client' 
      ? { clientId: userId }
      : type === 'artist'
      ? { artistId: userId }
      : { OR: [{ clientId: userId }, { artistId: userId }] }

    return await prisma.payment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        artist: { select: { id: true, name: true, email: true } },
        appointment: { select: { id: true, startTime: true, endTime: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Create refund
   */
  async createRefund(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      })

      if (!payment || !payment.stripePaymentId) {
        return {
          success: false,
          error: 'Payment not found or not processed'
        }
      }

      // Create Stripe refund
      const refund = await this.ensureStripe().refunds.create({
        payment_intent: payment.stripePaymentId,
        amount: amount || payment.amount,
        metadata: {
          originalPaymentId: payment.id,
          appointmentId: payment.appointmentId || '',
        }
      })

      // Create refund payment record
      await prisma.payment.create({
        data: {
          appointmentId: payment.appointmentId,
          clientId: payment.clientId,
          artistId: payment.artistId,
          amount: -(amount || payment.amount),
          type: 'REFUND',
          platformFee: 0,
          artistAmount: -(amount || payment.amount),
          description: `Refund for payment ${payment.id}`,
          status: 'COMPLETED',
          completedAt: new Date(),
          stripePaymentId: refund.id
        }
      })

      return {
        success: true,
        paymentId: refund.id
      }
    } catch (error) {
      console.error('Error creating refund:', error)
      return {
        success: false,
        error: 'Failed to create refund'
      }
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
