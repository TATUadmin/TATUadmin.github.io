'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  CalendarIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  PlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  PaintBrushIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Appointment {
  id: string
  artistId: string
  artistName: string
  artistAvatar: string
  serviceName: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  amount: number
  location: string
}

interface FavoriteArtist {
  id: string
  name: string
  avatar: string
  location: string
  rating: number
  specialties: string[]
  lastActive: string
}

interface Review {
  id: string
  artistId: string
  artistName: string
  rating: number
  content: string
  createdAt: string
  appointmentId: string
}

interface Payment {
  id: string
  amount: number
  description: string
  date: string
  status: 'completed' | 'pending' | 'failed'
  appointmentId: string
}

interface UserStats {
  totalAppointments: number
  completedAppointments: number
  totalSpent: number
  favoriteArtists: number
  reviewsSubmitted: number
}

export default function ClientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [userStats, setUserStats] = useState<UserStats>({
    totalAppointments: 0,
    completedAppointments: 0,
    totalSpent: 0,
    favoriteArtists: 0,
    reviewsSubmitted: 0
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [favoriteArtists, setFavoriteArtists] = useState<FavoriteArtist[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [payments, setPayments] = useState<Payment[]>([])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // In a real app, these would be actual API calls
      // For now, we'll use mock data
      await Promise.all([
        fetchMockAppointments(),
        fetchMockFavoriteArtists(),
        fetchMockReviews(),
        fetchMockPayments(),
        fetchMockUserStats()
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMockAppointments = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        artistId: 'artist1',
        artistName: 'Sarah Chen',
        artistAvatar: '/api/placeholder/40/40',
        serviceName: 'Consultation + Small Tattoo',
        date: '2024-02-15',
        time: '14:00',
        status: 'confirmed',
        amount: 15000,
        location: 'San Francisco, CA'
      },
      {
        id: '2',
        artistId: 'artist2',
        artistName: 'Mike Rodriguez',
        artistAvatar: '/api/placeholder/40/40',
        serviceName: 'Initial Consultation',
        date: '2024-02-20',
        time: '10:00',
        status: 'pending',
        amount: 5000,
        location: 'Oakland, CA'
      },
      {
        id: '3',
        artistId: 'artist3',
        artistName: 'Emma Thompson',
        artistAvatar: '/api/placeholder/40/40',
        serviceName: 'Large Tattoo Session',
        date: '2024-01-30',
        time: '13:00',
        status: 'completed',
        amount: 40000,
        location: 'Berkeley, CA'
      }
    ]
    
    setAppointments(mockAppointments)
  }

  const fetchMockFavoriteArtists = async () => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const mockArtists: FavoriteArtist[] = [
      {
        id: 'artist1',
        name: 'Sarah Chen',
        avatar: '/api/placeholder/40/40',
        location: 'San Francisco, CA',
        rating: 4.9,
        specialties: ['Minimalist', 'Watercolor', 'Fine Line'],
        lastActive: '2024-02-10'
      },
      {
        id: 'artist2',
        name: 'Mike Rodriguez',
        avatar: '/api/placeholder/40/40',
        location: 'Oakland, CA',
        rating: 4.7,
        specialties: ['Traditional', 'Neo-Traditional', 'Japanese'],
        lastActive: '2024-02-12'
      },
      {
        id: 'artist3',
        name: 'Emma Thompson',
        avatar: '/api/placeholder/40/40',
        location: 'Berkeley, CA',
        rating: 4.8,
        specialties: ['Realism', 'Portrait', 'Blackwork'],
        lastActive: '2024-02-08'
      }
    ]
    
    setFavoriteArtists(mockArtists)
  }

  const fetchMockReviews = async () => {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const mockReviews: Review[] = [
      {
        id: 'review1',
        artistId: 'artist3',
        artistName: 'Emma Thompson',
        rating: 5,
        content: 'Amazing work! Emma really captured the essence of what I wanted. The detail is incredible and the healing process was smooth.',
        createdAt: '2024-02-05',
        appointmentId: '3'
      },
      {
        id: 'review2',
        artistId: 'artist1',
        artistName: 'Sarah Chen',
        rating: 4,
        content: 'Great consultation experience. Sarah was very professional and helped me refine my idea. Looking forward to the actual tattoo!',
        createdAt: '2024-01-25',
        appointmentId: '1'
      }
    ]
    
    setReviews(mockReviews)
  }

  const fetchMockPayments = async () => {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const mockPayments: Payment[] = [
      {
        id: 'payment1',
        amount: 15000,
        description: 'Consultation + Small Tattoo - Sarah Chen',
        date: '2024-02-01',
        status: 'completed',
        appointmentId: '1'
      },
      {
        id: 'payment2',
        amount: 5000,
        description: 'Initial Consultation - Mike Rodriguez',
        date: '2024-02-05',
        status: 'completed',
        appointmentId: '2'
      },
      {
        id: 'payment3',
        amount: 40000,
        description: 'Large Tattoo Session - Emma Thompson',
        date: '2024-01-25',
        status: 'completed',
        appointmentId: '3'
      }
    ]
    
    setPayments(mockPayments)
  }

  const fetchMockUserStats = async () => {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    setUserStats({
      totalAppointments: 3,
      completedAppointments: 1,
      totalSpent: 60000,
      favoriteArtists: 3,
      reviewsSubmitted: 2
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />
      case 'pending': return <ClockIcon className="h-4 w-4" />
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRescheduleAppointment = (appointmentId: string) => {
    toast.success('Redirecting to reschedule page...')
    // In real app, redirect to reschedule page
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        // In real app, make API call to cancel
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' as const }
              : apt
          )
        )
        toast.success('Appointment cancelled successfully')
      } catch (error) {
        toast.error('Failed to cancel appointment')
      }
    }
  }

  const handleRemoveFavorite = async (artistId: string) => {
    try {
      setFavoriteArtists(prev => prev.filter(artist => artist.id !== artistId))
      setUserStats(prev => ({ ...prev, favoriteArtists: prev.favoriteArtists - 1 }))
      toast.success('Artist removed from favorites')
    } catch (error) {
      toast.error('Failed to remove artist from favorites')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {session?.user?.name || 'User'}!</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>
              <Link
                href="/profile"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <UserIcon className="h-6 w-6" />
              </Link>
              <Link
                href="/settings"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CogIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <SparklesIcon className="h-5 w-5" /> },
              { id: 'appointments', label: 'Appointments', icon: <CalendarIcon className="h-5 w-5" /> },
              { id: 'favorites', label: 'Favorites', icon: <HeartIcon className="h-5 w-5" /> },
              { id: 'reviews', label: 'Reviews', icon: <StarIcon className="h-5 w-5" /> },
              { id: 'payments', label: 'Payments', icon: <CurrencyDollarIcon className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.totalAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.completedAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(userStats.totalSpent)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <HeartIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Favorite Artists</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.favoriteArtists}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.reviewsSubmitted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/explore"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <PlusIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Find New Artist</h3>
                    <p className="text-sm text-gray-500">Discover talented tattoo artists</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-indigo-600 transition-colors" />
                </Link>

                <Link
                  href="/appointments/new"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">Book Appointment</h3>
                    <p className="text-sm text-gray-500">Schedule with your favorite artist</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-indigo-600 transition-colors" />
                </Link>

                <Link
                  href="/portfolio"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <PaintBrushIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-900">View Portfolio</h3>
                    <p className="text-sm text-gray-500">See your tattoo collection</p>
                  </div>
                  <ArrowRightIcon className="h-5 w-5 text-gray-400 ml-auto group-hover:text-indigo-600 transition-colors" />
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                  <Link
                    href="/dashboard/appointments"
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {appointments
                    .filter(apt => apt.status === 'confirmed' || apt.status === 'pending')
                    .slice(0, 3)
                    .map((appointment) => (
                      <div key={appointment.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={appointment.artistAvatar}
                            alt={appointment.artistName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-gray-900">{appointment.artistName}</h4>
                          <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(appointment.date)} at {appointment.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                  )}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
                  <Link
                    href="/dashboard/reviews"
                    className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{review.artistName}</h4>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.content}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(review.createdAt)}</p>
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
              <Link
                href="/explore"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Book New Appointment
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                              <Image
                                src={appointment.artistAvatar}
                                alt={appointment.artistName}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{appointment.artistName}</div>
                              <div className="text-sm text-gray-500">{appointment.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.serviceName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(appointment.date)}</div>
                          <div className="text-sm text-gray-500">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatPrice(appointment.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRescheduleAppointment(appointment.id)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                            <Link
                              href={`/appointments/${appointment.id}`}
                              className="text-gray-600 hover:text-gray-900 p-1 hover:bg-gray-50 rounded"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Favorite Artists</h2>
              <Link
                href="/explore"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Discover More Artists
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteArtists.map((artist) => (
                <div key={artist.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        <Image
                          src={artist.avatar}
                          alt={artist.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                        <div className="flex items-center gap-1 mb-1">
                          <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{artist.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4" />
                          {artist.location}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(artist.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                    >
                      <HeartIcon className="h-6 w-6 fill-current" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {artist.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Last active: {formatDate(artist.lastActive)}
                    </span>
                    <Link
                      href={`/artist/${artist.id}`}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                    >
                      View Profile
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
              <Link
                href="/explore"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Write New Review
              </Link>
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {review.artistName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{review.artistName}</h3>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Review for appointment on {formatDate(review.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                        Edit Review
                      </button>
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Delete Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {reviews.length === 0 && (
                <div className="text-center py-12">
                  <StarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500 mb-4">Share your experience with the artists you've worked with</p>
                  <Link
                    href="/explore"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Find Artists to Review
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
              <div className="text-sm text-gray-500">
                Total spent: <span className="font-semibold">{formatPrice(userStats.totalSpent)}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(payment.date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{payment.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatPrice(payment.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'completed' && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                            {payment.status === 'pending' && <ClockIcon className="h-4 w-4 mr-1" />}
                            {payment.status === 'failed' && <ExclamationTriangleIcon className="h-4 w-4 mr-1" />}
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            Download Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 