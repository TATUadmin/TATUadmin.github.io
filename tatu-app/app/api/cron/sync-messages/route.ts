import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MessagePlatform, MessageStatus, Prisma, PrismaClient } from '@prisma/client'
import { decrypt } from '@/lib/encryption'
import { google } from 'googleapis'
import { Client } from '@microsoft/microsoft-graph-client'
import { Instagram } from 'instagram-web-api'
import { TwitterApi } from 'twitter-api-v2'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { subHours } from 'date-fns'

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 requests per minute
})

// Initialize API clients
const gmail = google.gmail('v1')
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL
)

interface InstagramMessage {
  item_id: string
  text: string
  timestamp: number
  user_id: string
}

interface InstagramThread {
  thread_id: string
  users: Array<{
    username: string
    full_name: string
  }>
  items: InstagramMessage[]
}

type ConnectedAccountWithUser = Prisma.ConnectedAccountGetPayload<{
  include: { user: { select: { id: true } } }
}>

async function syncGmailMessages(account: ConnectedAccountWithUser) {
  try {
    oauth2Client.setCredentials({
      access_token: decrypt(account.accessToken),
      refresh_token: account.refreshToken ? decrypt(account.refreshToken) : undefined,
    })

    // Get messages from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${yesterday.getTime() / 1000}`,
    })

    const messages = response.data.messages || []
    
    for (const msg of messages) {
      const fullMessage = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      })

      const headers = fullMessage.data.payload?.headers
      const subject = headers?.find(h => h.name === 'Subject')?.value || ''
      const from = headers?.find(h => h.name === 'From')?.value || ''
      const to = headers?.find(h => h.name === 'To')?.value || ''
      const date = new Date(parseInt(fullMessage.data.internalDate!))

      // Extract email and name from From field
      const fromMatch = from.match(/(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/)
      const senderName = fromMatch?.[1] || ''
      const senderEmail = fromMatch?.[2] || from

      // Get message content
      const content = fullMessage.data.snippet || ''

      // Create or update thread
      const threadId = fullMessage.data.threadId!
      let thread = await prisma.messageThread.findUnique({
        where: { externalId: threadId },
      })

      if (!thread) {
        thread = await prisma.messageThread.create({
          data: {
            externalId: threadId,
            platform: MessagePlatform.EMAIL,
            subject,
          },
        })
      }

      // Create message
      await prisma.unifiedMessage.create({
        data: {
          externalId: msg.id!,
          platform: MessagePlatform.EMAIL,
          subject,
          content,
          senderName,
          senderEmail,
          recipientEmail: to,
          unread: fullMessage.data.labelIds?.includes('UNREAD') || false,
          createdAt: date,
          userId: account.userId,
          threadId: thread.id,
        },
      })
    }

    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { lastSynced: new Date() },
    })
  } catch (error) {
    console.error('Error syncing Gmail messages:', error)
    throw error
  }
}

async function syncInstagramMessages(account: ConnectedAccountWithUser) {
  try {
    const client = new Instagram({
      username: account.accountId,
      password: decrypt(account.accessToken),
    })

    await client.login()
    const inbox = await client.getDirectInbox()

    for (const thread of inbox.threads as InstagramThread[]) {
      // Create or update thread
      let messageThread = await prisma.messageThread.findFirst({
        where: {
          userId: account.userId,
          messages: {
            some: {
              externalId: thread.thread_id,
              platform: 'INSTAGRAM',
            },
          },
        },
      })

      if (!messageThread) {
        messageThread = await prisma.messageThread.create({
          data: {
            userId: account.userId,
            participants: thread.users.map(u => u.username),
            lastMessageAt: new Date(thread.items[0]?.timestamp * 1000 || Date.now()),
          },
        })
      }

      // Process messages
      for (const item of thread.items) {
        // Check if message already exists
        const existingMessage = await prisma.unifiedMessage.findFirst({
          where: {
            userId: account.userId,
            platform: 'INSTAGRAM',
            externalId: item.item_id,
          },
        })

        if (existingMessage) continue

        const sender = thread.users.find(u => u.username === item.user_id)

        await prisma.unifiedMessage.create({
          data: {
            userId: account.userId,
            platform: 'INSTAGRAM',
            externalId: item.item_id,
            sender: sender?.username || 'unknown',
            senderName: sender?.full_name,
            content: item.text,
            receivedAt: new Date(item.timestamp * 1000),
            status: 'UNREAD',
            threadId: messageThread.id,
          },
        })

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { lastSynced: new Date() },
    })
  } catch (error) {
    console.error('Error syncing Instagram messages:', error)
    throw error
  }
}

