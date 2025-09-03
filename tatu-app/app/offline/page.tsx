'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  WifiIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    // Check initial status
    checkOnlineStatus()

    // Listen for online/offline events
    window.addEventListener('online', checkOnlineStatus)
    window.addEventListener('offline', checkOnlineStatus)

    return () => {
      window.removeEventListener('online', checkOnlineStatus)
      window.removeEventListener('offline', checkOnlineStatus)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    // Try to navigate home, fallback to reload if offline
    if (isOnline) {
      window.location.href = '/'
    } else {
      window.location.reload()
    }
  }

  if (isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-6">
            <WifiIcon className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Back Online!</h1>
          <p className="text-gray-600 mb-6">
            Great! Your internet connection has been restored.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <HomeIcon className="h-5 w-5" />
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-6">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mx-auto" />
        </div>

        {/* Main Content */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">You're Offline</h1>
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry - you can still access some features that were cached.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="w-full mb-4 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <ArrowPathIcon className="h-5 w-5" />
          Try Again
        </button>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 text-left">Quick Actions:</h3>
          
          <button
            onClick={handleGoHome}
            className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <HomeIcon className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">Go Home</div>
              <div className="text-sm text-gray-500">Return to homepage</div>
            </div>
          </button>

          <Link
            href="/search"
            className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">Search Artists</div>
              <div className="text-sm text-gray-500">Browse cached results</div>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 p-3 text-left bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <UserIcon className="h-5 w-5 text-indigo-600" />
            <div>
              <div className="font-medium text-gray-900">My Dashboard</div>
              <div className="text-sm text-gray-500">View cached data</div>
            </div>
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">What you can do offline:</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>• View previously loaded artist profiles</li>
            <li>• Access cached search results</li>
            <li>• View your dashboard data</li>
            <li>• Browse tattoo styles and information</li>
          </ul>
        </div>

        {/* Retry Count */}
        {retryCount > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Retry attempts: {retryCount}
          </div>
        )}
      </div>
    </div>
  )
}
