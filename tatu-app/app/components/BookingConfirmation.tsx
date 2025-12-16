'use client'

import { useState } from 'react'
import { 
  CheckCircleIcon, 
  CalendarIcon, 
  MapPinIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface BookingConfirmationData {
  confirmationNumber: string
  bookingDate: string
  appointmentDate: string
  appointmentTime: string
  duration: string
  artist: {
    name: string
    avatar?: string
    studio: string
    address: string
    phone: string
    email: string
  }
  service: {
    name: string
    description: string
    price: number
  }
  client: {
    name: string
    email: string
    phone: string
  }
  payment: {
    method: string
    amountPaid: number
    remainingBalance: number
    total: number
  }
  specialInstructions?: string
}

interface BookingConfirmationProps {
  data: BookingConfirmationData
  onAddToCalendar?: () => void
  onPrint?: () => void
  onShare?: () => void
}

export default function BookingConfirmation({ 
  data, 
  onAddToCalendar, 
  onPrint, 
  onShare 
}: BookingConfirmationProps) {
  const [emailSent, setEmailSent] = useState(false)

  const handleSendEmail = () => {
    // Simulate sending email
    setTimeout(() => {
      setEmailSent(true)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 border-4 border-white rounded-full mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 text-lg">
            Your appointment has been successfully booked
          </p>
          <p className="text-white font-mono text-lg mt-4">
            Confirmation # {data.confirmationNumber}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={onAddToCalendar}
            className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-white transition-colors"
          >
            <CalendarIcon className="w-6 h-6 text-white mb-2" />
            <span className="text-white text-sm font-medium">Add to Calendar</span>
          </button>
          <button
            onClick={onPrint}
            className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-white transition-colors"
          >
            <PrinterIcon className="w-6 h-6 text-white mb-2" />
            <span className="text-white text-sm font-medium">Print</span>
          </button>
          <button
            onClick={onShare}
            className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-white transition-colors"
          >
            <ShareIcon className="w-6 h-6 text-white mb-2" />
            <span className="text-white text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Appointment Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="w-6 h-6 text-white mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="text-white font-semibold text-lg">{formatDate(data.appointmentDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="w-6 h-6 text-white mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Time & Duration</p>
                  <p className="text-white font-semibold">{data.appointmentTime}</p>
                  <p className="text-gray-400 text-sm">{data.duration}</p>
                </div>
              </div>

              <div className="flex items-start">
                <UserIcon className="w-6 h-6 text-white mr-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-400 text-sm">Service</p>
                  <p className="text-white font-semibold">{data.service.name}</p>
                  <p className="text-gray-400 text-sm">{data.service.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Artist Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Artist Information</h2>
            
            <div className="flex items-center mb-6">
              {data.artist.avatar ? (
                <img
                  src={data.artist.avatar}
                  alt={data.artist.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">
                    {data.artist.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-lg">{data.artist.name}</h3>
                <p className="text-gray-400">{data.artist.studio}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <MapPinIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-white">{data.artist.address}</span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                <a href={`tel:${data.artist.phone}`} className="text-white hover:underline">
                  {data.artist.phone}
                </a>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                <a href={`mailto:${data.artist.email}`} className="text-white hover:underline">
                  {data.artist.email}
                </a>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Payment Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-white font-semibold">{data.payment.method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Amount Paid (Deposit)</span>
                <span className="text-white font-semibold">${data.payment.amountPaid.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="text-gray-400">Remaining Balance</span>
                <span className="text-white font-semibold">${data.payment.remainingBalance.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-white font-bold">Total Service Cost</span>
                <span className="text-white font-bold text-xl">${data.payment.total.toFixed(2)}</span>
              </div>
            </div>

            {data.payment.remainingBalance > 0 && (
              <div className="mt-4 bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-gray-300 text-sm">
                  <strong>Note:</strong> The remaining balance of ${data.payment.remainingBalance.toFixed(2)} 
                  is due at the time of your appointment. Please bring payment or be prepared to pay at the studio.
                </p>
              </div>
            )}
          </div>

          {/* Client Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Your Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Name</span>
                <span className="text-white font-semibold">{data.client.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-semibold">{data.client.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="text-white font-semibold">{data.client.phone}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {data.specialInstructions && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Special Instructions</h2>
              <p className="text-gray-300">{data.specialInstructions}</p>
            </div>
          )}

          {/* Important Information */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Important Information</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>Please arrive 10 minutes early to complete any necessary paperwork</span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>Bring a valid ID for verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>If you need to cancel or reschedule, please contact the artist at least 24 hours in advance</span>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">•</span>
                <span>Follow pre-appointment care instructions provided by your artist</span>
              </li>
            </ul>
          </div>

          {/* Email Confirmation */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Email Confirmation</h3>
                <p className="text-gray-400 text-sm">
                  {emailSent 
                    ? 'Confirmation email sent successfully!'
                    : 'Haven\'t received your confirmation email?'
                  }
                </p>
              </div>
              {!emailSent && (
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Resend Email
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Link
              href="/dashboard/appointments"
              className="flex items-center justify-center px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <CalendarIcon className="w-5 h-5 mr-2" />
              View My Appointments
            </Link>
            <Link
              href="/explore"
              className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              Browse More Artists
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

