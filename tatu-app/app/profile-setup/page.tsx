'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { UserIcon, PaintBrushIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline'
import Logo from '../components/Logo'

interface ProfileData {
  bio?: string
  phone?: string
  instagram?: string
  website?: string
  location?: string
  specialties?: string[]
  avatar?: string
  hourlyRate?: string
  experience?: string
}

export default function ProfileSetupPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER'>('CUSTOMER')
  const [profileData, setProfileData] = useState<ProfileData>({
    specialties: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tattooStyles = [
    'Traditional', 'Realism', 'Watercolor', 'Geometric', 'Minimalist',
    'Japanese', 'Blackwork', 'Neo-Traditional', 'Tribal', 'Portrait',
    'Biomechanical', 'Dotwork', 'Lettering', 'Abstract', 'Cartoon',
    'Fine Line', 'Surrealism', 'Religious', 'Horror', 'Cover-up'
  ]

  useEffect(() => {
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Check if user has already completed profile setup
    checkProfileStatus()
  }, [session])

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (data.completedRegistration) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    }
  }

  const handleRoleSelection = (role: 'CUSTOMER' | 'ARTIST' | 'SHOP_OWNER') => {
    setSelectedRole(role)
    setStep(2)
  }

  const handleSpecialtyToggle = (specialty: string) => {
    setProfileData(prev => ({
      ...prev,
      specialties: prev.specialties?.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...(prev.specialties || []), specialty]
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Update user role
      const roleResponse = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole,
          profileData: {
            ...profileData,
            completedRegistration: true
          }
        }),
      })

      if (!roleResponse.ok) {
        throw new Error('Failed to update profile')
      }

      // Update session
      await update()
      
      toast.success('Profile setup completed!')
      
      // Redirect based on role
      if (selectedRole === 'ARTIST') {
        router.push('/dashboard/portfolio')
      } else if (selectedRole === 'SHOP_OWNER') {
        router.push('/dashboard/shops')
      } else {
        router.push('/explore')
      }
    } catch (error) {
      console.error('Error setting up profile:', error)
      toast.error('Failed to complete profile setup')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo 
            variant="black" 
            size="lg" 
            href="/"
            className="mb-4 mx-auto"
          />
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {step} of 2</span>
            <span>{Math.round((step / 2) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to TATU!
                </h1>
                <p className="text-lg text-gray-600">
                  Let's set up your profile. What best describes you?
                </p>
              </div>

              <div className="space-y-4">
                {/* Customer Option */}
                <button
                  onClick={() => handleRoleSelection('CUSTOMER')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <UserIcon className="h-8 w-8 text-gray-400 group-hover:text-black" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">
                        I'm looking for tattoo artists
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-800">
                        Browse portfolios, book appointments, and find the perfect artist for your tattoo
                      </p>
                    </div>
                  </div>
                </button>

                {/* Artist Option */}
                <button
                  onClick={() => handleRoleSelection('ARTIST')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <PaintBrushIcon className="h-8 w-8 text-gray-400 group-hover:text-black" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">
                        I'm a tattoo artist
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-800">
                        Showcase your portfolio, manage bookings, and connect with clients
                      </p>
                    </div>
                  </div>
                </button>

                {/* Shop Owner Option */}
                <button
                  onClick={() => handleRoleSelection('SHOP_OWNER')}
                  className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 mr-4">
                      <BuildingStorefrontIcon className="h-8 w-8 text-gray-400 group-hover:text-black" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black">
                        I own a tattoo shop
                      </h3>
                      <p className="text-gray-600 group-hover:text-gray-800">
                        Manage your shop, artists, and showcase your business
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-gray-600">
                  {selectedRole === 'ARTIST' 
                    ? 'Tell us about your artistic style and experience'
                    : selectedRole === 'SHOP_OWNER'
                    ? 'Share details about your business'
                    : 'Help us personalize your experience'
                  }
                </p>
              </div>

              <form className="space-y-6">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio {selectedRole === 'ARTIST' && '(Tell clients about your experience and style)'}
                  </label>
                  <textarea
                    value={profileData.bio || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    placeholder={selectedRole === 'ARTIST' 
                      ? 'I\'ve been tattooing for 5 years, specializing in...'
                      : 'Tell us a bit about yourself...'
                    }
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="City, State"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                    <input
                      type="text"
                      value={profileData.instagram || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, instagram: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="yourusername"
                    />
                  </div>
                </div>

                {/* Website (for artists/shop owners) */}
                {(selectedRole === 'ARTIST' || selectedRole === 'SHOP_OWNER') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={profileData.website || ''}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-black"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                )}

                {/* Specialties (for artists) */}
                {selectedRole === 'ARTIST' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tattoo Styles & Specialties
                    </label>
                    <p className="text-sm text-gray-500 mb-3">
                      Select all styles that you're comfortable with
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {tattooStyles.map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => handleSpecialtyToggle(style)}
                          className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            profileData.specialties?.includes(style)
                              ? 'bg-black text-white border-black'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 