import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { role, profileData, subscriptionTier } = await request.json()

    if (!role || !['CUSTOMER', 'ARTIST', 'SHOP_OWNER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate subscription tier if provided
    const validSubscriptionTier = subscriptionTier && ['FREE', 'PRO', 'STUDIO'].includes(subscriptionTier) 
      ? subscriptionTier 
      : 'FREE'

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role }
    })

    // Create or update profile
    const profileUpdate = {
      bio: profileData.bio || null,
      phone: profileData.phone || null,
      instagram: profileData.instagram || null,
      website: profileData.website || null,
      location: profileData.location || null,
      specialties: profileData.specialties || [],
      completedRegistration: true,
      subscriptionTier: validSubscriptionTier,
      subscriptionStatus: 'ACTIVE'
    }

    if (user.profile) {
      // Update existing profile
      await prisma.profile.update({
        where: { userId: user.id },
        data: profileUpdate
      })
    } else {
      // Create new profile
      await prisma.profile.create({
        data: {
          ...profileUpdate,
          userId: user.id
        }
      })
    }

    // Create FREE subscription record for all users
    if (validSubscriptionTier === 'FREE') {
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          tier: 'FREE',
          status: 'ACTIVE',
          billingInterval: 'MONTHLY',
          amount: 0
        },
        update: {
          tier: 'FREE',
          status: 'ACTIVE'
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        ...updatedUser,
        role
      }
    })
  } catch (error) {
    console.error('Error setting up profile:', error)
    return NextResponse.json(
      { error: 'Failed to setup profile' },
      { status: 500 }
    )
  }
} 