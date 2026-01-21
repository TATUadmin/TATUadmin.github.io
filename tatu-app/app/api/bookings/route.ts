import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/bookings - Get all bookings for the authenticated customer
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can access this endpoint
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'This endpoint is only available for customers' },
        { status: 403 }
      )
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: session.user.id,
      },
      include: {
        User_Appointment_artistIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Service: {
          select: {
            name: true,
          },
        },
        Shop: {
          select: {
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    const bookings = appointments.map((apt) => ({
      id: apt.id,
      artistId: apt.artistId,
      artistName: apt.User_Appointment_artistIdToUser.name,
      artistEmail: apt.User_Appointment_artistIdToUser.email,
      artistProfileLink: `/artist/${apt.artistId}`,
      date: apt.startTime.toISOString(),
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      status: apt.status,
      serviceName: apt.Service?.name,
      location: apt.Shop?.address || apt.Shop?.name,
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
    }))

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

