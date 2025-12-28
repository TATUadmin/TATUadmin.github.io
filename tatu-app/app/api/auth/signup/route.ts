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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
      },
    })

    // Create profile with role-specific data
    const profileData: Prisma.ProfileCreateInput = {
      user: {
        connect: {
          id: user.id
        }
      }
    }

    if (validatedData.role === 'ARTIST' && validatedData.artistSpecialties) {
      profileData.specialties = validatedData.artistSpecialties
    }

    if (validatedData.role === 'SHOP_OWNER') {
      if (validatedData.shopName) {
        // Create shop for shop owner
        await prisma.shop.create({
          data: {
            name: validatedData.shopName,
            address: validatedData.shopAddress || '',
            city: '', // These will be filled in during profile completion
            state: '',
            zipCode: '',
            owner: {
              connect: {
                id: user.id
              }
            }
          }
        })
      }
    }

    await prisma.profile.create({
      data: profileData,
    })

    // Generate secure verification token
    const token = generateSecureToken(32)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Save verification token
    await prisma.verificationToken.create({
      data: {
        token,
        email: user.email,
        expires,
      },
    })

    // Send verification email
    await sendWelcomeEmail(user.email, user.name || 'User', token)

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

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 