import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7

    // Calculate date range
    const endDate = endOfDay(new Date())
    const startDate = startOfDay(subDays(endDate, days))

    // Get all portfolio items for the user
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { userId: user.id },
      include: {
        analytics: {
          include: {
            dailyStats: {
              where: {
                date: {
                  gte: startDate,
                  lte: endDate,
                },
              },
              orderBy: {
                date: 'asc',
              },
            },
          },
        },
        likes: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        comments: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        shares: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    })

    // Aggregate analytics data
    const totalViews = portfolioItems.reduce(
      (sum, item) => sum + (item.analytics?.views || 0),
      0
    )
    const totalUniqueViews = portfolioItems.reduce(
      (sum, item) => sum + (item.analytics?.uniqueViews || 0),
      0
    )
    const totalLikes = portfolioItems.reduce(
      (sum, item) => sum + item.likes.length,
      0
    )
    const totalComments = portfolioItems.reduce(
      (sum, item) => sum + item.comments.length,
      0
    )
    const totalShares = portfolioItems.reduce(
      (sum, item) => sum + item.shares.length,
      0
    )

    // Aggregate daily stats
    const dailyStats = Array.from({ length: days }, (_, i) => {
      const date = subDays(endDate, days - 1 - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayStats = portfolioItems.reduce(
        (stats, item) => {
          const dailyStat = item.analytics?.dailyStats.find(
            (stat) => stat.date.toISOString().split('T')[0] === dateStr
          )

          return {
            views: stats.views + (dailyStat?.views || 0),
            uniqueViews: stats.uniqueViews + (dailyStat?.uniqueViews || 0),
            likes: stats.likes + (dailyStat?.likes || 0),
            comments: stats.comments + (dailyStat?.comments || 0),
            shares: stats.shares + (dailyStat?.shares || 0),
          }
        },
        { views: 0, uniqueViews: 0, likes: 0, comments: 0, shares: 0 }
      )

      return {
        date: dateStr,
        ...dayStats,
      }
    })

    return NextResponse.json({
      views: totalViews,
      uniqueViews: totalUniqueViews,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      dailyStats,
    })
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio analytics' },
      { status: 500 }
    )
  }
} 