'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shop, ShopStatus, User } from '@prisma/client'
import Image from 'next/image'
import { Tab } from '@headlessui/react'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { sendShopStatusUpdateNotification } from '@/lib/email'
import DashboardLayout from '../../../components/DashboardLayout'

interface ShopWithDetails extends Shop {
  owner: {
    id: string
    name: string | null
    email: string
  }
  artists: {
    artist: {
      id: string
      name: string | null
      email: string
      artistProfile: {
        avatar: string | null
        specialties: string[]
      } | null
    }
  }[]
  _count: {
    artists: number
    appointments: number
    reviews: number
  }
  reviews: {
    id: string
    rating: number
    content: string
    createdAt: string
    user: {
      id: string
      name: string | null
      artistProfile: {
        avatar: string | null
      } | null
      customerProfile: {
        avatar: string | null
      } | null
    }
  }[]
  services: {
    id: string
    name: string
    description: string | null
    duration: number
    price: number
    artist: {
      id: string
      name: string | null
      email: string
    } | null
  }[]
  appointments: {
    id: string
    title: string
    startTime: string
    endTime: string
    status: string
    notes: string | null
    artist: {
      id: string
      name: string | null
      email: string
    }
    client: {
      id: string
      name: string | null
      email: string
    }
    service: {
      id: string
      name: string
    }
  }[]
}

export default function ShopDetailsPage({ params }: { params: { shopId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [shop, setShop] = useState<ShopWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState(0)

  useEffect(() => {
    fetchShopDetails()
  }, [params.shopId])

  const fetchShopDetails = async () => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}`)
      if (!response.ok) throw new Error('Failed to fetch shop details')
      const data = await response.json()
      setShop(data)
    } catch (error) {
      console.error('Error fetching shop details:', error)
      toast.error('Failed to load shop details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: ShopStatus) => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...shop, status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update shop status')

      // Send notification email
      if (shop?.owner) {
        await sendShopStatusUpdateNotification({
          ownerEmail: shop.owner.email,
          ownerName: shop.owner.name || 'Shop Owner',
          shopName: shop.name,
          newStatus: newStatus,
        })
      }

      toast.success('Shop status updated successfully')
      fetchShopDetails()
    } catch (error) {
      console.error('Error updating shop status:', error)
      toast.error('Failed to update shop status')
    }
  }

  const handleRemoveArtist = async (artistId: string) => {
    if (!confirm('Are you sure you want to remove this artist from the shop?')) return

    try {
      const response = await fetch(`/api/shops/${params.shopId}/artists/${artistId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove artist')

      toast.success('Artist removed successfully')
      fetchShopDetails()
    } catch (error) {
      console.error('Error removing artist:', error)
      toast.error('Failed to remove artist')
    }
  }

  if (!session?.user) return null

  if (isLoading) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!shop) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Shop not found</h2>
            <p className="mt-2 text-gray-400">The shop you're looking for doesn't exist or you don't have permission to view it.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
            <p className="mt-1 text-gray-600">{shop.city}, {shop.state}</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={shop.status}
              onChange={(e) => handleStatusChange(e.target.value as ShopStatus)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Overview
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Artists
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Services
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Appointments
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${selected
                ? 'bg-white text-indigo-700 shadow'
                : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
              }`
            }
          >
            Reviews
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-6">
          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Shop Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-start space-x-2">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="mt-1">
                          {shop.address}<br />
                          {shop.city}, {shop.state} {shop.zipCode}
                        </p>
                      </div>
                    </div>

                    {shop.phone && (
                      <div className="flex items-start space-x-2 mt-4">
                        <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="mt-1">{shop.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    {shop.email && (
                      <div className="flex items-start space-x-2">
                        <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1">{shop.email}</p>
                        </div>
                      </div>
                    )}

                    {shop.website && (
                      <div className="flex items-start space-x-2 mt-4">
                        <GlobeAltIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Website</p>
                          <a
                            href={shop.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-indigo-600 hover:text-indigo-500"
                          >
                            {shop.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {shop.description && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1">{shop.description}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Artists</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{shop._count.artists}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Appointments</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{shop._count.appointments}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-500">Reviews</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{shop._count.reviews}</p>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Artists</h3>
                  <button
                    onClick={() => router.push(`/dashboard/shops/${params.shopId}/artists/invite`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Invite Artist
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shop.artists.map(({ artist }) => (
                    <div key={artist.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {artist.artistProfile?.avatar ? (
                            <Image
                              src={artist.artistProfile.avatar}
                              alt={artist.name || ''}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {artist.name?.[0] || 'A'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{artist.name}</p>
                            <p className="text-sm text-gray-500">{artist.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveArtist(artist.id)}
                          className="text-sm text-red-600 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                      {artist.artistProfile?.specialties && artist.artistProfile.specialties.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-500">Specialties</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {artist.artistProfile.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Services</h3>
                  <button
                    onClick={() => router.push(`/dashboard/shops/${params.shopId}/services/new`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Add Service
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shop.services?.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-500">{service.description}</p>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">Duration: {service.duration} minutes</p>
                            <p className="text-sm text-gray-600">Price: ${service.price}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/dashboard/shops/${params.shopId}/services/${service.id}/edit`)}
                          className="text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          Edit
                        </button>
                      </div>
                      {service.artist && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-500">
                            Assigned to: {service.artist.name || service.artist.email}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
                  <button
                    onClick={() => router.push(`/dashboard/shops/${params.shopId}/appointments`)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Manage Appointments
                  </button>
                </div>

                <div className="space-y-6">
                  {shop.appointments?.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.startTime).toLocaleDateString()}{' '}
                              {new Date(appointment.startTime).toLocaleTimeString()} -{' '}
                              {new Date(appointment.endTime).toLocaleTimeString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Artist: {appointment.artist.name || appointment.artist.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              Client: {appointment.client.name || appointment.client.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              Service: {appointment.service.name}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            appointment.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-800'
                              : appointment.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-500">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                  {shop.appointments?.length === 0 && (
                    <p className="text-gray-500">No appointments yet.</p>
                  )}
                  {shop.appointments?.length > 5 && (
                    <div className="text-center">
                      <button
                        onClick={() => router.push(`/dashboard/shops/${params.shopId}/appointments`)}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        View all appointments
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
                {shop.reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet.</p>
                ) : (
                  <div className="space-y-6">
                    {shop.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-start space-x-3">
                          {(review.user.artistProfile?.avatar || review.user.customerProfile?.avatar) ? (
                            <Image
                              src={review.user.artistProfile?.avatar || review.user.customerProfile?.avatar || ''}
                              alt={review.user.name || ''}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-500 text-sm">
                                {review.user.name?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{review.user.name}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <p className="mt-2 text-gray-700">{review.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      </div>
    </DashboardLayout>
  )
} 