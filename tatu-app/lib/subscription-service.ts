/**
 * Subscription Service
 * Handles all subscription-related business logic
 */

import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import { stripe } from '@/lib/stripe'
import { SUBSCRIPTION_TIERS } from '@/lib/subscription-config'
import { logger } from '@/lib/monitoring'

const prisma = new PrismaClient()

export interface CreateSubscriptionParams {
  userId: string
  tier: SubscriptionTier
  billingInterval: 'MONTHLY' | 'YEARLY'
  paymentMethodId?: string
  trialDays?: number
}

export interface SubscriptionResult {
  success: boolean
  subscription?: any
  clientSecret?: string
  error?: string
}

export class SubscriptionService {
  /**
   * Create or upgrade a subscription
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const { userId, tier, billingInterval, paymentMethodId, trialDays } = params

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      })

      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // Check if already has subscription
      if (user.subscription && user.subscription.status === 'ACTIVE') {
        return { success: false, error: 'User already has an active subscription' }
      }

      // FREE tier doesn't need Stripe
      if (tier === 'FREE') {
        const subscription = await prisma.subscription.create({
          data: {
            userId,
            tier,
            status: 'ACTIVE',
            billingInterval,
            amount: 0,
          }
        })

        // Update artist profile cache (subscriptions are artist-only)
        await prisma.artistProfile.update({
          where: { userId },
          data: {
            subscriptionTier: tier,
            subscriptionStatus: 'ACTIVE',
          }
        })

        return { success: true, subscription }
      }

      // For paid tiers, need Stripe
      if (!stripe) {
        return { success: false, error: 'Payment processing not configured' }
      }

      const tierConfig = SUBSCRIPTION_TIERS[tier]
      const amount = billingInterval === 'MONTHLY' ? tierConfig.price.monthly : tierConfig.price.yearly
      const stripePriceId = billingInterval === 'MONTHLY' 
        ? tierConfig.stripePriceId.monthly 
        : tierConfig.stripePriceId.yearly

      if (!stripePriceId) {
        return { success: false, error: 'Stripe price not configured for this tier' }
      }

      // Create or get Stripe customer
      let stripeCustomerId = user.subscription?.stripeCustomerId

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
          metadata: {
            userId: user.id,
          }
        })
        stripeCustomerId = customer.id
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        })

        await stripe.customers.update(stripeCustomerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          }
        })
      }

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: stripePriceId }],
        trial_period_days: trialDays,
        metadata: {
          userId: user.id,
          tier,
        },
        expand: ['latest_invoice.payment_intent'],
      })

      // Create subscription in database
      const subscription = await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier,
          status: trialDays ? 'TRIAL' : 'ACTIVE',
          billingInterval,
          amount,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId,
          stripePriceId,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          trialStart: trialDays ? new Date() : undefined,
          trialEnd: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : undefined,
        },
        update: {
          tier,
          status: trialDays ? 'TRIAL' : 'ACTIVE',
          billingInterval,
          amount,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId,
          stripePriceId,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          trialStart: trialDays ? new Date() : undefined,
          trialEnd: trialDays ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : undefined,
        }
      })

      // Update artist profile cache (subscriptions are artist-only)
      await prisma.artistProfile.update({
        where: { userId },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: trialDays ? 'TRIAL' : 'ACTIVE',
        }
      })

      // Get client secret for payment confirmation if needed
      const latestInvoice = stripeSubscription.latest_invoice as any
      const clientSecret = latestInvoice?.payment_intent?.client_secret

      logger.info('Subscription created', { userId, tier, subscriptionId: subscription.id })

      return { 
        success: true, 
        subscription,
        clientSecret 
      }

    } catch (error) {
      logger.error('Error creating subscription', { error, params })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create subscription' 
      }
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string, immediately: boolean = false): Promise<SubscriptionResult> {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { userId }
      })

      if (!subscription) {
        return { success: false, error: 'No subscription found' }
      }

      if (subscription.stripeSubscriptionId && stripe) {
        // Cancel in Stripe
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: !immediately,
        })

        if (immediately) {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
        }
      }

      // Update database
      const updated = await prisma.subscription.update({
        where: { userId },
        data: {
          status: immediately ? 'CANCELLED' : subscription.status,
          cancelAt: immediately ? new Date() : subscription.currentPeriodEnd,
          canceledAt: immediately ? new Date() : undefined,
        }
      })

      // If cancelled immediately, downgrade to FREE
      if (immediately) {
        await prisma.artistProfile.update({
          where: { userId },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'ACTIVE',
          }
        })
      }

      logger.info('Subscription cancelled', { userId, immediately })

      return { success: true, subscription: updated }

    } catch (error) {
      logger.error('Error cancelling subscription', { error, userId })
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel subscription' 
      }
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            artistProfile: true
          }
        }
      }
    })
  }

  /**
   * Check if user has access to a feature
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const profile = await prisma.artistProfile.findUnique({
      where: { userId }
    })

    if (!profile) return false

    const tier = profile.subscriptionTier
    const tierConfig = SUBSCRIPTION_TIERS[tier]
    
    return tierConfig?.features[feature as keyof typeof tierConfig.features] === true
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object)
          break
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object)
          break
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object)
          break
      }
    } catch (error) {
      logger.error('Error handling webhook event', { error, eventType: event.type })
      throw error
    }
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const userId = subscription.metadata.userId

    if (!userId) {
      logger.warn('Subscription updated without userId', { subscriptionId: subscription.id })
      return
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
      }
    })

    logger.info('Subscription updated from webhook', { userId, status: subscription.status })
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const userId = subscription.metadata.userId

    if (!userId) {
      logger.warn('Subscription deleted without userId', { subscriptionId: subscription.id })
      return
    }

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        canceledAt: new Date(),
      }
    })

    // Downgrade to FREE tier
    await prisma.artistProfile.update({
      where: { userId },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'ACTIVE',
      }
    })

    logger.info('Subscription deleted from webhook', { userId })
  }

  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    const subscriptionId = invoice.subscription
    const userId = invoice.metadata?.userId

    if (!userId) {
      logger.warn('Payment succeeded without userId', { invoiceId: invoice.id })
      return
    }

    // Update subscription status to ACTIVE if it was PAST_DUE
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: 'PAST_DUE',
      },
      data: {
        status: 'ACTIVE',
      }
    })

    logger.info('Payment succeeded', { userId, invoiceId: invoice.id })
  }

  private async handlePaymentFailed(invoice: any): Promise<void> {
    const userId = invoice.metadata?.userId

    if (!userId) {
      logger.warn('Payment failed without userId', { invoiceId: invoice.id })
      return
    }

    // Mark subscription as PAST_DUE
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'PAST_DUE',
      }
    })

    await prisma.artistProfile.update({
      where: { userId },
      data: {
        subscriptionStatus: 'PAST_DUE',
      }
    })

    logger.warn('Payment failed', { userId, invoiceId: invoice.id })
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': 'ACTIVE',
      'canceled': 'CANCELLED',
      'past_due': 'PAST_DUE',
      'paused': 'PAUSED',
      'trialing': 'TRIAL',
    }

    return statusMap[stripeStatus] || 'ACTIVE'
  }
}

export const subscriptionService = new SubscriptionService()

