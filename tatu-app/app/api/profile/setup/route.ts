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
      include: { 
        artistProfile: true,
        customerProfile: true
      }
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

    // Create or update role-specific profile
    if (role === 'ARTIST' || role === 'SHOP_OWNER') {
      const artistProfileData = {
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

      if (user.artistProfile) {
        await prisma.artistProfile.update({
          where: { userId: user.id },
          data: artistProfileData
        })
      } else {
        // Delete customer profile if exists (user changed role)
        if (user.customerProfile) {
          await prisma.customerProfile.delete({ where: { userId: user.id } })
        }
        await prisma.artistProfile.create({
          data: {
            ...artistProfileData,
            userId: user.id
          }
        })
      }
    } else if (role === 'CUSTOMER') {
      const customerProfileData = {
        phone: profileData.phone || null,
        completedRegistration: true,
        preferredStyles: profileData.preferredStyles || [],
        locationPreferences: profileData.locationPreferences || null
      }

      if (user.customerProfile) {
        await prisma.customerProfile.update({
          where: { userId: user.id },
          data: customerProfileData
        })
      } else {
        // Delete artist profile if exists (user changed role)
        if (user.artistProfile) {
          await prisma.artistProfile.delete({ where: { userId: user.id } })
        }
        await prisma.customerProfile.create({
          data: {
            ...customerProfileData,
            userId: user.id
          }
        })
      }
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