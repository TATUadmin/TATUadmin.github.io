'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Don't worry!</strong> Your booking is still available. You can complete the payment anytime before your appointment.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Try Payment Again
          </Link>
          
          <Link
            href="/explore"
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exploring
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Having trouble with payment? Contact our{' '}
            <Link href="/support" className="text-purple-600 hover:underline">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 