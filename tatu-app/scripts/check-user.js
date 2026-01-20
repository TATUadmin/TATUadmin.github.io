const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        Profile: true,
      }
    })

    if (user) {
      console.log('User found:')
      console.log('- ID:', user.id)
      console.log('- Name:', user.name)
      console.log('- Email:', user.email)
      console.log('- Email Verified:', user.emailVerified)
      console.log('- Role:', user.role)
      console.log('- Created At:', user.createdAt)
      console.log('- Has Profile:', !!user.Profile)
      return user
    } else {
      console.log('User not found')
      return null
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
if (!email) {
  console.log('Usage: node scripts/check-user.js <email>')
  process.exit(1)
}

checkUser(email)

