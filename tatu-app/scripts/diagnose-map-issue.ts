import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function diagnoseMapIssue() {
  const email = 'ppcrzart@gmail.com'
  
  try {
    console.log('🔍 Diagnosing map display issue for:', email)
    console.log('=' .repeat(60))
    
    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        artistProfile: true 
      }
    })

    if (!user) {
      console.log('❌ User not found in database')
      return
    }

    console.log('\n✅ User Found:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)

    if (!user.artistProfile) {
      console.log('\n❌ User does not have an artist profile')
      return
    }

    const profile = user.artistProfile
    console.log('\n📊 Artist Profile Data:')
    console.log(`   completedRegistration: ${profile.completedRegistration}`)
    console.log(`   Latitude: ${profile.latitude}`)
    console.log(`   Longitude: ${profile.longitude}`)
    console.log(`   Location: ${profile.location || '(not set)'}`)
    console.log(`   Actual Address: ${profile.actualAddress || '(not set)'}`)
    console.log(`   Specialties: ${profile.specialties?.join(', ') || '(none)'}`)

    // 2. Check query conditions
    console.log('\n🔍 Checking Query Conditions:')
    const hasLocation = profile.latitude !== null && profile.longitude !== null
    const hasCompletedRegistration = profile.completedRegistration === true
    const isArtist = user.role === 'ARTIST'

    console.log(`   Role is ARTIST: ${isArtist} ${isArtist ? '✅' : '❌'}`)
    console.log(`   Has location (lat/lng): ${hasLocation} ${hasLocation ? '✅' : '❌'}`)
    console.log(`   completedRegistration: ${hasCompletedRegistration} ${hasCompletedRegistration ? '✅' : '❌'}`)

    const shouldAppear = isArtist && hasLocation && hasCompletedRegistration
    console.log(`\n🎯 Should appear on map: ${shouldAppear} ${shouldAppear ? '✅' : '❌'}`)

    if (!shouldAppear) {
      console.log('\n❌ Issues preventing map display:')
      if (!isArtist) console.log('   - User role is not ARTIST')
      if (!hasLocation) console.log('   - Missing latitude/longitude')
      if (!hasCompletedRegistration) console.log('   - completedRegistration is false')
    }

    // 3. Test the actual query
    console.log('\n🔍 Testing API Query:')
    const artistProfileConditions: any = {
      completedRegistration: true,
      latitude: { not: null },
      longitude: { not: null }
    }

    const whereConditions: any = {
      role: 'ARTIST',
      artistProfile: artistProfileConditions
    }

    const matchingArtists = await prisma.user.findMany({
      where: whereConditions,
      include: {
        artistProfile: true
      },
      take: 100
    })

    const foundInQuery = matchingArtists.find(a => a.email === email)
    console.log(`   Total artists matching query: ${matchingArtists.length}`)
    console.log(`   Found ${email} in query results: ${foundInQuery ? '✅ YES' : '❌ NO'}`)

    if (foundInQuery) {
      console.log('\n✅ User WILL appear in API response')
    } else {
      console.log('\n❌ User will NOT appear in API response')
      console.log('   This means the query conditions are not matching')
    }

    // 4. Check if fix is needed
    if (!hasCompletedRegistration && hasLocation) {
      console.log('\n🔧 Fix Available:')
      console.log('   User has location but completedRegistration is false')
      console.log('   Run: npm run fix-user-location')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseMapIssue()

