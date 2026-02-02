import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user to verify they're an artist
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user || (user.role !== 'ARTIST' && user.role !== 'SHOP_OWNER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get reviews for this artist
    const reviews = await prisma.review.findMany({
      where: {
        artistId: session.user.id,
      },
      select: {
        rating: true,
      },
    })

    // Calculate stats
    const reviewCount = reviews.length
    const averageRating =
      reviewCount > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0

    return NextResponse.json({
      reviewCount,
      averageRating: Math.round(averageRating * 10) / 10,
    })
  } catch (error) {
    console.error('Error fetching artist stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}

