import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService, CacheTags, CacheKeyGenerators } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export const GET = withErrorHandling(async (request: NextRequest) => {
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  const authContext = await requireAuth(request)
  const { searchParams } = new URL(request.url)

  const artistId = searchParams.get('artistId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const sortBy = searchParams.get('sortBy') || 'recent'

  const cacheKey = CacheKeyGenerators.search('reviews', {
    artistId,
    page,
    limit,
    sortBy,
  })

  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId: authContext.requestId })
    }
  }

  const where: any = {}
  if (artistId) {
    where.artistId = artistId
  }

  let orderBy: any = { createdAt: 'desc' }
  if (sortBy === 'rating') {
    orderBy = { rating: 'desc' }
  } else if (sortBy === 'helpful') {
    orderBy = { helpfulCount: 'desc' }
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            customerProfile: { select: { avatar: true } },
          },
        },
        artist: {
          select: {
            id: true,
            name: true,
            artistProfile: { select: { avatar: true } },
          },
        },
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.review.count({ where }),
  ])

  const transformedReviews = reviews.map((review) => ({
    id: review.id,
    userId: review.clientId,
    userName: review.client.name || 'Anonymous',
    userAvatar: review.client.customerProfile?.avatar || '',
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    wouldRecommend: review.wouldRecommend,
    categories: review.categories || undefined,
    helpful: review.helpfulCount,
    notHelpful: review.notHelpfulCount,
    createdAt: review.createdAt.toISOString(),
    verified: Boolean(review.appointmentId),
    response: review.responseText
      ? {
          text: review.responseText,
          createdAt: review.responseCreatedAt?.toISOString() || review.updatedAt.toISOString(),
        }
      : undefined,
  }))

  const result = {
    reviews: transformedReviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }

  if (cacheService) {
    await cacheService.set(cacheKey, result, 300, [CacheTags.REVIEW, CacheTags.ARTIST])
  }

  return ApiResponse.paginated(transformedReviews, { page, limit, total }, { requestId: authContext.requestId })
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  const authContext = await requireAuth(request)
  const { user, requestId } = authContext
  const body = await request.json()

  const validationResult = ValidationSchemas.review(body)
  if (!validationResult.isValid) {
    return ApiResponse.validationError(validationResult.errors, { requestId })
  }

  const {
    artistId,
    appointmentId,
    rating,
    title,
    comment,
    wouldRecommend = true,
    categories,
    images,
  } = body

  if (!artistId) {
    return ApiResponse.validationError({ artistId: 'Artist is required' }, { requestId })
  }

  const artist = await prisma.user.findFirst({
    where: { id: artistId, role: 'ARTIST' },
    select: { id: true },
  })

  if (!artist) {
    return ApiResponse.notFound('Artist', { requestId })
  }

  if (appointmentId) {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        clientId: user.id,
        artistId: artistId,
        status: 'COMPLETED',
      },
      select: { id: true },
    })

    if (!appointment) {
      return ApiResponse.notFound('Appointment', { requestId })
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        appointmentId,
        clientId: user.id,
      },
      select: { id: true },
    })

    if (existingReview) {
      return ApiResponse.conflict('Review already exists for this appointment', { existingReviewId: existingReview.id }, { requestId })
    }
  }

  const existingArtistReview = await prisma.review.findFirst({
    where: {
      artistId,
      clientId: user.id,
      appointmentId: null,
    },
    select: { id: true },
  })

  if (existingArtistReview && !appointmentId) {
    return ApiResponse.conflict('You have already reviewed this artist', { existingReviewId: existingArtistReview.id }, { requestId })
  }

  const review = await prisma.review.create({
    data: {
      artistId,
      clientId: user.id,
      appointmentId: appointmentId || null,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      wouldRecommend: Boolean(wouldRecommend),
      categories: categories || undefined,
      images: Array.isArray(images) ? images : [],
      status: 'PUBLISHED',
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          customerProfile: { select: { avatar: true } },
        },
      },
      artist: {
        select: {
          id: true,
          name: true,
          artistProfile: { select: { avatar: true } },
        },
      },
    },
  })

  if (cacheService) {
    await cacheService.invalidateByTags([CacheTags.REVIEW, CacheTags.ARTIST])
  }

  logger.logBusinessEvent(
    'review_created',
    {
      reviewId: review.id,
      artistId: review.artistId,
      clientId: review.clientId,
      rating: review.rating,
      appointmentId: review.appointmentId,
    },
    request
  )

  return ApiResponse.success(
    {
      id: review.id,
      userId: review.clientId,
      userName: review.client.name || 'Anonymous',
      userAvatar: review.client.customerProfile?.avatar || '',
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      wouldRecommend: review.wouldRecommend,
      categories: review.categories || undefined,
      helpful: review.helpfulCount,
      notHelpful: review.notHelpfulCount,
      createdAt: review.createdAt.toISOString(),
      verified: Boolean(review.appointmentId),
    },
    201,
    { requestId }
  )
})
