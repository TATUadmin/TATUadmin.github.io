import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser(email: string) {
  try {
    console.log(`\n🔍 Looking for user with email: ${email}`)
    
    // First, find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Appointment_Appointment_artistIdToUser: true,
        Appointment_Appointment_clientIdToUser: true,
        Shop: true,
        Service: true,
        calendarEvents: true,
        clientEvents: true,
      }
    })

    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }

    console.log(`✓ Found user: ${user.name} (${user.id})`)
    console.log(`  Role: ${user.role}`)
    console.log(`  Created: ${user.createdAt}`)

    // Delete Appointments (RESTRICT constraint - must delete first)
    const artistAppointments = user.Appointment_Appointment_artistIdToUser.length
    const clientAppointments = user.Appointment_Appointment_clientIdToUser.length
    const totalAppointments = artistAppointments + clientAppointments
    
    if (totalAppointments > 0) {
      console.log(`\n🗑️  Deleting ${totalAppointments} appointments...`)
      
      // Delete appointments where user is artist
      if (artistAppointments > 0) {
        await prisma.appointment.deleteMany({
          where: { artistId: user.id }
        })
        console.log(`  ✓ Deleted ${artistAppointments} appointments as artist`)
      }
      
      // Delete appointments where user is client
      if (clientAppointments > 0) {
        await prisma.appointment.deleteMany({
          where: { clientId: user.id }
        })
        console.log(`  ✓ Deleted ${clientAppointments} appointments as client`)
      }
    }

    // Delete Calendar Events
    const calendarEvents = user.calendarEvents.length + user.clientEvents.length
    if (calendarEvents > 0) {
      console.log(`\n🗑️  Deleting ${calendarEvents} calendar events...`)
      await prisma.calendarEvent.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            { clientId: user.id }
          ]
        }
      })
      console.log(`  ✓ Deleted ${calendarEvents} calendar events`)
    }

    // Delete Services (SET NULL constraint - safe to delete)
    const services = user.Service.length
    if (services > 0) {
      console.log(`\n🗑️  Deleting ${services} services...`)
      await prisma.service.deleteMany({
        where: { artistId: user.id }
      })
      console.log(`  ✓ Deleted ${services} services`)
    }

    // Delete Shops (if user owns any)
    const shops = user.Shop.length
    if (shops > 0) {
      console.log(`\n🗑️  Deleting ${shops} shops...`)
      // First delete shops (cascade will handle related records)
      await prisma.shop.deleteMany({
        where: { ownerId: user.id }
      })
      console.log(`  ✓ Deleted ${shops} shops`)
    }

    // Delete ShopsOnArtists relationships
    const shopsOnArtists = await prisma.shopsOnArtists.count({
      where: { artistId: user.id }
    })
    if (shopsOnArtists > 0) {
      console.log(`\n🗑️  Deleting ${shopsOnArtists} shop-artist relationships...`)
      await prisma.shopsOnArtists.deleteMany({
        where: { artistId: user.id }
      })
      console.log(`  ✓ Deleted ${shopsOnArtists} relationships`)
    }

    // Now delete the user (cascade will handle: Account, ArtistProfile, CustomerProfile, 
    // Comment, ConnectedAccount, Like, MessageThread, PortfolioCollection, PortfolioItem,
    // Review, Session, Share, UnifiedMessage, Calendar, etc.)
    console.log(`\n🗑️  Deleting user...`)
    await prisma.user.delete({
      where: { id: user.id }
    })
    
    console.log(`\n✅ Successfully deleted user: ${email}`)
    console.log(`   All related records have been removed.`)
    
  } catch (error: any) {
    console.error(`\n❌ Error deleting user ${email}:`, error.message)
    if (error.code === 'P2003') {
      console.error('   Foreign key constraint violation. Some related records may still exist.')
    }
    throw error
  }
}

async function main() {
  const email = 'ppcrzart@gmail.com'
  
  console.log('🚀 Starting user deletion process...')
  console.log('=' .repeat(50))
  
  await deleteUser(email)
  
  console.log('\n' + '='.repeat(50))
  console.log('✨ Process completed!')
  
  await prisma.$disconnect()
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

