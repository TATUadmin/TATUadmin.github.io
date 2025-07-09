import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').optional(),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  artistId: z.string().optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { shopId: string; serviceId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!service || service.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { shopId: string; serviceId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
      include: {
        shop: true,
      },
    })

    if (!service || service.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = updateSchema.parse(data)

    // If artistId is provided, verify they belong to the shop
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

    const updatedService = await prisma.service.update({
      where: { id: params.serviceId },
      data: {
        ...validatedData,
        ...(validatedData.artistId && {
          artist: { connect: { id: validatedData.artistId } },
        }),
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Error updating service:', error)

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
  { params }: { params: { shopId: string; serviceId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.serviceId },
      include: {
        shop: true,
      },
    })

    if (!service || service.shopId !== params.shopId) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (service.shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.service.delete({
      where: { id: params.serviceId },
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 