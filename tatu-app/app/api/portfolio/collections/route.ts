import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { PortfolioCollection } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface CollectionWithCount extends PortfolioCollection {
  _count: {
    PortfolioItem: number
  }
}

interface CollectionResponse extends Omit<PortfolioCollection, 'userId'> {
  itemCount: number
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const collections = await prisma.portfolioCollection.findMany({
      where: {
        userId: session.user.id!,
      },
      include: {
        _count: {
          select: {
            PortfolioItem: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const response: CollectionResponse[] = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      itemCount: collection._count.PortfolioItem,
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, coverImage } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      )
    }

    const collection = await prisma.portfolioCollection.create({
      data: {
        name,
        description,
        coverImage,
        userId: session.user.id!,
      },
      include: {
        _count: {
          select: {
            PortfolioItem: true,
          },
        },
      },
    })

    const response: CollectionResponse = {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      coverImage: collection.coverImage,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
      itemCount: collection._count.PortfolioItem,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    )
  }
} 