import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      color,
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

    const event = await prisma.calendarEvent.create({
      data: {
        userId: session.user.id,
        calendarId,
        title,
        description,
        location,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay: allDay || false,
        timezone: timezone || 'UTC',
        clientName,
        clientEmail,
        clientPhone,
        serviceType,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        depositPaid: depositPaid || false,
        depositAmount: depositAmount ? parseFloat(depositAmount) : null,
        status: status || 'CONFIRMED',
        color,
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

    // TODO: Check for conflicts and update hasConflict field
    // TODO: If calendar has 2-way sync, create event in external calendar

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
    if (updates.estimatedCost) {
      data.estimatedCost = parseFloat(updates.estimatedCost)
    }
    if (updates.depositAmount) {
      data.depositAmount = parseFloat(updates.depositAmount)
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

    // TODO: If calendar has 2-way sync, update event in external calendar

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

    // TODO: If calendar has 2-way sync, delete event in external calendar

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
