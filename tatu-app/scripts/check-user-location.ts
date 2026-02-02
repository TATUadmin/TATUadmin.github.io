import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserLocation(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        artistProfile: true
      }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      return
    }

    console.log(`\n✅ User found: ${user.name || 'No name'} (${user.email})`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Status: ${user.status || 'N/A'}`)

    if (user.artistProfile) {
      const profile = user.artistProfile
      console.log(`\n📍 Artist Profile Location Data:`)
      console.log(`   Latitude: ${profile.latitude ?? 'NOT SET'}`)
      console.log(`   Longitude: ${profile.longitude ?? 'NOT SET'}`)
      console.log(`   Location (text): ${profile.location ?? 'NOT SET'}`)
      console.log(`   Actual Address: ${profile.actualAddress ?? 'NOT SET'}`)
      console.log(`   Location Radius: ${profile.locationRadius ?? 'NOT SET'} ft`)
      console.log(`   Completed Registration: ${profile.completedRegistration}`)
      
      if (profile.latitude && profile.longitude) {
        console.log(`\n✅ User HAS location data and SHOULD appear on map`)
      } else {
        console.log(`\n❌ User does NOT have location data (latitude/longitude missing)`)
      }
    } else {
      console.log(`\n❌ User does not have an artist profile`)
    }
  } catch (error) {
    console.error('Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check the specific user
checkUserLocation('ppcrzart@gmail.com')


