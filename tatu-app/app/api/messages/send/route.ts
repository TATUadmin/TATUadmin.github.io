import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// POST /api/messages/send - Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { conversationId, content } = body

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      )
    }

    const thread = await prisma.messageThread.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const now = new Date()
    const createdMessage = await prisma.unifiedMessage.create({
      data: {
        userId: session.user.id,
        platform: 'INTERNAL',
        sender: session.user.id,
        senderName: session.user.name || session.user.email || 'You',
        content: content.trim(),
        status: 'READ',
        receivedAt: now,
        threadId: thread.id,
      },
    })

    await prisma.messageThread.update({
      where: { id: thread.id },
      data: {
        lastMessageAt: now,
        updatedAt: now,
      },
    })

    return NextResponse.json(
      {
        id: createdMessage.id,
        senderId: createdMessage.sender,
        senderName: createdMessage.senderName || 'You',
        content: createdMessage.content,
        timestamp: createdMessage.receivedAt.toISOString(),
        isRead: true,
        isSent: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

