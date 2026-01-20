import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateSecureToken } from '@/lib/security'
import { sendWelcomeEmail } from '@/lib/email-service'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

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

    // Generate user ID (using crypto.randomUUID for compatibility)
    const userId = crypto.randomUUID()

    // Create user
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        updatedAt: new Date(),
      },
    })

    // Create profile with role-specific data
    const profileData: any = {
      userId: user.id,
    }

    if (validatedData.role === 'ARTIST' && validatedData.artistSpecialties) {
      profileData.specialties = validatedData.artistSpecialties
    }

    if (validatedData.role === 'SHOP_OWNER') {
      if (validatedData.shopName) {
        // Generate shop ID
        const shopId = crypto.randomUUID()
        
        // Create shop for shop owner
        await prisma.shop.create({
          data: {
            id: shopId,
            name: validatedData.shopName,
            address: validatedData.shopAddress || '',
            city: '', // These will be filled in during profile completion
            state: '',
            zipCode: '',
            ownerId: user.id,
            updatedAt: new Date(),
          }
        })
      }
    }

    // Generate profile ID
    const profileId = crypto.randomUUID()
    
    await prisma.profile.create({
      data: {
        id: profileId,
        ...profileData,
      },
    })

    // Generate secure verification token
    const token = generateSecureToken(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Generate verification token ID
    const verificationTokenId = crypto.randomUUID()

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        id: verificationTokenId,
        token,
        email: user.email,
        expires,
      },
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
      
      // If email fails, we should rollback the user creation
      // Delete the user and profile that were just created
      await prisma.profile.deleteMany({ where: { userId: user.id } })
      await prisma.verificationToken.deleteMany({ where: { email: user.email } })
      await prisma.user.delete({ where: { id: user.id } })
      
      // Return specific error message
      const errorMessage = emailResult.error || 'Failed to send verification email'
      
      if (errorMessage.includes('RESEND_API_KEY') || errorMessage.includes('not set')) {
        return NextResponse.json(
          { 
            message: 'Email service not configured. Please contact support.',
            error: 'RESEND_API_KEY is not set or invalid'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          message: 'Failed to send verification email. Please try again or contact support.',
          error: errorMessage
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'User created successfully. Please check your email to verify your account.',
        userId: user.id,
        role: user.role
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