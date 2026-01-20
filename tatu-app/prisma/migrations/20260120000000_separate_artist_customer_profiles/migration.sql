-- Create ArtistProfile table
CREATE TABLE "ArtistProfile" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "phone" TEXT,
    "instagram" TEXT,
    "website" TEXT,
    "location" TEXT,
    "specialties" TEXT[],
    "userId" TEXT NOT NULL,
    "completedRegistration" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionTier" "SubscriptionTier",
    "subscriptionStatus" "SubscriptionStatus",
    "portfolioImageCount" INTEGER NOT NULL DEFAULT 0,
    "featuredListingActive" BOOLEAN NOT NULL DEFAULT false,
    "visibilityBoostActive" BOOLEAN NOT NULL DEFAULT false,
    "visibilityBoostEndDate" TIMESTAMP(3),

    CONSTRAINT "ArtistProfile_pkey" PRIMARY KEY ("id")
);

-- Create CustomerProfile table
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "userId" TEXT NOT NULL,
    "completedRegistration" BOOLEAN NOT NULL DEFAULT false,
    "preferredStyles" TEXT[],
    "locationPreferences" TEXT,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- Migrate data from Profile to ArtistProfile (for ARTIST and SHOP_OWNER roles)
INSERT INTO "ArtistProfile" (
    "id",
    "bio",
    "avatar",
    "phone",
    "instagram",
    "website",
    "location",
    "specialties",
    "userId",
    "completedRegistration",
    "subscriptionTier",
    "subscriptionStatus",
    "portfolioImageCount",
    "featuredListingActive",
    "visibilityBoostActive",
    "visibilityBoostEndDate"
)
SELECT 
    "id",
    "bio",
    "avatar",
    "phone",
    "instagram",
    "website",
    "location",
    "specialties",
    "userId",
    "completedRegistration",
    "subscriptionTier",
    "subscriptionStatus",
    "portfolioImageCount",
    "featuredListingActive",
    "visibilityBoostActive",
    "visibilityBoostEndDate"
FROM "Profile"
WHERE "userId" IN (
    SELECT "id" FROM "User" WHERE "role" IN ('ARTIST', 'SHOP_OWNER')
);

-- Migrate data from Profile to CustomerProfile (for CUSTOMER role)
INSERT INTO "CustomerProfile" (
    "id",
    "avatar",
    "phone",
    "userId",
    "completedRegistration",
    "preferredStyles",
    "locationPreferences"
)
SELECT 
    "id",
    "avatar",
    "phone",
    "userId",
    "completedRegistration",
    ARRAY[]::TEXT[],
    NULL
FROM "Profile"
WHERE "userId" IN (
    SELECT "id" FROM "User" WHERE "role" = 'CUSTOMER'
);

-- Create unique constraints
CREATE UNIQUE INDEX "ArtistProfile_userId_key" ON "ArtistProfile"("userId");
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- Add foreign key constraints
ALTER TABLE "ArtistProfile" ADD CONSTRAINT "ArtistProfile_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the old Profile table
DROP TABLE "Profile";

