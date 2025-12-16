'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requiredRole?: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN'
  fallback?: ReactNode
}

export default function AuthGuard({ 
  children, 
  requiredRole, 
  fallback 
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, requiredRole])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // Show fallback if user doesn't have required role
  if (requiredRole && session?.user.role !== requiredRole) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show fallback if not authenticated
  if (!session) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-4">
            You need to be signed in to access this page.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for checking authentication status
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading',
    role: session?.user?.role
  }
}

// Hook for role-based access
export function useRole(requiredRole: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN') {
  const { user, isAuthenticated, isLoading } = useAuth()
  
  return {
    hasRole: user?.role === requiredRole,
    isAuthenticated,
    isLoading,
    user
  }
}
