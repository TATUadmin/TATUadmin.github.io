import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserLocation() {
  const email = 'ppcrzart@gmail.com'
  
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { artistProfile: true }
    })

    if (!user) {
      console.log(`❌ User ${email} not found`)
      return
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`)
    console.log(`   Role: ${user.role}`)

    if (!user.artistProfile) {
      console.log(`❌ User does not have an artist profile`)
      return
    }

    const profile = user.artistProfile
    console.log(`\n📊 Current Profile Data:`)
    console.log(`   Latitude: ${profile.latitude}`)
    console.log(`   Longitude: ${profile.longitude}`)
    console.log(`   Location: ${profile.location}`)
    console.log(`   Actual Address: ${profile.actualAddress}`)
    console.log(`   completedRegistration: ${profile.completedRegistration}`)

    // Check if user has location data
    const hasLocation = profile.latitude !== null && profile.longitude !== null

    if (!hasLocation) {
      console.log(`\n❌ User does not have latitude/longitude set`)
      console.log(`   They need to set their location in the dashboard first`)
      return
    }

    // Check if completedRegistration needs to be fixed
    if (!profile.completedRegistration) {
      console.log(`\n🔧 Fixing: Setting completedRegistration to true...`)
      
      await prisma.artistProfile.update({
        where: { userId: user.id },
        data: { completedRegistration: true }
      })

      console.log(`✅ Fixed! completedRegistration is now true`)
      console.log(`   The user should now appear on the map`)
    } else {
      console.log(`\n✅ completedRegistration is already true`)
      console.log(`   User should appear on the map`)
    }

    // Verify the fix
    const updatedProfile = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    })

    console.log(`\n✅ Verification:`)
    console.log(`   completedRegistration: ${updatedProfile?.completedRegistration}`)
    console.log(`   Should appear on map: ${updatedProfile?.completedRegistration && hasLocation}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserLocation()


