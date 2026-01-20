import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarIntegration } from '@/lib/integrations/google-calendar'
import { detectEventConflicts, updateEventConflicts } from '@/lib/services/conflict-detection'

// POST /api/calendar/sync - Manually trigger calendar sync
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { calendarId } = body

    if (!calendarId) {
      return NextResponse.json(
        { error: 'Calendar ID is required' },
        { status: 400 }
      )
    }

    // Verify calendar ownership
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    })

    if (!calendar || calendar.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Calendar not found' },
        { status: 404 }
      )
    }

    let syncedCount = 0

    // Sync based on provider
    switch (calendar.provider) {
      case 'GOOGLE':
        const result = await GoogleCalendarIntegration.syncUserGoogleCalendar(
          session.user.id,
          calendarId
        )
        syncedCount = result.syncedCount
        break
      
      case 'APPLE':
      case 'OUTLOOK':
      case 'SQUARE':
        // TODO: Implement other integrations
        return NextResponse.json(
          { error: `${calendar.provider} sync not yet implemented` },
          { status: 501 }
        )
      
      default:
        return NextResponse.json(
          { error: 'Cannot sync this calendar type' },
          { status: 400 }
        )
    }

    // After sync, check for conflicts
    const events = await prisma.calendarEvent.findMany({
      where: {
        calendarId,
        deletedAt: null,
      },
    })

    // Update conflicts for all synced events
    for (const event of events) {
      const conflicts = await detectEventConflicts(
        session.user.id,
        event.startTime,
        event.endTime,
        event.id
      )
      
      await updateEventConflicts(event.id, conflicts)
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      conflictsDetected: events.filter(e => e.hasConflict).length,
    })
  } catch (error) {
    console.error('Error syncing calendar:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar' },
      { status: 500 }
    )
  }
}
