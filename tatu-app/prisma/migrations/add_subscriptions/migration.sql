-- Add Subscription Enums
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO', 'STUDIO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'PAST_DUE', 'PAUSED', 'TRIAL');
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- Add subscription fields to Profile table
ALTER TABLE "Profile" ADD COLUMN "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'FREE';
ALTER TABLE "Profile" ADD COLUMN "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Profile" ADD COLUMN "portfolioImageCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Profile" ADD COLUMN "featuredListingActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Profile" ADD COLUMN "featuredListingEndDate" TIMESTAMP(3);

-- Create Subscription table
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'MONTHLY',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- Create unique constraint on stripeSubscriptionId
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- Create indexes for common queries
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_tier_idx" ON "Subscription"("tier");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");

-- Add foreign key constraint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create FREE subscriptions for all existing users
INSERT INTO "Subscription" ("id", "userId", "tier", "status", "billingInterval", "amount", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'FREE'::"SubscriptionTier",
    'ACTIVE'::"SubscriptionStatus",
    'MONTHLY'::"BillingInterval",
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE NOT EXISTS (
    SELECT 1 FROM "Subscription" WHERE "Subscription"."userId" = "User"."id"
);

-- Update all existing profiles to have FREE tier
UPDATE "Profile" 
SET "subscriptionTier" = 'FREE', "subscriptionStatus" = 'ACTIVE'
WHERE "subscriptionTier" IS NULL OR "subscriptionStatus" IS NULL;

