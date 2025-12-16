import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { paymentService } from '@/lib/payment'
import { z } from 'zod'

const createPaymentSchema = z.object({
  appointmentId: z.string(),
  amount: z.number().min(100), // Minimum $1.00
  type: z.enum(['CONSULTATION', 'DEPOSIT', 'FULL_PAYMENT']),
  description: z.string().optional(),
  useCheckout: z.boolean().optional().default(false) // Use checkout session vs payment intent
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createPaymentSchema.parse(body)

    // Create payment using the payment service
    const result = validatedData.useCheckout
      ? await paymentService.createCheckoutSession({
          appointmentId: validatedData.appointmentId,
          clientId: session.user.id,
          artistId: '', // TODO: Get from appointment
          amount: validatedData.amount,
          type: validatedData.type,
          description: validatedData.description
        })
      : await paymentService.createPaymentIntent({
          appointmentId: validatedData.appointmentId,
          clientId: session.user.id,
          artistId: '', // TODO: Get from appointment
          amount: validatedData.amount,
          type: validatedData.type,
          description: validatedData.description
        })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      clientSecret: result.clientSecret,
      sessionUrl: result.sessionUrl
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'client' | 'artist' | undefined

    const payments = await paymentService.getUserPayments(session.user.id, type)

    return NextResponse.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        description: payment.description,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        client: payment.client,
        artist: payment.artist,
        appointment: payment.appointment
      }))
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
