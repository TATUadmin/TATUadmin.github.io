'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const { user, isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
      ? 'bg-gray-900 text-white'
      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }

  const navigationItems = {
    CUSTOMER: [
      { name: 'My Profile', href: '/dashboard' },
      { name: 'My Appointments', href: '/dashboard/appointments' },
      { name: 'My Reviews', href: '/dashboard/reviews' },
      { name: 'Saved Artists', href: '/dashboard/saved' },
    ],
    ARTIST: [
      { name: 'My Profile', href: '/dashboard' },
      { name: 'My Portfolio', href: '/dashboard/portfolio' },
      { name: 'Appointments', href: '/dashboard/appointments' },
      { name: 'Communications', href: '/dashboard/communications' },
      { name: 'Analytics', href: '/dashboard/analytics' },
      { name: 'Reviews', href: '/dashboard/reviews' },
    ],
    SHOP_OWNER: [
      { name: 'My Profile', href: '/dashboard' },
      { name: 'My Shops', href: '/dashboard/shops' },
      { name: 'Artists', href: '/dashboard/artists' },
      { name: 'Appointments', href: '/dashboard/appointments' },
      { name: 'Communications', href: '/dashboard/communications' },
      { name: 'Analytics', href: '/dashboard/analytics' },
      { name: 'Reviews', href: '/dashboard/reviews' },
    ],
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Please Sign In</h1>
          <p className="text-gray-400 mb-4">You need to be signed in to access the dashboard.</p>
          <Link
            href="/login"
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Just render children - the DashboardLayout component handles the actual layout
  return <>{children}</>
} 