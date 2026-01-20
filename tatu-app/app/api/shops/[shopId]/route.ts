import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const shopSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  instagram: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'INACTIVE']).optional(),
})

export async function GET(
  req: Request,
  { params }: { params: { shopId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                email: true,
                artistProfile: {
                  select: {
                    avatar: true,
                    specialties: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                artistProfile: {
                  select: {
                    avatar: true,
                  },
                },
                customerProfile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        services: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        appointments: {
          where: {
            startTime: {
              gte: new Date(),
            },
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
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            artists: true,
            appointments: true,
            reviews: true,
          },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    const validatedData = shopSchema.parse(data)

    const updatedShop = await prisma.shop.update({
      where: { id: params.shopId },
      data: validatedData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        artists: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                email: true,
                artistProfile: {
                  select: {
                    avatar: true,
                    specialties: true,
                  },
                },
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                artistProfile: {
                  select: {
                    avatar: true,
                  },
                },
                customerProfile: {
                  select: {
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        services: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        appointments: {
          where: {
            startTime: {
              gte: new Date(),
            },
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
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        _count: {
          select: {
            artists: true,
            appointments: true,
            reviews: true,
          },
        },
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error('Error updating shop:', error)

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

    if (!user || user.role !== 'SHOP_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const shop = await prisma.shop.findUnique({
      where: { id: params.shopId },
    })

    if (!shop || shop.ownerId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.shop.delete({
      where: { id: params.shopId },
    })

    return NextResponse.json({ message: 'Shop deleted successfully' })
  } catch (error) {
    console.error('Error deleting shop:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 