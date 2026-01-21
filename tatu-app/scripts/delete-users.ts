import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUsers() {
  const emailsToDelete = [
    'norden858@gmail.com',
    'pedronauta@gmail.com', 
    'ppcrzart@gmail.com'
  ]

  console.log('Deleting users with emails:', emailsToDelete)

  for (const email of emailsToDelete) {
    try {
      // First check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (user) {
        // Delete related records first (cascade should handle most, but being explicit)
        await prisma.user.delete({
          where: { email }
        })
        console.log(`✓ Deleted user: ${email}`)
      } else {
        console.log(`- User not found: ${email}`)
      }
    } catch (error) {
      console.error(`✗ Error deleting ${email}:`, error)
    }
  }

  console.log('Done!')
  await prisma.$disconnect()
}

deleteUsers()


