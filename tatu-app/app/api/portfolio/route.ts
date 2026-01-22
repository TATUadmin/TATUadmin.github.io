import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireArtistProfile, optionalAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Optional authentication (for public portfolio viewing)
  const authContext = await optionalAuth(request)
  const { searchParams } = new URL(request.url)
  
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const artistId = searchParams.get('artistId')
  const style = searchParams.get('style')
  const isPublic = searchParams.get('public') === 'true'

  // Generate cache key
  const cacheKey = CacheKeyGenerators.portfolio('portfolio', {
    page,
    limit,
    artistId,
    style,
    isPublic,
    userId: authContext?.user.id
  })

  // Try to get from cache
  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId: authContext?.requestId })
    }
  }

  // Build where clause
  const where: any = {}
  
  if (artistId) {
    where.userId = artistId
  } else if (authContext?.user) {
    where.userId = authContext.user.id
  }

  if (style) {
    where.style = style
  }

  if (isPublic) {
    where.isPublic = true
  }

  // Get portfolio items
  const [portfolioItems, total] = await Promise.all([
    prisma.portfolioItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        images: true,
        style: true,
        size: true,
        placement: true,
        duration: true,
        price: true,
        isPublic: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            artistProfile: {
              select: {
                avatar: true,
                specialties: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true
          }
        }
      }
    }),
    prisma.portfolioItem.count({ where })
  ])

  const result = {
    items: portfolioItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  }

  // Cache the result
  if (cacheService) {
    await cacheService.set(cacheKey, result, 300, [CacheTags.PORTFOLIO]) // 5 minutes
  }

  return ApiResponse.paginated(portfolioItems, {
    page,
    limit,
    total
  }, { requestId: authContext?.requestId })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.upload.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication (require artist profile)
  const authContext = await requireArtistProfile(request)
  const { user, requestId } = authContext

  // Validate request data
  const body = await request.json()
  const validationResult = ValidationSchemas.Portfolio.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const {
    title,
    description,
    images,
    style,
    size,
    placement,
    duration,
    price,
    isPublic,
    tags,
    collectionId
  } = validationResult.data

  // Create portfolio item
  const portfolioItem = await prisma.portfolioItem.create({
    data: {
      title,
      description,
      images,
      style,
      size,
      placement,
      duration,
      price,
      isPublic: isPublic ?? true,
      tags,
      userId: user.id,
      collectionId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true,
              specialties: true
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
          shares: true
        }
      }
    }
  })

  // Invalidate cache
  if (cacheService) {
    await cacheService.invalidateByTags([CacheTags.PORTFOLIO, CacheTags.USER])
  }

  // Log business event
  logger.logBusinessEvent('portfolio_item_created', {
    portfolioItemId: portfolioItem.id,
    userId: user.id,
    style: portfolioItem.style,
    isPublic: portfolioItem.isPublic
  }, request)

  return ApiResponse.success(portfolioItem, 201, { requestId })
}) 