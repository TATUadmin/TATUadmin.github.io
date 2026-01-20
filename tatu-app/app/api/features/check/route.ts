import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-middleware'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { FeatureGate } from '@/lib/feature-gates'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const checkFeatureSchema = z.object({
  feature: z.enum([
    'portfolioUpload',
    'analytics',
    'videoConsultations',
    'socialMediaIntegration',
    'advancedScheduling',
    'clientManagement',
    'customBranding',
    'multipleArtists',
  ]),
})

/**
 * Check if user has access to a specific feature
 * GET /api/features/check?feature=analytics
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Get feature from query params
  const { searchParams } = new URL(request.url)
  const feature = searchParams.get('feature')

  const validationResult = checkFeatureSchema.safeParse({ feature })

  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  // Get user's subscription context (artists only have subscriptions)
  const profile = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      portfolioImageCount: true,
      featuredListingActive: true,
    }
  })

  if (!profile) {
    return ApiResponse.error('Artist profile not found. Features are only available for artists.', 404, { requestId })
  }

  const context = {
    tier: profile.subscriptionTier,
    status: profile.subscriptionStatus,
    portfolioImageCount: profile.portfolioImageCount,
    featuredListingActive: profile.featuredListingActive,
  }

  // Check feature access
  let result
  switch (validationResult.data.feature) {
    case 'portfolioUpload':
      result = FeatureGate.canUploadPortfolioImage(context)
      break
    case 'analytics':
      result = FeatureGate.canAccessAnalytics(context)
      break
    case 'videoConsultations':
      result = FeatureGate.canUseVideoConsultations(context)
      break
    case 'socialMediaIntegration':
      result = FeatureGate.canUseSocialMediaIntegration(context)
      break
    case 'advancedScheduling':
      result = FeatureGate.canUseAdvancedScheduling(context)
      break
    case 'clientManagement':
      result = FeatureGate.canUseClientManagement(context)
      break
    case 'customBranding':
      result = FeatureGate.canUseCustomBranding(context)
      break
    case 'multipleArtists':
      result = FeatureGate.canManageMultipleArtists(context)
      break
  }

  return NextResponse.json({
    success: true,
    feature: validationResult.data.feature,
    ...result,
    requestId,
  })
})

/**
 * Get all feature access for current user
 * POST /api/features/check
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Get user's subscription context (artists only have subscriptions)
  const profile = await prisma.artistProfile.findUnique({
    where: { userId: user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      portfolioImageCount: true,
      featuredListingActive: true,
    }
  })

  if (!profile) {
    return ApiResponse.error('Artist profile not found. Features are only available for artists.', 404, { requestId })
  }

  const context = {
    tier: profile.subscriptionTier,
    status: profile.subscriptionStatus,
    portfolioImageCount: profile.portfolioImageCount,
    featuredListingActive: profile.featuredListingActive,
  }

  // Get all features
  const features = FeatureGate.getAllFeatures(context)

  return NextResponse.json({
    success: true,
    tier: profile.subscriptionTier,
    status: profile.subscriptionStatus,
    features,
    requestId,
  })
})

