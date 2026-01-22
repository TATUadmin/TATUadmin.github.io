import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/instagram/unlink - Unlink Instagram account
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is customer or artist
    const isCustomer = session.user.role === 'CUSTOMER'
    const isArtist = session.user.role === 'ARTIST' || session.user.role === 'SHOP_OWNER'
    
    if (!isCustomer && !isArtist) {
      return NextResponse.json(
        { error: 'Only customers and artists can unlink Instagram accounts' },
        { status: 403 }
      )
    }

    // Update profile based on user role
    if (isCustomer) {
      await prisma.customerProfile.update({
        where: { userId: session.user.id },
        data: {
          instagramLinked: false,
          instagramHandle: null,
          instagramAccessToken: null,
          instagramTokenExpiry: null,
        },
      })
    } else if (isArtist) {
      await prisma.artistProfile.update({
        where: { userId: session.user.id },
        data: {
          instagramLinked: false,
          instagramHandle: null,
          instagramAccessToken: null,
          instagramTokenExpiry: null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unlinking Instagram:', error)
    return NextResponse.json(
      { error: 'Failed to unlink Instagram account' },
      { status: 500 }
    )
  }
}

