import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/instagram/images - Fetch recent Instagram images
export async function GET(request: NextRequest) {
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
        { error: 'Only customers and artists can fetch Instagram images' },
        { status: 403 }
      )
    }

    // Fetch profile based on user role
    const profile = isCustomer
      ? await prisma.customerProfile.findUnique({
          where: { userId: session.user.id },
          select: {
            instagramLinked: true,
            instagramAccessToken: true,
            instagramTokenExpiry: true,
            instagramHandle: true,
          },
        })
      : await prisma.artistProfile.findUnique({
          where: { userId: session.user.id },
          select: {
            instagramLinked: true,
            instagramAccessToken: true,
            instagramTokenExpiry: true,
            instagramHandle: true,
          },
        })

    if (!profile?.instagramLinked || !profile.instagramAccessToken) {
      return NextResponse.json({ images: [] })
    }

    // Check if token is expired
    if (profile.instagramTokenExpiry && profile.instagramTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: 'Instagram token expired. Please reconnect your account.' },
        { status: 401 }
      )
    }

    // Check if Instagram is configured
    if (!profile.instagramAccessToken || profile.instagramAccessToken.startsWith('mock_token_')) {
      // Development mode: Return mock images
      if (process.env.NODE_ENV === 'development') {
        const mockImages = [
          {
            id: 'mock_1',
            url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #1',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock_2',
            url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #2',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock_3',
            url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #3',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock_4',
            url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #4',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock_5',
            url: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #5',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'mock_6',
            url: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=400&h=400&fit=crop',
            thumbnail: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=200&h=200&fit=crop',
            caption: 'Sample tattoo work #6',
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]
        return NextResponse.json({ images: mockImages })
      }
      
      return NextResponse.json({ images: [] })
    }

    // Fetch recent media from Instagram Graph API
    try {
      // First, get the Instagram Business Account ID
      const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=instagram_business_account&access_token=${profile.instagramAccessToken}`)
      
      if (meResponse.ok) {
        const meData = await meResponse.json()
        const instagramAccountId = meData.instagram_business_account?.id

        if (instagramAccountId) {
          // Fetch media from Instagram Business Account
          const mediaResponse = await fetch(
            `https://graph.instagram.com/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=6&access_token=${profile.instagramAccessToken}`
          )

          if (mediaResponse.ok) {
            const mediaData = await mediaResponse.json()
            const images = (mediaData.data || []).map((item: any) => ({
              id: item.id,
              url: item.media_url || item.thumbnail_url,
              thumbnail: item.thumbnail_url || item.media_url,
              caption: item.caption || '',
              timestamp: item.timestamp,
            }))
            return NextResponse.json({ images })
          }
        }
      }

      // If Instagram Business Account fetch fails, return empty array
      return NextResponse.json({ images: [] })
    } catch (error) {
      console.error('Error fetching Instagram media:', error)
      return NextResponse.json({ images: [] })
    }
  } catch (error) {
    console.error('Error fetching Instagram images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram images' },
      { status: 500 }
    )
  }
}

