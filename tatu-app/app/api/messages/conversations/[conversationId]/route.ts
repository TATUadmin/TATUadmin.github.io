import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/conversations/[conversationId] - Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId } = params

    const thread = await prisma.messageThread.findFirst({
      where: {
        id: conversationId,
        userId: session.user.id,
      },
    })

    if (!thread) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messages = await prisma.unifiedMessage.findMany({
      where: {
        userId: session.user.id,
        threadId: conversationId,
      },
      orderBy: { receivedAt: 'asc' },
    })

    const mappedMessages = messages.map((message) => {
      const isSent =
        message.sender === session.user.id || message.sender === session.user.email
      return {
        id: message.id,
        senderId: message.sender,
        senderName: message.senderName || message.sender || 'Unknown',
        content: message.content,
        timestamp: message.receivedAt.toISOString(),
        isRead: message.status === 'READ',
        isSent,
      }
    })

    return NextResponse.json({ messages: mappedMessages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

