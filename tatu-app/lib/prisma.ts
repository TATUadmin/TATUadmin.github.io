import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

  // Handle connection errors gracefully
  client.$connect().catch((error) => {
    console.error('Failed to connect to database:', error.message)
    if (error.code === 'P1001') {
      console.error('Database connection error: Cannot reach database server')
      console.error('Please check:')
      console.error('1. DATABASE_URL environment variable is set correctly')
      console.error('2. Database server is running and accessible')
      console.error('3. Network/firewall settings allow the connection')
      console.error('4. If using Supabase, check if the project is paused')
    }
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 