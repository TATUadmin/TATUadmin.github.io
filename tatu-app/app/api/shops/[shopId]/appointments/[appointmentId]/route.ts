import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendAppointmentConfirmation, sendAppointmentCancellation } from '@/lib/email'

const updateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  artistId: z.string().optional(),
  serviceId: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
})

export async function GET(
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
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

    if (!appointment || appointment.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if user has permission to view the appointment
    if (
      user.role !== 'SHOP_OWNER' &&
      appointment.artistId !== user.id &&
      appointment.clientId !== user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Error fetching appointment:', error)
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
      include: {
        shop: true,
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
    })

    if (!appointment || appointment.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if user has permission to update the appointment
    if (
      user.role !== 'SHOP_OWNER' &&
      appointment.artistId !== user.id &&
      appointment.clientId !== user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = updateSchema.parse(data)

    // If updating artist, check if they belong to the shop
    if (validatedData.artistId) {
      const artist = await prisma.shopsOnArtists.findUnique({
        where: {
          shopId_artistId: {
            shopId: params.shopId,
            artistId: validatedData.artistId,
          },
        },
      })

      if (!artist) {
        return NextResponse.json(
          { error: 'Artist is not associated with this shop' },
          { status: 400 }
        )
      }
    }

    // If updating service, check if it belongs to the shop
    if (validatedData.serviceId) {
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
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.appointmentId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.startTime && { startTime: new Date(validatedData.startTime) }),
        ...(validatedData.endTime && { endTime: new Date(validatedData.endTime) }),
        ...(validatedData.artistId && { artistId: validatedData.artistId }),
        ...(validatedData.serviceId && { serviceId: validatedData.serviceId }),
        ...(validatedData.notes && { notes: validatedData.notes }),
        ...(validatedData.status && { status: validatedData.status }),
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

    // Send appropriate email notifications based on status changes
    if (validatedData.status) {
      if (validatedData.status === 'CONFIRMED') {
        await sendAppointmentConfirmation({
          appointmentTitle: updatedAppointment.title,
          shopName: updatedAppointment.shop.name,
          artistName: updatedAppointment.artist.name || updatedAppointment.artist.email,
          clientName: updatedAppointment.client.name || 'Valued Client',
          clientEmail: updatedAppointment.client.email,
          startTime: updatedAppointment.startTime,
          endTime: updatedAppointment.endTime,
          serviceName: updatedAppointment.service.name,
          price: updatedAppointment.service.price,
          notes: updatedAppointment.notes || undefined,
        })
      } else if (validatedData.status === 'CANCELLED') {
        await sendAppointmentCancellation({
          appointmentTitle: updatedAppointment.title,
          shopName: updatedAppointment.shop.name,
          clientName: updatedAppointment.client.name || 'Valued Client',
          clientEmail: updatedAppointment.client.email,
          startTime: updatedAppointment.startTime,
        })
      }
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    console.error('Error updating appointment:', error)

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

export async function DELETE(
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

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.appointmentId },
      include: {
        shop: true,
      },
    })

    if (!appointment || appointment.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Only shop owners and the assigned artist can delete appointments
    if (user.role !== 'SHOP_OWNER' && appointment.artistId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.appointment.delete({
      where: { id: params.appointmentId },
    })

    // TODO: Send cancellation notifications to all parties

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 