import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url)
    const metric = url.searchParams.get('metric')
    const date = url.searchParams.get('date')

    if (!metric || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const dayStart = startOfDay(parseISO(date))
    const dayEnd = endOfDay(parseISO(date))

    // Get hourly breakdown
    const hourlyBreakdown = await prisma.viewerSession.groupBy({
      by: ['lastView'],
      where: {
        itemId: params.id,
        lastView: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      _count: {
        lastView: true
      }
    })

    // Get referrer data
    const referrers = await prisma.viewerSession.groupBy({
      by: ['referrer'],
      where: {
        itemId: params.id,
        lastView: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      _count: {
        referrer: true
      },
      orderBy: {
        _count: {
          referrer: 'desc'
        }
      },
      take: 10
    })

    // Get device types
    const deviceTypes = await prisma.viewerSession.groupBy({
      by: ['deviceType'],
      where: {
        itemId: params.id,
        lastView: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      _count: {
        deviceType: true
      }
    })

    // Get locations
    const locations = await prisma.viewerSession.groupBy({
      by: ['country'],
      where: {
        itemId: params.id,
        lastView: {
          gte: dayStart,
          lte: dayEnd
        }
      },
      _count: {
        country: true
      },
      orderBy: {
        _count: {
          country: 'desc'
        }
      },
      take: 10
    })

    // Get user segments (based on interaction patterns)
    const userSegments = [
      {
        segment: 'First-time Visitors',
        count: await prisma.viewerSession.count({
          where: {
            itemId: params.id,
            lastView: {
              gte: dayStart,
              lte: dayEnd
            },
            firstView: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        })
      },
      {
        segment: 'Returning Visitors',
        count: await prisma.viewerSession.count({
          where: {
            itemId: params.id,
            lastView: {
              gte: dayStart,
              lte: dayEnd
            },
            firstView: {
              lt: dayStart
            }
          }
        })
      },
      {
        segment: 'Engaged Users',
        count: await prisma.viewerSession.count({
          where: {
            itemId: params.id,
            lastView: {
              gte: dayStart,
              lte: dayEnd
            },
            OR: [
              { hasLiked: true },
              { hasCommented: true },
              { hasShared: true }
            ]
          }
        })
      }
    ]

    // Process hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourSessions = hourlyBreakdown.filter(
        session => new Date(session.lastView).getHours() === hour
      )
      return {
        hour,
        count: hourSessions.reduce((sum, session) => sum + session._count.lastView, 0)
      }
    })

    return NextResponse.json({
      hourlyBreakdown: hourlyData,
      referrers: referrers.map(ref => ({
        source: ref.referrer || 'Direct',
        count: ref._count.referrer
      })),
      deviceTypes: deviceTypes.map(device => ({
        type: device.deviceType || 'Unknown',
        count: device._count.deviceType
      })),
      locations: locations.map(loc => ({
        country: loc.country || 'Unknown',
        count: loc._count.country
      })),
      userSegments
    })
  } catch (error) {
    console.error('Error fetching detailed analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detailed analytics' },
      { status: 500 }
    )
  }
} 