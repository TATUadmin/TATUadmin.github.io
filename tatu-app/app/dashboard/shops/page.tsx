'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import Link from 'next/link'
import {
  BuildingStorefrontIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface Shop {
  id: string
  name: string
  description: string
  logo: string
  coverImage: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  rating: number
  reviewCount: number
  isVerified: boolean
  isFeatured: boolean
  specialties: string[]
  services: string[]
  hours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  artists: ShopArtist[]
  stats: ShopStats
  policies: ShopPolicies
}

interface ShopArtist {
  id: string
  name: string
  avatar: string
  role: 'owner' | 'manager' | 'artist' | 'apprentice'
  status: 'active' | 'inactive' | 'pending'
  joinDate: string
  rating: number
  reviewCount: number
  appointmentCount: number
  revenue: number
  specialties: string[]
}

interface ShopStats {
  totalArtists: number
  totalAppointments: number
  totalRevenue: number
  totalCustomers: number
  averageRating: number
  monthlyGrowth: number
  topServices: { name: string; count: number; revenue: number }[]
  customerRetention: number
}

interface ShopPolicies {
  cancellationPolicy: string
  depositPolicy: string
  refundPolicy: string
  ageRequirement: number
  healthRequirements: string[]
  covidProtocols: string[]
}

export default function ShopsPage() {
  const { data: session } = useSession()
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchShops()
    }
  }, [session])

  const fetchShops = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - in real app, this would come from API
      const mockShops: Shop[] = [
        {
          id: '1',
          name: 'Ink & Soul Tattoo Studio',
          description: 'Premium tattoo studio specializing in custom designs and traditional styles',
          logo: '/api/placeholder/80/80',
          coverImage: '/api/placeholder/400/200',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          phone: '(415) 555-0123',
          email: 'hello@inkandsoul.com',
          website: 'https://inkandsoul.com',
          rating: 4.8,
          reviewCount: 342,
          isVerified: true,
          isFeatured: true,
          specialties: ['Custom Designs', 'Traditional', 'Realism', 'Japanese'],
          services: ['Tattoos', 'Cover-ups', 'Touch-ups', 'Consultations'],
          hours: {
            monday: { open: '10:00 AM', close: '8:00 PM', closed: false },
            tuesday: { open: '10:00 AM', close: '8:00 PM', closed: false },
            wednesday: { open: '10:00 AM', close: '8:00 PM', closed: false },
            thursday: { open: '10:00 AM', close: '8:00 PM', closed: false },
            friday: { open: '10:00 AM', close: '8:00 PM', closed: false },
            saturday: { open: '11:00 AM', close: '7:00 PM', closed: false },
            sunday: { open: '12:00 PM', close: '6:00 PM', closed: false }
          },
          artists: [
            {
              id: 'artist1',
              name: 'Sarah Chen',
              avatar: '/api/placeholder/40/40',
              role: 'owner',
              status: 'active',
              joinDate: '2020-01-15',
              rating: 4.9,
              reviewCount: 127,
              appointmentCount: 45,
              revenue: 12500,
              specialties: ['Portraits', 'Realism', 'Fine Line']
            },
            {
              id: 'artist2',
              name: 'Mike Rodriguez',
              avatar: '/api/placeholder/40/40',
              role: 'artist',
              status: 'active',
              joinDate: '2021-03-20',
              rating: 4.7,
              reviewCount: 89,
              appointmentCount: 38,
              revenue: 9800,
              specialties: ['Traditional', 'Japanese', 'Blackwork']
            },
            {
              id: 'artist3',
              name: 'Emma Thompson',
              avatar: '/api/placeholder/40/40',
              role: 'apprentice',
              status: 'active',
              joinDate: '2023-06-10',
              rating: 4.5,
              reviewCount: 23,
              appointmentCount: 12,
              revenue: 3200,
              specialties: ['Watercolor', 'Minimalist']
            }
          ],
          stats: {
            totalArtists: 3,
            totalAppointments: 95,
            totalRevenue: 25500,
            totalCustomers: 78,
            averageRating: 4.8,
            monthlyGrowth: 12.5,
            topServices: [
              { name: 'Custom Tattoos', count: 45, revenue: 13500 },
              { name: 'Cover-ups', count: 18, revenue: 7200 },
              { name: 'Touch-ups', count: 32, revenue: 4800 }
            ],
            customerRetention: 85.2
          },
          policies: {
            cancellationPolicy: '24-hour notice required for cancellations',
            depositPolicy: '50% deposit required for custom designs',
            refundPolicy: 'No refunds on completed work',
            ageRequirement: 18,
            healthRequirements: ['Valid ID', 'No alcohol 24h before', 'Good health'],
            covidProtocols: ['Masks required', 'Sanitization between clients', 'Limited capacity']
          }
        },
        {
          id: '2',
          name: 'Urban Ink Collective',
          description: 'Modern tattoo collective with diverse artist styles',
          logo: '/api/placeholder/80/80',
          coverImage: '/api/placeholder/400/200',
          address: '456 Oak Avenue',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94601',
          phone: '(510) 555-0456',
          email: 'info@urbaninkcollective.com',
          website: 'https://urbaninkcollective.com',
          rating: 4.6,
          reviewCount: 189,
          isVerified: true,
          isFeatured: false,
          specialties: ['Neo-Traditional', 'Geometric', 'Minimalist', 'Color'],
          services: ['Tattoos', 'Piercings', 'Consultations', 'Design Services'],
          hours: {
            monday: { open: '11:00 AM', close: '7:00 PM', closed: false },
            tuesday: { open: '11:00 AM', close: '7:00 PM', closed: false },
            wednesday: { open: '11:00 AM', close: '7:00 PM', closed: false },
            thursday: { open: '11:00 AM', close: '7:00 PM', closed: false },
            friday: { open: '11:00 AM', close: '8:00 PM', closed: false },
            saturday: { open: '12:00 PM', close: '8:00 PM', closed: false },
            sunday: { open: '12:00 PM', close: '6:00 PM', closed: false }
          },
          artists: [
            {
              id: 'artist4',
              name: 'Alex Kim',
              avatar: '/api/placeholder/40/40',
              role: 'owner',
              status: 'active',
              joinDate: '2019-08-12',
              rating: 4.6,
              reviewCount: 73,
              appointmentCount: 28,
              revenue: 8400,
              specialties: ['Geometric', 'Minimalist', 'Dotwork']
            },
            {
              id: 'artist5',
              name: 'Lisa Wang',
              avatar: '/api/placeholder/40/40',
              role: 'artist',
              status: 'active',
              joinDate: '2022-01-15',
              rating: 4.5,
              reviewCount: 67,
              appointmentCount: 31,
              revenue: 7200,
              specialties: ['Neo-Traditional', 'Color', 'Lettering']
            }
          ],
          stats: {
            totalArtists: 2,
            totalAppointments: 59,
            totalRevenue: 15600,
            totalCustomers: 42,
            averageRating: 4.6,
            monthlyGrowth: 8.3,
            topServices: [
              { name: 'Custom Tattoos', count: 28, revenue: 8400 },
              { name: 'Geometric Designs', count: 18, revenue: 5400 },
              { name: 'Minimalist Work', count: 13, revenue: 3900 }
            ],
            customerRetention: 78.9
          },
          policies: {
            cancellationPolicy: '48-hour notice required for cancellations',
            depositPolicy: '30% deposit required for all appointments',
            refundPolicy: 'Partial refunds available within 7 days',
            ageRequirement: 18,
            healthRequirements: ['Valid ID', 'No recent illnesses', 'Clean skin'],
            covidProtocols: ['Vaccination required', 'Masks optional', 'Enhanced cleaning']
          }
        }
      ]

      setShops(mockShops)
    } catch (error) {
      console.error('Error fetching shops:', error)
      toast.error('Failed to load shops')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateShop = () => {
    setShowCreateModal(true)
  }

  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'artist': return 'bg-green-100 text-green-800'
      case 'apprentice': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to access shop management.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
              <p className="text-gray-600 mt-1">Manage your tattoo shops and operations</p>
            </div>
            <button
              onClick={handleCreateShop}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Create New Shop
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shops yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first tattoo shop to get started
            </p>
            <button
              onClick={handleCreateShop}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Your First Shop
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {shops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Shop Header */}
                <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                  <Image
                    src={shop.coverImage}
                    alt={shop.name}
                    fill
                    className="object-cover opacity-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white rounded-xl p-2">
                        <Image
                          src={shop.logo}
                          alt={shop.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="text-white">
                        <h2 className="text-2xl font-bold">{shop.name}</h2>
                        <p className="text-indigo-100">{shop.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <StarIcon className="h-4 w-4 text-yellow-300 fill-current" />
                            <span className="font-medium">{shop.rating}</span>
                            <span className="text-indigo-200">({shop.reviewCount} reviews)</span>
                          </div>
                          {shop.isVerified && (
                            <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                          {shop.isFeatured && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                        <CogIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Shop Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Shop Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Shop Information</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{shop.address}, {shop.city}, {shop.state} {shop.zipCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <PhoneIcon className="h-4 w-4" />
                          <span>{shop.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <EnvelopeIcon className="h-4 w-4" />
                          <span>{shop.email}</span>
                        </div>
                        {shop.website && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <GlobeAltIcon className="h-4 w-4" />
                            <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                              {shop.website}
                            </a>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {shop.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {shop.services.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Artists */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Artists</h3>
                        <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                          <UserPlusIcon className="h-4 w-4" />
                          Invite Artist
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {shop.artists.map((artist) => (
                          <div key={artist.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <Image
                              src={artist.avatar}
                              alt={artist.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-900 truncate">{artist.name}</h4>
                                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(artist.role)}`}>
                                  {artist.role}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(artist.status)}`}>
                                  {artist.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <StarIcon className="h-3 w-3 text-yellow-400 fill-current" />
                                  {artist.rating}
                                </span>
                                <span>{artist.appointmentCount} appointments</span>
                                <span className="font-medium">{formatCurrency(artist.revenue)}</span>
                              </div>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <UsersIcon className="h-5 w-5 text-indigo-600" />
                            <span className="text-sm text-gray-600">Total Artists</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{shop.stats.totalArtists}</span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="h-5 w-5 text-green-600" />
                            <span className="text-sm text-gray-600">Appointments</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{shop.stats.totalAppointments}</span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CurrencyDollarIcon className="h-5 w-5 text-yellow-600" />
                            <span className="text-sm text-gray-600">Revenue</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{formatCurrency(shop.stats.totalRevenue)}</span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <StarIcon className="h-5 w-5 text-purple-600" />
                            <span className="text-sm text-gray-600">Rating</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">{shop.stats.averageRating}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Monthly Growth</span>
                          <ArrowTrendingUpIcon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold">{shop.stats.monthlyGrowth}%</span>
                        <p className="text-indigo-100 text-sm">vs last month</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Link
                      href={`/dashboard/shops/${shop.id}`}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <EyeIcon className="h-4 w-4" />
                      View Details
                    </Link>
                    <Link
                      href={`/dashboard/shops/${shop.id}/artists`}
                      className="bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <UsersIcon className="h-4 w-4" />
                      Manage Artists
                    </Link>
                    <Link
                      href={`/dashboard/shops/${shop.id}/appointments`}
                      className="bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      View Calendar
                    </Link>
                    <Link
                      href={`/dashboard/shops/${shop.id}/analytics`}
                      className="bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors font-medium flex items-center gap-2"
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Shop Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Shop</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter shop name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your shop"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="ZIP code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Shop created successfully!')
                  setShowCreateModal(false)
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 