'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '../components/DashboardLayout'
import { CameraIcon, PencilIcon, LinkIcon, XMarkIcon, StarIcon, MapPinIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import DashboardStats, { useDashboardStats } from '../components/DashboardStats'
import ArtistLocationMap from '../components/ArtistLocationMap'
import Link from 'next/link'

interface CustomerProfile {
  id: string
  avatar: string | null
  bio: string | null
  instagramHandle: string | null
  instagramLinked: boolean
  instagramImages?: InstagramImage[]
}

interface ArtistProfile extends CustomerProfile {
  age?: number | null
  location?: string | null
  specialties?: string[]
  latitude?: number | null
  longitude?: number | null
  locationRadius?: number | null
  actualAddress?: string | null
}

interface InstagramImage {
  id: string
  url: string
  thumbnail: string
  caption?: string
  timestamp: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [bioText, setBioText] = useState('')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLinkingInstagram, setIsLinkingInstagram] = useState(false)

  // Check if user is customer
  const isCustomer = session?.user?.role === 'CUSTOMER'

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  // Check for Instagram callback success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('instagram_linked') === 'true') {
      toast.success('Instagram account linked successfully!')
      fetchProfile()
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard')
    } else if (params.get('instagram_error')) {
      toast.error('Failed to link Instagram account')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      
      // For customers: check instagramLinked
      // For artists: check if instagram field exists (they might have just a handle, not OAuth)
      if (isCustomer) {
        if (data.instagramLinked) {
          try {
            const imagesResponse = await fetch('/api/instagram/images')
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json()
              data.instagramImages = imagesData.images || []
            }
          } catch (error) {
            console.warn('Failed to fetch Instagram images:', error)
          }
        }
      } else {
        // For artists, if they have an instagram handle, we can show it
        // But Instagram images API is currently customer-only
        // For now, artists can just display their handle
        if (data.instagram) {
          data.instagramHandle = data.instagram.replace('@', '')
          data.instagramLinked = true // Show as linked if they have a handle
        }
      }
      
      setProfile(data)
      setBioText(data.bio || '')
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.details || 'Upload failed'
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (!data.url) {
        throw new Error('No URL returned from upload')
      }
      
      // Update profile with new avatar URL
      const updateResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: data.url }),
      })

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to update profile'
        throw new Error(errorMessage)
      }

      const updatedProfile = await updateResponse.json()
      setProfile(updatedProfile)
      toast.success('Profile picture updated')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      const errorMessage = error?.message || 'Failed to upload profile picture'
      toast.error(errorMessage)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleBioSave = async () => {
    if (bioText.length > 500) {
      toast.error('Bio must be 500 characters or less')
      return
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: bioText }),
      })

      if (!response.ok) {
        throw new Error('Failed to update bio')
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setIsEditingBio(false)
      toast.success('Bio updated')
    } catch (error) {
      console.error('Error updating bio:', error)
      toast.error('Failed to update bio')
    }
  }

  const handleLinkInstagram = async () => {
    setIsLinkingInstagram(true)
    try {
      // Redirect to Instagram OAuth
      const response = await fetch('/api/instagram/auth', {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || 'Failed to initiate Instagram linking')
      }

      const data = await response.json()
      
      // Check if it's a mock/success response (development mode)
      if (data.success) {
        toast.success(data.message || 'Instagram linked successfully')
        if (data.warning) {
          toast(data.warning, { icon: '⚠️', duration: 5000 })
        }
        fetchProfile() // Refresh profile to show linked status
        setIsLinkingInstagram(false)
        return
      }
      
      // Production: Redirect to Instagram OAuth URL
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        throw new Error('No auth URL returned')
      }
    } catch (error: any) {
      console.error('Error linking Instagram:', error)
      const errorMessage = error?.message || 'Failed to link Instagram account'
      toast.error(errorMessage)
      setIsLinkingInstagram(false)
    }
  }

  const handleUnlinkInstagram = async () => {
    try {
      const response = await fetch('/api/instagram/unlink', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to unlink Instagram')
      }

      setProfile(prev => prev ? { ...prev, instagramLinked: false, instagramHandle: null, instagramImages: [] } : null)
      toast.success('Instagram account unlinked')
    } catch (error) {
      console.error('Error unlinking Instagram:', error)
      toast.error('Failed to unlink Instagram account')
    }
  }

  // If not customer, show artist dashboard with profile features + stats
  if (!isCustomer) {
    return (
      <DashboardLayout userRole="artist">
        <ArtistDashboard 
          profile={profile}
          setProfile={setProfile}
          isLoading={isLoading}
          isEditingBio={isEditingBio}
          setIsEditingBio={setIsEditingBio}
          bioText={bioText}
          setBioText={setBioText}
          isUploadingAvatar={isUploadingAvatar}
          isLinkingInstagram={isLinkingInstagram}
          handleAvatarUpload={handleAvatarUpload}
          handleBioSave={handleBioSave}
          handleLinkInstagram={handleLinkInstagram}
          handleUnlinkInstagram={handleUnlinkInstagram}
        />
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="client">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="client">
      <div className="w-full space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your profile and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <CameraIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  title="Upload profile picture"
                >
                  <CameraIcon className="w-5 h-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
                  </div>

            {/* Bio Section */}
            <div className="flex-1">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-white">Bio</label>
                  {!isEditingBio && (
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Edit bio"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                        )}
                      </div>
                {isEditingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {bioText.length}/500 characters
                        </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditingBio(false)
                            setBioText(profile?.bio || '')
                          }}
                          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                            </button>
                        <button
                          onClick={handleBioSave}
                          className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                          Save
                            </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 min-h-[60px]">
                    {profile?.bio || (
                      <span className="text-gray-500 italic">No bio yet. Click the edit icon to add one.</span>
                    )}
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>

        {/* Instagram Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">Instagram Preview</h2>
              <p className="text-sm text-gray-400">
                {profile?.instagramLinked
                  ? `Connected as @${profile.instagramHandle}`
                  : 'Link your Instagram to showcase recent photos'}
              </p>
              </div>
            {profile?.instagramLinked ? (
              <button
                onClick={handleUnlinkInstagram}
                className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 flex items-center gap-2"
              >
                <XMarkIcon className="w-4 h-4" />
                Unlink
              </button>
            ) : (
              <button
                onClick={handleLinkInstagram}
                disabled={isLinkingInstagram}
                className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <LinkIcon className="w-4 h-4" />
                {isLinkingInstagram ? 'Linking...' : 'Link Instagram'}
              </button>
            )}
                    </div>

          {profile?.instagramLinked ? (
            profile.instagramImages && profile.instagramImages.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {profile.instagramImages.slice(0, 6).map((image) => (
                  <div
                    key={image.id}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700"
                  >
                    <img
                      src={image.thumbnail || image.url}
                      alt={image.caption || 'Instagram photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-gray-800 rounded-lg">
                <p className="text-gray-400 mb-2">No Instagram photos found</p>
                <p className="text-sm text-gray-500">Your recent photos will appear here</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 border border-gray-800 rounded-lg border-dashed">
              <LinkIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">Instagram not connected</p>
              <p className="text-sm text-gray-500 mb-4">
                Connect your Instagram account to display your recent photos
              </p>
              <button
                onClick={handleLinkInstagram}
                disabled={isLinkingInstagram}
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                {isLinkingInstagram ? 'Linking...' : 'Connect Instagram'}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// Artist Dashboard Component
interface ArtistDashboardProps {
  profile: ArtistProfile | null
  setProfile: (profile: ArtistProfile | null) => void
  isLoading: boolean
  isEditingBio: boolean
  setIsEditingBio: (editing: boolean) => void
  bioText: string
  setBioText: (text: string) => void
  isUploadingAvatar: boolean
  isLinkingInstagram: boolean
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBioSave: () => void
  handleLinkInstagram: () => void
  handleUnlinkInstagram: () => void
}

function ArtistDashboard({
  profile,
  setProfile,
  isLoading,
  isEditingBio,
  setIsEditingBio,
  bioText,
  setBioText,
  isUploadingAvatar,
  isLinkingInstagram,
  handleAvatarUpload,
  handleBioSave,
  handleLinkInstagram,
  handleUnlinkInstagram,
}: ArtistDashboardProps) {
  const { stats, isLoading: statsLoading } = useDashboardStats('30d')
  const { data: session } = useSession()
  const [artistStats, setArtistStats] = useState<{ reviewCount: number; averageRating: number } | null>(null)
  const [isSavingLocation, setIsSavingLocation] = useState(false)
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true)

  // Fetch artist stats (reviews/ratings)
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/artists/stats')
        .then(res => res.json())
        .then(data => {
          if (data.reviewCount !== undefined) {
            setArtistStats(data)
          }
        })
        .catch(err => console.error('Failed to fetch artist stats:', err))
    }
  }, [session?.user?.id])

  // Fetch upcoming appointments
  useEffect(() => {
    if (session?.user?.id) {
      fetchUpcomingAppointments()
    }
  }, [session?.user?.id])

  const fetchUpcomingAppointments = async () => {
    setIsLoadingAppointments(true)
    try {
      const response = await fetch('/api/appointments')
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const appointments = await response.json()
      
      // Filter for upcoming appointments (status CONFIRMED or PENDING, date in future)
      const now = new Date()
      const upcoming = appointments
        .filter((apt: any) => {
          const aptDate = new Date(`${apt.date}T${apt.startTime}`)
          return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending')
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(`${a.date}T${a.startTime}`)
          const dateB = new Date(`${b.date}T${b.startTime}`)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(0, 5) // Show top 5 upcoming
      
      setUpcomingAppointments(upcoming)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  const handleLocationChange = async (locationData: {
    latitude: number
    longitude: number
    locationRadius: number
    actualAddress: string
  }) => {
    setIsSavingLocation(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          locationRadius: locationData.locationRadius,
          actualAddress: locationData.actualAddress,
        }),
      })

      if (!response.ok) throw new Error('Failed to save location')

      const updatedProfile = await response.json()
      setProfile({ ...profile, ...updatedProfile } as ArtistProfile)
      toast.success('Location saved successfully')
    } catch (error) {
      console.error('Error saving location:', error)
      toast.error('Failed to save location')
    } finally {
      setIsSavingLocation(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700'
    }
  }

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'decline') => {
    try {
      const endpoint = action === 'accept' ? '/api/bookings/approve' : '/api/bookings/decline'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      })

      if (!response.ok) throw new Error(`Failed to ${action} appointment`)

      toast.success(`Appointment ${action === 'accept' ? 'accepted' : 'declined'}`)
      fetchUpcomingAppointments() // Refresh list
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error)
      toast.error(`Failed to ${action} appointment`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700'
    }
  }

  const handleAppointmentAction = async (appointmentId: string, action: 'accept' | 'decline') => {
    try {
      const endpoint = action === 'accept' ? '/api/bookings/approve' : '/api/bookings/decline'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      })

      if (!response.ok) throw new Error(`Failed to ${action} appointment`)

      toast.success(`Appointment ${action === 'accept' ? 'accepted' : 'declined'}`)
      fetchUpcomingAppointments() // Refresh list
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error)
      toast.error(`Failed to ${action} appointment`)
    }
  }

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Dashboard Stats */}
      {!statsLoading && stats.length > 0 && (
        <DashboardStats stats={stats} layout="grid" />
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile, Map, Instagram */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <CameraIcon className="w-12 h-12" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload-artist"
                className="absolute bottom-0 right-0 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                title="Upload profile picture"
              >
                <CameraIcon className="w-5 h-5" />
                <input
                  id="avatar-upload-artist"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                />
              </label>
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          </div>

          {/* Name and Basic Info */}
          <div className="flex-1">
            {/* User Name */}
            <h2 className="text-2xl font-bold text-white mb-4">
              {session?.user?.name || 'Artist'}
            </h2>

            {/* Basic Info - Read Only */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {profile?.age && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Age</p>
                  <p className="text-white font-medium">{profile.age} years old</p>
                </div>
              )}
              {profile?.location && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {profile.location}
                  </p>
                </div>
              )}
              {profile?.specialties && profile.specialties.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Styles</p>
                  <p className="text-white font-medium">
                    {profile.specialties.slice(0, 2).join(', ')}
                    {profile.specialties.length > 2 && '...'}
                  </p>
                </div>
              )}
              {artistStats && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rating</p>
                  <div className="flex items-center gap-1">
                    <StarIconSolid className="w-4 h-4 text-yellow-400" />
                    <p className="text-white font-medium">
                      {artistStats.averageRating.toFixed(1)}
                    </p>
                    <span className="text-gray-500 text-sm">
                      ({artistStats.reviewCount} {artistStats.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white">Bio</label>
                {!isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Edit bio"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              {isEditingBio ? (
                <div className="space-y-3">
                  <textarea
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    maxLength={500}
                    rows={4}
                    className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none"
                    placeholder="Tell us about yourself and your artistry..."
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {bioText.length}/500 characters
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsEditingBio(false)
                          setBioText(profile?.bio || '')
                        }}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleBioSave}
                        className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 min-h-[60px]">
                  {profile?.bio || (
                    <span className="text-gray-500 italic">No bio yet. Click the edit icon to add one.</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

          {/* Location Map Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Set Your Location</h2>
              <p className="text-sm text-gray-400">
                Set your location for clients to find you. Your exact address will only be shared after booking confirmation.
              </p>
            </div>
            {isSavingLocation && (
              <div className="mb-4 px-4 py-2 bg-blue-900/20 border border-blue-700 rounded-lg text-blue-400 text-sm">
                Saving location...
              </div>
            )}
            <ArtistLocationMap
              latitude={profile?.latitude}
              longitude={profile?.longitude}
              locationRadius={profile?.locationRadius}
              actualAddress={profile?.actualAddress}
              onLocationChange={handleLocationChange}
            />
          </div>

          {/* Instagram Section */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">Instagram Preview</h2>
            <p className="text-sm text-gray-400">
              {profile?.instagramLinked
                ? `Connected as @${profile.instagramHandle}`
                : 'Link your Instagram to showcase recent photos'}
            </p>
          </div>
          {profile?.instagramLinked ? (
            <button
              onClick={handleUnlinkInstagram}
              className="px-4 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 flex items-center gap-2"
            >
              <XMarkIcon className="w-4 h-4" />
              Unlink
            </button>
          ) : (
            <button
              onClick={handleLinkInstagram}
              disabled={isLinkingInstagram}
              className="px-4 py-2 text-sm bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <LinkIcon className="w-4 h-4" />
              {isLinkingInstagram ? 'Linking...' : 'Link Instagram'}
            </button>
          )}
        </div>

        {profile?.instagramLinked ? (
          profile.instagramImages && profile.instagramImages.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {profile.instagramImages.slice(0, 6).map((image) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700"
                >
                  <img
                    src={image.thumbnail || image.url}
                    alt={image.caption || 'Instagram photo'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-800 rounded-lg">
              <p className="text-gray-400 mb-2">No Instagram photos found</p>
              <p className="text-sm text-gray-500">Your recent photos will appear here</p>
            </div>
          )
        ) : (
          <div className="text-center py-12 border border-gray-800 rounded-lg border-dashed">
            <LinkIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Instagram not connected</p>
            <p className="text-sm text-gray-500 mb-4">
              Connect your Instagram account to display your recent photos
            </p>
            <button
              onClick={handleLinkInstagram}
              disabled={isLinkingInstagram}
              className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              {isLinkingInstagram ? 'Linking...' : 'Connect Instagram'}
            </button>
          </div>
        )}
        </div>

        {/* Right Column - Upcoming Appointments */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-white" />
                <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
              </div>
              <Link
                href="/dashboard/calendar"
                className="text-sm text-white hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                View all
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-black border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">
                          {appointment.clientName || 'Client'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      {appointment.amount > 0 && (
                        <span className="text-white font-medium">${appointment.amount}</span>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{appointment.serviceName || 'Tattoo Session'}</p>
                    
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <CalendarIcon className="w-4 h-4" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <ClockIcon className="w-4 h-4" />
                        {formatTime(appointment.startTime)}
                      </div>
                    </div>

                    {appointment.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'accept')}
                          className="flex-1 px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'decline')}
                          className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                        >
                          <XCircleIcon className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
                        View Details
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
