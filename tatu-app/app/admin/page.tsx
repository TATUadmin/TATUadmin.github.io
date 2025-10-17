'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../components/DashboardLayout'
import DashboardStats, { adminDashboardStats } from '../components/DashboardStats'
import {
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Artist {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'active' | 'pending' | 'suspended'
  totalBookings: number
  totalRevenue: number
  rating: number
  joinedDate: string
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

// Mock data
const recentArtists: Artist[] = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    email: 'alex@example.com',
    status: 'active',
    totalBookings: 47,
    totalRevenue: 8450,
    rating: 4.9,
    joinedDate: '2023-06-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    status: 'active',
    totalBookings: 32,
    totalRevenue: 6200,
    rating: 4.8,
    joinedDate: '2023-08-20'
  },
  {
    id: '3',
    name: 'David Chen',
    email: 'david@example.com',
    status: 'pending',
    totalBookings: 0,
    totalRevenue: 0,
    rating: 0,
    joinedDate: '2024-01-10'
  }
]

const systemAlerts: SystemAlert[] = [
  {
    id: '1',
    type: 'warning',
    message: 'High server load detected - consider scaling resources',
    timestamp: '10 minutes ago',
    resolved: false
  },
  {
    id: '2',
    type: 'info',
    message: '3 new artist applications awaiting review',
    timestamp: '1 hour ago',
    resolved: false
  },
  {
    id: '3',
    type: 'error',
    message: 'Payment gateway reported 2 failed transactions',
    timestamp: '2 hours ago',
    resolved: true
  }
]

export default function AdminDashboard() {
  const [artists] = useState<Artist[]>(recentArtists)
  const [alerts, setAlerts] = useState<SystemAlert[]>(systemAlerts)
  const [searchQuery, setSearchQuery] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'suspended':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const handleResolveAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => alert.id === id ? { ...alert, resolved: true } : alert))
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={adminDashboardStats} />

        {/* System Alerts */}
        {alerts.filter(a => !a.resolved).length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-lg font-semibold text-white">System Alerts</h2>
                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20">
                  {alerts.filter(a => !a.resolved).length}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {alerts.filter(a => !a.resolved).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{alert.message}</p>
                      <p className="text-gray-500 text-xs mt-1">{alert.timestamp}</p>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-3 py-1 bg-gray-800 text-white rounded text-xs hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Artists */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                  <h2 className="text-lg font-semibold text-white">Recent Artists</h2>
                </div>
                <Link
                  href="/admin/artists"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  View all
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              {/* Search */}
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search artists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {artists.map((artist) => (
                      <tr key={artist.id} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {artist.avatar ? (
                              <img
                                src={artist.avatar}
                                alt={artist.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {artist.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-white font-medium">{artist.name}</p>
                              <p className="text-gray-500 text-sm">{artist.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              artist.status
                            )}`}
                          >
                            {artist.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {artist.totalBookings}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          ${artist.totalRevenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {artist.rating > 0 ? artist.rating.toFixed(1) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link
                            href={`/admin/artists/${artist.id}`}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/admin/artists/approve"
                  className="block w-full px-4 py-3 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Review Pending Artists
                </Link>
                <Link
                  href="/admin/reports"
                  className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700 text-center"
                >
                  Generate Report
                </Link>
                <Link
                  href="/admin/settings"
                  className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700 text-center"
                >
                  Platform Settings
                </Link>
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Platform Health</h2>
                <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                  Healthy
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Server Uptime</span>
                    <span className="text-sm text-white font-medium">99.9%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">API Response Time</span>
                    <span className="text-sm text-white font-medium">145ms</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Storage Used</span>
                    <span className="text-sm text-white font-medium">67%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

