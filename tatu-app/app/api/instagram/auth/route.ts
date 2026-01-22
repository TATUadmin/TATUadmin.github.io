import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// POST /api/instagram/auth - Initiate Instagram OAuth flow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role from database to ensure accuracy
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user is customer or artist
    const isCustomer = user.role === 'CUSTOMER'
    const isArtist = user.role === 'ARTIST' || user.role === 'SHOP_OWNER'
    
    if (!isCustomer && !isArtist) {
      return NextResponse.json(
        { error: 'Only customers and artists can link Instagram accounts' },
        { status: 403 }
      )
    }

    // Check if Instagram/Facebook is configured
    // Instagram Basic Display requires Facebook OAuth
    const clientId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/instagram/callback`
    
    if (!clientId) {
      // Development fallback: Mock Instagram linking
      // In production, this should require actual Instagram OAuth setup
      if (process.env.NODE_ENV === 'development') {
        // Simulate successful linking with mock data
        if (isCustomer) {
          await prisma.customerProfile.update({
            where: { userId: session.user.id },
            data: {
              instagramLinked: true,
              instagramHandle: 'mock_instagram_user',
              instagramAccessToken: 'mock_token_' + crypto.randomUUID(),
              instagramTokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            },
          })
        } else if (isArtist) {
          await prisma.artistProfile.update({
            where: { userId: session.user.id },
            data: {
              instagramLinked: true,
              instagramHandle: 'mock_instagram_user',
              instagramAccessToken: 'mock_token_' + crypto.randomUUID(),
              instagramTokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            },
          })
        }
        
        return NextResponse.json({ 
          success: true,
          message: 'Instagram linked (mock mode - development only)',
          warning: 'Instagram OAuth is not configured. Using mock data for development.'
        })
      }
      
      return NextResponse.json(
        { 
          error: 'Instagram integration not configured',
          details: 'Please configure INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET environment variables.'
        },
        { status: 500 }
      )
    }

    // Production: Use real Instagram OAuth via Facebook
    // Instagram Basic Display API requires Facebook Login
    // Note: For Instagram Basic Display, you need FACEBOOK_APP_ID instead
    const facebookAppId = process.env.FACEBOOK_APP_ID || clientId
    const scope = 'instagram_basic,instagram_manage_messages'
    
    // Use Facebook OAuth for Instagram Basic Display
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${facebookAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error initiating Instagram auth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Instagram authentication' },
      { status: 500 }
    )
  }
}

