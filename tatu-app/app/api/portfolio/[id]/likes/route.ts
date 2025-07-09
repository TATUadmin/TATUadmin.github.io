import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// Get like status and count
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    const [likeCount, userLike] = await Promise.all([
      prisma.like.count({
        where: { itemId: params.id }
      }),
      userId
        ? prisma.like.findUnique({
            where: {
              userId_itemId: {
                userId,
                itemId: params.id
              }
            }
          })
        : null
    ])

    return NextResponse.json({
      count: likeCount,
      isLiked: !!userLike
    })
  } catch (error) {
    console.error('Error fetching likes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch likes' },
      { status: 500 }
    )
  }
}

// Toggle like status
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const itemId = params.id

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId
        }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_itemId: {
            userId,
            itemId
          }
        }
      })
      return NextResponse.json({ isLiked: false })
    } else {
      await prisma.like.create({
        data: {
          userId,
          itemId
        }
      })
      return NextResponse.json({ isLiked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 