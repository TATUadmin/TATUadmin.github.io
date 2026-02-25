import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateSecureToken } from '@/lib/security'
import { sendWelcomeEmail } from '@/lib/email-service'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { randomUUID } from 'crypto'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  role: z.enum(['CUSTOMER', 'ARTIST', 'SHOP_OWNER']).optional().default('CUSTOMER'),
  terms: z.boolean().refine((value: boolean) => value === true, 'You must accept the terms and conditions'),
  // Role-specific fields
  artistSpecialties: z.array(z.string()).optional(),
  shopName: z.string().optional(),
  shopAddress: z.string().optional(),
})

type SignUpData = z.infer<typeof signUpSchema>

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Validate input using Zod
    const validatedData = signUpSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password using enterprise-grade security (configurable salt rounds)
    const hashedPassword = await hashPassword(validatedData.password)

    // Persist user + profile + verification token atomically.
    const { user, token } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: randomUUID(),
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          role: validatedData.role,
          updatedAt: new Date(),
        },
      })

      if (validatedData.role === 'ARTIST' || validatedData.role === 'SHOP_OWNER') {
        await tx.artistProfile.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            specialties: validatedData.artistSpecialties || [],
            subscriptionTier: 'FREE',
            subscriptionStatus: 'ACTIVE',
          },
        })

        if (validatedData.role === 'SHOP_OWNER' && validatedData.shopName) {
          await tx.shop.create({
            data: {
              id: randomUUID(),
              name: validatedData.shopName,
              address: validatedData.shopAddress || '',
              city: '',
              state: '',
              zipCode: '',
              ownerId: user.id,
              updatedAt: new Date(),
            },
          })
        }
      } else if (validatedData.role === 'CUSTOMER') {
        await tx.customerProfile.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            preferredStyles: [],
          },
        })
      }

      const token = generateSecureToken(32)
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
      await tx.verificationToken.create({
        data: {
          id: randomUUID(),
          token,
          email: user.email,
          expires,
        },
      })

      return { user, token }
    })

    // Send verification email (must succeed for signup to complete)
    // Add timeout to prevent hanging
    let emailResult
    try {
      const emailPromise = sendWelcomeEmail(user.email, user.name || 'User', token)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Email sending timed out after 15 seconds')), 15000)
      )
      
      emailResult = await Promise.race([emailPromise, timeoutPromise])
    } catch (timeoutError) {
      // If timeout, treat as email failure
      emailResult = {
        success: false,
        error: timeoutError instanceof Error ? timeoutError.message : 'Email sending timed out',
        id: 'timeout',
        recipient: user.email,
        subject: 'Welcome to TATU!',
        sentAt: new Date().toISOString()
      }
    }
    
    if (!emailResult.success) {
      console.error('=== EMAIL SENDING FAILED ===')
      console.error('Error:', emailResult.error)
      console.error('User email:', user.email)
      console.error('User name:', user.name)
      console.error('===========================')

      // Do not fail signup if email provider is temporarily unavailable.
      // Account exists and token is persisted; email can be resent later.
      return NextResponse.json(
        {
          message:
            'Account created, but verification email could not be sent right now. Please request a resend from support or retry shortly.',
          userId: user.id,
          role: user.role,
          verificationEmailSent: false,
          emailError: emailResult.error || 'Email send failed',
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id,
        role: user.role,
        verificationEmailSent: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Validation error',
          errors: error.errors
        },
        { status: 400 }
      )
    }

    // Check for Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      
      // Unique constraint violation (e.g., email already exists)
      if (prismaError.code === 'P2002') {
        return NextResponse.json(
          { 
            message: 'A user with this email already exists',
            error: 'Email already registered'
          },
          { status: 400 }
        )
      }
      
      // Foreign key constraint violation
      if (prismaError.code === 'P2003') {
        return NextResponse.json(
          { 
            message: 'Database constraint violation',
            error: 'Invalid reference in database'
          },
          { status: 400 }
        )
      }
      
      // Record not found
      if (prismaError.code === 'P2025') {
        return NextResponse.json(
          { 
            message: 'Record not found',
            error: 'Referenced record does not exist'
          },
          { status: 400 }
        )
      }
    }

    // Log full error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('=== SIGNUP ERROR ===')
    console.error('Message:', errorMessage)
    console.error('Stack:', errorStack)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    console.error('===================')

    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: errorMessage,
        // Include error details in development
        ...(process.env.NODE_ENV === 'development' && { 
          details: errorMessage,
          stack: errorStack 
        })
      },
      { status: 500 }
    )
  }
} 