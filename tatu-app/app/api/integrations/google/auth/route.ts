import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GoogleCalendarIntegration } from '@/lib/integrations/google-calendar'

// GET /api/integrations/google/auth - Initiate Google Calendar OAuth flow
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const integration = new GoogleCalendarIntegration()
    const authUrl = integration.getAuthUrl()

    // Store user ID in session/state for callback
    // In production, use a signed state parameter
    const url = new URL(authUrl)
    url.searchParams.set('state', session.user.id)

    return NextResponse.json({ authUrl: url.toString() })
  } catch (error) {
    console.error('Error initiating Google OAuth:', error)
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    )
  }
}
