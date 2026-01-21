import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user to determine role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch role-specific profile
    if (user.role === 'ARTIST' || user.role === 'SHOP_OWNER') {
      const profile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
      })
      return NextResponse.json(profile)
    } else if (user.role === 'CUSTOMER') {
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: session.user.id },
      })
      return NextResponse.json(profile)
    }

    return NextResponse.json(null)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    
    // Get user to determine role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update role-specific profile
    if (user.role === 'ARTIST' || user.role === 'SHOP_OWNER') {
      // Build update data object, only including fields that are provided
      const updateData: any = {}
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.bio !== undefined) updateData.bio = data.bio
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.instagram !== undefined) updateData.instagram = data.instagram
      if (data.website !== undefined) updateData.website = data.website
      if (data.location !== undefined) updateData.location = data.location
      if (data.specialties !== undefined) updateData.specialties = data.specialties || []
      if (data.age !== undefined) updateData.age = data.age
      if (data.latitude !== undefined) updateData.latitude = data.latitude
      if (data.longitude !== undefined) updateData.longitude = data.longitude
      if (data.locationRadius !== undefined) updateData.locationRadius = data.locationRadius
      if (data.actualAddress !== undefined) updateData.actualAddress = data.actualAddress

      const profile = await prisma.artistProfile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
      return NextResponse.json(profile)
    } else if (user.role === 'CUSTOMER') {
      // Build update data object, only including fields that are provided
      const updateData: any = {}
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.bio !== undefined) updateData.bio = data.bio
      if (data.phone !== undefined) updateData.phone = data.phone
      if (data.preferredStyles !== undefined) updateData.preferredStyles = data.preferredStyles
      if (data.locationPreferences !== undefined) updateData.locationPreferences = data.locationPreferences

      const profile = await prisma.customerProfile.update({
        where: { userId: session.user.id },
        data: updateData,
      })
      return NextResponse.json(profile)
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 