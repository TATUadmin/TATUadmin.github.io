'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'
import Link from 'next/link'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface Booking {
  id: string
  artistId: string
  artistName: string | null
  artistEmail: string
  artistProfileLink: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED'
  serviceName?: string
  location?: string
  notes?: string
  createdAt: string
}

export default function UpcomingBookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchBookings()
    }
  }, [session])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/bookings')
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-white/20 text-white border border-white/30'
      case 'PENDING':
        return 'bg-gray-800 text-gray-300 border border-gray-700'
      case 'DECLINED':
      case 'CANCELLED':
        return 'bg-gray-900 text-gray-500 border border-gray-800'
      case 'COMPLETED':
        return 'bg-white/10 text-gray-300 border border-gray-800'
      default:
        return 'bg-gray-900 text-gray-400 border border-gray-800'
    }
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircleIcon className="h-5 w-5" />
      case 'PENDING':
        return <PendingIcon className="h-5 w-5" />
      case 'DECLINED':
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5" />
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5" />
      default:
        return <PendingIcon className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (!session?.user) {
    return (
      <DashboardLayout userRole="client">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Please sign in to view your bookings.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="client">
      <div className="w-full min-h-screen bg-black">
        <div className="w-full px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upcoming Bookings</h1>
            <p className="text-gray-400">View and manage your scheduled appointments</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-gray-950 border border-gray-900 rounded-lg p-12 text-center">
              <CalendarIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
              <p className="text-gray-400 mb-6">Start booking appointments with artists to see them here.</p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Browse Artists
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-gray-950 border border-gray-900 rounded-lg p-6 hover:border-gray-800 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Link
                            href={booking.artistProfileLink}
                            className="text-xl font-semibold text-white hover:text-gray-300 transition-colors flex items-center gap-2"
                            >
                            <UserIcon className="h-5 w-5 text-gray-500" />
                            {booking.artistName || booking.artistEmail}
                          </Link>
                          {booking.serviceName && (
                            <p className="text-gray-400 mt-1">{booking.serviceName}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-gray-300">
                          <CalendarIcon className="h-5 w-5 text-gray-500" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <ClockIcon className="h-5 w-5 text-gray-500" />
                          <span>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-3 text-gray-300">
                            <MapPinIcon className="h-5 w-5 text-gray-500" />
                            <span>{booking.location}</span>
                          </div>
                        )}
                      </div>

                      {booking.notes && (
                        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                          <p className="text-sm text-gray-400">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <Link
                        href={booking.artistProfileLink}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        View Artist Profile
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/messages?artist=${booking.artistId}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        Contact Artist
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

