import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { GoogleCalendarIntegration } from '@/lib/integrations/google-calendar'

export const dynamic = 'force-dynamic'

// GET /api/calendar/events - Get events for user's calendars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const calendarId = searchParams.get('calendarId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    }

    if (calendarId) {
      where.calendarId = calendarId
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        calendar: {
          select: {
            id: true,
            name: true,
            provider: true,
            color: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/calendar/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      calendarId,
      title,
      description,
      location,
      startTime,
      endTime,
      allDay,
      timezone,
      clientName,
      clientEmail,
      clientPhone,
      serviceType,
      estimatedCost,
      depositPaid,
      depositAmount,
      status,
      eventType,
      visibility,
      color,
      appointmentId, // Link to appointment if this is a booking
    } = body

    if (!calendarId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Calendar ID, title, start time, and end time are required' },
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

    // Validate status
    const validStatuses = ['TENTATIVE', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED', 'RESCHEDULED', 'PENDING', 'DECLINED', 'AVAILABLE', 'BLOCKED']
    const eventStatus = status && validStatuses.includes(status) ? status : 'CONFIRMED'
    
    // Validate eventType
    const validEventTypes = ['MANUAL_BLOCK', 'BOOKING', 'PERSONAL', 'AVAILABILITY']
    const eventTypeValue = eventType && validEventTypes.includes(eventType) ? eventType : 'BOOKING'
    
    // Validate visibility
    const validVisibilities = ['PRIVATE', 'PUBLIC_BUSY', 'PUBLIC_AVAILABLE']
    const visibilityValue = visibility && validVisibilities.includes(visibility) ? visibility : 'PRIVATE'

    // Check for conflicts (double booking prevention)
    const conflictingEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
        status: { notIn: ['CANCELLED', 'DECLINED'] },
      },
    })

    if (conflictingEvents.length > 0 && eventTypeValue === 'BOOKING') {
      return NextResponse.json(
        { 
          error: 'Time slot is already booked',
          conflicts: conflictingEvents.map(e => ({
            id: e.id,
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime,
          }))
        },
        { status: 409 }
      )
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        calendarId,
        title,
        description: description || null,
        location: location || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay: allDay || false,
        timezone: timezone || 'UTC',
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        serviceType: serviceType || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost.toString()) : null,
        depositPaid: depositPaid || false,
        depositAmount: depositAmount ? parseFloat(depositAmount.toString()) : null,
        status: eventStatus,
        eventType: eventTypeValue,
        visibility: visibilityValue,
        color: color || null,
        hasConflict: false, // Will be updated by conflict detection
      },
      include: {
        calendar: {
          select: {
            id: true,
            name: true,
            provider: true,
            color: true,
          },
        },
      },
    })

    // Update conflict status for other events that might conflict with this one
    if (conflictingEvents.length > 0) {
      for (const conflict of conflictingEvents) {
        await prisma.calendarEvent.update({
          where: { id: conflict.id },
          data: {
            hasConflict: true,
            conflictWith: [...(conflict.conflictWith || []), event.id],
          },
        })
      }
    }

    // If this is a booking event linked to an appointment, update the appointment
    if (appointmentId && eventTypeValue === 'BOOKING') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          calendarEventId: event.id,
          status: eventStatus === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
        },
      })
    }

    if (calendar.provider === 'GOOGLE' && calendar.syncEnabled) {
      try {
        if (calendar.accessToken && calendar.refreshToken) {
          const integration = new GoogleCalendarIntegration(
            calendar.accessToken,
            calendar.refreshToken
          )
          const externalEvent = await integration.createEvent({
            title,
            description,
            location,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            timezone,
          })

          await prisma.calendarEvent.update({
            where: { id: event.id },
            data: {
              externalId: externalEvent.id || null,
              externalUrl: externalEvent.htmlLink || null,
              lastSyncedAt: new Date(),
            },
          })
        }
      } catch (error) {
        console.error('Error syncing event to Google Calendar:', error)
      }
    }

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}

