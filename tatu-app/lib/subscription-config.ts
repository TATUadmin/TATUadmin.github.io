/**
 * TATU Subscription Tiers & Pricing Configuration
 * 
 * Revenue Model: Value-Based Subscriptions (No Transaction Fees)
 * 
 * Philosophy: We don't process payments between clients and artists.
 * Artists handle their own payments (cash, Venmo, etc.) to avoid:
 * - Tax reporting burdens
 * - Payment processing fees
 * - 1099 complications
 * - Circumvention behaviors
 * 
 * Instead, we charge for VALUE: visibility, features, and tools that
 * help artists grow their business.
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceId: {
      monthly: null,
      yearly: null,
    },
    features: {
      portfolioImages: 50, // Updated: Generous limit for complete portfolios
      portfolioCollections: 5, // Updated: More collections for better organization
      appointmentBooking: true,
      basicProfile: true,
      clientMessages: true,
      searchListing: true,
      searchRanking: 'standard' as const,
      analytics: false,
      featuredListing: false,
      socialMediaIntegration: false,
      videoConsultations: true, // NEW: 3 calls per month, unlimited duration
      videoConsultationsLimit: 3, // NEW: 3 video calls per month
      videoConsultationDuration: 'unlimited' as const, // NEW: No time limits
      videoQuality: '480p' as const, // NEW: Standard quality
      videoRecording: false, // No recording on free tier
      advancedScheduling: false,
      clientManagementTools: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      multipleArtists: false,
    },
    description: 'Perfect for artists just starting out',
    cta: 'Get Started Free',
    popular: false,
  },
  
  PRO: {
    id: 'PRO',
    name: 'Pro Artist',
    price: {
      monthly: 3900, // $39/month in cents
      yearly: 39000, // $390/year in cents ($32.50/month)
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    },
    features: {
      portfolioImages: -1, // Unlimited
      portfolioCollections: -1, // Unlimited
      appointmentBooking: true,
      basicProfile: true,
      clientMessages: true,
      searchListing: true,
      searchRanking: 'boosted' as const, // Higher in search results (2x boost)
      analytics: true, // View counts, engagement, best performing work
      featuredListing: false, // Separate add-on purchase
      socialMediaIntegration: true, // Auto-post to Instagram
      videoConsultations: true, // Unlimited video calls
      videoConsultationsLimit: -1, // NEW: Unlimited calls per month
      videoConsultationDuration: 'unlimited' as const, // NEW: No time limits
      videoQuality: '720p' as const, // NEW: HD quality
      videoRecording: true, // NEW: Can record consultations & get transcripts
      advancedScheduling: true, // Complex availability rules, buffer times
      clientManagementTools: true, // Client history, notes, preferences
      customBranding: false,
      apiAccess: false,
      prioritySupport: true,
      multipleArtists: false,
    },
    savings: {
      monthly: 0,
      yearly: 7800, // Save $78/year (2 months free)
    },
    description: 'For serious artists building their brand',
    cta: 'Upgrade to Pro',
    popular: true, // Most popular tier
    badge: 'Most Popular',
  },
  
  STUDIO: {
    id: 'STUDIO',
    name: 'Studio',
    price: {
      monthly: 12900, // $129/month in cents
      yearly: 129000, // $1,290/year in cents ($107.50/month)
    },
    stripePriceId: {
      monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_STUDIO_YEARLY || '',
    },
    features: {
      portfolioImages: -1, // Unlimited
      portfolioCollections: -1, // Unlimited
      appointmentBooking: true,
      basicProfile: true,
      clientMessages: true,
      searchListing: true,
      searchRanking: 'premium' as const, // Highest priority (3x boost)
      analytics: true,
      featuredListing: false, // Separate add-on purchase
      socialMediaIntegration: true,
      videoConsultations: true, // Unlimited video calls
      videoConsultationsLimit: -1, // NEW: Unlimited calls per month
      videoConsultationDuration: 'unlimited' as const, // NEW: No time limits
      videoQuality: '1080p' as const, // NEW: Full HD quality
      videoRecording: true, // NEW: Can record consultations & get transcripts
      videoCustomBranding: true, // NEW: White-label video call interface
      advancedScheduling: true,
      clientManagementTools: true,
      customBranding: true, // Custom colors, logo, URL
      apiAccess: true, // Integrate with other tools
      prioritySupport: true,
      multipleArtists: true, // Up to 10 artist accounts
      studioAnalytics: true, // Studio-wide insights
      teamManagement: true, // Artist permissions, schedules
      industryBenchmarking: true, // Compare to other studios
    },
    savings: {
      monthly: 0,
      yearly: 25800, // Save $258/year (2 months free)
    },
    description: 'Complete solution for tattoo studios',
    cta: 'Upgrade to Studio',
    popular: false,
    maxArtists: 10,
  },
} as const

/**
 * Add-On Features (À la carte purchases)
 * These are one-time or recurring purchases on top of base subscription
 */
