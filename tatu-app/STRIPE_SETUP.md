# Stripe Payment Integration Setup Guide

## Overview

Stripe is a payment processing API that handles credit card payments, subscriptions, and other financial transactions. Your TATU application already has most of the Stripe integration code in place - you just need to configure your Stripe account and add the environment variables.

## What Stripe Is

**Stripe is primarily an API-based payment service** that:
- Processes credit/debit card payments securely
- Handles subscriptions and recurring billing
- Provides webhooks for payment status updates
- Manages customer payment methods
- Handles refunds and disputes
- Is PCI-compliant (you don't store full card numbers)

## Current Implementation Status

✅ **Already Implemented:**
- Stripe SDK installed (`stripe` and `@stripe/stripe-js`)
- Payment service (`lib/payment.ts`)
- Payment API routes (`/api/payments/*`)
- Webhook handler (`/api/payments/webhook`)
- Frontend components (`PaymentForm.tsx`, `CheckoutFlow.tsx`)
- Payment hooks (`usePayment`)
- Database models (Payment, Donation)

## Setup Steps

### 1. Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete your business information
4. Verify your email address

### 2. Get Your API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

**Important:** Use test keys (`pk_test_` and `sk_test_`) during development. Switch to live keys (`pk_live_` and `sk_live_`) only when ready for production.

### 3. Set Up Webhooks

Webhooks allow Stripe to notify your app when payment events occur (payment succeeded, failed, etc.).

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Development:** `http://localhost:3000/api/payments/webhook` (use Stripe CLI - see below)
   - **Production:** `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)

#### Testing Webhooks Locally (Recommended)

Use Stripe CLI to forward webhooks to your local server:

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

This will give you a webhook signing secret that starts with `whsec_` - use this for `STRIPE_WEBHOOK_SECRET` in development.

### 4. Add Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your_publishable_key
STRIPE_SECRET_KEY=sk_test_...your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret

# For production, also add subscription webhook secret:
STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS=whsec_...your_subscription_webhook_secret
```

**For Vercel/Production:**
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the same variables with your **live** keys (not test keys)

### 5. Run Database Migration

After adding the Payment and Donation models, run:

```bash
cd tatu-app
npx prisma migrate dev --name add_payment_models
npx prisma generate
```

### 6. Test the Integration

#### Test Payment Flow:

1. **Create a test appointment** (or use existing one)
2. **Navigate to payment page** (integrate PaymentForm component)
3. **Use Stripe test card numbers:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
   - Use any future expiry date (e.g., `12/34`)
   - Use any 3-digit CVV (e.g., `123`)

#### Test Webhook:

1. Make a test payment
2. Check your server logs for webhook events
3. Verify payment status updates in database

## Payment Features Available

### 1. Appointment Holds (`/api/payments/hold`)
- Hold funds on a card without charging
- Used to secure appointments
- Minimum hold: $20 (configurable)

### 2. Full Payments (`/api/payments`)
- Process consultation fees, deposits, or full payments
- Supports Stripe Checkout (redirect) or Payment Intents (embedded)

### 3. Donations (`/api/payments/donation`)
- Allow clients to tip artists after appointments
- Fixed amounts: $5, $10, $25, $50, $100

### 4. Refunds (`/api/payments/[id]/refund`)
- Process full or partial refunds
- Automatically updates payment status

### 5. Subscriptions (`/api/subscriptions/*`)
- Already implemented for artist tiers (PRO, STUDIO)
- Handles recurring billing

## Payment Flow Architecture

```
Client → PaymentForm Component
  ↓
POST /api/payments
  ↓
PaymentService.createPaymentIntent() or createCheckoutSession()
  ↓
Stripe API (creates PaymentIntent/CheckoutSession)
  ↓
Client redirected to Stripe Checkout OR uses Payment Intent
  ↓
Stripe processes payment
  ↓
Webhook → /api/payments/webhook
  ↓
PaymentService.handlePaymentSuccess()
  ↓
Database updated (Payment status → COMPLETED)
  ↓
Appointment status updated
```

## Security Best Practices

1. **Never expose secret keys** - Only use `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in client-side code
2. **Always verify webhooks** - Use webhook signing secret to verify events
3. **Use HTTPS in production** - Stripe requires HTTPS for live payments
4. **Validate amounts server-side** - Never trust client-submitted amounts
5. **Log all payment events** - For auditing and debugging

## Troubleshooting

### "Stripe is not configured" error
- Check that `STRIPE_SECRET_KEY` is set in `.env.local`
- Restart your dev server after adding env vars

### Webhook not receiving events
- Verify webhook URL is correct
- Check webhook signing secret matches
- Use Stripe CLI for local testing
- Check server logs for errors

### Payment Intent creation fails
- Verify Stripe account is activated
- Check API key permissions
- Ensure amount is in cents (e.g., $10.00 = 1000)
- Check Stripe Dashboard for error details

### Test cards not working
- Ensure you're using test API keys (not live)
- Use correct test card numbers
- Check card expiry is in the future

## Next Steps

1. ✅ Add environment variables
2. ✅ Run database migration
3. ✅ Test payment flow with test cards
4. ✅ Set up webhook endpoint
5. ✅ Integrate PaymentForm into booking flow
6. ✅ Test refund functionality
7. ✅ Switch to live keys when ready for production

## Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

## Support

If you encounter issues:
1. Check Stripe Dashboard → **Logs** for API errors
2. Review server logs for application errors
3. Check webhook delivery status in Stripe Dashboard
4. Verify environment variables are set correctly

