'use client'

import { useState, useEffect } from 'react'
import { Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
)

interface AnalyticsData {
  views: number
  uniqueViews: number
  likes: number
  comments: number
  shares: number
  dailyStats: {
    date: string
    views: number
    uniqueViews: number
    likes: number
    comments: number
    shares: number
  }[]
}

export default function PortfolioAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/portfolio/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>Failed to load analytics</div>
  }

  const engagementData = {
    labels: analyticsData.dailyStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Views',
        data: analyticsData.dailyStats.map(stat => stat.views),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Unique Views',
        data: analyticsData.dailyStats.map(stat => stat.uniqueViews),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.1,
      },
    ],
  }

  const interactionData = {
    labels: analyticsData.dailyStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Likes',
        data: analyticsData.dailyStats.map(stat => stat.likes),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Comments',
        data: analyticsData.dailyStats.map(stat => stat.comments),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Shares',
        data: analyticsData.dailyStats.map(stat => stat.shares),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Analytics</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: analyticsData.views },
          { label: 'Unique Visitors', value: analyticsData.uniqueViews },
          { label: 'Total Likes', value: analyticsData.likes },
          { label: 'Total Comments', value: analyticsData.comments },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-4"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Over Time</h3>
          <Line
            data={engagementData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Interactions Breakdown</h3>
          <Bar
            data={interactionData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
} 