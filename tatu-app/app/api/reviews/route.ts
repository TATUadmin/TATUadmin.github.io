import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'
import { addReviewRequestJob } from '@/lib/background-jobs'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Optional authentication
  const authContext = await requireAuth(request)
  const { searchParams } = new URL(request.url)
  
  const artistId = searchParams.get('artistId')
  const appointmentId = searchParams.get('appointmentId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sortBy = searchParams.get('sortBy') || 'recent'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Generate cache key
  const cacheKey = CacheKeyGenerators.search('reviews', {
    artistId,
    appointmentId,
    page,
    limit,
    sortBy,
    sortOrder
  })

  // Try to get from cache
  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId: authContext.requestId })
    }
  }

  // Build where conditions
  const where: any = {}
  
  if (artistId) {
    where.artistId = artistId
  }
  
  if (appointmentId) {
    where.appointmentId = appointmentId
  }

  // Determine sort order
  let orderBy: any = []
  switch (sortBy) {
    case 'recent':
      orderBy = [{ createdAt: sortOrder === 'asc' ? 'asc' : 'desc' }]
      break
    case 'rating':
      orderBy = [{ rating: sortOrder === 'asc' ? 'asc' : 'desc' }]
      break
    case 'helpful':
      orderBy = [{ helpfulCount: sortOrder === 'asc' ? 'asc' : 'desc' }]
      break
    default:
      orderBy = [{ createdAt: 'desc' }]
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatar: true
              }
            }
          }
        },
        artist: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                avatar: true
              }
            }
          }
        },
        appointment: {
          select: {
            id: true,
            serviceType: true,
            preferredDate: true
          }
        },
        _count: {
          select: {
            helpfulVotes: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit
    }),
    prisma.review.count({ where })
  ])

  const transformedReviews = reviews.map(review => ({
    id: review.id,
    rating: review.rating,
    content: review.content,
    images: review.images || [],
    categories: review.categories || {},
    helpfulCount: review._count.helpfulVotes,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    client: {
      id: review.client.id,
      name: review.client.name || 'Anonymous',
      avatar: review.client.profile?.avatar || ''
    },
    artist: {
      id: review.artist.id,
      name: review.artist.name || 'Unknown Artist',
      avatar: review.artist.profile?.avatar || ''
    },
    appointment: review.appointment ? {
      id: review.appointment.id,
      serviceType: review.appointment.serviceType,
      date: review.appointment.preferredDate
    } : null
  }))

  const result = {
    reviews: transformedReviews,
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
    await cacheService.set(cacheKey, result, 300, [CacheTags.REVIEW, CacheTags.ARTIST]) // 5 minutes
  }

  return ApiResponse.paginated(transformedReviews, {
    page,
    limit,
    total
  }, { requestId: authContext.requestId })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Validate request data
  const body = await request.json()
  const validationResult = ValidationSchemas.Review.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const {
    artistId,
    appointmentId,
    rating,
    content,
    images,
    categories
  } = validationResult.data

  // Verify artist exists
  const artist = await prisma.user.findUnique({
    where: { 
      id: artistId,
      role: 'ARTIST'
    },
    include: {
      profile: true
    }
  })

  if (!artist) {
    return ApiResponse.notFound('Artist', { requestId })
  }

  // Check if appointment exists and belongs to user
  if (appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clientId: user.id,
        artistId: artistId,
        status: 'COMPLETED'
      }
    })

    if (!appointment) {
      return ApiResponse.notFound('Appointment', { requestId })
    }

    // Check if review already exists for this appointment
    const existingReview = await prisma.review.findFirst({
      where: {
        appointmentId: appointmentId,
        clientId: user.id
      }
    })

    if (existingReview) {
      return ApiResponse.conflict(
        'Review already exists for this appointment',
        { existingReviewId: existingReview.id },
        { requestId }
      )
    }
  }

  // Check if user has already reviewed this artist
  const existingArtistReview = await prisma.review.findFirst({
    where: {
      artistId: artistId,
      clientId: user.id,
      appointmentId: null // Only check for general reviews
    }
  })

  if (existingArtistReview && !appointmentId) {
    return ApiResponse.conflict(
      'You have already reviewed this artist',
      { existingReviewId: existingArtistReview.id },
      { requestId }
    )
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      artistId,
      clientId: user.id,
      appointmentId: appointmentId || null,
      rating,
      content,
      images: images || [],
      categories: categories || {},
      status: 'PUBLISHED'
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      },
      artist: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      },
      appointment: {
        select: {
          id: true,
          serviceType: true,
          preferredDate: true
        }
      }
    }
  })

  // Update artist's average rating
  const artistReviews = await prisma.review.findMany({
    where: { artistId },
    select: { rating: true }
  })

  const averageRating = artistReviews.reduce((sum, r) => sum + r.rating, 0) / artistReviews.length

  await prisma.user.update({
    where: { id: artistId },
    data: {
      profile: {
        update: {
          averageRating: Math.round(averageRating * 10) / 10
        }
      }
    }
  })

  // Invalidate cache
  if (cacheService) {
    await cacheService.invalidateByTags([CacheTags.REVIEW, CacheTags.ARTIST])
  }

  // Log business event
  logger.logBusinessEvent('review_created', {
    reviewId: review.id,
    artistId: review.artistId,
    clientId: review.clientId,
    rating: review.rating,
    appointmentId: review.appointmentId
  }, request)

  // Schedule review request for other clients (if this was from an appointment)
  if (appointmentId) {
    // Find other completed appointments for this artist that don't have reviews
    const otherAppointments = await prisma.appointment.findMany({
      where: {
        artistId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        },
        reviews: {
          none: {}
        }
      },
      take: 5,
      select: { id: true }
    })

    // Schedule review request jobs for these appointments
    for (const appointment of otherAppointments) {
      await addReviewRequestJob(appointment.id, 7 * 24 * 60 * 60 * 1000) // 7 days delay
    }
  }

  return ApiResponse.success({
    id: review.id,
    rating: review.rating,
    content: review.content,
    images: review.images,
    categories: review.categories,
    createdAt: review.createdAt,
    client: {
      id: review.client.id,
      name: review.client.name || 'Anonymous',
      avatar: review.client.profile?.avatar || ''
    },
    artist: {
      id: review.artist.id,
      name: review.artist.name || 'Unknown Artist',
      avatar: review.artist.profile?.avatar || ''
    },
    appointment: review.appointment ? {
      id: review.appointment.id,
      serviceType: review.appointment.serviceType,
      date: review.appointment.preferredDate
    } : null
  }, 201, { requestId })
})
