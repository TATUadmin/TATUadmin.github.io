import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { optionalAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

const prisma = new PrismaClient()

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.search.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Optional authentication
  const authContext = await optionalAuth(request)
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get('type') || 'all'
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const style = searchParams.get('style') || ''
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Validate search parameters
  const searchValidation = ValidationSchemas.Search.artists.safeParse({
    query,
    location,
    style,
    limit,
    offset,
    sortBy: 'relevance',
    sortOrder: 'desc'
  })

  if (!searchValidation.success) {
    return ApiResponse.validationError(searchValidation.error.errors, { requestId: authContext?.requestId })
  }

  // Generate cache key
  const cacheKey = CacheKeyGenerators.search('search', {
    type,
    query,
    location,
    style,
    limit,
    offset
  })

  // Try to get from cache
  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId: authContext?.requestId })
    }
  }

  try {
    const results: any = {
      artists: [],
      portfolio: [],
      shops: [],
      total: 0
    }

    // Search artists
    if (type === 'all' || type === 'artists') {
      const artistWhere: any = {
        role: 'ARTIST',
        status: 'ACTIVE',
        profile: {
          completedRegistration: true,
          verified: true
        }
      }

      if (query) {
        artistWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { profile: { bio: { contains: query, mode: 'insensitive' } } }
        ]
      }

      if (location) {
        artistWhere.profile = {
          ...artistWhere.profile,
          location: { contains: location, mode: 'insensitive' }
        }
      }

      if (style) {
        artistWhere.profile = {
          ...artistWhere.profile,
          specialties: { has: style }
        }
      }

      const [artists, artistTotal] = await Promise.all([
        prisma.user.findMany({
          where: artistWhere,
          include: {
            profile: {
              select: {
                bio: true,
                avatar: true,
                location: true,
                specialties: true,
                instagram: true,
                website: true,
                hourlyRate: true,
                experience: true,
                verified: true
              }
            },
            shop: {
              select: {
                id: true,
                name: true,
                address: true,
                verified: true
              }
            },
            portfolioItems: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                title: true,
                images: true,
                style: true
              }
            },
            reviews: {
              select: { rating: true }
            },
            _count: {
              select: {
                portfolioItems: true,
                reviews: true
              }
            }
          },
          take: limit,
          skip: offset
        }),
        prisma.user.count({ where: artistWhere })
      ])

      results.artists = artists.map(artist => {
        const ratings = artist.reviews.map(r => r.rating)
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0

        return {
          id: artist.id,
          name: artist.name || 'Unknown Artist',
          bio: artist.profile?.bio || '',
          avatar: artist.profile?.avatar || '',
          location: artist.profile?.location || '',
          specialties: artist.profile?.specialties || [],
          instagram: artist.profile?.instagram || '',
          website: artist.profile?.website || '',
          portfolioCount: artist._count.portfolioItems,
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: artist._count.reviews,
          hourlyRate: artist.profile?.hourlyRate || 0,
          experience: artist.profile?.experience || 0,
          verified: artist.profile?.verified || false,
          shop: artist.shop,
          recentWork: artist.portfolioItems
        }
      })

      results.total += artistTotal
    }

    // Search portfolio items
    if (type === 'all' || type === 'portfolio') {
      const portfolioWhere: any = {
        isPublic: true
      }

      if (query) {
        portfolioWhere.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ]
      }

      if (style) {
        portfolioWhere.style = style
      }

      if (location) {
        portfolioWhere.user = {
          profile: {
            location: { contains: location, mode: 'insensitive' }
          }
        }
      }

      const [portfolioItems, portfolioTotal] = await Promise.all([
        prisma.portfolioItem.findMany({
          where: portfolioWhere,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatar: true,
                    location: true,
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
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.portfolioItem.count({ where: portfolioWhere })
      ])

      results.portfolio = portfolioItems.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        images: item.images,
        style: item.style,
        size: item.size,
        placement: item.placement,
        duration: item.duration,
        price: item.price,
        tags: item.tags,
        createdAt: item.createdAt,
        artist: {
          id: item.user.id,
          name: item.user.name || 'Unknown Artist',
          avatar: item.user.profile?.avatar || '',
          location: item.user.profile?.location || '',
          specialties: item.user.profile?.specialties || []
        },
        stats: {
          likes: item._count.likes,
          comments: item._count.comments,
          shares: item._count.shares
        }
      }))

      results.total += portfolioTotal
    }

    // Search shops
    if (type === 'all' || type === 'shops') {
      const shopWhere: any = {
        verified: true
      }

      if (query) {
        shopWhere.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      }

      if (location) {
        shopWhere.address = { contains: location, mode: 'insensitive' }
      }

      const [shops, shopTotal] = await Promise.all([
        prisma.shop.findMany({
          where: shopWhere,
          include: {
            artists: {
              take: 3,
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
                artists: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.shop.count({ where: shopWhere })
      ])

      results.shops = shops.map(shop => ({
        id: shop.id,
        name: shop.name,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        website: shop.website,
        verified: shop.verified,
        artistCount: shop._count.artists,
        featuredArtists: shop.artists
      }))

      results.total += shopTotal
    }

    // Cache the result
    if (cacheService) {
      await cacheService.set(cacheKey, results, 300, [CacheTags.SEARCH]) // 5 minutes
    }

    // Log search event
    logger.logBusinessEvent('search', {
      type,
      query,
      location,
      style,
      results: results.total,
      userId: authContext?.user.id
    }, request)

    return ApiResponse.success(results, 200, { requestId: authContext?.requestId })

  } catch (error) {
    logger.error('Search error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      type,
      query,
      location,
      style
    })

    return ApiResponse.internalError(
      'Search failed',
      process.env.NODE_ENV === 'development' ? error : undefined,
      { requestId: authContext?.requestId }
    )
  }
})
