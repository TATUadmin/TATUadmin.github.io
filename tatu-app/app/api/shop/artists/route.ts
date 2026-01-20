import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session and verify they're a shop owner
    const userId = 'temp-user' // For now, use temp user

    // First find the shop owned by this user
    const shop = await prisma.shop.findFirst({
      where: { ownerId: userId }
    })

    if (!shop) {
      return NextResponse.json([])
    }

    // Get artists associated with this shop
    const shopArtists = await prisma.shopsOnArtists.findMany({
      where: { shopId: shop.id },
      include: {
        artist: {
          include: {
            artistProfile: true,
            portfolioItems: true,
            reviews: true
          }
        }
      }
    })

    const artists = shopArtists.map(sa => {
      const artist = sa.artist
      const portfolioCount = artist.portfolioItems.length
      const reviewCount = artist.reviews.length
      const rating = reviewCount > 0 
        ? artist.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewCount
        : 0

      return {
        id: artist.id,
        name: artist.name || 'Unknown Artist',
        avatar: artist.artistProfile?.avatar || '',
        specialties: artist.artistProfile?.specialties || [],
        portfolioCount,
        rating: Math.round(rating * 10) / 10
      }
    })

    return NextResponse.json(artists)
  } catch (error) {
    console.error('Error fetching shop artists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shop artists' },
      { status: 500 }
    )
  }
} 