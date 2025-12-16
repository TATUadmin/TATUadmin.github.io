import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'
import { POST as createPayment, GET as getPayments } from '@/app/api/payments/route'

// Mock the auth function
jest.mock('@/app/auth', () => ({
  auth: jest.fn(),
}))

// Mock the payment service
jest.mock('@/lib/payment', () => ({
  paymentService: {
    createPaymentIntent: jest.fn(),
    createCheckoutSession: jest.fn(),
    getUserPayments: jest.fn(),
  },
}))

import { auth } from '@/app/auth'
import { paymentService } from '@/lib/payment'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockPaymentService = paymentService as jest.Mocked<typeof paymentService>

describe('/api/payments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('should create a payment intent successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      mockPaymentService.createPaymentIntent.mockResolvedValue({
        success: true,
        paymentId: 'payment_123',
        clientSecret: 'pi_test_123_secret',
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          appointmentId: 'appointment_123',
          amount: 5000,
          type: 'CONSULTATION',
          description: 'Test consultation',
          useCheckout: false,
        },
      })

      const request = req as unknown as NextRequest
      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.paymentId).toBe('payment_123')
      expect(data.clientSecret).toBe('pi_test_123_secret')
    })

    it('should create a checkout session successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      mockPaymentService.createCheckoutSession.mockResolvedValue({
        success: true,
        paymentId: 'payment_123',
        sessionUrl: 'https://checkout.stripe.com/test',
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          appointmentId: 'appointment_123',
          amount: 5000,
          type: 'CONSULTATION',
          description: 'Test consultation',
          useCheckout: true,
        },
      })

      const request = req as unknown as NextRequest
      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.paymentId).toBe('payment_123')
      expect(data.sessionUrl).toBe('https://checkout.stripe.com/test')
    })

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'POST',
        body: {
          appointmentId: 'appointment_123',
          amount: 5000,
          type: 'CONSULTATION',
        },
      })

      const request = req as unknown as NextRequest
      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid request data', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          appointmentId: 'appointment_123',
          amount: 50, // Too small
          type: 'CONSULTATION',
        },
      })

      const request = req as unknown as NextRequest
      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBeDefined()
    })

    it('should handle payment service errors', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      mockPaymentService.createPaymentIntent.mockResolvedValue({
        success: false,
        error: 'Payment service error',
      })

      const { req } = createMocks({
        method: 'POST',
        body: {
          appointmentId: 'appointment_123',
          amount: 5000,
          type: 'CONSULTATION',
        },
      })

      const request = req as unknown as NextRequest
      const response = await createPayment(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Payment service error')
    })
  })

  describe('GET', () => {
    it('should fetch user payments successfully', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      const mockPayments = [
        {
          id: 'payment_123',
          amount: 5000,
          status: 'COMPLETED',
          type: 'CONSULTATION',
          client: { id: 'client_123', name: 'Test Client' },
          artist: { id: 'artist_123', name: 'Test Artist' },
        },
      ]

      mockPaymentService.getUserPayments.mockResolvedValue(mockPayments)

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/payments',
      })

      const request = req as unknown as NextRequest
      const response = await getPayments(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.payments).toHaveLength(1)
      expect(data.payments[0].id).toBe('payment_123')
    })

    it('should fetch payments with type filter', async () => {
      mockAuth.mockResolvedValue({
        user: { id: 'user_123', email: 'test@example.com' },
      })

      mockPaymentService.getUserPayments.mockResolvedValue([])

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/payments?type=client',
      })

      const request = req as unknown as NextRequest
      const response = await getPayments(request)

      expect(response.status).toBe(200)
      expect(mockPaymentService.getUserPayments).toHaveBeenCalledWith(
        'user_123',
        'client'
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const { req } = createMocks({
        method: 'GET',
        url: 'http://localhost:3000/api/payments',
      })

      const request = req as unknown as NextRequest
      const response = await getPayments(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})