// PATCH /api/calendar/events - Update an event
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, ...updates } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Verify event ownership
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      include: { calendar: true },
    })

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Process date fields
    const data: any = { ...updates }
    if (updates.startTime) {
      data.startTime = new Date(updates.startTime)
    }
    if (updates.endTime) {
      data.endTime = new Date(updates.endTime)
    }
    if (updates.estimatedCost !== undefined) {
      data.estimatedCost = updates.estimatedCost ? parseFloat(updates.estimatedCost.toString()) : null
    }
    if (updates.depositAmount !== undefined) {
      data.depositAmount = updates.depositAmount ? parseFloat(updates.depositAmount.toString()) : null
    }
    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['TENTATIVE', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED', 'RESCHEDULED', 'PENDING', 'DECLINED', 'AVAILABLE', 'BLOCKED']
      if (validStatuses.includes(updates.status)) {
        data.status = updates.status
      }
    }
    // Validate eventType if provided
    if (updates.eventType) {
      const validEventTypes = ['MANUAL_BLOCK', 'BOOKING', 'PERSONAL', 'AVAILABILITY']
      if (validEventTypes.includes(updates.eventType)) {
        data.eventType = updates.eventType
      }
    }
    // Validate visibility if provided
    if (updates.visibility) {
      const validVisibilities = ['PRIVATE', 'PUBLIC_BUSY', 'PUBLIC_AVAILABLE']
      if (validVisibilities.includes(updates.visibility)) {
        data.visibility = updates.visibility
      }
    }
    
    // Check for conflicts if time is being updated
    if (updates.startTime || updates.endTime) {
      const newStartTime = updates.startTime ? new Date(updates.startTime) : event.startTime
      const newEndTime = updates.endTime ? new Date(updates.endTime) : event.endTime
      
      const conflictingEvents = await prisma.calendarEvent.findMany({
        where: {
          userId: session.user.id,
          id: { not: eventId },
          deletedAt: null,
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
          status: { notIn: ['CANCELLED', 'DECLINED'] },
        },
      })
      
      if (conflictingEvents.length > 0 && (data.eventType || event.eventType) !== 'MANUAL_BLOCK') {
        return NextResponse.json(
          { 
            error: 'Time slot conflicts with existing event',
            conflicts: conflictingEvents.map(e => ({
              id: e.id,
              title: e.title,
              startTime: e.startTime,
              endTime: e.endTime,
            }))
          },
          { status: 409 }
        )
      }
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id: eventId },
      data,
      include: {
        calendar: {
          select: {
            id: true,
            name: true,
            provider: true,
            color: true,
          },
        },
      },
    })

    if (updatedEvent.calendar.provider === 'GOOGLE' && updatedEvent.calendar.syncEnabled) {
      try {
        if (event.calendar.accessToken && event.calendar.refreshToken) {
          const integration = new GoogleCalendarIntegration(
            event.calendar.accessToken,
            event.calendar.refreshToken
          )

          if (updatedEvent.externalId) {
            await integration.updateEvent(updatedEvent.externalId, {
              title: updatedEvent.title,
              description: updatedEvent.description || undefined,
              location: updatedEvent.location || undefined,
              startTime: updatedEvent.startTime,
              endTime: updatedEvent.endTime,
              timezone: updatedEvent.timezone,
            })
          } else {
            const externalEvent = await integration.createEvent({
              title: updatedEvent.title,
              description: updatedEvent.description || undefined,
              location: updatedEvent.location || undefined,
              startTime: updatedEvent.startTime,
              endTime: updatedEvent.endTime,
              timezone: updatedEvent.timezone,
            })

            await prisma.calendarEvent.update({
              where: { id: updatedEvent.id },
              data: {
                externalId: externalEvent.id || null,
                externalUrl: externalEvent.htmlLink || null,
                lastSyncedAt: new Date(),
              },
            })
          }
        }
      } catch (error) {
        console.error('Error syncing event update to Google Calendar:', error)
      }
    }

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE /api/calendar/events?id=<eventId> - Delete an event
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('id')

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Verify event ownership
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
    })

    if (!event || event.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: {
        deletedAt: new Date(),
      },
    })

    if (event.externalId) {
      const calendar = await prisma.calendar.findUnique({
        where: { id: event.calendarId },
      })

      if (calendar?.provider === 'GOOGLE' && calendar.syncEnabled) {
        try {
          if (calendar.accessToken && calendar.refreshToken) {
            const integration = new GoogleCalendarIntegration(
              calendar.accessToken,
              calendar.refreshToken
            )
            await integration.deleteEvent(event.externalId)
          }
        } catch (error) {
          console.error('Error deleting event from Google Calendar:', error)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
