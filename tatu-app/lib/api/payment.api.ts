// Payment API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'

export interface PaymentMethod {
  id: string
  type: 'card' | 'paypal' | 'applepay' | 'googlepay'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  billingAddress?: Address
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  clientSecret: string
  metadata?: Record<string, any>
}

export interface PaymentData {
  amount: number
  currency?: string
  paymentMethodId: string
  appointmentId?: string
  description?: string
  metadata?: Record<string, any>
}

export interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  type: 'payment' | 'refund' | 'payout'
  description: string
  paymentMethod: PaymentMethod
  createdAt: string
  receiptUrl?: string
}

export interface Refund {
  id: string
  transactionId: string
  amount: number
  reason: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
}

export class PaymentAPI {
  private static instance: PaymentAPI

  static getInstance(): PaymentAPI {
    if (!this.instance) {
      this.instance = new PaymentAPI()
    }
    return this.instance
  }

  // Create payment intent
  async createPaymentIntent(data: PaymentData): Promise<ApiResponse<PaymentIntent>> {
    AnalyticsTracker.trackFormSubmit('payment_initiated', {
      amount: data.amount,
      currency: data.currency
    })

    return apiClient.post('/payments/intent', data)
  }

  // Confirm payment
  async confirmPayment(intentId: string, paymentMethodId: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('payment_confirmed', { intentId })

    return apiClient.post(`/payments/${intentId}/confirm`, { paymentMethodId })
  }

  // Process deposit payment
  async processDeposit(appointmentId: string, amount: number): Promise<ApiResponse<PaymentIntent>> {
    AnalyticsTracker.track('deposit_payment', { appointmentId, amount })

    return apiClient.post('/payments/deposit', { appointmentId, amount })
  }

  // Process full payment
  async processFullPayment(appointmentId: string): Promise<ApiResponse<PaymentIntent>> {
    AnalyticsTracker.track('full_payment', { appointmentId })

    return apiClient.post(`/payments/appointments/${appointmentId}/full`)
  }

  // Get payment methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get('/payments/methods')
  }

  // Add payment method
  async addPaymentMethod(data: {
    type: string
    token: string
    isDefault?: boolean
  }): Promise<ApiResponse<PaymentMethod>> {
    AnalyticsTracker.track('payment_method_added', { type: data.type })

    return apiClient.post('/payments/methods', data)
  }

  // Update payment method
  async updatePaymentMethod(
    id: string,
    data: Partial<PaymentMethod>
  ): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.patch(`/payments/methods/${id}`, data)
  }

  // Delete payment method
  async deletePaymentMethod(id: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('payment_method_deleted', { methodId: id })

    return apiClient.delete(`/payments/methods/${id}`)
  }

  // Set default payment method
  async setDefaultPaymentMethod(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/payments/methods/${id}/set-default`)
  }

  // Get transaction history
  async getTransactions(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    status?: string
    type?: string
  }): Promise<ApiResponse<Transaction[]>> {
    return apiClient.get('/payments/transactions', { params })
  }

  // Get single transaction
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return apiClient.get(`/payments/transactions/${id}`)
  }

  // Download receipt
  async downloadReceipt(transactionId: string): Promise<ApiResponse<{ url: string }>> {
    return apiClient.get(`/payments/transactions/${transactionId}/receipt`)
  }

  // Request refund
  async requestRefund(transactionId: string, data: {
    amount?: number
    reason: string
  }): Promise<ApiResponse<Refund>> {
    AnalyticsTracker.track('refund_requested', { transactionId })

    return apiClient.post(`/payments/transactions/${transactionId}/refund`, data)
  }

  // Get refund status
  async getRefund(refundId: string): Promise<ApiResponse<Refund>> {
    return apiClient.get(`/payments/refunds/${refundId}`)
  }

  // Get payment statistics (for artists)
  async getPaymentStats(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{
    totalEarnings: number
    pendingPayouts: number
    completedPayments: number
    refunds: number
    averageTransaction: number
  }>> {
    return apiClient.get('/payments/stats', { params })
  }

  // Request payout (for artists)
  async requestPayout(data: {
    amount: number
    method: 'bank' | 'paypal'
    accountId: string
  }): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('payout_requested', { amount: data.amount })

    return apiClient.post('/payments/payouts', data)
  }

  // Get payout history
  async getPayouts(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<ApiResponse<any[]>> {
    return apiClient.get('/payments/payouts', { params })
  }

  // Calculate fees
  async calculateFees(amount: number, type: 'deposit' | 'full'): Promise<ApiResponse<{
    subtotal: number
    platformFee: number
    processingFee: number
    total: number
  }>> {
    return apiClient.get('/payments/calculate-fees', { params: { amount, type } })
  }

  // Verify payment method
  async verifyPaymentMethod(methodId: string, amounts: [number, number]): Promise<ApiResponse<any>> {
    return apiClient.post(`/payments/methods/${methodId}/verify`, { amounts })
  }

  // Setup Apple Pay
  async setupApplePay(): Promise<ApiResponse<{ merchantId: string }>> {
    return apiClient.get('/payments/apple-pay/setup')
  }

  // Setup Google Pay
  async setupGooglePay(): Promise<ApiResponse<{ merchantId: string }>> {
    return apiClient.get('/payments/google-pay/setup')
  }
}

export const paymentAPI = PaymentAPI.getInstance()

