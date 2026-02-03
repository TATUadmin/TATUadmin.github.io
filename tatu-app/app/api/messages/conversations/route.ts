import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/messages/conversations - Get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const threads = await prisma.messageThread.findMany({
      where: { userId: session.user.id },
      orderBy: { lastMessageAt: 'desc' },
    })

    if (threads.length === 0) {
      return NextResponse.json({ conversations: [] })
    }

    const threadIds = threads.map(thread => thread.id)
    const participantIdentifiers = new Set<string>()
    threads.forEach((thread) => {
      thread.participants.forEach((participant) => {
        if (participant !== session.user.id && participant !== session.user.email) {
          participantIdentifiers.add(participant)
        }
      })
    })

    const participantList = Array.from(participantIdentifiers)
    const participants = participantList.length
      ? await prisma.user.findMany({
          where: {
            OR: [
              { id: { in: participantList } },
              { email: { in: participantList } },
            ],
          },
          select: {
            id: true,
            email: true,
            name: true,
            artistProfile: { select: { avatar: true } },
            customerProfile: { select: { avatar: true } },
          },
        })
      : []

    const participantLookup = new Map(
      participants.flatMap((participant) => {
        const avatar = participant.artistProfile?.avatar || participant.customerProfile?.avatar
        return [
          [participant.id, { name: participant.name, avatar }],
          [participant.email, { name: participant.name, avatar }],
        ]
      })
    )
    const latestMessages = await prisma.unifiedMessage.findMany({
      where: {
        userId: session.user.id,
        threadId: { in: threadIds },
      },
      orderBy: { receivedAt: 'desc' },
    })

    const latestByThread = new Map<string, typeof latestMessages[number]>()
    for (const message of latestMessages) {
      if (message.threadId && !latestByThread.has(message.threadId)) {
        latestByThread.set(message.threadId, message)
      }
    }

    const unreadCounts = await prisma.unifiedMessage.groupBy({
      by: ['threadId'],
      where: {
        userId: session.user.id,
        status: 'UNREAD',
        threadId: { in: threadIds },
      },
      _count: { _all: true },
    })

    const unreadCountByThread = new Map(
      unreadCounts.map(item => [item.threadId, item._count._all])
    )

    const conversations = threads.map((thread) => {
      const latestMessage = latestByThread.get(thread.id)
      const participant =
        thread.participants.find(p => p !== session.user.id && p !== session.user.email) ||
        thread.participants[0] ||
        latestMessage?.senderName ||
        latestMessage?.sender ||
        'Unknown User'
      const participantProfile = participantLookup.get(participant)

      return {
        id: thread.id,
        participantId: participant,
        participantName: participantProfile?.name || participant,
        participantAvatar: participantProfile?.avatar,
        lastMessage: latestMessage?.content || 'No messages yet',
        lastMessageTime: (latestMessage?.receivedAt || thread.lastMessageAt).toISOString(),
        unreadCount: unreadCountByThread.get(thread.id) || 0,
      }
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

