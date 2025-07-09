import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MessagePlatform, MessageStatus } from '@prisma/client'
import { z } from 'zod'

const messageQuerySchema = z.object({
  platform: z.enum(['EMAIL', 'INSTAGRAM', 'FACEBOOK', 'X_TWITTER', 'INTERNAL']).optional(),
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED', 'DELETED']).optional(),
  search: z.string().optional(),
  threadId: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

const updateMessageSchema = z.object({
  status: z.enum(['READ', 'ARCHIVED', 'DELETED']).optional(),
  labels: z.array(z.string()).optional(),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = messageQuerySchema.parse(Object.fromEntries(searchParams))

    const where = {
      userId: session.user.id,
      ...(query.platform && { platform: query.platform }),
      ...(query.status && { status: query.status }),
      ...(query.threadId && { threadId: query.threadId }),
      ...(query.search && {
        OR: [
          { subject: { contains: query.search, mode: 'insensitive' } },
          { content: { contains: query.search, mode: 'insensitive' } },
          { sender: { contains: query.search, mode: 'insensitive' } },
          { senderName: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    }

    const page = query.page || 1
    const limit = query.limit || 20
    const skip = (page - 1) * limit

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
              lastMessageAt: true,
            },
          },
        },
        orderBy: { receivedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.unifiedMessage.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const data = await request.json()
    const validatedData = updateMessageSchema.parse(data)

    // Verify ownership and update
    const message = await prisma.unifiedMessage.findFirst({
      where: {
        id: messageId,
        userId: session.user.id,
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const updatedMessage = await prisma.unifiedMessage.update({
      where: { id: messageId },
      data: validatedData,
      include: {
        attachments: true,
        thread: {
          select: {
            id: true,
            subject: true,
            participants: true,
            lastMessageAt: true,
          },
        },
      },
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating message:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('id')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Verify ownership and delete
    const message = await prisma.unifiedMessage.findFirst({
      where: {
        id: messageId,
        userId: session.user.id,
      },
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    await prisma.unifiedMessage.delete({
      where: { id: messageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 