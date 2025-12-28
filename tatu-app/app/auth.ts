import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
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
    async signIn({ user, account }: any) {
      if (account?.provider === 'google') {
        // Ensure Google OAuth user has a role set, default to CUSTOMER
        const existingUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        
        if (existingUser && !existingUser.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER' }
          })
        }
        return true
      }
      return true // Allow credentials provider sign-in
    },
    async jwt({ token, user }: any) {
      if (user) {
        // Add role and id to JWT token
        token.role = user.role as UserRole || 'CUSTOMER'
        token.id = user.id
      } else if (!token.role) {
        // If token doesn't have a role, fetch from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.id || token.sub
      }
      return session
    },
    async redirect({ url, baseUrl }: any) {
      // After successful sign-in, redirect to home page
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}

// Export auth handlers for route
export const handler = NextAuth(authOptions)

// Export auth function for server components
import { getServerSession } from "next-auth"

export async function auth() {
  return await getServerSession(authOptions)
} 