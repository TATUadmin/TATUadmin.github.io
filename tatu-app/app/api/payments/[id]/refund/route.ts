import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { paymentService } from '@/lib/payment'
import { z } from 'zod'

const refundSchema = z.object({
  amount: z.number().optional() // Optional partial refund amount
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const paymentId = params.id
    const body = await request.json()
    const validatedData = refundSchema.parse(body)

    // Create refund using the payment service
    const result = await paymentService.createRefund(paymentId, validatedData.amount)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create refund' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      refundId: result.paymentId
    })

  } catch (error) {
    console.error('Refund creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create refund' },
      { status: 500 }
    )
  }
}
