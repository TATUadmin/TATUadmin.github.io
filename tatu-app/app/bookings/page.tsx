'use client'

import { useState } from 'react'
import { MobileHeader } from '@/app/components/MobileNavigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function BookingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('upcoming')

  // Mock bookings data
  const mockBookings = {
    upcoming: [
      {
        id: '1',
        artist: 'Sarah Johnson',
        date: '2024-01-15',
        time: '2:00 PM',
        service: 'Custom Tattoo Design',
        price: '$200',
        status: 'confirmed'
      },
      {
        id: '2',
        artist: 'Mike Chen',
        date: '2024-01-20',
        time: '10:00 AM',
        service: 'Portrait Tattoo',
        price: '$350',
        status: 'pending'
      }
    ],
    past: [
      {
        id: '3',
        artist: 'Emma Wilson',
        date: '2023-12-10',
        time: '3:00 PM',
        service: 'Small Design',
        price: '$150',
        status: 'completed'
      }
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-white bg-gray-700/50 border border-gray-600/30'
      case 'pending':
        return 'text-gray-300 bg-gray-800/50 border border-gray-600/30'
      case 'completed':
        return 'text-gray-400 bg-gray-900/50 border border-gray-700/30'
      default:
        return 'text-gray-400 bg-gray-800/50 border border-gray-700/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed'
      case 'pending':
        return 'Pending'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MobileHeader title="My Bookings" />
      
      <div className="pt-14 pb-16 px-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-700/50 mb-6 bg-gray-900/30 rounded-t-lg">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'upcoming'
                ? 'text-white bg-gray-800/50 border-b-2 border-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'past'
                ? 'text-white bg-gray-800/50 border-b-2 border-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            Past
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {mockBookings[activeTab as keyof typeof mockBookings].length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700/50">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No {activeTab} bookings
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments"
                  : "You don't have any past appointments"
                }
              </p>
              {activeTab === 'upcoming' && (
                <Link 
                  href="/explore" 
                  className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 border border-gray-600/30"
                >
                  Browse Artists
                </Link>
              )}
            </div>
          ) : (
            mockBookings[activeTab as keyof typeof mockBookings].map((booking) => (
              <div key={booking.id} className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{booking.artist}</h3>
                    <p className="text-gray-400 text-sm">{booking.service}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {booking.date} at {booking.time}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {booking.price}
                  </div>
                </div>

                {activeTab === 'upcoming' && booking.status === 'confirmed' && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 px-4 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                      Reschedule
                    </button>
                    <button className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
