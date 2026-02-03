'use client'

import { useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface BookingForm {
  name: string
  email: string
  phone: string
  date: string
  time: string
  description: string
  size: string
  style: string
}

export default function BookAppointmentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const artistId = params.id as string
  
  const [formData, setFormData] = useState<BookingForm>({
    name: '',
    email: '',
    phone: '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    description: '',
    size: '',
    style: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message and redirect
    setStatusMessage('Booking request submitted successfully! The artist will contact you soon.')
    setTimeout(() => {
      router.push(`/artist/${artistId}`)
    }, 1200)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="bg-black py-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/artist/${artistId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
              <p className="text-gray-400">Schedule your tattoo session</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-transparent border-2 border-gray-400 rounded-lg p-8">
            <h2 className="headline text-xl text-white mb-6">Appointment Details</h2>
            {statusMessage && (
              <div className="mb-6 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {statusMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Appointment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-white text-sm font-medium mb-2">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input w-full pl-10"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-white text-sm font-medium mb-2">
                    Preferred Time *
                  </label>
                  <div className="relative">
                    <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      id="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                      className="input w-full pl-10"
                    >
                      <option value="">Select time</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tattoo Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="size" className="block text-white text-sm font-medium mb-2">
                    Estimated Size *
                  </label>
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small (1-3 inches)</option>
                    <option value="medium">Medium (3-6 inches)</option>
                    <option value="large">Large (6+ inches)</option>
                    <option value="sleeve">Full Sleeve</option>
                    <option value="back">Full Back</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="style" className="block text-white text-sm font-medium mb-2">
                    Preferred Style *
                  </label>
                  <select
                    id="style"
                    name="style"
                    required
                    value={formData.style}
                    onChange={handleInputChange}
                    className="input w-full"
                  >
                    <option value="">Select style</option>
                    <option value="traditional">Traditional American</option>
                    <option value="neo-traditional">Neo-Traditional</option>
                    <option value="realism">Realism</option>
                    <option value="watercolor">Watercolor</option>
                    <option value="geometric">Geometric</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="japanese">Japanese</option>
                    <option value="blackwork">Blackwork</option>
                    <option value="portrait">Portrait</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-white text-sm font-medium mb-2">
                  Tattoo Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input w-full resize-none"
                  placeholder="Describe your tattoo idea, include any reference images you have in mind, placement preferences, and any specific details..."
                />
              </div>

              {/* Important Notes */}
              <div className="bg-surface-2 p-4 rounded-lg border border-gray-600">
                <h3 className="text-white font-medium mb-2">Important Information</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Please arrive 15 minutes before your scheduled appointment</li>
                  <li>• Bring a valid ID and any reference images</li>
                  <li>• Avoid alcohol 24 hours before your appointment</li>
                  <li>• Get a good night's sleep and eat before coming</li>
                  <li>• The artist will contact you within 24-48 hours to confirm</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Link
                  href={`/artist/${artistId}`}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
} 