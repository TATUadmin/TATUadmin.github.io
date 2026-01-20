import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email-service'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({
        message: 'If an account exists with this email, you will receive a password reset link.',
      })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Generate verification token ID
    const verificationTokenId = crypto.randomUUID()

    // Save reset token
    await prisma.verificationToken.create({
      data: {
        id: verificationTokenId,
        token,
        email: user.email,
        expires,
      },
    })

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name || 'User', token)

    return NextResponse.json({
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 