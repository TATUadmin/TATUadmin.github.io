import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe functionality will be disabled.')
}

export const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  : null

export const STRIPE_CONFIG = {
  currency: 'usd',
  consultationFee: 5000, // $50 in cents
  minimumPayment: 2000, // $20 in cents
  platformFeePercentage: 0.10, // 10% platform fee
} 