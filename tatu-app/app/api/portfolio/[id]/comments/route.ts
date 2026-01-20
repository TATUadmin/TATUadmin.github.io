import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// Get comments for a portfolio item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        itemId: params.id,
        parentId: null // Only get top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            artistProfile: {
              select: {
                avatar: true
              }
            },
            customerProfile: {
              select: {
                avatar: true
              }
            }
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                artistProfile: {
                  select: {
                    avatar: true
                  }
                },
                customerProfile: {
                  select: {
                    avatar: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// Add a new comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, parentId } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        itemId: params.id,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            artistProfile: {
              select: {
                avatar: true
              }
            },
            customerProfile: {
              select: {
                avatar: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
} 