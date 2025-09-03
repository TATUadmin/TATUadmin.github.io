'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HeartIcon,
  CalendarIcon,
  PaintBrushIcon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode
  badge?: number
  requiresAuth?: boolean
  role?: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER'
}

export default function MobileNavigation() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigationItems: NavigationItem[] = [
    { name: 'Home', href: '/', icon: <HomeIcon className="h-6 w-6" /> },
    { name: 'Find Artists', href: '/search', icon: <MagnifyingGlassIcon className="h-6 w-6" /> },
    { name: 'Tattoo Styles', href: '/styles', icon: <PaintBrushIcon className="h-6 w-6" /> },
    { name: 'How It Works', href: '/how-it-works', icon: <CogIcon className="h-6 w-6" /> },
    { name: 'About', href: '/about', icon: <UserIcon className="h-6 w-6" /> },
  ]

  const dashboardItems: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: <UserIcon className="h-6 w-6" />,
      requiresAuth: true 
    },
    { 
      name: 'Appointments', 
      href: '/dashboard/appointments', 
      icon: <CalendarIcon className="h-6 w-6" />,
      requiresAuth: true 
    },
    { 
      name: 'Portfolio', 
      href: '/dashboard/portfolio', 
      icon: <PaintBrushIcon className="h-6 w-6" />,
      requiresAuth: true,
      role: 'ARTIST'
    },
    { 
      name: 'My Shops', 
      href: '/dashboard/shops', 
      icon: <BuildingStorefrontIcon className="h-6 w-6" />,
      requiresAuth: true,
      role: 'SHOP_OWNER'
    },
    { 
      name: 'Analytics', 
      href: '/dashboard/analytics', 
      icon: <ChartBarIcon className="h-6 w-6" />,
      requiresAuth: true,
      role: 'ARTIST'
    },
    { 
      name: 'Communications', 
      href: '/dashboard/communications', 
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      requiresAuth: true,
      role: 'ARTIST'
    },
    { 
      name: 'Favorites', 
      href: '/dashboard/favorites', 
      icon: <HeartIcon className="h-6 w-6" />,
      requiresAuth: true,
      role: 'CUSTOMER'
    },
  ]

  const isActive = (href: string) => pathname === href

  const filteredDashboardItems = dashboardItems.filter(item => {
    if (item.requiresAuth && !session?.user) return false
    if (item.role && session?.user?.role !== item.role) return false
    return true
  })

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <>
      {/* Mobile Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
      } lg:hidden`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">TATU</span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            {session?.user && (
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={closeMenu}
          />
          
          {/* Menu Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {session?.user ? (
                    <>
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{session.user.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{session.user.role?.toLowerCase()}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Guest</p>
                        <p className="text-sm text-gray-500">Sign in to access more features</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {/* Main Navigation */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Navigation
                  </h3>
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Dashboard Items (if authenticated) */}
                {session?.user && filteredDashboardItems.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Dashboard
                    </h3>
                    <div className="space-y-1">
                      {filteredDashboardItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive(item.href)
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {item.icon}
                          {item.name}
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Auth Actions */}
                <div className="border-t border-gray-200 pt-4">
                  {session?.user ? (
                    <div className="space-y-2">
                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <CogIcon className="h-6 w-6" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          closeMenu()
                          // Handle sign out
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <UserIcon className="h-6 w-6" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                      >
                        <UserIcon className="h-5 w-5" />
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={closeMenu}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 lg:hidden" />
    </>
  )
}
