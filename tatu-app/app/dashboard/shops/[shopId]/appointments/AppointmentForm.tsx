'use client'

import { useState } from 'react'
import { format } from 'date-fns'

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
  notes?: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
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
    notes: initialData?.notes || '',
    status: initialData?.status || 'PENDING',
  })
  const [errors, setErrors] = useState<ValidationError[]>([])

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = []

    // Title validation
    if (formData.title.trim().length < 2) {
      newErrors.push({
        field: 'title',
        message: 'Title must be at least 2 characters long',
      })
    }

    // Time validation
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.clientEmail)) {
      newErrors.push({
        field: 'clientEmail',
        message: 'Please enter a valid email address',
      })
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value })
            setErrors(errors.filter(error => error.field !== 'title'))
          }}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            getFieldError('title') ? 'border-red-300' : 'border-gray-300'
          }`}
          required
        />
        {getFieldError('title') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => {
              setFormData({ ...formData, startTime: e.target.value })
              setErrors(errors.filter(error => error.field !== 'startTime'))
            }}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              getFieldError('startTime') ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {getFieldError('startTime') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('startTime')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => {
              setFormData({ ...formData, endTime: e.target.value })
              setErrors(errors.filter(error => error.field !== 'endTime'))
            }}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
              getFieldError('endTime') ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
          {getFieldError('endTime') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('endTime')}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Artist</label>
        <select
          value={formData.artistId}
          onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
        <label className="block text-sm font-medium text-gray-700">Service</label>
        <select
          value={formData.serviceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

      {initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentFormData['status'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            initialData ? 'Update' : 'Create'
          )}
        </button>
      </div>
    </form>
  )
} 