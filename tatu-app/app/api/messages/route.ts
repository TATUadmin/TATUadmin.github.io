import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// GET /api/messages - Get messages for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      userId: session.user.id,
    }

    if (platform) {
      where.platform = platform
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    const [messages, total] = await Promise.all([
      prisma.unifiedMessage.findMany({
        where,
        include: {
          attachments: true,
          thread: {
            select: {
              id: true,
              subject: true,
              participants: true,
            },
          },
        },
        orderBy: {
          receivedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.unifiedMessage.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send a message or reply
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { platform, recipient, content, threadId, replyToId } = body

    if (!platform || !recipient || !content) {
      return NextResponse.json(
        { error: 'Platform, recipient, and content are required' },
        { status: 400 }
      )
    }

    let resolvedThreadId = threadId as string | undefined
    const now = new Date()

    if (resolvedThreadId) {
      const existingThread = await prisma.messageThread.findFirst({
        where: {
          id: resolvedThreadId,
          userId: session.user.id,
        },
      })

      if (!existingThread) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        )
      }
    } else {
      const newThread = await prisma.messageThread.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          subject: null,
          participants: [session.user.id, recipient],
          lastMessageAt: now,
          createdAt: now,
          updatedAt: now,
        },
      })
      resolvedThreadId = newThread.id
    }

    const message = await prisma.unifiedMessage.create({
      data: {
        userId: session.user.id,
        platform,
        sender: session.user.id,
        senderName: session.user.name || session.user.email || 'You',
        content,
        status: 'READ', // Sent messages are automatically read
        receivedAt: now,
        threadId: resolvedThreadId,
      },
      include: {
        attachments: true,
      },
    })

    await prisma.messageThread.update({
      where: { id: resolvedThreadId },
      data: {
        lastMessageAt: now,
        updatedAt: now,
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PATCH /api/messages - Update message (mark as read, archive, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, status, labels } = body

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Verify message ownership
    const message = await prisma.unifiedMessage.findUnique({
      where: { id: messageId },
    })

    if (!message || message.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    const updates: any = {}
    if (status) updates.status = status
    if (labels) updates.labels = labels

    const updatedMessage = await prisma.unifiedMessage.update({
      where: { id: messageId },
      data: updates,
    })

    return NextResponse.json({ message: updatedMessage })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/messages?id=<messageId> - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Verify message ownership
    const message = await prisma.unifiedMessage.findUnique({
      where: { id: messageId },
    })

    if (!message || message.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Soft delete by marking as DELETED
    await prisma.unifiedMessage.update({
      where: { id: messageId },
      data: {
        status: 'DELETED',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
