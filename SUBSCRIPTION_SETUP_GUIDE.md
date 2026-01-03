# TATU Subscription System - Setup Guide

## 🚀 Quick Start

This guide will help you set up the subscription system for TATU.

---

## 📋 Prerequisites

1. **Stripe Account** - Sign up at [stripe.com](https://stripe.com)
2. **Database Access** - PostgreSQL/TimescaleDB with Prisma
3. **Environment Variables** - Access to Vercel or local `.env` file

---

## 🔧 Step 1: Database Migration

Run the Prisma migration to add subscription tables:

```bash
cd tatu-app
npx prisma migrate dev --name add_subscriptions
```

Or manually run the migration SQL:

```bash
psql $DATABASE_URL -f prisma/migrations/add_subscriptions/migration.sql
```

This will:
- Add `SubscriptionTier`, `SubscriptionStatus`, `BillingInterval` enums
- Create `Subscription` table
- Add subscription fields to `Profile` table
- Create FREE subscriptions for all existing users

---

## 💳 Step 2: Stripe Configuration

### 2.1 Create Stripe Products

Log into Stripe Dashboard → Products → Create Product

**Product 1: TATU Pro Artist**
- Name: `TATU Pro Artist`
- Description: `Professional artist subscription with unlimited portfolio, analytics, and premium features`
- Pricing:
  - Monthly: $39.00 USD (recurring)
  - Yearly: $390.00 USD (recurring, annually)

**Product 2: TATU Studio**
- Name: `TATU Studio`
- Description: `Complete studio solution with multiple artists, custom branding, and advanced analytics`
- Pricing:
  - Monthly: $129.00 USD (recurring)
  - Yearly: $1,290.00 USD (recurring, annually)

### 2.2 Get Price IDs

After creating products, copy the **Price IDs** (they look like `price_xxxxxxxxxxxxx`):

- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_YEARLY`
- `STRIPE_PRICE_STUDIO_MONTHLY`
- `STRIPE_PRICE_STUDIO_YEARLY`

### 2.3 Create Add-On Products (Optional)

**Featured Listing - Daily**
- Price: $20.00 USD (one-time)

**Featured Listing - Weekly**
- Price: $50.00 USD (one-time)

**Featured Listing - Monthly**
- Price: $150.00 USD (one-time)

**Additional Artist Seat**
- Price: $15.00 USD (recurring, monthly)

---

## 🔐 Step 3: Environment Variables

Add these to your Vercel environment variables or `.env.local`:

```bash
# Stripe Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Use sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Stripe Price IDs (from Step 2.2)
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_STUDIO_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_STUDIO_YEARLY=price_xxxxxxxxxxxxx

# Add-on Price IDs (optional)
STRIPE_PRICE_FEATURED_DAILY=price_xxxxxxxxxxxxx
STRIPE_PRICE_FEATURED_WEEKLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_FEATURED_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ADDITIONAL_ARTIST=price_xxxxxxxxxxxxx

# Webhook Secrets (from Step 4)
STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS=whsec_xxxxxxxxxxxxx
```

---

## 🔔 Step 4: Stripe Webhooks

### 4.1 Create Webhook Endpoint

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

**Endpoint URL:**
```
https://tatufortattoos.com/api/subscriptions/webhook
```

**Events to listen for:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### 4.2 Get Webhook Secret

After creating the webhook, copy the **Signing Secret** (starts with `whsec_`):

```bash
STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS=whsec_xxxxxxxxxxxxx
```

### 4.3 Test Webhook (Development)

For local testing, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
```

---

## 🧪 Step 5: Testing

### 5.1 Test Subscription Flow

1. **Sign up as a new artist**
   - Go to `/signup`
   - Select "I'm a tattoo artist"
   - Complete profile setup
   - On Step 3, select a subscription tier

2. **Test FREE tier**
   - Select FREE
   - Complete setup
   - Verify profile shows FREE tier

3. **Test PRO tier (with test card)**
   - Select PRO
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date, any CVC
   - Complete payment
   - Verify subscription created in database

4. **Test subscription management**
   - Go to `/dashboard/subscription`
   - View current subscription
   - Test cancellation (with "cancel at period end")
   - Test immediate cancellation

### 5.2 Test Feature Gating

1. **Portfolio upload limit (FREE tier)**
   - Upload 10 images (should succeed)
   - Try to upload 11th image (should be blocked)
   - Upgrade to PRO
   - Upload more images (should succeed)

2. **Analytics access**
   - As FREE user, try to access analytics (should be blocked)
   - Upgrade to PRO
   - Access analytics (should succeed)

3. **Search ranking**
   - Create 3 test artists: FREE, PRO, STUDIO
   - Search for artists
   - Verify ranking order (STUDIO > PRO > FREE)

### 5.3 Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
3D Secure: 4000 0027 6000 3184
```

---

## 📊 Step 6: Monitoring

### 6.1 Stripe Dashboard

Monitor:
- **Subscriptions:** Active, cancelled, past due
- **Revenue:** MRR, ARR, churn rate
- **Customers:** New signups, payment failures

### 6.2 Database Queries

**Check subscription distribution:**
```sql
SELECT 
  tier,
  status,
  COUNT(*) as count
FROM "Subscription"
GROUP BY tier, status
ORDER BY tier, status;
```

**Find users with payment issues:**
```sql
SELECT 
  u.email,
  s.tier,
  s.status,
  s."currentPeriodEnd"
FROM "Subscription" s
JOIN "User" u ON s."userId" = u.id
WHERE s.status = 'PAST_DUE'
ORDER BY s."currentPeriodEnd" ASC;
```

**Calculate MRR:**
```sql
SELECT 
  SUM(CASE 
    WHEN "billingInterval" = 'MONTHLY' THEN amount / 100
    WHEN "billingInterval" = 'YEARLY' THEN (amount / 100) / 12
  END) as mrr
FROM "Subscription"
WHERE status = 'ACTIVE' AND tier != 'FREE';
```

### 6.3 Sentry Monitoring

Subscription events are automatically logged to Sentry. Monitor:
- Subscription creation failures
- Payment failures
- Webhook processing errors

---

## 🚨 Troubleshooting

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is correct in Stripe Dashboard
2. Verify webhook secret is set in environment variables
3. Check Stripe Dashboard → Webhooks → Recent deliveries for errors
4. Ensure your server is publicly accessible (not localhost)

### Issue: Payment fails during subscription creation

**Solution:**
1. Check Stripe logs for specific error
2. Verify price IDs are correct
3. Ensure customer has valid payment method
4. Check for Stripe account restrictions

### Issue: Feature gates not working

**Solution:**
1. Verify profile has correct `subscriptionTier` and `subscriptionStatus`
2. Check subscription record exists in database
3. Ensure feature check is using correct tier
4. Clear any caching (Redis, browser)

### Issue: Subscription not syncing from Stripe

**Solution:**
1. Check webhook is receiving events
2. Verify webhook signature validation
3. Check Sentry for webhook processing errors
4. Manually trigger webhook event in Stripe Dashboard

---

## 🔄 Migration for Existing Users

If you have existing users, run this script to set them up with FREE subscriptions:

```sql
-- Create FREE subscriptions for users without one
INSERT INTO "Subscription" ("id", "userId", "tier", "status", "billingInterval", "amount", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    u."id",
    'FREE'::"SubscriptionTier",
    'ACTIVE'::"SubscriptionStatus",
    'MONTHLY'::"BillingInterval",
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" u
LEFT JOIN "Subscription" s ON s."userId" = u."id"
WHERE s."id" IS NULL;

-- Update profiles to reflect FREE tier
UPDATE "Profile" p
SET 
    "subscriptionTier" = 'FREE',
    "subscriptionStatus" = 'ACTIVE'
FROM "User" u
WHERE p."userId" = u."id"
AND (p."subscriptionTier" IS NULL OR p."subscriptionStatus" IS NULL);
```

---

## 📈 Go Live Checklist

Before launching subscriptions to production:

- [ ] Database migration completed successfully
- [ ] Stripe products created with correct pricing
- [ ] All environment variables set in production
- [ ] Webhook endpoint configured and tested
- [ ] Test subscriptions created and verified
- [ ] Feature gating tested for all tiers
- [ ] Payment flow tested end-to-end
- [ ] Cancellation flow tested
- [ ] Monitoring and alerts set up
- [ ] Customer support documentation updated
- [ ] Pricing page live on website
- [ ] Legal terms updated (if needed)
- [ ] Email templates for subscription events
- [ ] Analytics tracking configured

---

## 📞 Support

**Technical Issues:**
- Check Sentry for error logs
- Review Stripe Dashboard for payment issues
- Check database for subscription records

**Business Questions:**
- Review `TATU_REVENUE_STRATEGY.md` for pricing rationale
- Monitor MRR and churn in Stripe Dashboard
- Analyze feature adoption in analytics

---

## 🎉 You're All Set!

The subscription system is now ready to generate revenue for TATU. Remember:

- **Start with FREE tier** - Let artists try the platform
- **Show value first** - Demonstrate ROI before asking for payment
- **Monitor metrics** - Track conversion, churn, and feature adoption
- **Iterate quickly** - Adjust pricing and features based on feedback

**Good luck with your launch!** 🚀

