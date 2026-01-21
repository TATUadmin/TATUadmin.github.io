import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/portfolio/public - Get all public portfolio items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const style = searchParams.get('style')
    const tags = searchParams.get('tags')?.split(',').filter(Boolean)
    const search = searchParams.get('search')

    const where: any = {
      // Filter by user role - only get items from artists
      user: {
        role: {
          in: ['ARTIST', 'SHOP_OWNER']
        }
      }
    }

    // Filter by style
    if (style) {
      where.style = style
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    const [items, total] = await Promise.all([
      prisma.portfolioItem.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              artistProfile: {
                select: {
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              Like: true,
              Comment: true,
              Share: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.portfolioItem.count({ where })
    ])

    // Transform to match PortfolioGallery format
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description || undefined,
      imageUrl: item.imageUrl,
      style: item.style,
      tags: item.tags,
      featured: item.featured,
      likes: item._count.Like,
      views: 0, // We don't track views in the current schema
      createdAt: item.createdAt.toISOString(),
      artist: {
        id: item.user.id,
        name: item.user.name,
        avatar: item.user.artistProfile?.avatar || undefined
      }
    }))

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching public portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio items' },
      { status: 500 }
    )
  }
}

