import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendAppointmentConfirmation } from '@/lib/email'

const appointmentSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  artistId: z.string(),
  clientEmail: z.string().email(),
  serviceId: z.string(),
  notes: z.string().optional(),
})

async function checkArtistAvailability(
  artistId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
) {
  const overlappingAppointments = await prisma.appointment.findMany({
    where: {
      artistId,
      id: { not: excludeAppointmentId },
      status: { notIn: ['CANCELLED'] },
      OR: [
        {
          // New appointment starts during an existing appointment
          AND: [
            { startTime: { lte: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
        {
          // New appointment ends during an existing appointment
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gte: startTime } },
          ],
        },
        {
          // New appointment completely contains an existing appointment
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  })

  return overlappingAppointments.length === 0
}

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view appointments
    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
      include: {
        artists: {
          where: { artistId: user.id },
        },
      },
    })

    if (!shop || (shop.ownerId !== user.id && shop.artists.length === 0)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        shopId: params.shopId,
        ...(user.role === 'ARTIST' ? { artistId: user.id } : {}),
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== 'SHOP_OWNER' && user.role !== 'ARTIST')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
      include: {
        artists: {
          where: { artistId: user.id },
        },
      },
    })

    if (!shop || (shop.ownerId !== user.id && shop.artists.length === 0)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = appointmentSchema.parse(data)

    // Check artist availability
    const startTime = new Date(validatedData.startTime)
    const endTime = new Date(validatedData.endTime)
    
    const isAvailable = await checkArtistAvailability(
      validatedData.artistId,
      startTime,
      endTime
    )

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Artist is not available during the selected time slot' },
        { status: 400 }
      )
    }

    // Find or create client
    const client = await prisma.user.findUnique({
      where: { email: validatedData.clientEmail },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found. Please ask them to create an account first.' },
        { status: 404 }
      )
    }

    // Check if artist belongs to the shop
    const artist = await prisma.shopsOnArtists.findUnique({
      where: {
        shopId_artistId: {
          shopId: params.shopId,
          artistId: validatedData.artistId,
        },
      },
      include: {
        artist: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist is not associated with this shop' },
        { status: 400 }
      )
    }

    // Check if service belongs to the shop
    const service = await prisma.service.findFirst({
      where: {
        id: validatedData.serviceId,
        shopId: params.shopId,
      },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        title: validatedData.title,
        startTime: new Date(validatedData.startTime),
        endTime: new Date(validatedData.endTime),
        notes: validatedData.notes,
        status: 'PENDING',
        shop: { connect: { id: params.shopId } },
        artist: { connect: { id: validatedData.artistId } },
        client: { connect: { id: client.id } },
        service: { connect: { id: validatedData.serviceId } },
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
        shop: true,
      },
    })

    // Send confirmation email to client
    await sendAppointmentConfirmation({
      appointmentTitle: appointment.title,
      shopName: appointment.shop.name,
      artistName: appointment.artist.name || appointment.artist.email,
      clientName: appointment.client.name || 'Valued Client',
      clientEmail: appointment.client.email,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      serviceName: appointment.service.name,
      price: appointment.service.price,
      notes: appointment.notes || undefined,
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error creating appointment:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { shopId: string; appointmentId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || (user.role !== 'SHOP_OWNER' && user.role !== 'ARTIST')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
      include: {
        artists: {
          where: { artistId: user.id },
        },
      },
    })

    if (!shop || (shop.ownerId !== user.id && shop.artists.length === 0)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = updateSchema.parse(data)

    if (validatedData.startTime && validatedData.endTime && validatedData.artistId) {
      const startTime = new Date(validatedData.startTime)
      const endTime = new Date(validatedData.endTime)
      
      const isAvailable = await checkArtistAvailability(
        validatedData.artistId,
        startTime,
        endTime,
        params.appointmentId // Exclude current appointment from check
      )

      if (!isAvailable) {
        return NextResponse.json(
          { error: 'Artist is not available during the selected time slot' },
          { status: 400 }
        )
      }
    }

    // ... rest of the existing code ...
  } catch (error) {
    // ... existing error handling ...
  }
} 