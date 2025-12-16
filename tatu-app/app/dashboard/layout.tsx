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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-4">You need to be signed in to access the dashboard.</p>
          <Link
            href="/login"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const userRole = user?.role || 'CUSTOMER'
  const navItems = navigationItems[userRole as keyof typeof navigationItems]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-md text-sm font-medium ${isActive(
                  item.href
                )}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User info and sign out */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 capitalize">{userRole.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 