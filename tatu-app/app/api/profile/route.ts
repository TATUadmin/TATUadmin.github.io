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
      
      // Auto-fix: If user has location data but completedRegistration is false, fix it
      if (profile && profile.latitude !== null && profile.longitude !== null && !profile.completedRegistration) {
        const fixedProfile = await prisma.artistProfile.update({
          where: { userId: session.user.id },
          data: { completedRegistration: true }
        })
        return NextResponse.json(fixedProfile)
      }
      
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

      // If location text is provided but lat/lng are missing, geocode it
      if (data.location && data.location.trim() && (!data.latitude || !data.longitude)) {
        try {
          // Geocode the location using Nominatim (same as geocode API)
          const nominatimResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location.trim())}&limit=1&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'TATU-App/1.0',
                'Accept': 'application/json'
              }
            }
          )
          
          if (nominatimResponse.ok) {
            const nominatimData = await nominatimResponse.json()
            if (Array.isArray(nominatimData) && nominatimData.length > 0) {
              const result = nominatimData[0]
              const lat = parseFloat(result.lat)
              const lon = parseFloat(result.lon)
              
              // Validate coordinates
              if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                updateData.latitude = lat
                updateData.longitude = lon
                if (!updateData.actualAddress && result.display_name) {
                  updateData.actualAddress = result.display_name
                }
              }
            }
          }
        } catch (error) {
          console.error('Error geocoding location:', error)
          // Continue without lat/lng if geocoding fails
        }
      }

      // Always check current profile to ensure completedRegistration is set correctly
      const currentProfile = await prisma.artistProfile.findUnique({
        where: { userId: session.user.id },
        select: { latitude: true, longitude: true, completedRegistration: true }
      })

      // If artist is setting their location (latitude and longitude), make profile visible
      // This ensures the artist becomes discoverable once they set their location on the map
      // Artists with completedRegistration: true appear in search results and on the map
      if (data.latitude !== undefined && data.longitude !== undefined) {
        // Check if location is being set (not cleared - both values must be valid numbers)
        const isSettingLocation = data.latitude !== null && 
                                   data.longitude !== null &&
                                   !isNaN(data.latitude) && 
                                   !isNaN(data.longitude) &&
                                   data.latitude >= -90 && data.latitude <= 90 &&
                                   data.longitude >= -180 && data.longitude <= 180
        if (isSettingLocation) {
          updateData.completedRegistration = true
        }
      } else if (updateData.latitude !== undefined && updateData.longitude !== undefined) {
        // Check if we geocoded the location and got lat/lng
        const isSettingLocation = updateData.latitude !== null && 
                                   updateData.longitude !== null &&
                                   !isNaN(updateData.latitude) && 
                                   !isNaN(updateData.longitude) &&
                                   updateData.latitude >= -90 && updateData.latitude <= 90 &&
                                   updateData.longitude >= -180 && updateData.longitude <= 180
        if (isSettingLocation) {
          updateData.completedRegistration = true
        }
      }
      
      // Always ensure completedRegistration is true if user has location data
      // This fixes cases where location was set but completedRegistration wasn't updated
      const finalLatitude = updateData.latitude !== undefined ? updateData.latitude : currentProfile?.latitude
      const finalLongitude = updateData.longitude !== undefined ? updateData.longitude : currentProfile?.longitude
      
      if (finalLatitude !== null && finalLatitude !== undefined &&
          finalLongitude !== null && finalLongitude !== undefined &&
          !isNaN(finalLatitude) && !isNaN(finalLongitude) &&
          finalLatitude >= -90 && finalLatitude <= 90 &&
          finalLongitude >= -180 && finalLongitude <= 180) {
        // User has valid location data - ensure completedRegistration is true
        updateData.completedRegistration = true
      }

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