import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { cacheService } from '@/lib/cache'
import { CacheTags, CacheKeyGenerators } from '@/lib/cache'
import { addEmailJob } from '@/lib/background-jobs'

const prisma = new PrismaClient()

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.messaging.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext
  const { searchParams } = new URL(request.url)
  
  const conversationId = searchParams.get('conversationId')
  const recipientId = searchParams.get('recipientId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const unreadOnly = searchParams.get('unreadOnly') === 'true'

  // Generate cache key
  const cacheKey = CacheKeyGenerators.search('messages', {
    userId: user.id,
    conversationId,
    recipientId,
    page,
    limit,
    unreadOnly
  })

  // Try to get from cache
  if (cacheService) {
    const cached = await cacheService.get(cacheKey)
    if (cached) {
      return ApiResponse.success(cached, 200, { requestId })
    }
  }

  try {
    let messages: any[] = []
    let total = 0

    if (conversationId) {
      // Get messages for specific conversation
      const where: any = {
        conversationId: conversationId,
        OR: [
          { senderId: user.id },
          { recipientId: user.id }
        ]
      }

      if (unreadOnly) {
        where.readAt = null
        where.recipientId = user.id
      }

      [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatar: true
                  }
                }
              }
            },
            recipient: {
              select: {
                id: true,
                name: true,
                profile: {
                  select: {
                    avatar: true
                  }
                }
              }
            },
            conversation: {
              select: {
                id: true,
                subject: true,
                participants: {
                  select: {
                    id: true,
                    name: true,
                    profile: {
                      select: {
                        avatar: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit
        }),
        prisma.message.count({ where })
      ])

    } else if (recipientId) {
      // Get conversation between two users
      const conversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              id: {
                in: [user.id, recipientId]
              }
            }
          }
        }
      })

      if (conversation) {
        const where: any = {
          conversationId: conversation.id
        }

        if (unreadOnly) {
          where.readAt = null
          where.recipientId = user.id
        }

        [messages, total] = await Promise.all([
          prisma.message.findMany({
            where,
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      avatar: true
                    }
                  }
                }
              },
              recipient: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      avatar: true
                    }
                  }
                }
              },
              conversation: {
                select: {
                  id: true,
                  subject: true,
                  participants: {
                    select: {
                      id: true,
                      name: true,
                      profile: {
                        select: {
                          avatar: true
                        }
                      }
                    }
                  }
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: (page - 1) * limit
          }),
          prisma.message.count({ where })
        ])
      }

    } else {
      // Get all conversations for user
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              id: user.id
            }
          }
        },
        include: {
          participants: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatar: true
                }
              }
            }
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profile: {
                    select: {
                      avatar: true
                    }
                  }
                }
              }
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      })

      messages = conversations.map(conv => ({
        id: conv.id,
        subject: conv.subject,
        participants: conv.participants,
        lastMessage: conv.messages[0] || null,
        messageCount: conv._count.messages,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt
      }))

      total = await prisma.conversation.count({
        where: {
          participants: {
            some: {
              id: user.id
            }
          }
        }
      })
    }

    const result = {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }

    // Cache the result
    if (cacheService) {
      await cacheService.set(cacheKey, result, 60, [CacheTags.MESSAGE]) // 1 minute
    }

    return ApiResponse.paginated(messages, {
      page,
      limit,
      total
    }, { requestId })

  } catch (error) {
    logger.error('Messages fetch error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      conversationId,
      recipientId
    })

    return ApiResponse.internalError(
      'Failed to fetch messages',
      process.env.NODE_ENV === 'development' ? error : undefined,
      { requestId }
    )
  }
})

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.messaging.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Validate request data
  const body = await request.json()
  const validationResult = ValidationSchemas.Message.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const {
    recipientId,
    subject,
    content,
    attachments,
    priority
  } = validationResult.data

  // Verify recipient exists
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    include: {
      profile: true
    }
  })

  if (!recipient) {
    return ApiResponse.notFound('Recipient', { requestId })
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          id: {
            in: [user.id, recipientId]
          }
        }
      }
    },
    include: {
      participants: true
    }
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        subject: subject || 'New Conversation',
        participants: {
          connect: [
            { id: user.id },
            { id: recipientId }
          ]
        }
      },
      include: {
        participants: true
      }
    })
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: user.id,
      recipientId: recipientId,
      subject: subject || conversation.subject,
      content,
      attachments: attachments || [],
      priority: priority || 'NORMAL',
      status: 'SENT'
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      },
      recipient: {
        select: {
          id: true,
          name: true,
          profile: {
            select: {
              avatar: true
            }
          }
        }
      },
      conversation: {
        select: {
          id: true,
          subject: true,
          participants: {
            select: {
              id: true,
              name: true,
              profile: {
                select: {
                  avatar: true
                }
              }
            }
          }
        }
      }
    }
  })

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() }
  })

  // Invalidate cache
  if (cacheService) {
    await cacheService.invalidateByTags([CacheTags.MESSAGE])
  }

  // Send email notification if recipient has email notifications enabled
  if (recipient.profile?.emailNotifications !== false) {
    await addEmailJob('notification', recipient.email, recipient.name || 'User', {
      title: `New message from ${user.name || 'Someone'}`,
      message: content,
      actionUrl: `${process.env.NEXTAUTH_URL}/inbox?conversation=${conversation.id}`,
      actionText: 'View Message'
    })
  }

  // Log business event
  logger.logBusinessEvent('message_sent', {
    messageId: message.id,
    senderId: user.id,
    recipientId: recipientId,
    conversationId: conversation.id,
    priority: message.priority
  }, request)

  return ApiResponse.success({
    id: message.id,
    subject: message.subject,
    content: message.content,
    attachments: message.attachments,
    priority: message.priority,
    status: message.status,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      name: message.sender.name || 'Unknown',
      avatar: message.sender.profile?.avatar || ''
    },
    recipient: {
      id: message.recipient.id,
      name: message.recipient.name || 'Unknown',
      avatar: message.recipient.profile?.avatar || ''
    },
    conversation: {
      id: message.conversation.id,
      subject: message.conversation.subject,
      participants: message.conversation.participants
    }
  }, 201, { requestId })
})
