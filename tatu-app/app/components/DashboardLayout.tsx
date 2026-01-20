'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  HomeIcon,
  CalendarIcon,
  PhotoIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import NotificationDropdown from './NotificationDropdown'
import type { Notification } from './NotificationCenter'

interface DashboardLayoutProps {
  children: ReactNode
  userRole?: 'artist' | 'admin' | 'client'
}

interface NavItem {
  name: string
  href: string
  icon: any
  roles: Array<'artist' | 'admin' | 'client'>
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['artist', 'admin', 'client'] },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon, roles: ['artist', 'admin', 'client'] },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: PhotoIcon, roles: ['artist', 'admin'] },
  { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftIcon, roles: ['artist', 'admin', 'client'] },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon, roles: ['artist', 'admin'] },
  { name: 'Artists', href: '/dashboard/artists', icon: UserGroupIcon, roles: ['admin'] },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon, roles: ['artist', 'admin'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['artist', 'admin', 'client'] },
]

// Mock notifications
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'John Doe wants to book a session',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Sarah M. sent you a message',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false
  }
]

export default function DashboardLayout({ children, userRole = 'artist' }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const filteredNavigation = navigation.filter(item => item.roles.includes(userRole))
  const userName = session?.user?.name || 'User'

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification)
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 border-r border-gray-900 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-900">
          <Link href="/" className="flex items-center">
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              className="h-8 w-auto"
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-900 p-4">
          <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-900 rounded-lg transition-colors cursor-pointer">
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{userRole}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full mt-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-gray-950 border-b border-gray-900 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-900 rounded-lg transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-400" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />

            {/* User Avatar (Desktop) */}
            <button className="hidden lg:flex items-center space-x-2 p-2 hover:bg-gray-900 rounded-lg transition-colors">
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="bg-black min-h-screen">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

