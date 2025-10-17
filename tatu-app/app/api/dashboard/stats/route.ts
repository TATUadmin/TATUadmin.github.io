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
    const range = searchParams.get('range') || '30d'
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7

    // Calculate date range
    const endDate = endOfDay(new Date())
    const startDate = startOfDay(subDays(endDate, days))

    // Get stats based on user role
    if (user.role === 'ARTIST') {
      // Artist dashboard stats
      const [
        totalAppointments,
        totalRevenue,
        activeClients,
        portfolioViews
      ] = await Promise.all([
        // Total appointments
        prisma.appointment.count({
          where: {
            artistId: user.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        
        // Total revenue
        prisma.appointment.aggregate({
          where: {
            artistId: user.id,
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            totalPrice: true
          }
        }),
        
        // Active clients (unique clients with appointments)
        prisma.appointment.groupBy({
          by: ['clientId'],
          where: {
            artistId: user.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }).then(result => result.length),
        
        // Portfolio views
        prisma.portfolioItem.aggregate({
          where: {
            userId: user.id
          },
          _sum: {
            viewCount: true
          }
        })
      ])

      // Calculate previous period for comparison
      const prevStartDate = startOfDay(subDays(startDate, days))
      const prevEndDate = endOfDay(subDays(startDate, 1))

      const [
        prevTotalAppointments,
        prevTotalRevenue
      ] = await Promise.all([
        prisma.appointment.count({
          where: {
            artistId: user.id,
            createdAt: {
              gte: prevStartDate,
              lte: prevEndDate
            }
          }
        }),
        prisma.appointment.aggregate({
          where: {
            artistId: user.id,
            status: 'COMPLETED',
            createdAt: {
              gte: prevStartDate,
              lte: prevEndDate
            }
          },
          _sum: {
            totalPrice: true
          }
        })
      ])

      // Calculate percentage changes
      const appointmentChange = prevTotalAppointments > 0 
        ? Math.round(((totalAppointments - prevTotalAppointments) / prevTotalAppointments) * 100)
        : 0

      const revenueChange = prevTotalRevenue._sum.totalPrice && prevTotalRevenue._sum.totalPrice > 0
        ? Math.round(((Number(totalRevenue._sum.totalPrice || 0) - Number(prevTotalRevenue._sum.totalPrice)) / Number(prevTotalRevenue._sum.totalPrice)) * 100)
        : 0

      return NextResponse.json({
        stats: [
          {
            id: 'total-appointments',
            label: 'Total Appointments',
            value: totalAppointments,
            change: appointmentChange,
            changeLabel: 'vs previous period',
            trend: appointmentChange >= 0 ? 'up' : 'down',
            color: 'white'
          },
          {
            id: 'total-revenue',
            label: 'Total Revenue',
            value: `$${Number(totalRevenue._sum.totalPrice || 0).toLocaleString()}`,
            change: revenueChange,
            changeLabel: 'vs previous period',
            trend: revenueChange >= 0 ? 'up' : 'down',
            color: 'green'
          },
          {
            id: 'active-clients',
            label: 'Active Clients',
            value: activeClients,
            change: 5, // TODO: Calculate actual change
            changeLabel: 'vs previous period',
            trend: 'up',
            color: 'white'
          },
          {
            id: 'portfolio-views',
            label: 'Portfolio Views',
            value: `${Number(portfolioViews._sum.viewCount || 0).toLocaleString()}`,
            change: 15, // TODO: Calculate actual change
            changeLabel: 'vs previous period',
            trend: 'up',
            color: 'white'
          }
        ]
      })

    } else if (user.role === 'ADMIN') {
      // Admin dashboard stats
      const [
        totalArtists,
        totalBookings,
        platformRevenue,
        userEngagement
      ] = await Promise.all([
        prisma.user.count({
          where: {
            role: 'ARTIST',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.appointment.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        prisma.appointment.aggregate({
          where: {
            status: 'COMPLETED',
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            totalPrice: true
          }
        }),
        // Calculate engagement as percentage of active users
        prisma.user.count({
          where: {
            lastActiveAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }).then(activeUsers => 
          prisma.user.count().then(totalUsers => 
            Math.round((activeUsers / totalUsers) * 100)
          )
        )
      ])

      return NextResponse.json({
        stats: [
          {
            id: 'total-artists',
            label: 'Total Artists',
            value: totalArtists,
            change: 3,
            changeLabel: 'new this period',
            trend: 'up',
            color: 'white'
          },
          {
            id: 'total-bookings',
            label: 'Total Bookings',
            value: totalBookings,
            change: 18,
            changeLabel: 'vs previous period',
            trend: 'up',
            color: 'white'
          },
          {
            id: 'platform-revenue',
            label: 'Platform Revenue',
            value: `$${Number(platformRevenue._sum.totalPrice || 0).toLocaleString()}`,
            change: 22,
            changeLabel: 'vs previous period',
            trend: 'up',
            color: 'green'
          },
          {
            id: 'user-engagement',
            label: 'User Engagement',
            value: `${userEngagement}%`,
            change: 4,
            changeLabel: 'vs previous period',
            trend: 'up',
            color: 'white'
          }
        ]
      })

    } else {
      // Client dashboard stats
      return NextResponse.json({
        stats: [
          {
            id: 'upcoming-appointments',
            label: 'Upcoming Appointments',
            value: 2,
            change: 0,
            changeLabel: 'this week',
            trend: 'neutral',
            color: 'white'
          },
          {
            id: 'total-spent',
            label: 'Total Spent',
            value: '$1,250',
            change: 5,
            changeLabel: 'this month',
            trend: 'up',
            color: 'green'
          },
          {
            id: 'favorite-artists',
            label: 'Favorite Artists',
            value: 3,
            change: 1,
            changeLabel: 'new this month',
            trend: 'up',
            color: 'white'
          },
          {
            id: 'reviews-given',
            label: 'Reviews Given',
            value: 5,
            change: 2,
            changeLabel: 'this month',
            trend: 'up',
            color: 'white'
          }
        ]
      })
    }

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
