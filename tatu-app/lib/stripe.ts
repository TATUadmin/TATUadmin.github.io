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
  // Card hold amounts
  appointmentHoldAmount: 5000, // $50 hold for appointments
  minimumHoldAmount: 2000, // $20 minimum hold
  // Visibility boost pricing
  visibilityBoostDaily: 1000, // $10/day for visibility boost
  visibilityBoostWeekly: 5000, // $50/week for visibility boost
  visibilityBoostMonthly: 15000, // $150/month for visibility boost
  // Donation amounts
  donationAmounts: [500, 1000, 2500, 5000, 10000], // $5, $10, $25, $50, $100
  // Platform fees
  platformFeePercentage: 0.05, // 5% platform fee (reduced for new model)
} 