import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// POST /api/bookings/decline - Artist declines a booking request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only artists can decline bookings
    if (session.user.role !== 'ARTIST' && session.user.role !== 'SHOP_OWNER') {
      return NextResponse.json(
        { error: 'Only artists can decline bookings' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { appointmentId, reason } = body

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
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
        { error: 'Unauthorized to decline this booking' },
        { status: 403 }
      )
    }

    // Update appointment status to CANCELLED
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CANCELLED',
        notes: reason ? `${appointment.notes || ''}\n\nDeclined: ${reason}`.trim() : appointment.notes,
        updatedAt: new Date(),
      },
    })

    // If there's a linked calendar event, mark it as declined
    if (appointment.calendarEventId) {
      await prisma.calendarEvent.update({
        where: { id: appointment.calendarEventId },
        data: {
          status: 'DECLINED',
          deletedAt: new Date(),
        },
      })
    }

    // TODO: Send notification to client about declined booking

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          status: 'CANCELLED',
        },
        message: 'Booking request declined',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error declining booking:', error)
    return NextResponse.json(
      { error: 'Failed to decline booking' },
      { status: 500 }
    )
  }
}

