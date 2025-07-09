import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: params.id }
    })

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if the item belongs to the user
    if (portfolioItem.userId !== (await prisma.user.findUnique({ where: { email: session.user.email } }))?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(portfolioItem)
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: params.id }
    })

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if the item belongs to the user
    if (portfolioItem.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, description, imageUrl, tags, style } = await request.json()

    if (!title || !imageUrl || !style) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const updatedItem = await prisma.portfolioItem.update({
      where: { id: params.id },
      data: {
        title,
        description,
        imageUrl,
        tags,
        style
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to update portfolio item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: params.id }
    })

    if (!portfolioItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check if the item belongs to the user
    if (portfolioItem.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.portfolioItem.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Portfolio item deleted successfully' })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to delete portfolio item' },
      { status: 500 }
    )
  }
} 