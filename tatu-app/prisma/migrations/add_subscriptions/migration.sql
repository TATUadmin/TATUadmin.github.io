-- Create Subscription table (string-based fields, no enums)
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "billingInterval" TEXT NOT NULL DEFAULT 'MONTHLY',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- Create indexes for common queries
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- Add foreign key constraint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create FREE subscriptions for all existing users
INSERT INTO "Subscription" ("id", "userId", "tier", "status", "billingInterval", "amount", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    "id",
    'FREE',
    'ACTIVE',
    'MONTHLY',
    0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User"
WHERE NOT EXISTS (
    SELECT 1 FROM "Subscription" WHERE "Subscription"."userId" = "User"."id"
);

