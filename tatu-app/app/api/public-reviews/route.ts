import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const targetType = typeof body.targetType === 'string' ? body.targetType.trim() : ''
    const targetName = typeof body.targetName === 'string' ? body.targetName.trim() : ''
    const rating = Number(body.rating)
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null

    if (!targetType || !targetName) {
      return NextResponse.json({ error: 'Review target is required' }, { status: 400 })
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    if (!title || !comment) {
      return NextResponse.json({ error: 'Title and review are required' }, { status: 400 })
    }

    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    await prisma.publicReview.create({
      data: {
        targetType,
        targetName,
        rating,
        title,
        comment,
        email,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting public review:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
