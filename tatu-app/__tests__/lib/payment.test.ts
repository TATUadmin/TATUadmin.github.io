import { PaymentService } from '@/lib/payment'
import { prisma } from '@/lib/prisma'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    payment: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    appointment: {
      update: jest.fn(),
    },
  },
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
      }),
    },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/test',
        }),
      },
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_test_123',
      }),
    },
  }))
})

describe('PaymentService', () => {
  let paymentService: PaymentService

  beforeEach(() => {
    paymentService = new PaymentService()
    jest.clearAllMocks()
  })

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const mockPayment = {
        id: 'payment_123',
        appointmentId: 'appointment_123',
        clientId: 'client_123',
        artistId: 'artist_123',
        amount: 5000,
        type: 'CONSULTATION',
        platformFee: 500,
        artistAmount: 4500,
        status: 'PENDING',
      }

      ;(prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment)
      ;(prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        stripePaymentId: 'pi_test_123',
        status: 'PROCESSING',
      })

      const result = await paymentService.createPaymentIntent({
        appointmentId: 'appointment_123',
        clientId: 'client_123',
        artistId: 'artist_123',
        amount: 5000,
        type: 'CONSULTATION',
        description: 'Test consultation',
      })

      expect(result.success).toBe(true)
      expect(result.paymentId).toBe('payment_123')
      expect(result.clientSecret).toBe('pi_test_123_secret')
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          appointmentId: 'appointment_123',
          clientId: 'client_123',
          artistId: 'artist_123',
          amount: 5000,
          type: 'CONSULTATION',
          platformFee: 500,
          artistAmount: 4500,
          status: 'PENDING',
        }),
      })
    })

    it('should handle errors gracefully', async () => {
      ;(prisma.payment.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const result = await paymentService.createPaymentIntent({
        appointmentId: 'appointment_123',
        clientId: 'client_123',
        artistId: 'artist_123',
        amount: 5000,
        type: 'CONSULTATION',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create payment intent')
    })
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockPayment = {
        id: 'payment_123',
        appointmentId: 'appointment_123',
        clientId: 'client_123',
        artistId: 'artist_123',
        amount: 5000,
        type: 'CONSULTATION',
        platformFee: 500,
        artistAmount: 4500,
        status: 'PENDING',
      }

      ;(prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment)
      ;(prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        stripeSessionId: 'cs_test_123',
        status: 'PROCESSING',
      })

      const result = await paymentService.createCheckoutSession({
        appointmentId: 'appointment_123',
        clientId: 'client_123',
        artistId: 'artist_123',
        amount: 5000,
        type: 'CONSULTATION',
        description: 'Test consultation',
      })

      expect(result.success).toBe(true)
      expect(result.paymentId).toBe('payment_123')
      expect(result.sessionUrl).toBe('https://checkout.stripe.com/test')
    })
  })

  describe('handlePaymentSuccess', () => {
    it('should update payment status to completed', async () => {
      const mockPayment = {
        id: 'payment_123',
        appointmentId: 'appointment_123',
        stripePaymentId: 'pi_test_123',
      }

      ;(prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment)
      ;(prisma.payment.update as jest.Mock).mockResolvedValue({})
      ;(prisma.appointment.update as jest.Mock).mockResolvedValue({})

      await paymentService.handlePaymentSuccess('pi_test_123')

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment_123' },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        },
      })
    })
  })

  describe('handlePaymentFailure', () => {
    it('should update payment status to failed', async () => {
      const mockPayment = {
        id: 'payment_123',
        stripePaymentId: 'pi_test_123',
      }

      ;(prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment)
      ;(prisma.payment.update as jest.Mock).mockResolvedValue({})

      await paymentService.handlePaymentFailure('pi_test_123')

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment_123' },
        data: { status: 'FAILED' },
      })
    })
  })

  describe('getUserPayments', () => {
    it('should fetch user payments', async () => {
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

      ;(prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments)

      const result = await paymentService.getUserPayments('user_123', 'client')

      expect(result).toEqual(mockPayments)
      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { clientId: 'user_123' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      })
    })
  })
})
