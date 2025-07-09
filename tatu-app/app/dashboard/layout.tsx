'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
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
      { name: 'Reviews', href: '/dashboard/reviews' },
    ],
    SHOP_OWNER: [
      { name: 'My Profile', href: '/dashboard' },
      { name: 'My Shops', href: '/dashboard/shops' },
      { name: 'Artists', href: '/dashboard/artists' },
      { name: 'Appointments', href: '/dashboard/appointments' },
      { name: 'Reviews', href: '/dashboard/reviews' },
    ],
  }

  const userRole = session?.user?.role || 'CUSTOMER'
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