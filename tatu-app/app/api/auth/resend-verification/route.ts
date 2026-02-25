import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWelcomeEmail } from '@/lib/email-service'
import { generateSecureToken } from '@/lib/security'
import { randomUUID } from 'crypto'
import { z } from 'zod'

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a verification email was sent.' })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email is already verified.' })
    }

    const token = generateSecureToken(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { email: user.email } }),
      prisma.verificationToken.create({
        data: {
          id: randomUUID(),
          token,
          email: user.email,
          expires,
        },
      }),
    ])

    const result = await sendWelcomeEmail(user.email, user.name || 'User', token)
    if (!result.success) {
      return NextResponse.json(
        { message: 'Could not send verification email right now. Please try again shortly.' },
        { status: 503 }
      )
    }

    return NextResponse.json({ message: 'Verification email sent successfully.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 })
    }

    console.error('Resend verification error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
