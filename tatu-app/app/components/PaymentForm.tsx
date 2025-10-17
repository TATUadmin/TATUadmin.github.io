'use client'

import { useState } from 'react'
import { usePayment } from '@/lib/hooks/usePayment'
import { 
  CreditCardIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface PaymentFormProps {
  appointmentId: string
  amount: number
  type: 'CONSULTATION' | 'DEPOSIT' | 'FULL_PAYMENT'
  description?: string
  onSuccess: (paymentId: string) => void
  onCancel: () => void
}

export default function PaymentForm({
  appointmentId,
  amount,
  type,
  description,
  onSuccess,
  onCancel
}: PaymentFormProps) {
  const { createPayment, isLoading } = usePayment()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'checkout'>('card')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === 'checkout') {
      // Use Stripe Checkout
      const result = await createPayment({
        appointmentId,
        amount,
        type,
        description,
        useCheckout: true
      })

      if (result.success && result.sessionUrl) {
        window.location.href = result.sessionUrl
      }
    } else {
      // Use Payment Intent (for custom form)
      const result = await createPayment({
        appointmentId,
        amount,
        type,
        description,
        useCheckout: false
      })

      if (result.success && result.clientSecret) {
        // TODO: Integrate with Stripe Elements for custom form
        // For now, redirect to checkout
        window.location.href = result.sessionUrl || '/payment/error'
      }
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
          <div className="flex items-center text-sm text-gray-500">
            <LockClosedIcon className="h-4 w-4 mr-1" />
            Secure Payment
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{type === 'CONSULTATION' ? 'Consultation Fee' : 'Payment'}</span>
            <span className="text-lg font-semibold text-gray-900">{formatAmount(amount)}</span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Payment Method</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="checkout"
                checked={paymentMethod === 'checkout'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'checkout')}
                className="mr-3"
              />
              <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
              <span>Stripe Checkout (Recommended)</span>
            </label>
            
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'checkout')}
                className="mr-3"
              />
              <CreditCardIcon className="h-5 w-5 mr-2 text-gray-400" />
              <span>Custom Form (Coming Soon)</span>
            </label>
          </div>
        </div>

        {paymentMethod === 'checkout' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 font-medium">Secure Checkout</p>
                <p className="text-xs text-blue-600 mt-1">
                  You'll be redirected to Stripe's secure checkout page to complete your payment.
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Custom Form</p>
                <p className="text-xs text-yellow-600 mt-1">
                  This feature is coming soon. Please use Stripe Checkout for now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading || paymentMethod === 'card'}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ${formatAmount(amount)}`
            )}
          </button>
        </div>
      </form>

      {/* Security Notice */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure. We use Stripe to process payments.
        </p>
      </div>
    </div>
  )
}