async function syncTwitterMessages(account: ConnectedAccountWithUser) {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: decrypt(account.accessToken),
      accessSecret: decrypt(account.refreshToken!),
    })

    const messages = await client.v1.listDirectMessages()

    // Group messages by conversation
    const conversations = new Map<string, any[]>()
    for (const msg of messages) {
      const conversationId = msg.conversation_id || msg.id
      if (!conversations.has(conversationId)) {
        conversations.set(conversationId, [])
      }
      conversations.get(conversationId)!.push(msg)
    }

    // Process each conversation
    for (const [conversationId, msgs] of conversations) {
      // Create or update thread
      let messageThread = await prisma.messageThread.findFirst({
        where: {
          userId: account.userId,
          messages: {
            some: {
              externalId: conversationId,
              platform: 'X_TWITTER',
            },
          },
        },
      })

      if (!messageThread) {
        const participants = [...new Set(msgs.map(m => m.message_create.sender_id))]
        messageThread = await prisma.messageThread.create({
          data: {
            userId: account.userId,
            participants,
            lastMessageAt: new Date(Number(msgs[0].created_timestamp)),
          },
        })
      }

      // Process messages
      for (const msg of msgs) {
        // Check if message already exists
        const existingMessage = await prisma.unifiedMessage.findFirst({
          where: {
            userId: account.userId,
            platform: 'X_TWITTER',
            externalId: msg.id,
          },
        })

        if (existingMessage) continue

        await prisma.unifiedMessage.create({
          data: {
            userId: account.userId,
            platform: 'X_TWITTER',
            externalId: msg.id,
            sender: msg.message_create.sender_id,
            content: msg.message_create.message_data.text,
            receivedAt: new Date(Number(msg.created_timestamp)),
            status: 'UNREAD',
            threadId: messageThread.id,
          },
        })

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    await prisma.connectedAccount.update({
      where: { id: account.id },
      data: { lastSynced: new Date() },
    })
  } catch (error) {
    console.error('Error syncing Twitter messages:', error)
    throw error
  }
}

function parseEmailSender(from: string): [string | null, string] {
  const match = from.match(/"?([^"<]*)"?\s*<?([^>]*)>?/)
  if (match) {
    return [match[1].trim() || null, match[2].trim() || match[1].trim()]
  }
  return [null, from.trim()]
}

function extractEmailContent(message: any): string {
  let content = ''
  
  if (message.payload?.body?.data) {
    content = Buffer.from(message.payload.body.data, 'base64').toString()
  } else if (message.payload?.parts) {
    for (const part of message.payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        content = Buffer.from(part.body.data, 'base64').toString()
        break
      }
    }
  }

  return content
}

export async function GET() {
  try {
    // Rate limiting
    const { success } = await ratelimit.limit('sync_messages')
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Get accounts that haven't been synced in the last 15 minutes
    const accounts = await prisma.connectedAccount.findMany({
      where: {
        OR: [
          { lastSynced: null },
          { lastSynced: { lt: subHours(new Date(), 0.25) } },
        ],
      },
      include: {
        user: true,
      },
    })

    const results = []
    for (const account of accounts) {
      try {
        switch (account.platform) {
          case 'EMAIL':
            await syncGmailMessages(account)
            results.push({ platform: account.platform, status: 'success' })
            break
          case 'INSTAGRAM':
            await syncInstagramMessages(account)
            results.push({ platform: account.platform, status: 'success' })
            break
          case 'X_TWITTER':
            await syncTwitterMessages(account)
            results.push({ platform: account.platform, status: 'success' })
            break
        }
      } catch (error) {
        console.error(`Error syncing ${account.platform} messages:`, error)
        results.push({
          platform: account.platform,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      message: `Sync completed for ${accounts.length} accounts`,
      results,
    })
  } catch (error) {
    console.error('Error syncing messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 