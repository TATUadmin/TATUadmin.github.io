'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/components/AuthGuard'
import { useI18n } from '@/lib/i18n/context'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useI18n()
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
      { name: t('dashboard.nav.myProfile'), href: '/dashboard' },
      { name: t('dashboard.nav.myAppointments'), href: '/dashboard/appointments' },
      { name: t('dashboard.nav.myReviews'), href: '/dashboard/reviews' },
      { name: t('dashboard.nav.savedArtists'), href: '/dashboard/saved' },
    ],
    ARTIST: [
      { name: t('dashboard.nav.myProfile'), href: '/dashboard' },
      { name: t('dashboard.nav.portfolio'), href: '/dashboard/portfolio' },
      { name: t('dashboard.nav.appointments'), href: '/dashboard/appointments' },
      { name: t('dashboard.nav.communications'), href: '/dashboard/communications' },
      { name: t('dashboard.nav.analytics'), href: '/dashboard/analytics' },
      { name: t('dashboard.nav.reviews'), href: '/dashboard/reviews' },
    ],
    SHOP_OWNER: [
      { name: t('dashboard.nav.myProfile'), href: '/dashboard' },
      { name: t('dashboard.nav.myShops'), href: '/dashboard/shops' },
      { name: t('dashboard.nav.artists'), href: '/dashboard/artists' },
      { name: t('dashboard.nav.appointments'), href: '/dashboard/appointments' },
      { name: t('dashboard.nav.communications'), href: '/dashboard/communications' },
      { name: t('dashboard.nav.analytics'), href: '/dashboard/analytics' },
      { name: t('dashboard.nav.reviews'), href: '/dashboard/reviews' },
    ],
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">{t('dashboard.loading')}</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('dashboard.pleaseSignIn')}</h1>
          <p className="text-gray-400 mb-4">{t('dashboard.signInRequired')}</p>
          <Link
            href="/login"
            className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t('auth.signin')}
          </Link>
        </div>
      </div>
    )
  }

  // Just render children - the DashboardLayout component handles the actual layout
  return <>{children}</>
} 