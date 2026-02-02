'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useI18n } from '@/lib/i18n/context'
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
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import NotificationDropdown from './NotificationDropdown'
import type { Notification } from './NotificationCenter'

interface DashboardLayoutProps {
  children: ReactNode
  userRole?: 'artist' | 'admin' | 'client' | 'customer'
}

interface NavItem {
  name: string
  href: string
  icon: any
  roles: Array<'artist' | 'admin' | 'client' | 'customer'>
}

const getNavigation = (t: (key: string) => string): NavItem[] => [
  { name: t('dashboard.nav.dashboard'), href: '/dashboard', icon: HomeIcon, roles: ['artist', 'admin', 'client'] },
  { name: t('dashboard.nav.calendar'), href: '/dashboard/calendar', icon: CalendarIcon, roles: ['artist', 'admin'] },
  { name: t('dashboard.nav.upcomingBookings'), href: '/dashboard/bookings', icon: CalendarIcon, roles: ['client'] },
  { name: t('dashboard.nav.portfolio'), href: '/dashboard/portfolio', icon: PhotoIcon, roles: ['artist', 'admin'] },
  { name: t('dashboard.nav.messages'), href: '/dashboard/messages', icon: ChatBubbleLeftIcon, roles: ['artist', 'admin', 'client'] },
  { name: t('dashboard.nav.payments'), href: '/dashboard/payments', icon: CreditCardIcon, roles: ['artist', 'admin'] },
  { name: t('dashboard.nav.artists'), href: '/dashboard/artists', icon: UserGroupIcon, roles: ['admin'] },
  { name: t('dashboard.nav.analytics'), href: '/dashboard/analytics', icon: ChartBarIcon, roles: ['artist', 'admin'] },
  { name: t('dashboard.nav.settings'), href: '/dashboard/settings', icon: Cog6ToothIcon, roles: ['artist', 'admin', 'client'] },
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
  const { t } = useI18n()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const navigation = getNavigation(t)

  // Fetch user avatar
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.avatar) {
            setAvatar(data.avatar)
          }
        })
        .catch(err => console.error('Failed to fetch avatar:', err))
    }
  }, [session?.user?.id])

  // Fetch notifications
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/notifications?limit=50')
        .then(res => res.json())
        .then(data => {
          if (data?.notifications) {
            setNotifications(data.notifications)
          }
        })
        .catch(err => {
          console.error('Failed to fetch notifications:', err)
          // Fallback to mock notifications if API fails
          setNotifications(mockNotifications)
        })
    }
  }, [session?.user?.id])

  // Get actual role from session, fallback to prop
  // Map database role (CUSTOMER) to UI role (client/customer)
  const getUIRole = (dbRole: string | undefined, propRole: string): 'artist' | 'admin' | 'client' | 'customer' => {
    if (dbRole) {
      const roleLower = dbRole.toLowerCase()
      if (roleLower === 'customer') return 'client' // Map CUSTOMER to client for navigation
      if (roleLower === 'shop_owner') return 'artist'
      if (roleLower === 'artist') return 'artist'
      if (roleLower === 'admin') return 'admin'
    }
    return propRole as any
  }
  const actualUIRole = getUIRole(session?.user?.role, userRole)
  
  // Map role for display (CUSTOMER -> customer, SHOP_OWNER -> shop owner, etc.)
  const getRoleDisplayName = (role: string | undefined) => {
    if (!role) return userRole
    const roleLower = role.toLowerCase()
    if (roleLower === 'shop_owner') return 'shop owner'
    if (roleLower === 'customer') return 'customer'
    if (roleLower === 'artist') return 'artist'
    if (roleLower === 'admin') return 'admin'
    return roleLower
  }
  const roleDisplayName = getRoleDisplayName(session?.user?.role) || userRole
  
  const filteredNavigation = navigation.filter(item => item.roles.includes(actualUIRole))
  const userName = session?.user?.name || 'User'

  const handleMarkAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    
    // Update on server
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      // Revert on error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n))
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Navigate based on notification type
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    } else if (notification.type === 'message') {
      window.location.href = '/dashboard/messages'
    } else if (notification.type === 'booking') {
      window.location.href = '/dashboard/bookings'
    }
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
            className="lg:hidden p-2 hover:bg-gray-900 rounded-full transition-colors"
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
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-full transition-colors ${
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
          <Link 
            href="/dashboard" 
            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-900 rounded-full transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              {roleDisplayName && roleDisplayName.toLowerCase() !== 'customer' && (
                <p className="text-xs text-gray-500 truncate capitalize">{roleDisplayName}</p>
              )}
            </div>
          </Link>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full mt-2 flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-900 rounded-full transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
            {t('nav.signout')}
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
            className="lg:hidden p-2 hover:bg-gray-900 rounded-full transition-colors"
          >
            <Bars3Icon className="w-6 h-6 text-gray-400" />
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />

            {/* User Avatar (Desktop) */}
            <Link 
              href="/dashboard"
              className="hidden lg:flex items-center space-x-2 p-2 hover:bg-gray-900 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
              <UserCircleIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="bg-black min-h-screen">
          <div className="w-full h-full p-4 lg:p-8">
          {children}
          </div>
        </main>
      </div>
    </div>
  )
}

