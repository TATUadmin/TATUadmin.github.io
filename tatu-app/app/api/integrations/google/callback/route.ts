import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarIntegration } from '@/lib/integrations/google-calendar'
import { prisma } from '@/lib/prisma'

// GET /api/integrations/google/callback - Handle Google Calendar OAuth callback
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      // Redirect to sign in
      return NextResponse.redirect(
        new URL('/api/auth/signin?callbackUrl=/calendar', request.url)
      )
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(
        new URL(
          `/calendar?error=${encodeURIComponent(
            'Failed to connect Google Calendar'
          )}`,
          request.url
        )
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/calendar?error=no_code', request.url)
      )
    }

    // Verify state matches user ID (basic security check)
    if (state !== session.user.id) {
      return NextResponse.redirect(
        new URL('/calendar?error=invalid_state', request.url)
      )
    }

    const integration = new GoogleCalendarIntegration()
    const tokens = await integration.getTokensFromCode(code)

    // Save calendar connection to database
    await prisma.calendar.create({
      data: {
        userId: session.user.id,
        name: 'Google Calendar',
        provider: 'GOOGLE',
        providerCalendarId: 'primary',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        tokenExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : null,
        color: '#4285F4', // Google blue
        syncEnabled: true,
      },
    })

    // Trigger initial sync in background (don't wait for it)
    // In production, this would be a background job
    setTimeout(async () => {
      try {
        const calendar = await prisma.calendar.findFirst({
          where: {
            userId: session.user.id,
            provider: 'GOOGLE',
          },
          orderBy: {
            createdAt: 'desc',
          },
        })
        
        if (calendar) {
          await GoogleCalendarIntegration.syncUserGoogleCalendar(
            session.user.id,
            calendar.id
          )
        }
      } catch (syncError) {
        console.error('Background sync error:', syncError)
      }
    }, 1000)

    return NextResponse.redirect(
      new URL('/calendar?success=google_connected', request.url)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL(
        `/calendar?error=${encodeURIComponent('Connection failed')}`,
        request.url
      )
    )
  }
}
