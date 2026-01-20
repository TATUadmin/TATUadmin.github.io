const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Profile: true,
      }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('Deleting user:', user.email)
    
    // Delete related records first (cascade should handle most, but being explicit)
    await prisma.profile.deleteMany({ where: { userId: user.id } })
    await prisma.verificationToken.deleteMany({ where: { email: user.email } })
    
    // Delete the user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id }
    })

    console.log('User deleted successfully')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
if (!email) {
  console.log('Usage: node scripts/delete-user.js <email>')
  console.log('WARNING: This will permanently delete the user and all related data!')
  process.exit(1)
}

deleteUser(email)

