'use client'

import { useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '../components/DashboardLayout'
import DashboardStats, { artistDashboardStats } from '../components/DashboardStats'
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  clientName: string
  service: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  price: number
}

interface RecentActivity {
  id: string
  type: 'booking' | 'review' | 'payment' | 'message'
  description: string
  timestamp: string
}

// Mock data
const upcomingAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Sarah Mitchell',
    service: 'Traditional Rose Tattoo',
    date: '2024-01-15',
    time: '10:00 AM',
    status: 'confirmed',
    price: 350
  },
  {
    id: '2',
    clientName: 'John Davis',
    service: 'Geometric Sleeve Session 2/3',
    date: '2024-01-15',
    time: '2:00 PM',
    status: 'confirmed',
    price: 500
  },
  {
    id: '3',
    clientName: 'Emily Chen',
    service: 'Cover-up Consultation',
    date: '2024-01-16',
    time: '11:00 AM',
    status: 'pending',
    price: 0
  }
]

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'booking',
    description: 'New booking request from Mike Johnson',
    timestamp: '5 minutes ago'
  },
  {
    id: '2',
    type: 'review',
    description: 'New 5-star review from Sarah M.',
    timestamp: '1 hour ago'
  },
  {
    id: '3',
    type: 'payment',
    description: 'Payment received for appointment #A1234',
    timestamp: '2 hours ago'
  },
  {
    id: '4',
    type: 'message',
    description: 'New message from Alex T.',
    timestamp: '3 hours ago'
  }
]

export default function DashboardPage() {
  const [appointments] = useState<Appointment[]>(upcomingAppointments)
  const [activities] = useState<RecentActivity[]>(recentActivities)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'completed':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <DashboardStats stats={artistDashboardStats} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-6 h-6 text-white" />
                  <h2 className="text-lg font-semibold text-white">Upcoming Appointments</h2>
                </div>
                <Link
                  href="/dashboard/appointments"
                  className="text-sm text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  View all
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="p-6 space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-400">No upcoming appointments</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-semibold">{appointment.clientName}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{appointment.service}</p>
                        </div>
                        {appointment.price > 0 && (
                          <span className="text-white font-semibold">${appointment.price}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {appointment.time}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        {appointment.status === 'pending' && (
                          <>
                            <button className="flex-1 px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                              <CheckCircleIcon className="w-4 h-4 mr-2" />
                              Accept
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors border border-gray-600 flex items-center justify-center">
                              <XMarkIcon className="w-4 h-4 mr-2" />
                              Decline
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Link
                            href={`/dashboard/appointments/${appointment.id}`}
                            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors border border-gray-600 text-center"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="p-6 space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 bg-white rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  href="/dashboard/portfolio/new"
                  className="block w-full px-4 py-3 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Add Portfolio Item
                </Link>
                <Link
                  href="/dashboard/appointments/new"
                  className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700 text-center"
                >
                  Create Appointment
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="block w-full px-4 py-3 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700 text-center"
                >
                  View Messages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
