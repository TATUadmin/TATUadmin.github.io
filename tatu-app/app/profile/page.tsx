'use client'

import { useState } from 'react'
import { MobileHeader } from '@/app/components/MobileNavigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('profile')

  // Mock user data
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: 'January 2023',
    avatar: null,
    bio: 'Tattoo enthusiast and collector',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false
    }
  }

  const mockStats = {
    totalBookings: 12,
    favoriteArtists: 5,
    reviewsWritten: 8,
    yearsActive: 1
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <MobileHeader title="My Profile" />
      
      <div className="pt-14 pb-16 px-4">
        {/* Profile Header */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-gray-700/50 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center mr-4 border border-gray-600/30">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{mockUser.name}</h2>
              <p className="text-gray-400">{mockUser.email}</p>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-4">{mockUser.bio}</p>
          
          <div className="flex items-center text-sm text-gray-400">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {mockUser.location}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
            <div className="text-2xl font-bold text-white">{mockStats.totalBookings}</div>
            <div className="text-sm text-gray-400">Total Bookings</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
            <div className="text-2xl font-bold text-white">{mockStats.favoriteArtists}</div>
            <div className="text-sm text-gray-400">Favorite Artists</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700/50 mb-6 bg-gray-900/30 rounded-t-lg">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'profile'
                ? 'text-white bg-gray-800/50 border-b-2 border-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 rounded-t-lg ${
              activeTab === 'settings'
                ? 'text-white bg-gray-800/50 border-b-2 border-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Full Name</label>
                  <p className="text-white">{mockUser.name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{mockUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Phone</label>
                  <p className="text-white">{mockUser.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Location</label>
                  <p className="text-white">{mockUser.location}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Member Since</label>
                  <p className="text-white">{mockUser.joinDate}</p>
                </div>
              </div>
              <button className="mt-4 w-full py-2 px-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/20 transition-all duration-200 border border-gray-600/30">
                Edit Profile
              </button>
            </div>

            {/* Activity */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Reviews Written</span>
                  <span className="text-white font-medium">{mockStats.reviewsWritten}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Years Active</span>
                  <span className="text-white font-medium">{mockStats.yearsActive}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab Content */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Notification Settings */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-sm text-gray-400">Receive notifications about bookings and messages</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={mockUser.preferences.notifications} />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email Updates</p>
                    <p className="text-sm text-gray-400">Receive email notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={mockUser.preferences.emailUpdates} />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 shadow-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Account</h3>
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-gray-700/50 transition-all duration-200 text-left border border-gray-600/30">
                  Change Password
                </button>
                <button className="w-full py-3 px-4 bg-gray-800/50 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-gray-700/50 transition-all duration-200 text-left border border-gray-600/30">
                  Privacy Settings
                </button>
                <button className="w-full py-3 px-4 bg-red-600/20 backdrop-blur-sm text-red-400 rounded-lg font-medium hover:bg-red-600/30 transition-all duration-200 text-left border border-red-600/30">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
