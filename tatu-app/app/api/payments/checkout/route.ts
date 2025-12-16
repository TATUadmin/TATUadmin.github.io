import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

const prisma = new PrismaClient()

export const POST = withErrorHandling(async (request: NextRequest) => {
  // This endpoint is deprecated - redirect to new payment system
  return ApiResponse.gone(
    'This payment endpoint is deprecated. Please use the new payment system: /api/payments/hold for appointment holds, /api/payments/visibility-boost for artist visibility, and /api/payments/donation for donations.',
    { 
      newEndpoints: {
        appointmentHold: '/api/payments/hold',
        visibilityBoost: '/api/payments/visibility-boost', 
        donation: '/api/payments/donation'
      }
    },
    { requestId: 'deprecated' }
  )
}) 