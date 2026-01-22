import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { optionalAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const prisma = new PrismaClient()

// Fallback mock data for when database is unavailable
const mockArtists = [
  {
    id: "mock-1",
    name: "RAZOR MARTINEZ",
    bio: "Traditional American tattoo master with 15+ years experience. Specializing in bold linework and classic designs.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "Los Angeles, CA",
    specialties: ["Traditional", "American Traditional", "Bold Lines"],
    instagram: "@razor_ink",
    portfolioCount: 247,
    rating: 4.9,
    reviewCount: 89,
    featured: true
  },
  {
    id: "mock-2", 
    name: "INK GODDESS",
    bio: "Realism specialist creating photorealistic portraits and nature scenes. Award-winning artist featured in Tattoo Magazine.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "New York, NY",
    specialties: ["Realism", "Portraits", "Black & Grey"],
    instagram: "@ink_goddess",
    portfolioCount: 156,
    rating: 4.8,
    reviewCount: 67,
    featured: true
  },
  {
    id: "mock-3",
    name: "STEEL BONES",
    bio: "Blackwork and geometric tattoo artist. Minimalist designs with maximum impact. Clean lines, bold statements.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    location: "Tokyo, Japan",
    specialties: ["Blackwork", "Geometric", "Minimalist"],
    instagram: "@steel_bones",
    portfolioCount: 198,
    rating: 4.7,
    reviewCount: 45,
    featured: false
  },
  {
    id: "mock-4",
    name: "WATERCOLOR WIZARD",
    bio: "Watercolor tattoo specialist creating vibrant, flowing designs that look like paintings on skin.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "Portland, OR",
    specialties: ["Watercolor", "Color", "Abstract"],
    instagram: "@watercolor_wizard",
    portfolioCount: 134,
    rating: 4.6,
    reviewCount: 38,
    featured: false
  },
  {
    id: "mock-5",
    name: "JAPANESE MASTER",
    bio: "Traditional Japanese tattoo artist specializing in Irezumi and modern interpretations of classic designs.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    location: "San Francisco, CA",
    specialties: ["Japanese", "Irezumi", "Traditional"],
    instagram: "@japanese_master",
    portfolioCount: 189,
    rating: 4.9,
    reviewCount: 72,
    featured: true
  },
  {
    id: "mock-6",
    name: "MINIMALIST MUSE",
    bio: "Minimalist tattoo artist creating delicate, meaningful designs with clean lines and subtle beauty.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    location: "Austin, TX",
    specialties: ["Minimalist", "Fine Line", "Delicate"],
    instagram: "@minimalist_muse",
    portfolioCount: 167,
    rating: 4.7,
    reviewCount: 53,
    featured: false
  }
]

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.search.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Optional authentication
  const authContext = await optionalAuth(request)
  const { searchParams } = new URL(request.url)
  
  // Validate search parameters
  const searchValidation = ValidationSchemas.Search.artists.safeParse({
    query: searchParams.get('q') || '',
    location: searchParams.get('location') || '',
    style: searchParams.get('style') || '',
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: parseInt(searchParams.get('offset') || '0'),
    sortBy: searchParams.get('sort') || 'rating',
    sortOrder: 'desc'
  })

  if (!searchValidation.success) {
    return ApiResponse.validationError(searchValidation.error.errors, { requestId: authContext?.requestId })
  }

  const {
    query,
    location,
    style,
    minPrice,
    maxPrice,
    rating,
    limit,
    offset,
    sortBy,
    sortOrder
  } = searchValidation.data

  // Generate cache key
  const cacheKey = CacheKeyGenerators.search('artists', {
    query,
    location,
    style,
    minPrice,
    maxPrice,
    rating,
    limit,
    offset,
    sortBy,
    sortOrder
  })

  // Try to get from cache
  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId: authContext?.requestId })
    }
  }

  try {
    // Build where conditions
    const whereConditions: any = {
      role: 'ARTIST',
      status: 'ACTIVE',
      artistProfile: {
        completedRegistration: true
      }
    }

    // Text search across name and bio
    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { artistProfile: { bio: { contains: query, mode: 'insensitive' } } }
      ]
    }

    // Location filter
    if (location) {
      whereConditions.artistProfile = {
        ...whereConditions.artistProfile,
        location: { contains: location, mode: 'insensitive' }
      }
    }

    // Style/specialty filter
    if (style) {
      whereConditions.artistProfile = {
        ...whereConditions.artistProfile,
        specialties: { has: style }
      }
    }

    // Note: hourlyRate and experience are not in ArtistProfile schema
    // These filters would need to be added to the schema if needed

    // Rating filter
    if (rating !== undefined) {
      whereConditions.reviews = {
        some: {
          rating: { gte: rating }
        }
      }
    }

    // Determine sort order
    let orderBy: any = []
    switch (sortBy) {
      case 'rating':
        orderBy = [{ reviews: { _count: 'desc' } }]
        break
      case 'reviews':
        orderBy = [{ reviews: { _count: 'desc' } }]
        break
      case 'portfolio':
        orderBy = [{ portfolioItems: { _count: 'desc' } }]
        break
      case 'price':
        // Note: hourlyRate not in ArtistProfile schema - would need to add if needed
        orderBy = [{ createdAt: 'desc' }]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      default:
        orderBy = [{ createdAt: 'desc' }]
    }

    const [artists, total] = await Promise.all([
      prisma.user.findMany({
        where: whereConditions,
        include: {
          artistProfile: true,
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
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.user.count({ where: whereConditions })
    ])

    // Transform data for frontend
    const transformedArtists = artists.map(artist => {
      const ratings = artist.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0

      return {
        id: artist.id,
        name: artist.name || 'Unknown Artist',
        bio: artist.artistProfile?.bio || '',
        avatar: artist.artistProfile?.avatar || '',
        location: artist.artistProfile?.location || '',
        specialties: artist.artistProfile?.specialties || [],
        instagram: artist.artistProfile?.instagram || '',
        website: artist.artistProfile?.website || '',
        portfolioCount: artist._count.portfolioItems,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: artist._count.reviews,
        hourlyRate: 0, // Not in ArtistProfile schema - would need to add if needed
        experience: 0, // Not in ArtistProfile schema - would need to add if needed
        verified: false, // Not in ArtistProfile schema - would need to add if needed
        featured: artist.artistProfile?.featuredListingActive || false,
        shop: artist.shop,
        recentWork: artist.portfolioItems
      }
    })

    const result = {
      artists: transformedArtists,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0
      }
    }

    // Cache the result
    if (cacheService) {
      await cacheService.set(cacheKey, result, 300, [CacheTags.ARTIST, CacheTags.SEARCH]) // 5 minutes
    }

    // Log search event
    logger.logBusinessEvent('artist_search', {
      query,
      location,
      style,
      results: transformedArtists.length,
      userId: authContext?.user.id
    }, request)

    return ApiResponse.paginated(transformedArtists, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total
    }, { requestId: authContext?.requestId })

  } catch (error) {
    logger.error('Database error, returning mock data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      query,
      location,
      style
    })
    
    // Return mock data when database is unavailable
    let filteredMockData = [...mockArtists]
    
    if (query) {
      filteredMockData = filteredMockData.filter(artist => 
        artist.name.toLowerCase().includes(query.toLowerCase()) ||
        artist.bio.toLowerCase().includes(query.toLowerCase())
      )
    }
    
    if (location) {
      filteredMockData = filteredMockData.filter(artist =>
        artist.location.toLowerCase().includes(location.toLowerCase())
      )
    }
    
    if (style) {
      filteredMockData = filteredMockData.filter(artist =>
        artist.specialties.some(specialty => 
          specialty.toLowerCase().includes(style.toLowerCase())
        )
      )
    }

    // Apply pagination to mock data
    const paginatedData = filteredMockData.slice(offset, offset + limit)
    
    return ApiResponse.paginated(paginatedData, {
      page: Math.floor(offset / limit) + 1,
      limit,
      total: filteredMockData.length
    }, { requestId: authContext?.requestId })
  }
}) 