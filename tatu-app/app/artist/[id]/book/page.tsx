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
  CheckCircleIcon
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
}

interface BookingData {
  artistId: string
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
}

const TATTOO_SIZES = [
  { value: 'small', label: 'Small (under 2")' },
  { value: 'medium', label: 'Medium (2-4")' },
  { value: 'large', label: 'Large (4-8")' },
  { value: 'extra-large', label: 'Extra Large (8"+)' },
  { value: 'sleeve', label: 'Sleeve/Large piece' }
]

const DURATIONS = [
  { value: '30', label: '30 minutes - Quick consultation' },
  { value: '60', label: '1 hour - Standard consultation' },
  { value: '90', label: '1.5 hours - Detailed planning' },
  { value: '120', label: '2 hours - Comprehensive session' }
]

const BUDGET_RANGES = [
  { value: 'under-200', label: 'Under $200' },
  { value: '200-500', label: '$200 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-2000', label: '$1,000 - $2,000' },
  { value: '2000-plus', label: '$2,000+' },
  { value: 'unsure', label: 'Not sure yet' }
]

const PAYMENT_OPTIONS = [
  {
    type: 'consultation' as const,
    title: 'Consultation Fee',
    description: 'Pay consultation fee to secure your appointment',
    amount: STRIPE_CONFIG.consultationFee,
    recommended: true
  },
  {
    type: 'deposit' as const,
    title: 'Consultation + Deposit',
    description: 'Pay consultation fee plus a deposit toward your tattoo',
    amount: STRIPE_CONFIG.consultationFee + 10000, // $100 deposit
    recommended: false
  }
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
  
  const [bookingData, setBookingData] = useState<BookingData>({
    artistId: params.id as string,
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
    paymentAmount: STRIPE_CONFIG.consultationFee
  })

  useEffect(() => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    if (params.id) {
      fetchArtist(params.id as string)
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

  const handleInputChange = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
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
    if (currentStep < 5) {
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
      case 1: return 'Service Details'
      case 2: return 'Schedule'
      case 3: return 'Project Info'
      case 4: return 'Review'
      case 5: return 'Payment'
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
      <div className="bg-white shadow-sm border-b">
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
                <p className="text-gray-600">{artist.location}</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 5 && (
                    <div
                      className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900">{getStepTitle()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Service Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Details</h2>
                <p className="text-gray-600">Let's start with the basics</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Duration
                  </label>
                  <div className="space-y-2">
                    {DURATIONS.map((duration) => (
                      <label key={duration.value} className="flex items-center">
                        <input
                          type="radio"
                          name="duration"
                          value={duration.value}
                          checked={bookingData.duration === duration.value}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          className="mr-3 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{duration.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tattoo Size
                  </label>
                  <select
                    value={bookingData.tattooSize}
                    onChange={(e) => handleInputChange('tattooSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select size</option>
                    {TATTOO_SIZES.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={bookingData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select budget</option>
                    {BUDGET_RANGES.map((budget) => (
                      <option key={budget.value} value={budget.value}>
                        {budget.label}
                      </option>
                    ))}
                  </select>
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
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Schedule</h2>
                <p className="text-gray-600">When would you like to meet?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.preferredDate}
                    onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    value={bookingData.preferredTime}
                    onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a consultation request. The artist will confirm availability and may suggest alternative times if needed.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Project Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Details</h2>
                <p className="text-gray-600">Tell us about your tattoo idea</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tattoo Placement
                  </label>
                  <input
                    type="text"
                    value={bookingData.placement}
                    onChange={(e) => handleInputChange('placement', e.target.value)}
                    placeholder="e.g., forearm, shoulder, back, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                    placeholder="Describe your tattoo idea, style preferences, colors, themes, etc."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference Images (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <PaintBrushIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload reference images to help explain your vision
                    </p>
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      Choose Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Your Request</h2>
                <p className="text-gray-600">Please review your consultation details</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Artist</h4>
                    <p className="text-gray-600">{artist.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Duration</h4>
                    <p className="text-gray-600">{bookingData.duration} minutes</p>
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
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Placement</h4>
                  <p className="text-gray-600">{bookingData.placement}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900">Project Description</h4>
                  <p className="text-gray-600">{bookingData.projectDescription}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  <strong>What happens next?</strong> After submitting your request, you'll proceed to payment to secure your consultation slot.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Secure Your Consultation</h2>
                <p className="text-gray-600">Choose your payment option to confirm your booking</p>
              </div>

              <div className="space-y-4">
                {PAYMENT_OPTIONS.map((option) => (
                  <div
                    key={option.type}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      bookingData.paymentType === option.type
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.recommended ? 'ring-2 ring-indigo-200' : ''}`}
                    onClick={() => handlePaymentOptionChange(option)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="paymentType"
                          value={option.type}
                          checked={bookingData.paymentType === option.type}
                          onChange={() => handlePaymentOptionChange(option)}
                          className="mr-3 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{option.title}</h4>
                            {option.recommended && (
                              <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(option.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-start">
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
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <CreditCardIcon className="h-5 w-5" />
                {isProcessingPayment ? 'Processing...' : `Pay ${formatPrice(bookingData.paymentAmount)}`}
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!bookingData.tattooSize || !bookingData.budget)) ||
                    (currentStep === 2 && (!bookingData.preferredDate || !bookingData.preferredTime)) ||
                    (currentStep === 3 && (!bookingData.placement || !bookingData.projectDescription))
                  }
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitBooking}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Continue to Payment'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 