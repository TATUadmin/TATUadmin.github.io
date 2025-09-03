'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  CameraIcon,
  CreditCardIcon,
  CheckCircleIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { getStripe, formatPrice } from '@/lib/stripe-client'
import { STRIPE_CONFIG } from '@/lib/stripe'

interface Artist {
  id: string
  name: string
  avatar: string
  location: string
  specialties: string[]
  rating: number
  reviewCount: number
  yearsExperience?: number
}

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  popular?: boolean
}

interface TimeSlot {
  time: string
  available: boolean
  booked?: boolean
}

interface BookingData {
  artistId: string
  serviceId: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  duration: string
  budget: string
  projectDescription: string
  tattooSize: string
  placement: string
  isFirstTattoo: boolean
  referenceImages: string[]
  paymentType: 'consultation' | 'deposit' | 'full'
  paymentAmount: number
  appointmentId?: string
  specialRequests?: string
}

const TATTOO_SIZES = [
  { value: 'small', label: 'Small (under 2")', icon: '🔹' },
  { value: 'medium', label: 'Medium (2-4")', icon: '🔸' },
  { value: 'large', label: 'Large (4-8")', icon: '🔶' },
  { value: 'extra-large', label: 'Extra Large (8"+)', icon: '🔷' },
  { value: 'sleeve', label: 'Sleeve/Large piece', icon: '💫' }
]

const DURATIONS = [
  { value: '30', label: '30 minutes', description: 'Quick consultation' },
  { value: '60', label: '1 hour', description: 'Standard consultation' },
  { value: '90', label: '1.5 hours', description: 'Detailed planning' },
  { value: '120', label: '2 hours', description: 'Comprehensive session' }
]

const BUDGET_RANGES = [
  { value: 'under-200', label: 'Under $200', icon: '💰' },
  { value: '200-500', label: '$200 - $500', icon: '💵' },
  { value: '500-1000', label: '$500 - $1,000', icon: '💸' },
  { value: '1000-2000', label: '$1,000 - $2,000', icon: '🏦' },
  { value: '2000-plus', label: '$2,000+', icon: '💎' },
  { value: 'unsure', label: 'Not sure yet', icon: '🤔' }
]

const PAYMENT_OPTIONS = [
  {
    type: 'consultation' as const,
    title: 'Consultation Fee',
    description: 'Pay consultation fee to secure your appointment',
    amount: STRIPE_CONFIG.consultationFee,
    recommended: true,
    benefits: ['Secure your time slot', 'Professional consultation', 'Design discussion']
  },
  {
    type: 'deposit' as const,
    title: 'Consultation + Deposit',
    description: 'Pay consultation fee plus a deposit toward your tattoo',
    amount: STRIPE_CONFIG.consultationFee + 10000, // $100 deposit
    recommended: false,
    benefits: ['All consultation benefits', 'Reserve your tattoo date', 'Lock in current pricing']
  }
]

// Mock services - in real app, these would come from the artist's profile
const MOCK_SERVICES: Service[] = [
  {
    id: 'consultation',
    name: 'Initial Consultation',
    description: 'Meet with the artist to discuss your tattoo idea, placement, and design',
    duration: 60,
    price: STRIPE_CONFIG.consultationFee,
    category: 'consultation',
    popular: true
  },
  {
    id: 'small-tattoo',
    name: 'Small Tattoo',
    description: 'Simple designs under 2 inches',
    duration: 120,
    price: 15000, // $150
    category: 'tattoo'
  },
  {
    id: 'medium-tattoo',
    name: 'Medium Tattoo',
    description: 'Detailed designs 2-4 inches',
    duration: 180,
    price: 25000, // $250
    category: 'tattoo'
  },
  {
    id: 'large-tattoo',
    name: 'Large Tattoo',
    description: 'Complex designs 4-8 inches',
    duration: 240,
    price: 40000, // $400
    category: 'tattoo'
  }
]

// Mock available time slots
const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
]

