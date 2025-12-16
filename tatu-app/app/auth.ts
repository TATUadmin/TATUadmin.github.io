import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"

type UserRole = 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN'

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: UserRole
    }
  }
  interface User {
    role: UserRole
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        if (!email || !password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        const isPasswordValid = await bcrypt.compare(
          password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role as UserRole
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  }
}

// Simple auth function for server components
// This will be used by server components to get the current session
export async function auth() {
  // Import NextAuth's auth function dynamically to avoid build issues
  try {
    const { auth: nextAuth } = await import('@/lib/auth')
    return await nextAuth()
  } catch (error) {
    // If auth fails (e.g., missing env vars), return null instead of throwing
    console.error('Auth error:', error)
    return null
  }
} 