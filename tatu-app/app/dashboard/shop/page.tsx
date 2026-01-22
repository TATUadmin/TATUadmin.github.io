'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  BuildingStorefrontIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeAltIcon,
  PencilIcon,
  PlusIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Shop {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  instagram: string
  hours: Record<string, string>
  images: string[]
  status: string
  artistCount: number
}

interface Artist {
  id: string
  name: string
  avatar: string
  specialties: string[]
  portfolioCount: number
  rating: number
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

export default function ShopDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [shop, setShop] = useState<Shop | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    hours: {} as Record<string, string>
  })

  useEffect(() => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    fetchShopData()
  }, [session, router])

  const fetchShopData = async () => {
    setIsLoading(true)
    try {
      const [shopResponse, artistsResponse] = await Promise.all([
        fetch('/api/shop'),
        fetch('/api/shop/artists')
      ])

      if (shopResponse.ok) {
        const shopData = await shopResponse.json()
        setShop(shopData)
        setEditData({
          name: shopData.name || '',
          description: shopData.description || '',
          address: shopData.address || '',
          phone: shopData.phone || '',
          email: shopData.email || '',
          website: shopData.website || '',
          instagram: shopData.instagram || '',
          hours: shopData.hours || {}
        })
      }

      if (artistsResponse.ok) {
        const artistsData = await artistsResponse.json()
        setArtists(artistsData)
      }
    } catch (error) {
      console.error('Error fetching shop data:', error)
      toast.error('Failed to load shop information')
    } finally {
      setIsLoading(false)
    }
  }

  const updateShop = async () => {
    try {
      const response = await fetch('/api/shop', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        toast.success('Shop information updated successfully!')
        setShowEditModal(false)
        fetchShopData()
      } else {
        throw new Error('Failed to update shop')
      }
    } catch (error) {
      console.error('Error updating shop:', error)
      toast.error('Failed to update shop information')
    }
  }

  const formatHours = (hours: Record<string, string>) => {
    return DAYS_OF_WEEK.map(day => {
      const dayHours = hours[day]
      const dayName = day.charAt(0).toUpperCase() + day.slice(1)
      return `${dayName}: ${dayHours || 'Closed'}`
    }).join('\n')
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!shop) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BuildingStorefrontIcon className="h-24 w-24 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Shop Found</h2>
            <p className="text-gray-400 mb-6">Create your shop profile to get started</p>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-md font-medium transition-colors"
            >
              Create Shop Profile
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{shop.name}</h1>
              <p className="text-gray-400 mt-1">Shop Management Dashboard</p>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Shop Info
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shop Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-gray-950 rounded-xl shadow-sm border border-gray-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Shop Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white">{shop.name}</h3>
                  <p className="text-gray-400">{shop.description}</p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-white">{shop.address}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <p className="text-white">{shop.phone}</p>
                </div>

                {shop.website && (
                  <div className="flex items-center space-x-3">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    <a 
                      href={shop.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300"
                    >
                      {shop.website}
                    </a>
                  </div>
                )}

                {shop.instagram && (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">@</span>
                    <a 
                      href={`https://instagram.com/${shop.instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300"
                    >
                      {shop.instagram}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-gray-950 rounded-xl shadow-sm border border-gray-900 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Hours</h2>
              <div className="space-y-2">
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="flex justify-between">
                    <span className="font-medium text-white capitalize">{day}</span>
                    <span className="text-gray-600">{shop.hours[day] || 'Closed'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Artists Section */}
            <div className="bg-gray-950 rounded-xl shadow-sm border border-gray-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Shop Artists</h2>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Invite Artist
                </button>
              </div>
              
              {artists.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No artists in your shop yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artists.map(artist => (
                    <div key={artist.id} className="border border-gray-800 rounded-xl p-4 bg-gray-900">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                          {artist.avatar ? (
                            <Image
                              src={artist.avatar}
                              alt={artist.name}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-600">
                              <CameraIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{artist.name}</h3>
                          <p className="text-sm text-gray-500">
                            {artist.portfolioCount} portfolio items • {artist.rating.toFixed(1)} rating
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {artist.specialties.slice(0, 2).map(specialty => (
                              <span key={specialty} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gray-950 rounded-xl shadow-sm border border-gray-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Artists</span>
                  <span className="font-medium">{shop.artistCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shop Status</span>
                  <span className={`font-medium ${shop.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {shop.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Shop Images */}
            <div className="bg-gray-950 rounded-xl shadow-sm border border-gray-900 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Photos</h3>
              {shop.images.length === 0 ? (
                <div className="text-center py-8">
                  <CameraIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No photos uploaded yet</p>
                  <button className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                    Upload Photos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {shop.images.slice(0, 4).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Shop photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Shop Information</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editData.website}
                    onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={editData.instagram}
                    onChange={(e) => setEditData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Business Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <div className="space-y-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center space-x-3">
                      <span className="w-20 text-sm font-medium text-gray-700 capitalize">{day}</span>
                      <input
                        type="text"
                        value={editData.hours[day] || ''}
                        onChange={(e) => setEditData(prev => ({
                          ...prev,
                          hours: { ...prev.hours, [day]: e.target.value }
                        }))}
                        placeholder="e.g., 9:00 AM - 6:00 PM or Closed"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateShop}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
} 