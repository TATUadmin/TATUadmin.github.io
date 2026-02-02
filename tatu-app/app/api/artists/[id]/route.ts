import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artistId = params.id

    if (!artistId) {
      return NextResponse.json(
        { error: 'Artist ID is required' },
        { status: 400 }
      )
    }

    // Fetch artist with all related data
    const artist = await prisma.user.findUnique({
      where: { 
        id: artistId,
        role: 'ARTIST'
      },
      include: {
        artistProfile: true,
        portfolioItems: {
          orderBy: { createdAt: 'desc' }
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!artist || !artist.artistProfile) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const portfolioCount = artist.portfolioItems.length
    const reviewCount = artist.reviews.length
    const rating = reviewCount > 0 
      ? artist.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
      : 0

    // Format portfolio items
    const portfolioItems = artist.portfolioItems.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      style: item.style,
      tags: [], // Tags will be handled separately if needed
      createdAt: item.createdAt.toISOString()
    }))

    // Format reviews
    const reviews = artist.reviews.map((review: any) => ({
      id: review.id,
      rating: review.rating,
      content: review.content,
      createdAt: review.createdAt.toISOString(),
      user: {
        name: review.user.name || 'Anonymous'
      }
    }))

    // Format response
    const response = {
      id: artist.id,
      name: artist.name || 'Unknown Artist',
      bio: artist.artistProfile.bio || '',
      avatar: artist.artistProfile.avatar || '',
      location: artist.artistProfile.location || '',
      specialties: artist.artistProfile.specialties,
      instagram: artist.artistProfile.instagram || '',
      website: artist.artistProfile.website || '',
      phone: artist.artistProfile.phone || '',
      portfolioCount,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
      reviewCount,
      portfolioItems,
      reviews,
      featured: artist.artistProfile.featuredListingActive || false
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching artist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artist' },
      { status: 500 }
    )
  }
} 