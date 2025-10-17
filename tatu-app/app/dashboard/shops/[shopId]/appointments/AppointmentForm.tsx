'use client'

import { useState, useCallback, useEffect } from 'react'
import { format, addDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'
import { 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Artist {
  id: string
  name: string | null
  email: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface AppointmentFormData {
  title: string
  startTime: string
  endTime: string
  artistId: string
  serviceId: string
  clientEmail: string
  clientPhone?: string
  clientName?: string
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  deposit?: number
  totalPrice?: number
  location?: string
  specialRequests?: string
}

interface AppointmentFormProps {
  shopId: string
  artists: Artist[]
  services: Service[]
  initialData?: Partial<AppointmentFormData>
  onSubmit: (data: AppointmentFormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

interface ValidationError {
  field: string
  message: string
}

export default function AppointmentForm({
  shopId,
  artists,
  services,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: initialData?.title || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    artistId: initialData?.artistId || '',
    serviceId: initialData?.serviceId || '',
    clientEmail: initialData?.clientEmail || '',
    clientPhone: initialData?.clientPhone || '',
    clientName: initialData?.clientName || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'PENDING',
    deposit: initialData?.deposit || 0,
    totalPrice: initialData?.totalPrice || 0,
    location: initialData?.location || '',
    specialRequests: initialData?.specialRequests || '',
  })
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    // Title validation
    if (!formData.title.trim()) {
      newErrors.push({
        field: 'title',
        message: 'Title is required',
      })
    } else if (formData.title.trim().length < 2) {
      newErrors.push({
        field: 'title',
        message: 'Title must be at least 2 characters long',
      })
    } else if (formData.title.trim().length > 100) {
      newErrors.push({
        field: 'title',
        message: 'Title must be less than 100 characters',
      })
    }

    // Client name validation
    if (formData.clientName && formData.clientName.trim().length < 2) {
      newErrors.push({
        field: 'clientName',
        message: 'Client name must be at least 2 characters long',
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.clientEmail.trim()) {
      newErrors.push({
        field: 'clientEmail',
        message: 'Email is required',
      })
    } else if (!emailRegex.test(formData.clientEmail)) {
      newErrors.push({
        field: 'clientEmail',
        message: 'Please enter a valid email address',
      })
    }

    // Phone validation (if provided)
    if (formData.clientPhone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(formData.clientPhone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.push({
          field: 'clientPhone',
          message: 'Please enter a valid phone number',
        })
      }
    }

    // Time validation
    if (!formData.startTime) {
      newErrors.push({
        field: 'startTime',
        message: 'Start time is required',
      })
    } else if (!formData.endTime) {
      newErrors.push({
        field: 'endTime',
        message: 'End time is required',
      })
    } else {
      const startDate = new Date(formData.startTime)
      const endDate = new Date(formData.endTime)
      const now = new Date()

      if (startDate < now) {
        newErrors.push({
          field: 'startTime',
          message: 'Start time cannot be in the past',
        })
      }

      if (endDate <= startDate) {
        newErrors.push({
          field: 'endTime',
          message: 'End time must be after start time',
        })
      }

      // Check if appointment is within business hours (9 AM - 9 PM)
      const startHour = startDate.getHours()
      const endHour = endDate.getHours()
      if (startHour < 9 || endHour > 21) {
        newErrors.push({
          field: 'startTime',
          message: 'Appointments must be scheduled between 9 AM and 9 PM',
        })
      }

      // Check minimum duration (30 minutes)
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
      if (duration < 30) {
        newErrors.push({
          field: 'endTime',
          message: 'Minimum appointment duration is 30 minutes',
        })
      }
    }

    // Required fields validation
    if (!formData.artistId) {
      newErrors.push({
        field: 'artistId',
        message: 'Please select an artist',
      })
    }

    if (!formData.serviceId) {
      newErrors.push({
        field: 'serviceId',
        message: 'Please select a service',
      })
    }

    // Special requests validation
    if (formData.specialRequests && formData.specialRequests.length > 500) {
      newErrors.push({
        field: 'specialRequests',
        message: 'Special requests must be less than 500 characters',
      })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      await onSubmit(formData)
    }
  }

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message
  }

  // Calculate price based on service and duration
  const calculatePrice = useCallback(() => {
    const service = services.find(s => s.id === formData.serviceId)
    if (!service || !formData.startTime || !formData.endTime) return

    const startDate = new Date(formData.startTime)
    const endDate = new Date(formData.endTime)
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60) // minutes

    // Calculate price based on service base price and duration
    const basePrice = service.price
    const hourlyRate = basePrice / (service.duration / 60) // Convert to hourly rate
    const totalPrice = (duration / 60) * hourlyRate
    const deposit = totalPrice * 0.3 // 30% deposit

    setFormData(prev => ({
      ...prev,
      totalPrice: Math.round(totalPrice * 100) / 100,
      deposit: Math.round(deposit * 100) / 100
    }))
  }, [formData.serviceId, formData.startTime, formData.endTime, services])

  // Generate available time slots for a given date
  const generateTimeSlots = useCallback((date: string) => {
    const slots = []
    const startHour = 9
    const endHour = 21
    const interval = 30 // 30-minute intervals

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(`${date}T${timeString}`)
      }
    }
    return slots
  }, [])

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service && formData.startTime) {
      const startDate = new Date(formData.startTime)
      const endDate = new Date(startDate.getTime() + service.duration * 60000)
      setFormData({
        ...formData,
        serviceId,
        endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
      })
    } else {
      setFormData({ ...formData, serviceId })
    }
    
    // Recalculate price when service changes
    setTimeout(calculatePrice, 100)
  }

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Recalculate price when time changes
    setTimeout(calculatePrice, 100)
  }

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate)
      setAvailableTimeSlots(slots)
    }
  }, [selectedDate, generateTimeSlots])

  // Auto-calculate price when relevant fields change
  useEffect(() => {
    if (formData.serviceId && formData.startTime && formData.endTime) {
      calculatePrice()
    }
  }, [formData.serviceId, formData.startTime, formData.endTime, calculatePrice])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Appointment' : 'Book New Appointment'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Schedule a tattoo appointment with detailed information and pricing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    setErrors(errors.filter(error => error.field !== 'title'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('title') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Dragon Sleeve Tattoo"
                  maxLength={100}
                  required
                />
                {getFieldError('title') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name
                </label>
                <input
                  type="text"
                  value={formData.clientName || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, clientName: e.target.value })
                    setErrors(errors.filter(error => error.field !== 'clientName'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('clientName') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Client's full name"
                />
                {getFieldError('clientName') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('clientName')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <EnvelopeIcon className="h-5 w-5 mr-2" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, clientEmail: e.target.value })
                    setErrors(errors.filter(error => error.field !== 'clientEmail'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('clientEmail') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="client@example.com"
                  required
                />
                {getFieldError('clientEmail') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('clientEmail')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, clientPhone: e.target.value })
                    setErrors(errors.filter(error => error.field !== 'clientPhone'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('clientPhone') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                />
                {getFieldError('clientPhone') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('clientPhone')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Scheduling
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => {
                    handleTimeChange('startTime', e.target.value)
                    setErrors(errors.filter(error => error.field !== 'startTime'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('startTime') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required
                />
                {getFieldError('startTime') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('startTime')}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => {
                    handleTimeChange('endTime', e.target.value)
                    setErrors(errors.filter(error => error.field !== 'endTime'))
                  }}
                  className={`block w-full rounded-md border shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    getFieldError('endTime') ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min={formData.startTime || format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  required
                />
                {getFieldError('endTime') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('endTime')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Service & Artist Selection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artist *
                </label>
                <select
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Select an artist</option>
                  {artists.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.name || artist.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleServiceChange(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({service.duration} min - ${service.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Client Email</label>
        <input
          type="email"
          value={formData.clientEmail}
          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

          {/* Status (for editing) */}
          {initialData && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Appointment Status
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentFormData['status'] })}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {initialData ? 'Updating Appointment...' : 'Creating Appointment...'}
                </>
              ) : (
                initialData ? 'Update Appointment' : 'Create Appointment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 