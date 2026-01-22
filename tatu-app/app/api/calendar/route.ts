import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/calendar - Get all calendars for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const calendars = await prisma.calendar.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ calendars })
  } catch (error) {
    console.error('Error fetching calendars:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    )
  }
}

// POST /api/calendar - Create or connect a new calendar
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      provider,
      providerCalendarId,
      accessToken,
      refreshToken,
      tokenExpiresAt,
      color,
      isDefault,
    } = body

    if (!name || !provider) {
      return NextResponse.json(
        { error: 'Name and provider are required' },
        { status: 400 }
      )
    }

    // Validate provider against enum
    const validProviders = ['TATU', 'GOOGLE', 'APPLE', 'OUTLOOK', 'SQUARE', 'CALENDLY', 'ACUITY', 'MANUAL', 'EMAIL_PARSED', 'INSTAGRAM']
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be one of: ' + validProviders.join(', ') },
        { status: 400 }
      )
    }

    // Check subscription tier limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        artistProfile: {
          select: {
            subscriptionTier: true,
          },
        },
        calendars: true,
      },
    })

    const tierLimits = {
      FREE: 1, // Can connect 1 external calendar
      PRO: Infinity,
      STUDIO: Infinity,
    }

    const tier = user?.artistProfile?.subscriptionTier || 'FREE'
    const limit = tierLimits[tier]
    
    if (user && user.calendars.length >= limit) {
      return NextResponse.json(
        {
          error: `Your ${tier} plan allows ${limit} external calendar${
            limit > 1 ? 's' : ''
          }. Upgrade to connect more.`,
          upgradeRequired: tier === 'FREE' ? 'PRO' : null,
        },
        { status: 403 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.calendar.updateMany({
        where: {
          userId: session.user.id,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const calendar = await prisma.calendar.create({
      data: {
        userId: session.user.id,
        name,
        provider,
        providerCalendarId,
        accessToken,
        refreshToken,
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        color: color || '#3B82F6',
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ calendar }, { status: 201 })
  } catch (error) {
    console.error('Error creating calendar:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar?id=<calendarId> - Delete/disconnect a calendar
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const calendarId = searchParams.get('id')

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    })

    if (!calendar || calendar.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      )
    }

    // Delete calendar (cascades to events)
    await prisma.calendar.delete({
      where: { id: calendarId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting calendar:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar' },
      { status: 500 }
    )
  }
}