export const ADDON_FEATURES = {
  FEATURED_LISTING_DAILY: {
    id: 'FEATURED_LISTING_DAILY',
    name: 'Featured Listing - 24 Hours',
    price: 2000, // $20
    stripePriceId: process.env.STRIPE_PRICE_FEATURED_DAILY || '',
    duration: 1, // days
    description: 'Appear at the top of search results for 24 hours',
    benefit: 'Average 5x more profile views',
  },
  
  FEATURED_LISTING_WEEKLY: {
    id: 'FEATURED_LISTING_WEEKLY',
    name: 'Featured Listing - 7 Days',
    price: 5000, // $50
    stripePriceId: process.env.STRIPE_PRICE_FEATURED_WEEKLY || '',
    duration: 7, // days
    description: 'Appear at the top of search results for 7 days',
    benefit: 'Save $90 vs daily',
    popular: true,
  },
  
  FEATURED_LISTING_MONTHLY: {
    id: 'FEATURED_LISTING_MONTHLY',
    name: 'Featured Listing - 30 Days',
    price: 15000, // $150
    stripePriceId: process.env.STRIPE_PRICE_FEATURED_MONTHLY || '',
    duration: 30, // days
    description: 'Appear at the top of search results for 30 days',
    benefit: 'Save $450 vs daily',
  },
  
  ADDITIONAL_STUDIO_ARTIST: {
    id: 'ADDITIONAL_STUDIO_ARTIST',
    name: 'Additional Artist Seat',
    price: 1500, // $15/month
    stripePriceId: process.env.STRIPE_PRICE_ADDITIONAL_ARTIST || '',
    recurring: true,
    description: 'Add another artist to your Studio plan (beyond 10)',
    minimumTier: 'STUDIO',
  },
} as const

/**
 * Check if a user has access to a feature based on their subscription tier
 */
export function hasFeatureAccess(
  userTier: keyof typeof SUBSCRIPTION_TIERS,
  feature: keyof typeof SUBSCRIPTION_TIERS.FREE.features
): boolean {
  return SUBSCRIPTION_TIERS[userTier]?.features[feature] === true
}

/**
 * Get the portfolio image limit for a tier
 */
export function getPortfolioLimit(tier: keyof typeof SUBSCRIPTION_TIERS): number {
  const limit = SUBSCRIPTION_TIERS[tier]?.features.portfolioImages
  return limit === -1 ? Infinity : limit || 0
}

/**
 * Get the video consultation limit for a tier
 */
export function getVideoConsultationLimit(tier: keyof typeof SUBSCRIPTION_TIERS): number {
  const limit = SUBSCRIPTION_TIERS[tier]?.features.videoConsultationsLimit
  return limit === -1 ? Infinity : (limit || 0)
}

/**
 * Get the video quality for a tier
 */
export function getVideoQuality(tier: keyof typeof SUBSCRIPTION_TIERS): string {
  return SUBSCRIPTION_TIERS[tier]?.features.videoQuality || '480p'
}

/**
 * Check if user has reached their portfolio limit
 */
export function hasReachedPortfolioLimit(
  tier: keyof typeof SUBSCRIPTION_TIERS,
  currentCount: number
): boolean {
  const limit = getPortfolioLimit(tier)
  return limit !== Infinity && currentCount >= limit
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyMonthly = yearlyPrice / 12
  const savings = ((monthlyPrice - yearlyMonthly) / monthlyPrice) * 100
  return Math.round(savings)
}

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
export type AddonFeature = keyof typeof ADDON_FEATURES

