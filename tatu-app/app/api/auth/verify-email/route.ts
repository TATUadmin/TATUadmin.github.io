import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing verification token' },
        { status: 400 }
      )
    }

    // Find and validate the verification token
    console.log('=== EMAIL VERIFICATION ===')
    console.log('Token received:', token ? token.substring(0, 10) + '...' : 'null')
    
    let verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    })

    if (!verificationToken) {
      // Log for debugging
      console.error('Token not found. Checking database...')
      const allTokens = await prisma.verificationToken.findMany({
        take: 10,
        select: { 
          token: true, 
          email: true, 
          expires: true,
          createdAt: true 
        },
        orderBy: { createdAt: 'desc' }
      })
      console.log('Total tokens in database:', allTokens.length)
      console.log('Recent tokens:', allTokens.map(t => ({
        email: t.email,
        expires: t.expires,
        tokenPreview: t.token.substring(0, 10) + '...'
      })))
      
      return NextResponse.json(
        { error: 'Invalid verification token. The token may have expired or already been used.' },
        { status: 400 }
      )
    }
    
    console.log('Token found for email:', verificationToken.email)
    console.log('Token expires:', verificationToken.expires)

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      })
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update user's email verification status
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    })

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    })

    return NextResponse.json({
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 