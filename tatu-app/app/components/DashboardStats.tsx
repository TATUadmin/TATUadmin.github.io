'use client'

import { useState, useEffect } from 'react'
import {
  CalendarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

export interface StatCard {
  id: string
  label: string
  value: string | number
  change?: number // Percentage change
  changeLabel?: string
  icon: any
  trend?: 'up' | 'down' | 'neutral'
  color?: 'white' | 'green' | 'red' | 'yellow'
}

interface DashboardStatsProps {
  stats: StatCard[]
  layout?: 'grid' | 'horizontal'
}

// Hook to fetch dashboard stats from API
export function useDashboardStats(range: '7d' | '30d' | '90d' = '30d') {
  const [stats, setStats] = useState<StatCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/dashboard/stats?range=${range}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        
        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [range])

  return { stats, isLoading, error }
}

export default function DashboardStats({ stats, layout = 'grid' }: DashboardStatsProps) {
  const getIconColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-500'
      case 'red':
        return 'text-red-500'
      case 'yellow':
        return 'text-yellow-500'
      default:
        return 'text-white'
    }
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
    } else if (trend === 'down') {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return 'text-green-500'
    if (trend === 'down') return 'text-red-500'
    return 'text-gray-400'
  }

  return (
    <div
      className={
        layout === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          : 'flex flex-col md:flex-row gap-6'
      }
    >
      {stats.map((stat) => {
        const IconComponent = stat.icon

        return (
          <div
            key={stat.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gray-800 rounded-lg ${getIconColor(stat.color)}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              {stat.trend && getTrendIcon(stat.trend)}
            </div>

            {/* Value */}
            <div className="mb-2">
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>

            {/* Change Indicator */}
            {stat.change !== undefined && (
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
                  {stat.change > 0 ? '+' : ''}
                  {stat.change}%
                </span>
                {stat.changeLabel && (
                  <span className="text-xs text-gray-500">{stat.changeLabel}</span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Preset stat configurations
export const artistDashboardStats: StatCard[] = [
  {
    id: 'total-appointments',
    label: 'Total Appointments',
    value: 47,
    change: 12,
    changeLabel: 'vs last month',
    icon: CalendarIcon,
    trend: 'up',
    color: 'white'
  },
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: '$8,450',
    change: 8,
    changeLabel: 'vs last month',
    icon: CurrencyDollarIcon,
    trend: 'up',
    color: 'green'
  },
  {
    id: 'active-clients',
    label: 'Active Clients',
    value: 124,
    change: 5,
    changeLabel: 'vs last month',
    icon: UserGroupIcon,
    trend: 'up',
    color: 'white'
  },
  {
    id: 'portfolio-views',
    label: 'Portfolio Views',
    value: '2.4K',
    change: 15,
    changeLabel: 'vs last week',
    icon: ChartBarIcon,
    trend: 'up',
    color: 'white'
  }
]

export const adminDashboardStats: StatCard[] = [
  {
    id: 'total-artists',
    label: 'Total Artists',
    value: 28,
    change: 3,
    changeLabel: 'new this month',
    icon: UserGroupIcon,
    trend: 'up',
    color: 'white'
  },
  {
    id: 'total-bookings',
    label: 'Total Bookings',
    value: 342,
    change: 18,
    changeLabel: 'vs last month',
    icon: CalendarIcon,
    trend: 'up',
    color: 'white'
  },
  {
    id: 'platform-revenue',
    label: 'Platform Revenue',
    value: '$45.2K',
    change: 22,
    changeLabel: 'vs last month',
    icon: CurrencyDollarIcon,
    trend: 'up',
    color: 'green'
  },
  {
    id: 'user-engagement',
    label: 'User Engagement',
    value: '89%',
    change: 4,
    changeLabel: 'vs last week',
    icon: ChartBarIcon,
    trend: 'up',
    color: 'white'
  }
]

export const appointmentStats: StatCard[] = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    value: 12,
    icon: ClockIcon,
    color: 'yellow'
  },
  {
    id: 'completed',
    label: 'Completed',
    value: 28,
    icon: CheckCircleIcon,
    color: 'green'
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    value: 3,
    icon: XCircleIcon,
    color: 'red'
  },
  {
    id: 'pending',
    label: 'Pending',
    value: 5,
    icon: ClockIcon,
    color: 'yellow'
  }
]

