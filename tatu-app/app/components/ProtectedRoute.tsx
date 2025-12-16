'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, requiredRole, redirectTo])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or wrong role
  if (!session || (requiredRole && session.user.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER' | 'ADMIN'
    redirectTo?: string
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute 
        requiredRole={options?.requiredRole}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}
