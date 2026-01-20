'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SubscriptionPricing from '@/app/components/SubscriptionPricing'
import DashboardLayout from '../../components/DashboardLayout'
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface Subscription {
  id: string
  tier: 'FREE' | 'PRO' | 'STUDIO'
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'PAUSED' | 'TRIAL'
  billingInterval: 'MONTHLY' | 'YEARLY'
  amount: number
  currentPeriodEnd?: string
  cancelAt?: string
  trialEnd?: string
}

export default function SubscriptionPage() {
  const router = useRouter()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current')
      const data = await response.json()
      
      if (data.success) {
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async (immediately: boolean = false) => {
    if (!confirm(immediately 
      ? 'Are you sure you want to cancel your subscription immediately? You will lose access to premium features right away.'
      : 'Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.'
    )) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ immediately }),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        await fetchSubscription()
      } else {
        alert('Failed to cancel subscription: ' + data.error)
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleSelectPlan = async (tier: 'FREE' | 'PRO' | 'STUDIO', interval: 'MONTHLY' | 'YEARLY') => {
    // Redirect to checkout/upgrade flow
    router.push(`/dashboard/subscription/checkout?tier=${tier}&interval=${interval}`)
  }

  if (loading) {
    return (
      <DashboardLayout userRole="artist">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      TRIAL: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, text: 'Trial' },
      PAST_DUE: { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Past Due' },
      CANCELLED: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelled' },
      PAUSED: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Paused' },
    }

    const badge = badges[status as keyof typeof badges] || badges.ACTIVE
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon size={16} />
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subscription Management
          </h1>
          <p className="text-gray-600">
            Manage your TATU subscription and billing
          </p>
        </div>

        {/* Current Subscription Card */}
        {subscription && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {subscription.tier} Plan
                </h2>
                {getStatusBadge(subscription.status)}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">
                  {formatPrice(subscription.amount)}
                </div>
                <div className="text-gray-600">
                  per {subscription.billingInterval === 'MONTHLY' ? 'month' : 'year'}
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {subscription.currentPeriodEnd && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Current Period Ends</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(subscription.currentPeriodEnd)}
                    </div>
                  </div>
                </div>
              )}

              {subscription.trialEnd && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-500 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Trial Ends</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(subscription.trialEnd)}
                    </div>
                  </div>
                </div>
              )}

              {subscription.cancelAt && (
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-500 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-600">Cancels On</div>
                    <div className="font-medium text-gray-900">
                      {formatDate(subscription.cancelAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {subscription.status === 'PAST_DUE' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Payment Failed</h3>
                    <p className="text-red-700 text-sm">
                      Your last payment failed. Please update your payment method to continue using premium features.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {subscription.cancelAt && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Subscription Ending</h3>
                    <p className="text-yellow-700 text-sm">
                      Your subscription will end on {formatDate(subscription.cancelAt)}. You can reactivate anytime before then.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              {subscription.tier !== 'FREE' && !subscription.cancelAt && (
                <>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Change Plan
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(false)}
                    disabled={cancelling}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </>
              )}

              {subscription.tier === 'FREE' && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Upgrade Plan
                </button>
              )}

              {subscription.cancelAt && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Reactivate Subscription
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        {(showPricing || !subscription || subscription.tier === 'FREE') && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <SubscriptionPricing
              currentTier={subscription?.tier || 'FREE'}
              onSelectPlan={handleSelectPlan}
              showFreeTier={true}
            />
          </div>
        )}

        {/* Benefits Reminder */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            💡 Why TATU is Different
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>No transaction fees</strong> - We never take a cut of your tattoo payments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>No payment processing</strong> - Handle payments however you want (cash, Venmo, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>No tax complications</strong> - We're not a payment processor, so no 1099 forms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span><strong>Just powerful tools</strong> - Pay only for features that help you grow your business</span>
            </li>
          </ul>
        </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

