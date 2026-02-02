import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { optionalAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'

export const dynamic = 'force-dynamic'

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
    // Only show artists who have completed registration AND have set their location
    // This ensures only artists with location data appear in search results and on the map
    const artistProfileConditions: any = {
      completedRegistration: true,
      latitude: { not: null },
      longitude: { not: null }
    }

    // Location filter
    if (location) {
      artistProfileConditions.location = { contains: location, mode: 'insensitive' }
    }

    // Style/specialty filter
    if (style) {
      artistProfileConditions.specialties = { has: style }
    }

    // Build where conditions
    // Base conditions: role and artistProfile requirements
    const whereConditions: any = {
      role: 'ARTIST',
      artistProfile: artistProfileConditions
    }

    // Text search across name and bio
    // When query exists, add search condition using AND to combine with base filters
    if (query && query.trim()) {
      const searchQuery = query.trim()
      // Include all artistProfile conditions (including location/style filters) in the bio search branch
      whereConditions.AND = [
        {
          role: 'ARTIST',
          artistProfile: artistProfileConditions
        },
        {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { artistProfile: { 
              ...artistProfileConditions, // Include all filters (location, style, etc.)
              bio: { contains: searchQuery, mode: 'insensitive' } 
            } }
          ]
        }
      ]
      // Remove top-level conditions since they're now in AND
      delete whereConditions.role
      delete whereConditions.artistProfile
    }

    // Note: hourlyRate and experience are not in ArtistProfile schema
    // These filters would need to be added to the schema if needed

    // Rating filter
    if (rating !== undefined) {
      whereConditions.Review = {
        some: {
          rating: { gte: rating }
        }
      }
    }

    // Determine sort order
    // Note: Prisma doesn't support ordering by relation count directly
    // We'll fetch all and sort in memory for rating/reviews/portfolio
    let orderBy: any = []
    switch (sortBy) {
      case 'rating':
      case 'reviews':
      case 'portfolio':
        // Will sort in memory after fetching
        orderBy = [{ createdAt: 'desc' }]
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

    // Log the query for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('Querying artists with conditions:', JSON.stringify(whereConditions, null, 2))
    }
    
    let artists, total
    try {
      [artists, total] = await Promise.all([
        prisma.user.findMany({
          where: whereConditions,
          include: {
            artistProfile: true,
            Shop: {
              take: 1, // Get first shop if user has multiple
            },
            PortfolioItem: {
              take: 3,
              orderBy: { createdAt: 'desc' },
            },
            Review: {
              select: { rating: true }
            },
            _count: {
              select: {
                PortfolioItem: true,
                Review: true
              }
            }
          },
          orderBy,
          take: Math.min(limit, 1000), // Cap at 1000 to prevent timeout
          skip: offset
        }),
        prisma.user.count({ where: whereConditions })
      ])
      
      // Debug logging: Check for specific user (wrapped in try-catch to prevent errors)
      if (process.env.NODE_ENV === 'development') {
        try {
          const ppcrzart = artists.find(a => a.email === 'ppcrzart@gmail.com')
          if (ppcrzart) {
            console.log('✅ Found ppcrzart@gmail.com in results:', {
              id: ppcrzart.id,
              name: ppcrzart.name,
              email: ppcrzart.email,
              role: ppcrzart.role,
              completedRegistration: ppcrzart.artistProfile?.completedRegistration,
              latitude: ppcrzart.artistProfile?.latitude,
              longitude: ppcrzart.artistProfile?.longitude,
              location: ppcrzart.artistProfile?.location
            })
          } else {
            console.log('❌ ppcrzart@gmail.com NOT found in query results')
            // Check if user exists at all (only in development, wrapped in try-catch)
            try {
              const userCheck = await prisma.user.findUnique({
                where: { email: 'ppcrzart@gmail.com' },
                include: { artistProfile: true }
              })
              if (userCheck) {
                console.log('⚠️ User exists but not matching query:', {
                  role: userCheck.role,
                  completedRegistration: userCheck.artistProfile?.completedRegistration,
                  latitude: userCheck.artistProfile?.latitude,
                  longitude: userCheck.artistProfile?.longitude
                })
              } else {
                console.log('❌ User does not exist in database')
              }
            } catch (debugError) {
              // Silently fail debug logging
              console.log('Debug check failed (non-critical)')
            }
          }
        } catch (debugError) {
          // Silently fail debug logging to prevent breaking the API
          console.log('Debug logging failed (non-critical)')
        }
      }
    } catch (dbError: any) {
      console.error('Prisma query error:', dbError)
      console.error('Error details:', {
        message: dbError?.message,
        code: dbError?.code,
        meta: dbError?.meta,
        stack: dbError?.stack
      })
      throw dbError // Re-throw to be caught by outer catch block
    }

    // Transform data for frontend
    let transformedArtists = artists.map(artist => {
      const ratings = artist.Review?.map(r => r.rating) || []
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
        portfolioCount: artist._count.PortfolioItem || 0,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: artist._count.Review || 0,
        hourlyRate: 0, // Not in ArtistProfile schema - would need to add if needed
        experience: 0, // Not in ArtistProfile schema - would need to add if needed
        verified: false, // Not in ArtistProfile schema - would need to add if needed
        featured: artist.artistProfile?.featuredListingActive || false,
        shop: artist.Shop?.[0] || null, // Get first shop if multiple exist
        recentWork: artist.PortfolioItem || [],
        // Include location data for map display
        latitude: artist.artistProfile?.latitude || null,
        longitude: artist.artistProfile?.longitude || null,
        locationRadius: artist.artistProfile?.locationRadius || null
      }
    })

    // Sort in memory for rating/reviews/portfolio (Prisma doesn't support relation count ordering)
    if (sortBy === 'rating') {
      transformedArtists.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'reviews') {
      transformedArtists.sort((a, b) => b.reviewCount - a.reviewCount)
    } else if (sortBy === 'portfolio') {
      transformedArtists.sort((a, b) => b.portfolioCount - a.portfolioCount)
    }

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
    console.error('Database error in /api/artists:', error)
    logger.error('Database error, returning mock data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
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