import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        artistProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ 
        found: false,
        message: `User with email ${email} not found` 
      })
    }

    const hasLocation = user.artistProfile?.latitude && user.artistProfile?.longitude
    const completedRegistration = user.artistProfile?.completedRegistration || false

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      },
      artistProfile: user.artistProfile ? {
        latitude: user.artistProfile.latitude,
        longitude: user.artistProfile.longitude,
        location: user.artistProfile.location,
        actualAddress: user.artistProfile.actualAddress,
        locationRadius: user.artistProfile.locationRadius,
        completedRegistration: user.artistProfile.completedRegistration
      } : null,
      hasLocation,
      completedRegistration,
      shouldAppearOnMap: hasLocation && completedRegistration,
      reason: !hasLocation 
        ? 'Missing latitude/longitude' 
        : !completedRegistration 
        ? 'completedRegistration is false'
        : 'Should appear on map'
    })
  } catch (error) {
    console.error('Error checking user location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


