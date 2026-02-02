import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { PortfolioItem } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface ItemWithCounts extends PortfolioItem {
  _count: {
    likes: number
    comments: number
  }
}

interface ItemResponse extends Omit<PortfolioItem, 'userId'> {
  likes: number
  comments: number
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured') === 'true'
    const collectionId = searchParams.get('collectionId')
    const style = searchParams.get('style')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)

    const where = {
      userId: session.user.id!,
      ...(featured && { featured: true }),
      ...(collectionId && { collectionId }),
      ...(style && { style }),
      ...(tags?.length && { tags: { hasEvery: tags } }),
    }

    const items = await prisma.portfolioItem.findMany({
      where,
      include: {
        _count: {
          select: {
            Like: true,
            Comment: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    const response: ItemResponse[] = items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.tags,
      style: item.style,
      featured: item.featured,
      order: item.order,
      collectionId: item.collectionId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      likes: item._count.Like,
      comments: item._count.Comment,
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
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

    const { title, description, imageUrl, tags, style, collectionId, featured } =
      await request.json()

    if (!title || !imageUrl || !style) {
      return NextResponse.json(
        { error: 'Title, image, and style are required' },
        { status: 400 }
      )
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        imageUrl,
        tags: tags || [],
        style,
        featured: featured || false,
        collectionId,
        userId: session.user.id!,
      },
      include: {
        _count: {
          select: {
            Like: true,
            Comment: true,
          },
        },
      },
    })

    const response: ItemResponse = {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.tags,
      style: item.style,
      featured: item.featured,
      order: item.order,
      collectionId: item.collectionId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      likes: item._count.Like,
      comments: item._count.Comment,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, ...data } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id },
    })

    if (!existingItem || existingItem.userId !== session.user.id!) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    const item = await prisma.portfolioItem.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            Like: true,
            Comment: true,
          },
        },
      },
    })

    const response: ItemResponse = {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      tags: item.tags,
      style: item.style,
      featured: item.featured,
      order: item.order,
      collectionId: item.collectionId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      likes: item._count.Like,
      comments: item._count.Comment,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const existingItem = await prisma.portfolioItem.findUnique({
      where: { id },
    })

    if (!existingItem || existingItem.userId !== session.user.id!) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.portfolioItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    )
  }
} 