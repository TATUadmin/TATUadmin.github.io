'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCardIcon, 
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface CheckoutItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
}

interface CheckoutData {
  items: CheckoutItem[]
  subtotal: number
  tax: number
  total: number
  depositAmount?: number
  isDeposit?: boolean
}

interface PaymentMethod {
  type: 'card' | 'bank' | 'paypal' | 'venmo'
  last4?: string
  brand?: string
}

interface CheckoutFlowProps {
  checkoutData: CheckoutData
  onComplete: (paymentData: any) => Promise<void>
  onCancel: () => void
}

export default function CheckoutFlow({ checkoutData, onComplete, onCancel }: CheckoutFlowProps) {
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'complete'>('review')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card')
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    saveCard: false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const validateCardNumber = (number: string): boolean => {
    const cleaned = number.replace(/\s/g, '')
    return /^\d{13,19}$/.test(cleaned)
  }

  const validateExpiry = (expiry: string): boolean => {
    const [month, year] = expiry.split('/')
    if (!month || !year) return false
    const m = parseInt(month)
    const y = parseInt('20' + year)
    const now = new Date()
    const expDate = new Date(y, m - 1)
    return m >= 1 && m <= 12 && expDate > now
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardNumber || !validateCardNumber(formData.cardNumber)) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }

    if (!formData.cardName || formData.cardName.length < 3) {
      newErrors.cardName = 'Please enter the cardholder name'
    }

    if (!formData.expiryDate || !validateExpiry(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date'
    }

    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'Please enter a valid CVV'
    }

    if (!formData.billingAddress) {
      newErrors.billingAddress = 'Billing address is required'
    }

    if (!formData.city) {
      newErrors.city = 'City is required'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    if (!formData.zipCode || !/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ')
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value.replace(/\D/g, ''))
    setFormData({ ...formData, cardNumber: formatted })
  }

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value)
    setFormData({ ...formData, expiryDate: formatted })
  }

  const handleSubmitPayment = async () => {
    if (!validateForm()) {
      return
    }

    setIsProcessing(true)
    setStep('processing')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await onComplete({
        paymentMethod: 'card',
        last4: formData.cardNumber.slice(-4),
        billingAddress: {
          address: formData.billingAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }
      })

      setStep('complete')
    } catch (error) {
      console.error('Payment failed:', error)
      setStep('payment')
      setErrors({ submit: 'Payment failed. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['Review', 'Payment', 'Complete'].map((label, index) => {
              const stepIndex = ['review', 'payment', 'complete'].indexOf(step)
              const isActive = index <= stepIndex
              const isCurrent = index === stepIndex

              return (
                <div key={label} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive 
                      ? 'bg-white border-white text-black' 
                      : 'bg-black border-gray-800 text-gray-500'
                  }`}>
                    {index < stepIndex ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}>
                    {label}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index < stepIndex ? 'bg-white' : 'bg-gray-800'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'review' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Review</h2>
                
                <div className="space-y-4 mb-6">
                  {checkoutData.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between py-4 border-b border-gray-800 last:border-0">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                        <p className="text-gray-500 text-sm mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-white font-semibold ml-4">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {checkoutData.isDeposit && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-white mb-2">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                      <span className="font-semibold">Deposit Payment</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      You are paying a ${checkoutData.depositAmount?.toFixed(2)} deposit. 
                      The remaining balance of ${(checkoutData.total - (checkoutData.depositAmount || 0)).toFixed(2)} 
                      will be due at the time of service.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Payment Information</h2>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-white bg-gray-800'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <CreditCardIcon className="w-6 h-6 text-white mx-auto mb-2" />
                    <span className="text-white text-sm font-medium">Credit Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'bank'
                        ? 'border-white bg-gray-800'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <BanknotesIcon className="w-6 h-6 text-white mx-auto mb-2" />
                    <span className="text-white text-sm font-medium">Bank Transfer</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <form className="space-y-4">
                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                          errors.cardNumber ? 'border-red-500' : 'border-gray-800'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {errors.cardNumber && (
                        <p className="mt-1 text-sm text-red-400">{errors.cardNumber}</p>
                      )}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={formData.cardName}
                        onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                        className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                          errors.cardName ? 'border-red-500' : 'border-gray-800'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.cardName && (
                        <p className="mt-1 text-sm text-red-400">{errors.cardName}</p>
                      )}
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                            errors.expiryDate ? 'border-red-500' : 'border-gray-800'
                          }`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {errors.expiryDate && (
                          <p className="mt-1 text-sm text-red-400">{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                          className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                            errors.cvv ? 'border-red-500' : 'border-gray-800'
                          }`}
                          placeholder="123"
                          maxLength={4}
                        />
                        {errors.cvv && (
                          <p className="mt-1 text-sm text-red-400">{errors.cvv}</p>
                        )}
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="pt-4 border-t border-gray-800">
                      <h3 className="text-lg font-semibold text-white mb-4">Billing Address</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            value={formData.billingAddress}
                            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                              errors.billingAddress ? 'border-red-500' : 'border-gray-800'
                            }`}
                            placeholder="123 Main St"
                          />
                          {errors.billingAddress && (
                            <p className="mt-1 text-sm text-red-400">{errors.billingAddress}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                                errors.city ? 'border-red-500' : 'border-gray-800'
                              }`}
                              placeholder="City"
                            />
                            {errors.city && (
                              <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              State *
                            </label>
                            <input
                              type="text"
                              value={formData.state}
                              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                              className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                                errors.state ? 'border-red-500' : 'border-gray-800'
                              }`}
                              placeholder="State"
                              maxLength={2}
                            />
                            {errors.state && (
                              <p className="mt-1 text-sm text-red-400">{errors.state}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            className={`w-full px-4 py-3 bg-black border rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors ${
                              errors.zipCode ? 'border-red-500' : 'border-gray-800'
                            }`}
                            placeholder="12345"
                            maxLength={10}
                          />
                          {errors.zipCode && (
                            <p className="mt-1 text-sm text-red-400">{errors.zipCode}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Save Card */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={formData.saveCard}
                        onChange={(e) => setFormData({ ...formData, saveCard: e.target.checked })}
                        className="w-4 h-4 bg-black border-gray-800 rounded"
                      />
                      <label htmlFor="saveCard" className="ml-2 text-sm text-gray-300">
                        Save this card for future payments
                      </label>
                    </div>

                    {errors.submit && (
                      <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                        <p className="text-red-300 text-sm">{errors.submit}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-4 pt-6">
                      <button
                        type="button"
                        onClick={() => setStep('review')}
                        className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold border border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmitPayment}
                        disabled={isProcessing}
                        className="flex-1 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : `Pay $${checkoutData.total.toFixed(2)}`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {step === 'processing' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Processing Payment...</h2>
                <p className="text-gray-400">Please don't close this window</p>
              </div>
            )}

            {step === 'complete' && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
                <CheckCircleIcon className="w-16 h-16 text-white mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-2">Payment Successful!</h2>
                <p className="text-gray-400 mb-8">
                  Your payment has been processed successfully. You will receive a confirmation email shortly.
                </p>
                <button
                  onClick={onCancel}
                  className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-semibold">${checkoutData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-white font-semibold">${checkoutData.tax.toFixed(2)}</span>
                </div>
                {checkoutData.isDeposit && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deposit Amount</span>
                    <span className="text-white font-semibold">${checkoutData.depositAmount?.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-bold">Total</span>
                <span className="text-2xl font-bold text-white">
                  ${(checkoutData.isDeposit ? checkoutData.depositAmount : checkoutData.total)?.toFixed(2)}
                </span>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Secure SSL encrypted payment</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm mt-2">
                  <LockClosedIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>Your payment information is safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

