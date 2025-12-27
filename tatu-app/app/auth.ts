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
      // Allow sign-in for all OAuth providers
      if (account?.provider === 'google') {
        // Ensure user has a role set
        if (!user.role) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER' }
          })
        }
        return true
      }
      // For credentials provider
      return true
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        // For Google OAuth, set default role if not already set
        if (account?.provider === 'google' && !user.role) {
          // Update user with default CUSTOMER role
          await prisma.user.update({
            where: { id: user.id },
            data: { role: 'CUSTOMER' }
          })
          token.role = 'CUSTOMER'
        } else {
          token.role = user.role as UserRole
        }
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