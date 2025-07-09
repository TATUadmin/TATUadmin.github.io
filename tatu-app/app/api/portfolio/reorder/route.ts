import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
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

    const { items } = await request.json()

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Update all items in a transaction
    await prisma.$transaction(
      items.map((item, index) => 
        prisma.portfolioItem.update({
          where: {
            id: item.id,
            userId: user.id // Ensure user owns the item
          },
          data: {
            order: index,
            collectionId: item.collectionId
          }
        })
      )
    )

    return NextResponse.json({ message: 'Items reordered successfully' })
  } catch (error) {
    console.error('Error reordering items:', error)
    return NextResponse.json(
      { error: 'Failed to reorder items' },
      { status: 500 }
    )
  }
} 