export default function BookArtistPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  
  const [bookingData, setBookingData] = useState<BookingData>({
    artistId: params.id as string,
    serviceId: '',
    serviceType: 'consultation',
    preferredDate: '',
    preferredTime: '',
    duration: '60',
    budget: '',
    projectDescription: '',
    tattooSize: '',
    placement: '',
    isFirstTattoo: false,
    referenceImages: [],
    paymentType: 'consultation',
    paymentAmount: STRIPE_CONFIG.consultationFee,
    specialRequests: ''
  })

  useEffect(() => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    if (params.id) {
      fetchArtist(params.id as string)
      generateTimeSlots()
    }
  }, [params.id, session, router])

  const fetchArtist = async (artistId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/artists/${artistId}`)
      if (!response.ok) throw new Error('Failed to fetch artist')
      
      const data = await response.json()
      setArtist(data)
    } catch (error) {
      console.error('Error fetching artist:', error)
      toast.error('Failed to load artist information')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = AVAILABLE_TIMES.map(time => ({
      time,
      available: Math.random() > 0.3, // 70% availability for demo
      booked: false
    }))
    setAvailableTimeSlots(slots)
  }

  const handleInputChange = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleServiceSelection = (service: Service) => {
    setSelectedService(service)
    setBookingData(prev => ({
      ...prev,
      serviceId: service.id,
      serviceType: service.category,
      duration: service.duration.toString(),
      paymentAmount: service.price
    }))
  }

  const handlePaymentOptionChange = (option: typeof PAYMENT_OPTIONS[0]) => {
    setBookingData(prev => ({
      ...prev,
      paymentType: option.type,
      paymentAmount: option.amount
    }))
  }

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const submitBooking = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const appointment = await response.json()
        setBookingData(prev => ({ ...prev, appointmentId: appointment.id }))
        nextStep() // Go to payment step
      } else {
        throw new Error('Failed to submit booking')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      toast.error('Failed to submit consultation request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const processPayment = async () => {
    setIsProcessingPayment(true)
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: bookingData.appointmentId,
          artistId: bookingData.artistId,
          amount: bookingData.paymentAmount,
          paymentType: bookingData.paymentType.toUpperCase(),
          description: `${bookingData.paymentType === 'consultation' ? 'Consultation' : 'Consultation + Deposit'} with ${artist?.name}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment session')
      }

      const { url } = await response.json()
      
      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Choose Service'
      case 2: return 'Schedule Appointment'
      case 3: return 'Project Details'
      case 4: return 'Additional Info'
      case 5: return 'Review & Confirm'
      case 6: return 'Payment'
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Select the service you\'d like to book'
      case 2: return 'Pick your preferred date and time'
      case 3: return 'Tell us about your tattoo idea'
      case 4: return 'Any special requests or preferences?'
      case 5: return 'Review your booking details'
      case 6: return 'Secure your appointment with payment'
      default: return ''
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h2>
          <Link
            href="/explore"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Back to Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/artist/${params.id}`}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                {artist.avatar && (
                  <Image
                    src={artist.avatar}
                    alt={artist.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Book with {artist.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                    {artist.rating?.toFixed(1) || '4.8'} ({artist.reviewCount || 24} reviews)
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="h-4 w-4" />
                    {artist.location}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step <= currentStep
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 6 && (
                    <div
                      className={`w-16 h-1 mx-2 transition-all ${
                        step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-gray-900">{getStepTitle()}</p>
              <p className="text-xs text-gray-500">{getStepDescription()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Service</h2>
                <p className="text-gray-600">Select the service that best fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_SERVICES.map((service) => (
                  <div
                    key={service.id}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedService?.id === service.id
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${service.popular ? 'ring-2 ring-yellow-200 border-yellow-300' : ''}`}
                    onClick={() => handleServiceSelection(service)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          {service.popular && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="h-4 w-4" />
                            {service.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="h-4 w-4" />
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedService?.id === service.id
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedService?.id === service.id && (
                            <CheckCircleIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedService && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-800">
                      Selected: {selectedService.name} - {formatPrice(selectedService.price)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Schedule Your Appointment</h2>
                <p className="text-gray-600">Pick a date and time that works for you</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingData.preferredDate}
                      onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                      min={getMinDate()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                      required
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Available dates start from tomorrow</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => handleInputChange('preferredTime', slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          bookingData.preferredTime === slot.time
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : slot.available
                            ? 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Times shown are available for booking</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Flexible Scheduling</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Don't see a time that works? The artist may be able to accommodate special requests. 
                      You can also discuss alternative times during your consultation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Project Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tell Us About Your Tattoo</h2>
                <p className="text-gray-600">Help the artist understand your vision</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tattoo Size
                  </label>
                  <div className="space-y-2">
                    {TATTOO_SIZES.map((size) => (
                      <label key={size.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="tattooSize"
                          value={size.value}
                          checked={bookingData.tattooSize === size.value}
                          onChange={(e) => handleInputChange('tattooSize', e.target.value)}
                          className="mr-3 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-2xl mr-3">{size.icon}</span>
                        <span className="text-gray-700">{size.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <div className="space-y-2">
                    {BUDGET_RANGES.map((budget) => (
                      <label key={budget.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="budget"
                          value={budget.value}
                          checked={bookingData.budget === budget.value}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className="mr-3 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-2xl mr-3">{budget.icon}</span>
                        <span className="text-gray-700">{budget.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tattoo Placement
                </label>
                <input
                  type="text"
                  value={bookingData.placement}
                  onChange={(e) => handleInputChange('placement', e.target.value)}
                  placeholder="e.g., forearm, shoulder, back, ankle, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description
                </label>
                <textarea
                  value={bookingData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  placeholder="Describe your tattoo idea, style preferences, colors, themes, symbolism, etc. Be as detailed as possible!"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  The more details you provide, the better the artist can prepare for your consultation.
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="firstTattoo"
                  checked={bookingData.isFirstTattoo}
                  onChange={(e) => handleInputChange('isFirstTattoo', e.target.checked)}
                  className="mr-3 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="firstTattoo" className="text-gray-700">
                  This will be my first tattoo
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Additional Information</h2>
                <p className="text-gray-600">Help us provide the best experience possible</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests or Preferences
                </label>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Any special accommodations, preferences, or requests? (Optional)"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Images (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors">
                  <CameraIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload reference images to help explain your vision
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    You can also bring these to your consultation
                  </p>
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <PaintBrushIcon className="h-4 w-4 text-yellow-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800">First Time Getting a Tattoo?</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Don't worry! Many of our clients are first-timers. The consultation will cover everything you need to know, 
                      including aftercare, what to expect, and any questions you might have.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Review Your Booking</h2>
                <p className="text-gray-600">Please review your consultation details</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Artist</h4>
                    <p className="text-gray-600">{artist.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Service</h4>
                    <p className="text-gray-600">{selectedService?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Duration</h4>
                    <p className="text-gray-600">{selectedService?.duration} minutes</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Preferred Date</h4>
                    <p className="text-gray-600">
                      {new Date(bookingData.preferredDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Preferred Time</h4>
                    <p className="text-gray-600">{bookingData.preferredTime}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Tattoo Size</h4>
                    <p className="text-gray-600">
                      {TATTOO_SIZES.find(s => s.value === bookingData.tattooSize)?.label}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Budget</h4>
                    <p className="text-gray-600">
                      {BUDGET_RANGES.find(b => b.value === bookingData.budget)?.label}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Placement</h4>
                    <p className="text-gray-600">{bookingData.placement}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Project Description</h4>
                  <p className="text-gray-600">{bookingData.projectDescription}</p>
                </div>

                {bookingData.specialRequests && (
                  <div>
                    <h4 className="font-medium text-gray-900">Special Requests</h4>
                    <p className="text-gray-600">{bookingData.specialRequests}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">What happens next?</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      After submitting your request, you'll proceed to payment to secure your consultation slot. 
                      The artist will review your details and may reach out with any questions before your appointment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Secure Your Consultation</h2>
                <p className="text-gray-600">Choose your payment option to confirm your booking</p>
              </div>

              <div className="space-y-4">
                {PAYMENT_OPTIONS.map((option) => (
                  <div
                    key={option.type}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      bookingData.paymentType === option.type
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.recommended ? 'ring-2 ring-yellow-200 border-yellow-300' : ''}`}
                    onClick={() => handlePaymentOptionChange(option)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="paymentType"
                          value={option.type}
                          checked={bookingData.paymentType === option.type}
                          onChange={() => handlePaymentOptionChange(option)}
                          className="mr-4 mt-1 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">{option.title}</h4>
                            {option.recommended && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{option.description}</p>
                          <ul className="space-y-1">
                            {option.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(option.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">Secure Payment</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your payment is processed securely through Stripe. We never store your card information.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={processPayment}
                disabled={isProcessingPayment}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <CreditCardIcon className="h-5 w-5" />
                {isProcessingPayment ? 'Processing...' : `Pay ${formatPrice(bookingData.paymentAmount)}`}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !selectedService) ||
                    (currentStep === 2 && (!bookingData.preferredDate || !bookingData.preferredTime)) ||
                    (currentStep === 3 && (!bookingData.tattooSize || !bookingData.budget || !bookingData.placement || !bookingData.projectDescription))
                  }
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                >
                  Next Step
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue to Payment'}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 