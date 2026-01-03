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
  const [selectedSubscription, setSelectedSubscription] = useState<'FREE' | 'PRO' | 'STUDIO'>('FREE')
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
      // Update user role and profile
      const roleResponse = await fetch('/api/profile/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: selectedRole,
          profileData: {
            ...profileData,
            completedRegistration: true
          },
          subscriptionTier: selectedSubscription
        }),
      })

      if (!roleResponse.ok) {
        throw new Error('Failed to update profile')
      }

      // If artist selected paid tier, create subscription
      if (selectedRole === 'ARTIST' && selectedSubscription !== 'FREE') {
        // Redirect to subscription checkout
        router.push(`/dashboard/subscription/checkout?tier=${selectedSubscription}&interval=MONTHLY&onboarding=true`)
        return
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
            <span>Step {step} of {selectedRole === 'ARTIST' ? 3 : 2}</span>
            <span>{Math.round((step / (selectedRole === 'ARTIST' ? 3 : 2)) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / (selectedRole === 'ARTIST' ? 3 : 2)) * 100}%` }}
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
                    onClick={() => {
                      if (selectedRole === 'ARTIST') {
                        setStep(3) // Go to subscription selection for artists
                      } else {
                        handleSubmit() // Complete setup for non-artists
                      }
                    }}
                    className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  >
                    {selectedRole === 'ARTIST' ? 'Continue' : 'Complete Setup'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Subscription Selection (Artists Only) */}
          {step === 3 && selectedRole === 'ARTIST' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Plan
                </h2>
                <p className="text-gray-600">
                  Start with our free plan or unlock premium features
                </p>
              </div>

              {/* Subscription Options */}
              <div className="space-y-4 mb-8">
                {/* FREE Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedSubscription('FREE')}
                  className={`w-full p-6 border-2 rounded-lg transition-all text-left ${
                    selectedSubscription === 'FREE'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Free</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-1">$0<span className="text-base font-normal text-gray-600">/month</span></p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedSubscription === 'FREE' ? 'border-black bg-black' : 'border-gray-300'
                    }`}>
                      {selectedSubscription === 'FREE' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      50 portfolio images
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      3 video consultations/month (unlimited duration)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Basic profile & booking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Standard search listing
                    </li>
                  </ul>
                </button>

                {/* PRO Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedSubscription('PRO')}
                  className={`w-full p-6 border-2 rounded-lg transition-all text-left relative ${
                    selectedSubscription === 'PRO'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Pro Artist</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-1">$39<span className="text-base font-normal text-gray-600">/month</span></p>
                      <p className="text-sm text-gray-600">or $390/year (save $78)</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedSubscription === 'PRO' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedSubscription === 'PRO' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <strong>Unlimited</strong> portfolio images
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <strong>Unlimited</strong> video consultations (HD, recording)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <strong>Boosted</strong> search ranking (2x visibility)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Advanced analytics & insights
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Instagram auto-posting
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Client management tools
                    </li>
                  </ul>
                </button>

                {/* STUDIO Tier */}
                <button
                  type="button"
                  onClick={() => setSelectedSubscription('STUDIO')}
                  className={`w-full p-6 border-2 rounded-lg transition-all text-left ${
                    selectedSubscription === 'STUDIO'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Studio</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-1">$129<span className="text-base font-normal text-gray-600">/month</span></p>
                      <p className="text-sm text-gray-600">or $1,290/year (save $258)</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedSubscription === 'STUDIO' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                    }`}>
                      {selectedSubscription === 'STUDIO' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Everything in Pro, plus:
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <strong>Full HD</strong> video (1080p + custom branding)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <strong>Premium</strong> search ranking (3x visibility)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Up to 10 artist accounts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Custom branding & URL
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      Studio-wide analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      API access
                    </li>
                  </ul>
                </button>
              </div>

              {/* Important Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>💡 No transaction fees.</strong> We don't process payments between you and clients. 
                  Handle payments however you want (cash, Venmo, etc.). We only charge for tools that help you grow.
                </p>
                <p className="text-sm text-blue-900">
                  <strong>⏱️ No time limits.</strong> All video consultations have unlimited duration on every tier. 
                  Talk as long as you need - we trust you!
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
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
                  {isSubmitting ? 'Setting up...' : selectedSubscription === 'FREE' ? 'Complete Setup' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 