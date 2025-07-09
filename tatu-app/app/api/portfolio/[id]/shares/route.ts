import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// Get share count
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const shareCount = await prisma.share.count({
      where: { itemId: params.id }
    })

    return NextResponse.json({ count: shareCount })
  } catch (error) {
    console.error('Error fetching shares:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shares' },
      { status: 500 }
    )
  }
}

// Record a new share
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    const { platform } = await request.json()

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    const share = await prisma.share.create({
      data: {
        platform,
        itemId: params.id,
        userId: session?.user?.id // Optional: only if user is logged in
      }
    })

    return NextResponse.json(share, { status: 201 })
  } catch (error) {
    console.error('Error recording share:', error)
    return NextResponse.json(
      { error: 'Failed to record share' },
      { status: 500 }
    )
  }
} 