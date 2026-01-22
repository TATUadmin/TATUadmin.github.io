import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic'

// GET /api/instagram/callback - Handle Instagram OAuth callback
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=access_denied', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=no_code', request.url))
    }

    // Exchange code for access token via Facebook OAuth
    const clientId = process.env.FACEBOOK_APP_ID || process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.FACEBOOK_APP_SECRET || process.env.INSTAGRAM_CLIENT_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/instagram/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=credentials_missing', request.url))
    }

    // Step 1: Exchange code for short-lived access token
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)
      return NextResponse.redirect(new URL('/dashboard?instagram_error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const shortLivedToken = tokenData.access_token

    if (!shortLivedToken) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=no_token', request.url))
    }

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`)
    
    if (!longLivedResponse.ok) {
      // If long-lived token exchange fails, use short-lived token
      console.warn('Long-lived token exchange failed, using short-lived token')
    }

    const longLivedData = longLivedResponse.ok ? await longLivedResponse.json() : null
    const accessToken = longLivedData?.access_token || shortLivedToken
    const expiresIn = longLivedData?.expires_in || 3600 // Default to 1 hour if short-lived

    // Determine user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=user_not_found', request.url))
    }

    const isCustomer = user.role === 'CUSTOMER'
    const isArtist = user.role === 'ARTIST' || user.role === 'SHOP_OWNER'

    if (!isCustomer && !isArtist) {
      return NextResponse.redirect(new URL('/dashboard?instagram_error=invalid_role', request.url))
    }

    // Step 3: Get Instagram user ID and username
    // First get the Instagram Business Account ID from the Facebook page
    const meResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=instagram_business_account&access_token=${accessToken}`)
    
    if (!meResponse.ok) {
      // Fallback: Try to get basic user info
      const basicResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=name&access_token=${accessToken}`)
      if (basicResponse.ok) {
        const basicData = await basicResponse.json()
        // Use a placeholder username
        const username = basicData.name?.toLowerCase().replace(/\s+/g, '_') || 'instagram_user'
        
        const updateData = {
          instagramLinked: true,
          instagramHandle: username,
          instagramAccessToken: accessToken,
          instagramTokenExpiry: new Date(Date.now() + expiresIn * 1000),
        }

        if (isCustomer) {
          await prisma.customerProfile.update({
            where: { userId: session.user.id },
            data: updateData,
          })
        } else if (isArtist) {
          await prisma.artistProfile.update({
            where: { userId: session.user.id },
            data: updateData,
          })
        }
        
        return NextResponse.redirect(new URL('/dashboard?instagram_linked=true', request.url))
      }
      
      return NextResponse.redirect(new URL('/dashboard?instagram_error=profile_fetch_failed', request.url))
    }

    const meData = await meResponse.json()
    const instagramAccountId = meData.instagram_business_account?.id

    if (instagramAccountId) {
      // Get Instagram account details
      const instagramResponse = await fetch(`https://graph.instagram.com/${instagramAccountId}?fields=username&access_token=${accessToken}`)
      if (instagramResponse.ok) {
        const instagramData = await instagramResponse.json()
        const username = instagramData.username || 'instagram_user'
        
        const updateData = {
          instagramLinked: true,
          instagramHandle: username,
          instagramAccessToken: accessToken,
          instagramTokenExpiry: new Date(Date.now() + expiresIn * 1000),
        }

        if (isCustomer) {
          await prisma.customerProfile.update({
            where: { userId: session.user.id },
            data: updateData,
          })
        } else if (isArtist) {
          await prisma.artistProfile.update({
            where: { userId: session.user.id },
            data: updateData,
          })
        }
        
        return NextResponse.redirect(new URL('/dashboard?instagram_linked=true', request.url))
      }
    }

    // Fallback: Save with basic info if Instagram account not found
    const updateData = {
      instagramLinked: true,
      instagramHandle: 'instagram_user',
      instagramAccessToken: accessToken,
      instagramTokenExpiry: new Date(Date.now() + expiresIn * 1000),
    }

    if (isCustomer) {
      await prisma.customerProfile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
    } else if (isArtist) {
      await prisma.artistProfile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
    }

    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/dashboard?instagram_linked=true', request.url))
  } catch (error) {
    console.error('Error in Instagram callback:', error)
    return NextResponse.redirect(new URL('/dashboard?instagram_error=callback_error', request.url))
  }
}

