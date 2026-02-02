import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// POST /api/bookings/request - Create a booking request from client to artist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can request bookings
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Only customers can request bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      artistId,
      startTime,
      endTime,
      serviceId,
      shopId,
      notes,
      serviceName,
    } = body

    if (!artistId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Artist ID, start time, and end time are required' },
        { status: 400 }
      )
    }

    // Verify artist exists
    const artist = await prisma.user.findUnique({
      where: { id: artistId },
      include: {
        artistProfile: true,
      },
    })

    if (!artist || artist.role !== 'ARTIST') {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // Check for conflicts - ensure time slot is available
    const start = new Date(startTime)
    const end = new Date(endTime)

    // Check for existing calendar events that would conflict
    const conflictingEvents = await prisma.calendarEvent.findMany({
      where: {
        userId: artistId,
        deletedAt: null,
        startTime: { lt: end },
        endTime: { gt: start },
        status: { notIn: ['CANCELLED', 'DECLINED'] },
        eventType: { not: 'AVAILABILITY' }, // Availability slots don't block
      },
    })

    if (conflictingEvents.length > 0) {
      return NextResponse.json(
        {
          error: 'Time slot is not available',
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

    // Create appointment with PENDING status
    const appointment = await prisma.appointment.create({
      data: {
        id: crypto.randomUUID(),
        artistId,
        clientId: session.user.id,
        shopId: shopId || '', // Default shop if not provided
        serviceId: serviceId || '', // Default service if not provided
        startTime: start,
        endTime: end,
        status: 'PENDING',
        notes: notes || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        Service: true,
        Shop: true,
      },
    })

    // TODO: Send notification to artist about new booking request
    // TODO: Send confirmation email to client

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          artistId: appointment.artistId,
          status: appointment.status,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          serviceName: appointment.Service?.name || serviceName,
        },
        message: 'Booking request created successfully. The artist will review and respond.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating booking request:', error)
    return NextResponse.json(
      { error: 'Failed to create booking request' },
      { status: 500 }
    )
  }
}

