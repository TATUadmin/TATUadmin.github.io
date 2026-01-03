/**
 * Feature Gating System
 * Controls access to features based on subscription tier
 */

import { SubscriptionTier, SubscriptionStatus } from '@prisma/client'
import { SUBSCRIPTION_TIERS, getPortfolioLimit } from '@/lib/subscription-config'

export interface FeatureGateContext {
  tier: SubscriptionTier
  status: SubscriptionStatus
  portfolioImageCount?: number
  featuredListingActive?: boolean
}

export class FeatureGate {
  /**
   * Check if user can upload more portfolio images
   */
  static canUploadPortfolioImage(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
    limit?: number
    current?: number
  } {
    // Check subscription status
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active. Please update your payment method.',
      }
    }

    const limit = getPortfolioLimit(context.tier)
    const current = context.portfolioImageCount || 0

    if (limit === Infinity) {
      return { allowed: true }
    }

    if (current >= limit) {
      return {
        allowed: false,
        reason: `You've reached your portfolio limit of ${limit} images. Upgrade to Pro for unlimited images.`,
        limit,
        current,
      }
    }

    return { allowed: true, limit, current }
  }

  /**
   * Check if user can access analytics
   */
  static canAccessAnalytics(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.analytics

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Analytics is available on Pro and Studio plans. Upgrade to see detailed insights.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can start a video consultation
   */
  static canUseVideoConsultations(context: FeatureGateContext & { monthlyVideoCallsUsed?: number }): {
    allowed: boolean
    reason?: string
    limit?: number
    used?: number
    remaining?: number
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.videoConsultations

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Video consultations require a subscription.',
      }
    }

    // Check monthly limit
    const limit = SUBSCRIPTION_TIERS[context.tier]?.features.videoConsultationsLimit || 0
    const used = context.monthlyVideoCallsUsed || 0

    // Unlimited calls
    if (limit === -1) {
      return { allowed: true }
    }

    // Check if limit reached
    if (used >= limit) {
      return {
        allowed: false,
        reason: `You've reached your limit of ${limit} video consultations this month. Upgrade to Pro for unlimited consultations.`,
        limit,
        used,
        remaining: 0,
      }
    }

    return { 
      allowed: true,
      limit,
      used,
      remaining: limit - used,
    }
  }

  /**
   * Check if user can use social media integration
   */
  static canUseSocialMediaIntegration(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.socialMediaIntegration

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Social media integration is available on Pro and Studio plans.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can use advanced scheduling
   */
  static canUseAdvancedScheduling(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.advancedScheduling

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Advanced scheduling is available on Pro and Studio plans.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can use client management tools
   */
  static canUseClientManagement(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.clientManagementTools

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Client management tools are available on Pro and Studio plans.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can use custom branding
   */
  static canUseCustomBranding(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.customBranding

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Custom branding is available on Studio plan.',
      }
    }

    return { allowed: true }
  }

  /**
   * Check if user can manage multiple artists
   */
  static canManageMultipleArtists(context: FeatureGateContext): {
    allowed: boolean
    reason?: string
  } {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return {
        allowed: false,
        reason: 'Your subscription is not active.',
      }
    }

    const hasAccess = SUBSCRIPTION_TIERS[context.tier]?.features.multipleArtists

    if (!hasAccess) {
      return {
        allowed: false,
        reason: 'Multiple artist accounts are available on Studio plan.',
      }
    }

    return { allowed: true }
  }

  /**
   * Get search ranking boost multiplier
   */
  static getSearchRankingBoost(context: FeatureGateContext): number {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return 1.0 // No boost if subscription not active
    }

    const ranking = SUBSCRIPTION_TIERS[context.tier]?.features.searchRanking

    switch (ranking) {
      case 'premium':
        return 3.0 // Studio tier gets 3x boost
      case 'boosted':
        return 2.0 // Pro tier gets 2x boost
      case 'standard':
      default:
        return 1.0 // Free tier gets no boost
    }
  }

  /**
   * Check if featured listing is active
   */
  static hasFeaturedListing(context: FeatureGateContext): boolean {
    return context.featuredListingActive === true
  }

  /**
   * Get video consultation quality for tier
   */
  static getVideoQuality(tier: SubscriptionTier): string {
    return SUBSCRIPTION_TIERS[tier]?.features.videoQuality || '480p'
  }

  /**
   * Check if user can record video consultations
   */
  static canRecordVideoConsultations(context: FeatureGateContext): boolean {
    if (context.status !== 'ACTIVE' && context.status !== 'TRIAL') {
      return false
    }
    return SUBSCRIPTION_TIERS[context.tier]?.features.videoRecording === true
  }

  /**
   * Get all feature access for a user
   */
  static getAllFeatures(context: FeatureGateContext & { monthlyVideoCallsUsed?: number }) {
    return {
      portfolioUpload: this.canUploadPortfolioImage(context),
      analytics: this.canAccessAnalytics(context),
      videoConsultations: this.canUseVideoConsultations(context),
      videoQuality: this.getVideoQuality(context.tier),
      videoRecording: this.canRecordVideoConsultations(context),
      socialMediaIntegration: this.canUseSocialMediaIntegration(context),
      advancedScheduling: this.canUseAdvancedScheduling(context),
      clientManagement: this.canUseClientManagement(context),
      customBranding: this.canUseCustomBranding(context),
      multipleArtists: this.canManageMultipleArtists(context),
      searchRankingBoost: this.getSearchRankingBoost(context),
      featuredListing: this.hasFeaturedListing(context),
    }
  }
}

/**
 * Middleware helper to check feature access
 */
export async function requireFeature(
  userId: string,
  featureCheck: (context: FeatureGateContext) => { allowed: boolean; reason?: string }
): Promise<{ allowed: boolean; reason?: string }> {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        portfolioImageCount: true,
        featuredListingActive: true,
      }
    })

    if (!profile) {
      return {
        allowed: false,
        reason: 'Profile not found',
      }
    }

    const context: FeatureGateContext = {
      tier: profile.subscriptionTier,
      status: profile.subscriptionStatus,
      portfolioImageCount: profile.portfolioImageCount,
      featuredListingActive: profile.featuredListingActive,
    }

    return featureCheck(context)
  } finally {
    await prisma.$disconnect()
  }
}

