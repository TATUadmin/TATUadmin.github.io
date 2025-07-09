import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || ''
    const style = searchParams.get('style') || ''
    const sort = searchParams.get('sort') || 'rating'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where conditions
    const whereConditions: any = {
      role: 'ARTIST',
      profile: {
        completedRegistration: true
      }
    }

    // Text search across name and bio
    if (query) {
      whereConditions.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { profile: { bio: { contains: query, mode: 'insensitive' } } }
      ]
    }

    // Location filter
    if (location) {
      whereConditions.profile = {
        ...whereConditions.profile,
        location: { contains: location, mode: 'insensitive' }
      }
    }

    // Style/specialty filter
    if (style) {
      whereConditions.profile = {
        ...whereConditions.profile,
        specialties: { has: style }
      }
    }

    // Determine sort order
    let orderBy: any = []
    switch (sort) {
      case 'rating':
        orderBy = [{ reviews: { _count: 'desc' } }] // Temp: sort by review count as proxy for rating
        break
      case 'reviews':
        orderBy = [{ reviews: { _count: 'desc' } }]
        break
      case 'portfolio':
        orderBy = [{ portfolioItems: { _count: 'desc' } }]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      default:
        orderBy = [{ createdAt: 'desc' }]
    }

    const artists = await prisma.user.findMany({
      where: whereConditions,
      include: {
        profile: true,
        portfolioItems: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { imageUrl: true }
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
    })

    // Transform data for frontend
    const transformedArtists = artists.map(artist => {
      const ratings = artist.reviews.map(r => r.rating)
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0

      return {
        id: artist.id,
        name: artist.name || 'Unknown Artist',
        bio: artist.profile?.bio || '',
        avatar: artist.portfolioItems[0]?.imageUrl || artist.profile?.avatar || '',
        location: artist.profile?.location || '',
        specialties: artist.profile?.specialties || [],
        instagram: artist.profile?.instagram || '',
        portfolioCount: artist._count.portfolioItems,
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        reviewCount: artist._count.reviews,
        featured: false // TODO: Add featured logic
      }
    })

    return NextResponse.json(transformedArtists)
  } catch (error) {
    console.error('Error fetching artists:', error)
    
    // Return mock data when database is unavailable
    console.log('Database unavailable, returning mock data for development')
    
    // Filter mock data based on search parameters if provided
    let filteredMockData = [...mockArtists]
    
    const query = new URL(request.url).searchParams.get('q') || ''
    const location = new URL(request.url).searchParams.get('location') || ''
    const style = new URL(request.url).searchParams.get('style') || ''
    
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
    
    return NextResponse.json(filteredMockData)
  }
} 