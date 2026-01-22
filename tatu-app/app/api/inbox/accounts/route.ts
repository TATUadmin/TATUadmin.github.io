import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MessagePlatform } from '@prisma/client'
import { z } from 'zod'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

// Encryption helpers
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const IV_LENGTH = 16

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

function decrypt(text: string) {
  const [ivHex, authTagHex, encryptedHex] = text.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv)
  decipher.setAuthTag(authTag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString()
}

const connectAccountSchema = z.object({
  platform: z.enum(['EMAIL', 'INSTAGRAM', 'FACEBOOK', 'X_TWITTER']),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  accountId: z.string(),
  tokenExpiry: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const validatedData = connectAccountSchema.parse(data)

    // Encrypt sensitive data
    const encryptedAccessToken = encrypt(validatedData.accessToken)
    const encryptedRefreshToken = validatedData.refreshToken ? encrypt(validatedData.refreshToken) : null

    // Create or update connected account
    const account = await prisma.connectedAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: validatedData.platform as MessagePlatform,
        },
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: validatedData.tokenExpiry ? new Date(validatedData.tokenExpiry) : null,
        accountId: validatedData.accountId,
      },
      create: {
        userId: session.user.id,
        platform: validatedData.platform as MessagePlatform,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: validatedData.tokenExpiry ? new Date(validatedData.tokenExpiry) : null,
        accountId: validatedData.accountId,
      },
    })

    return NextResponse.json({
      id: account.id,
      platform: account.platform,
      accountId: account.accountId,
      lastSynced: account.lastSynced,
    })
  } catch (error) {
    console.error('Error connecting account:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.connectedAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        platform: true,
        accountId: true,
        lastSynced: true,
        createdAt: true,
      },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching connected accounts:', error)
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
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // Verify ownership and delete
    const account = await prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.connectedAccount.delete({
      where: { id: accountId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting connected account:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 