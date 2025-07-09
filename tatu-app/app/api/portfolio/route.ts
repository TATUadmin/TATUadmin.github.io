import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session
    const userId = 'temp-user' // For now, use temp user

    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        style: true,
        createdAt: true
      }
    })

    return NextResponse.json(portfolioItems)
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, style, imageUrl } = await request.json()

    if (!title || !style || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: Get user ID from session
    const userId = 'temp-user' // For now, use temp user

    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        title,
        description: description || '',
        style,
        imageUrl,
        userId
      }
    })

    return NextResponse.json(portfolioItem)
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json(
      { error: 'Failed to create portfolio item' },
      { status: 500 }
    )
  }
} 