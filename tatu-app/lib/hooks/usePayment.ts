'use client'

import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface CreatePaymentData {
  appointmentId: string
  amount: number
  type: 'CONSULTATION' | 'DEPOSIT' | 'FULL_PAYMENT'
  description?: string
  useCheckout?: boolean
}

interface PaymentResult {
  success: boolean
  paymentId?: string
  clientSecret?: string
  sessionUrl?: string
  error?: string
}

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false)

  const createPayment = useCallback(async (data: CreatePaymentData): Promise<PaymentResult> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment')
      }

      return {
        success: true,
        paymentId: result.paymentId,
        clientSecret: result.clientSecret,
        sessionUrl: result.sessionUrl
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment'
      toast.error(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPayments = useCallback(async (type?: 'client' | 'artist') => {
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)

      const response = await fetch(`/api/payments?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch payments')
      }

      return result.payments
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments')
      return []
    }
  }, [])

  const createRefund = useCallback(async (paymentId: string, amount?: number) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create refund')
      }

      toast.success('Refund processed successfully')
      return { success: true, refundId: result.refundId }
    } catch (error) {
      console.error('Refund error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create refund'
      toast.error(errorMessage)
      
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    createPayment,
    getPayments,
    createRefund,
    isLoading
  }
}
