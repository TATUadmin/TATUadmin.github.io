import { NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { subDays, subMonths, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

interface TrendAnalysis {
  metric: string
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  averageGrowth: number
  predictedValue: number
}

function calculateTrend(data: number[]): TrendAnalysis['trend'] {
  if (data.length < 2) return 'stable'
  const recentAvg = data.slice(-3).reduce((a, b) => a + b, 0) / 3
  const olderAvg = data.slice(0, -3).reduce((a, b) => a + b, 0) / (data.length - 3)
  const difference = recentAvg - olderAvg
  if (Math.abs(difference) < olderAvg * 0.05) return 'stable'
  return difference > 0 ? 'up' : 'down'
}

function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

function calculateMovingAverage(data: number[], window: number): number[] {
  return data.map((_, index) => {
    const start = Math.max(0, index - window + 1)
    const windowData = data.slice(start, index + 1)
    return windowData.reduce((a, b) => a + b, 0) / windowData.length
  })
}

function predictNextValue(data: number[]): number {
  if (data.length < 2) return data[data.length - 1] || 0
  
  // Simple linear regression
  const x = Array.from({ length: data.length }, (_, i) => i)
  const y = data
  const n = data.length
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
  const sumXX = x.reduce((a, b) => a + b * b, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  return Math.max(0, Math.round(slope * data.length + intercept))
}

function analyzeTrend(data: number[], metric: string): TrendAnalysis {
  const trend = calculateTrend(data)
  const current = data[data.length - 1] || 0
  const previous = data[data.length - 2] || 0
  const percentageChange = calculateGrowthRate(current, previous)
  
  // Calculate average daily growth rate
  const growthRates = data.slice(1).map((value, index) => 
    calculateGrowthRate(value, data[index])
  )
  const averageGrowth = growthRates.reduce((a, b) => a + b, 0) / growthRates.length || 0
  
  // Predict next value
  const predictedValue = predictNextValue(data)

  return {
    metric,
    trend,
    percentageChange,
    averageGrowth,
    predictedValue
  }
}

interface DailyAnalytics {
  id: string
  date: Date
  views: number
  uniqueViews: number
  likes: number
  comments: number
  shares: number
}

interface Metrics {
  views: number[]
  uniqueViews: number[]
  likes: number[]
  comments: number[]
  shares: number[]
}

type DailyAnalyticsGetPayload = Prisma.DailyAnalyticsGetPayload<{}>

interface PeriodComparison {
  current: {
    total: number
    daily: number[]
  }
  previous: {
    total: number
    daily: number[]
  }
  percentageChange: number
}

interface MetricComparisons {
  views: PeriodComparison
  uniqueViews: PeriodComparison
  likes: PeriodComparison
  comments: PeriodComparison
  shares: PeriodComparison
  engagement: PeriodComparison
}

function calculatePeriodMetrics(stats: any[], metric: string) {
  return {
    total: stats.reduce((sum, stat) => sum + (stat[metric] || 0), 0),
    daily: stats.map(stat => stat[metric] || 0)
  }
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

interface ViewerSessionWithCount {
  lastView: Date
  _count: {
    lastView: number
  }
}

// Get analytics for a portfolio item
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = new URL(request.url).searchParams
    const comparisonPeriod = searchParams.get('period') || '30' // days
    const periodDays = parseInt(comparisonPeriod)
    
    const currentDate = new Date()
    const currentPeriodStart = subDays(currentDate, periodDays)
    const previousPeriodStart = subDays(currentPeriodStart, periodDays)

    // Fetch analytics for both current and previous periods
    const [currentPeriodStats, previousPeriodStats] = await Promise.all([
      prisma.dailyAnalytics.findMany({
        where: {
          analytics: {
            itemId: params.id
          },
          date: {
            gte: currentPeriodStart,
            lte: currentDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      }),
      prisma.dailyAnalytics.findMany({
        where: {
          analytics: {
            itemId: params.id
          },
          date: {
            gte: previousPeriodStart,
            lt: currentPeriodStart
          }
        },
        orderBy: {
          date: 'asc'
        }
      })
    ])

    // Calculate comparisons for each metric
    const comparisons: MetricComparisons = {
      views: {
        current: calculatePeriodMetrics(currentPeriodStats, 'views'),
        previous: calculatePeriodMetrics(previousPeriodStats, 'views'),
        percentageChange: calculatePercentageChange(
          calculatePeriodMetrics(currentPeriodStats, 'views').total,
          calculatePeriodMetrics(previousPeriodStats, 'views').total
        )
      },
      uniqueViews: {
        current: calculatePeriodMetrics(currentPeriodStats, 'uniqueViews'),
        previous: calculatePeriodMetrics(previousPeriodStats, 'uniqueViews'),
        percentageChange: calculatePercentageChange(
          calculatePeriodMetrics(currentPeriodStats, 'uniqueViews').total,
          calculatePeriodMetrics(previousPeriodStats, 'uniqueViews').total
        )
      },
      likes: {
        current: calculatePeriodMetrics(currentPeriodStats, 'likes'),
        previous: calculatePeriodMetrics(previousPeriodStats, 'likes'),
        percentageChange: calculatePercentageChange(
          calculatePeriodMetrics(currentPeriodStats, 'likes').total,
          calculatePeriodMetrics(previousPeriodStats, 'likes').total
        )
      },
      comments: {
        current: calculatePeriodMetrics(currentPeriodStats, 'comments'),
        previous: calculatePeriodMetrics(previousPeriodStats, 'comments'),
        percentageChange: calculatePercentageChange(
          calculatePeriodMetrics(currentPeriodStats, 'comments').total,
          calculatePeriodMetrics(previousPeriodStats, 'comments').total
        )
      },
      shares: {
        current: calculatePeriodMetrics(currentPeriodStats, 'shares'),
        previous: calculatePeriodMetrics(previousPeriodStats, 'shares'),
        percentageChange: calculatePercentageChange(
          calculatePeriodMetrics(currentPeriodStats, 'shares').total,
          calculatePeriodMetrics(previousPeriodStats, 'shares').total
        )
      },
      engagement: {
        current: {
          total: calculateEngagementRate(currentPeriodStats),
          daily: currentPeriodStats.map(stat => 
            (stat.likes + stat.comments + stat.shares) / (stat.views || 1) * 100
          )
        },
        previous: {
          total: calculateEngagementRate(previousPeriodStats),
          daily: previousPeriodStats.map(stat => 
            (stat.likes + stat.comments + stat.shares) / (stat.views || 1) * 100
          )
        },
        percentageChange: calculatePercentageChange(
          calculateEngagementRate(currentPeriodStats),
          calculateEngagementRate(previousPeriodStats)
        )
      }
    }

    // Get monthly comparisons
    const currentMonth = startOfMonth(currentDate)
    const previousMonth = subMonths(currentMonth, 1)

    const [currentMonthStats, previousMonthStats] = await Promise.all([
      prisma.dailyAnalytics.findMany({
        where: {
          analytics: {
            itemId: params.id
          },
          date: {
            gte: startOfMonth(currentMonth),
            lte: endOfMonth(currentMonth)
          }
        }
      }),
      prisma.dailyAnalytics.findMany({
        where: {
          analytics: {
            itemId: params.id
          },
          date: {
            gte: startOfMonth(previousMonth),
            lte: endOfMonth(previousMonth)
          }
        }
      })
    ])

    const monthlyComparisons = {
      current: {
        month: currentMonth.toLocaleString('default', { month: 'long' }),
        metrics: calculatePeriodMetrics(currentMonthStats, 'views')
      },
      previous: {
        month: previousMonth.toLocaleString('default', { month: 'long' }),
        metrics: calculatePeriodMetrics(previousMonthStats, 'views')
      }
    }

    // Get the base analytics data
    const analytics = await prisma.analytics.findUnique({
      where: { itemId: params.id },
      include: {
        dailyStats: {
          orderBy: { date: 'desc' },
          take: periodDays,
        }
      }
    })

    if (!analytics) {
      return NextResponse.json({
        views: 0,
        uniqueViews: 0,
        dailyStats: [],
        trends: [],
        comparisons: {},
        monthlyComparisons: {}
      })
    }

    // Calculate existing analytics data
    const dailyStats = analytics.dailyStats.reverse()
    const metrics = {
      views: dailyStats.map(stat => stat.views),
      uniqueViews: dailyStats.map(stat => stat.uniqueViews),
      likes: dailyStats.map(stat => stat.likes),
      comments: dailyStats.map(stat => stat.comments),
      shares: dailyStats.map(stat => stat.shares)
    }

    // Calculate moving averages
    const movingAverages = {
      views: calculateMovingAverage(metrics.views, 7),
      uniqueViews: calculateMovingAverage(metrics.uniqueViews, 7),
      likes: calculateMovingAverage(metrics.likes, 7),
      comments: calculateMovingAverage(metrics.comments, 7),
      shares: calculateMovingAverage(metrics.shares, 7)
    }

    // Calculate trends for each metric
    const trends = Object.entries(metrics).map(([metric, data]) => 
      analyzeTrend(data, metric)
    )

    // Calculate overall engagement trend
    const dailyEngagement = dailyStats.map((stat: DailyAnalytics) => 
      (stat.likes + stat.comments + stat.shares) / (stat.views || 1) * 100
    )
    const engagementTrend = analyzeTrend(dailyEngagement, 'engagement')

    // Calculate peak times (hours with most activity)
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)

    const peakTimes = await prisma.viewerSession.groupBy({
      by: ['lastView'],
      where: {
        itemId: params.id,
        lastView: {
          gte: thirtyDaysAgo,
          lte: today
        }
      },
      _count: {
        lastView: true
      },
      orderBy: {
        _count: {
          lastView: 'desc'
        }
      },
      take: 5
    })

    return NextResponse.json({
      ...analytics,
      dailyStats: analytics.dailyStats.reverse(),
      trends,
      engagementTrend,
      movingAverages,
      peakActivityTimes: peakTimes.map((time: ViewerSessionWithCount) => ({
        hour: new Date(time.lastView).getHours(),
        count: time._count.lastView
      })),
      comparisons,
      monthlyComparisons
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function calculateEngagementRate(stats: any[]): number {
  const totalViews = stats.reduce((sum, stat) => sum + (stat.views || 0), 0) || 1
  const totalEngagements = stats.reduce((sum, stat) => 
    sum + (stat.likes || 0) + (stat.comments || 0) + (stat.shares || 0), 0
  )
  return (totalEngagements / totalViews) * 100
}

// Record a view
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { sessionId } = await request.json()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get or create analytics record
    let analytics = await prisma.analytics.findUnique({
      where: { itemId: params.id }
    })

    if (!analytics) {
      analytics = await prisma.analytics.create({
        data: {
          itemId: params.id,
          views: 0,
          uniqueViews: 0
        }
      })
    }

    // Check if this is a unique view
    const existingSession = await prisma.viewerSession.findUnique({
      where: {
        sessionId_itemId: {
          sessionId,
          itemId: params.id
        }
      }
    })

    // Get or create daily stats
    let dailyStats = await prisma.dailyAnalytics.findUnique({
      where: {
        analyticsId_date: {
          analyticsId: analytics.id,
          date: today
        }
      }
    })

    if (!dailyStats) {
      dailyStats = await prisma.dailyAnalytics.create({
        data: {
          analyticsId: analytics.id,
          date: today,
          views: 0,
          uniqueViews: 0,
          likes: 0,
          comments: 0,
          shares: 0
        }
      })
    }

    // Update analytics
    await prisma.$transaction(async (prisma) => {
      // Update daily stats
      await prisma.dailyAnalytics.update({
        where: {
          id: dailyStats!.id
        },
        data: {
          views: { increment: 1 },
          uniqueViews: existingSession ? 0 : 1
        }
      })

      // Update overall analytics
      await prisma.analytics.update({
        where: { id: analytics!.id },
        data: {
          views: { increment: 1 },
          uniqueViews: existingSession ? undefined : { increment: 1 }
        }
      })

      // Record session if new
      if (!existingSession) {
        await prisma.viewerSession.create({
          data: {
            sessionId,
            itemId: params.id
          }
        })
      } else {
        // Update last view time
        await prisma.viewerSession.update({
          where: {
            sessionId_itemId: {
              sessionId,
              itemId: params.id
            }
          },
          data: {
            lastView: new Date()
          }
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}

// Update engagement metrics (likes, comments, shares)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type, increment } = await request.json()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get or create analytics record
    let analytics = await prisma.analytics.findUnique({
      where: { itemId: params.id }
    })

    if (!analytics) {
      analytics = await prisma.analytics.create({
        data: {
          itemId: params.id,
          views: 0,
          uniqueViews: 0
        }
      })
    }

    // Get or create daily stats
    let dailyStats = await prisma.dailyAnalytics.findUnique({
      where: {
        analyticsId_date: {
          analyticsId: analytics.id,
          date: today
        }
      }
    })

    if (!dailyStats) {
      dailyStats = await prisma.dailyAnalytics.create({
        data: {
          analyticsId: analytics.id,
          date: today,
          views: 0,
          uniqueViews: 0,
          likes: 0,
          comments: 0,
          shares: 0
        }
      })
    }

    // Update the specific metric
    await prisma.$transaction(async (tx: typeof prisma) => {
      await tx.dailyAnalytics.update({
        where: { id: dailyStats!.id },
        data: {
          [type]: { increment: increment ? 1 : -1 }
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating engagement metrics:', error)
    return NextResponse.json(
      { error: 'Failed to update engagement metrics' },
      { status: 500 }
    )
  }
} 