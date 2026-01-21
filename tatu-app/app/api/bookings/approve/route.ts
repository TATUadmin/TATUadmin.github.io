import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// POST /api/bookings/approve - Artist approves a booking request and creates calendar event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only artists can approve bookings
    if (session.user.role !== 'ARTIST' && session.user.role !== 'SHOP_OWNER') {
      return NextResponse.json(
        { error: 'Only artists can approve bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        Appointment_clientIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            CustomerProfile: {
              select: {
                phone: true,
              },
            },
          },
        },
        Service: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Verify artist owns this appointment
    if (appointment.artistId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to approve this booking' },
        { status: 403 }
      )
    }

    // Check if already has a calendar event
    if (appointment.calendarEventId) {
      return NextResponse.json(
        { error: 'Appointment already has a calendar event' },
        { status: 400 }
      )
    }

    // Get or create default calendar for artist
    let calendar = await prisma.calendar.findFirst({
      where: {
        userId: session.user.id,
        provider: 'TATU',
        isDefault: true,
      },
    })

    if (!calendar) {
      // Create default TATU calendar
      calendar = await prisma.calendar.create({
        data: {
          userId: session.user.id,
          name: 'TATU Bookings',
          provider: 'TATU',
          color: '#FFFFFF',
          isDefault: true,
          syncEnabled: true,
        },
      })
    }

    // Check for conflicts one more time
    const conflictingEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: session.user.id,
        calendarId: calendar.id,
        deletedAt: null,
        startTime: { lt: appointment.endTime },
        endTime: { gt: appointment.startTime },
        status: { notIn: ['CANCELLED', 'DECLINED'] },
      },
    })

    if (conflictingEvents.length > 0) {
      return NextResponse.json(
        {
          error: 'Time slot is no longer available',
          conflicts: conflictingEvents.map(e => ({
            id: e.id,
            title: e.title,
            startTime: e.startTime,
            endTime: e.endTime,
          })),
        },
        { status: 409 }
      )
    }

    // Create calendar event for the approved booking
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        calendarId: calendar.id,
        userId: session.user.id,
        title: appointment.Service?.name || `Booking with ${appointment.Appointment_clientIdToUser?.name || 'Client'}`,
        description: appointment.notes || null,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        eventType: 'BOOKING',
        status: 'CONFIRMED',
        visibility: 'PUBLIC_BUSY', // Show as busy on public calendar
        clientId: appointment.clientId,
        clientName: appointment.Appointment_clientIdToUser?.name || null,
        clientEmail: appointment.Appointment_clientIdToUser?.email || null,
        clientPhone: appointment.Appointment_clientIdToUser?.CustomerProfile?.phone || null,
        serviceType: appointment.Service?.name || null,
        appointmentId: appointment.id,
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

    // Update appointment to link to calendar event and set status to CONFIRMED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        calendarEventId: calendarEvent.id,
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    })

    // TODO: Send confirmation email to client
    // TODO: Send notification to client

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          status: 'CONFIRMED',
          calendarEventId: calendarEvent.id,
        },
        calendarEvent: {
          id: calendarEvent.id,
          title: calendarEvent.title,
          startTime: calendarEvent.startTime,
          endTime: calendarEvent.endTime,
        },
        message: 'Booking approved and added to calendar',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error approving booking:', error)
    return NextResponse.json(
      { error: 'Failed to approve booking' },
      { status: 500 }
    )
  }
}

