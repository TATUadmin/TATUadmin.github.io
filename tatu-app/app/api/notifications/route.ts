import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createNotificationSchema = z.object({
  type: z.enum(['booking', 'message', 'review', 'payment', 'like', 'follow', 'system']),
  title: z.string().min(1),
  message: z.string().min(1),
  userId: z.string(),
  actionUrl: z.string().optional(),
  metadata: z.record(z.any()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createNotificationSchema.parse(body)

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        message: validatedData.message,
        userId: validatedData.userId,
        actionUrl: validatedData.actionUrl,
        metadata: validatedData.metadata,
        read: false
      }
    })

    // TODO: Send real-time notification via WebSocket
    // This would typically trigger a WebSocket event to the user
    console.log('Notification created:', notification.id)

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timestamp: notification.createdAt.toISOString(),
        read: notification.read,
        actionUrl: notification.actionUrl
      }
    })

  } catch (error) {
    console.error('Error creating notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where = {
      userId: session.user.id,
      ...(unreadOnly && { read: false })
    }

    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.notification.count({ where })
    ])

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timestamp: n.createdAt.toISOString(),
        read: n.read,
        actionUrl: n.actionUrl,
        metadata: n.metadata
      })),
      totalCount,
      hasMore: offset + limit < totalCount
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
