'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  StarIcon,

  TrendingDownIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  MapPinIcon,
  PaintBrushIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  overview: OverviewStats
  revenue: RevenueData
  customers: CustomerData
  artists: ArtistPerformance[]
  services: ServicePerformance[]
  trends: TrendData
  insights: Insight[]
}

interface OverviewStats {
  totalRevenue: number
  totalAppointments: number
  totalCustomers: number
  totalArtists: number
  averageRating: number
  customerRetention: number
  monthlyGrowth: number
  conversionRate: number
}

interface RevenueData {
  monthly: { month: string; revenue: number; growth: number }[]
  byService: { service: string; revenue: number; percentage: number }[]
  byArtist: { artist: string; revenue: number; appointments: number }[]
  projections: { month: string; projected: number; confidence: number }[]
}

interface CustomerData {
  demographics: { age: string; count: number; percentage: number }[]
  acquisition: { source: string; count: number; cost: number }[]
  retention: { month: string; rate: number; churn: number }[]
  lifetimeValue: { segment: string; value: number; count: number }[]
}

interface ArtistPerformance {
  id: string
  name: string
  avatar: string
  rating: number
  appointments: number
  revenue: number
  portfolioViews: number
  conversionRate: number
  customerSatisfaction: number
  growth: number
}

interface ServicePerformance {
  name: string
  appointments: number
  revenue: number
  popularity: number
  growth: number
  customerSatisfaction: number
}

interface TrendData {
  revenue: { date: string; value: number }[]
  appointments: { date: string; value: number }[]
  customers: { date: string; value: number }[]
  ratings: { date: string; value: number }[]
}

interface Insight {
  id: string
  type: 'positive' | 'warning' | 'info'
  title: string
  description: string
  impact: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

export default function AnalyticsPage() {
  const { data: session } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'artists' | 'insights'>('overview')

  useEffect(() => {
    if (session?.user) {
      fetchAnalyticsData()
    }
  }, [session, timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - in real app, this would come from API
      const mockData: AnalyticsData = {
        overview: {
          totalRevenue: 125000,
          totalAppointments: 342,
          totalCustomers: 189,
          totalArtists: 8,
          averageRating: 4.8,
          customerRetention: 87.3,
          monthlyGrowth: 15.2,
          conversionRate: 23.4
        },
        revenue: {
          monthly: [
            { month: 'Jan', revenue: 8500, growth: 12.5 },
            { month: 'Feb', revenue: 9200, growth: 8.2 },
            { month: 'Mar', revenue: 10800, growth: 17.4 },
            { month: 'Apr', revenue: 11500, growth: 6.5 },
            { month: 'May', revenue: 13200, growth: 14.8 },
            { month: 'Jun', revenue: 14800, growth: 12.1 }
          ],
          byService: [
            { service: 'Custom Tattoos', revenue: 68000, percentage: 54.4 },
            { service: 'Cover-ups', revenue: 28000, percentage: 22.4 },
            { service: 'Touch-ups', revenue: 18000, percentage: 14.4 },
            { service: 'Consultations', revenue: 11000, percentage: 8.8 }
          ],
          byArtist: [
            { artist: 'Sarah Chen', revenue: 28000, appointments: 45 },
            { artist: 'Mike Rodriguez', revenue: 22000, appointments: 38 },
            { artist: 'Emma Thompson', revenue: 19000, appointments: 32 },
            { artist: 'Alex Kim', revenue: 18000, appointments: 28 }
          ],
          projections: [
            { month: 'Jul', projected: 16200, confidence: 0.85 },
            { month: 'Aug', projected: 17800, confidence: 0.82 },
            { month: 'Sep', projected: 19500, confidence: 0.79 }
          ]
        },
        customers: {
          demographics: [
            { age: '18-25', count: 45, percentage: 23.8 },
            { age: '26-35', count: 78, percentage: 41.3 },
            { age: '36-45', count: 42, percentage: 22.2 },
            { age: '46+', count: 24, percentage: 12.7 }
          ],
          acquisition: [
            { source: 'Search', count: 89, cost: 450 },
            { source: 'Social Media', count: 67, cost: 320 },
            { source: 'Referrals', count: 23, cost: 0 },
            { source: 'Direct', count: 10, cost: 0 }
          ],
          retention: [
            { month: 'Jan', rate: 85.2, churn: 14.8 },
            { month: 'Feb', rate: 87.1, churn: 12.9 },
            { month: 'Mar', rate: 89.3, churn: 10.7 },
            { month: 'Apr', rate: 91.2, churn: 8.8 }
          ],
          lifetimeValue: [
            { segment: 'High Value', value: 850, count: 23 },
            { segment: 'Medium Value', value: 420, count: 89 },
            { segment: 'Low Value', value: 180, count: 77 }
          ]
        },
        artists: [
          {
            id: '1',
            name: 'Sarah Chen',
            avatar: '/api/placeholder/40/40',
            rating: 4.9,
            appointments: 45,
            revenue: 28000,
            portfolioViews: 1240,
            conversionRate: 28.4,
            customerSatisfaction: 96.2,
            growth: 18.5
          },
          {
            id: '2',
            name: 'Mike Rodriguez',
            avatar: '/api/placeholder/40/40',
            rating: 4.7,
            appointments: 38,
            revenue: 22000,
            portfolioViews: 980,
            conversionRate: 25.1,
            customerSatisfaction: 92.8,
            growth: 12.3
          },
          {
            id: '3',
            name: 'Emma Thompson',
            avatar: '/api/placeholder/40/40',
            rating: 4.8,
            appointments: 32,
            revenue: 19000,
            portfolioViews: 1120,
            conversionRate: 26.8,
            customerSatisfaction: 94.5,
            growth: 15.7
          }
        ],
        services: [
          {
            name: 'Custom Tattoos',
            appointments: 156,
            revenue: 68000,
            popularity: 45.6,
            growth: 18.2,
            customerSatisfaction: 95.1
          },
          {
            name: 'Cover-ups',
            appointments: 67,
            revenue: 28000,
            popularity: 19.6,
            growth: 12.4,
            customerSatisfaction: 91.3
          },
          {
            name: 'Touch-ups',
            appointments: 89,
            revenue: 18000,
            popularity: 26.0,
            growth: 8.7,
            customerSatisfaction: 88.9
          },
          {
            name: 'Consultations',
            appointments: 30,
            revenue: 11000,
            popularity: 8.8,
            growth: 22.1,
            customerSatisfaction: 97.2
          }
        ],
        trends: {
          revenue: [
            { date: '2024-01-01', value: 8500 },
            { date: '2024-02-01', value: 9200 },
            { date: '2024-03-01', value: 10800 },
            { date: '2024-04-01', value: 11500 },
            { date: '2024-05-01', value: 13200 },
            { date: '2024-06-01', value: 14800 }
          ],
          appointments: [
            { date: '2024-01-01', value: 45 },
            { date: '2024-02-01', value: 52 },
            { date: '2024-03-01', value: 58 },
            { date: '2024-04-01', value: 62 },
            { date: '2024-05-01', value: 71 },
            { date: '2024-06-01', value: 79 }
          ],
          customers: [
            { date: '2024-01-01', value: 23 },
            { date: '2024-02-01', value: 28 },
            { date: '2024-03-01', value: 31 },
            { date: '2024-04-01', value: 35 },
            { date: '2024-05-01', value: 39 },
            { date: '2024-06-01', value: 42 }
          ],
          ratings: [
            { date: '2024-01-01', value: 4.7 },
            { date: '2024-02-01', value: 4.8 },
            { date: '2024-03-01', value: 4.8 },
            { date: '2024-04-01', value: 4.9 },
            { date: '2024-05-01', value: 4.9 },
            { date: '2024-06-01', value: 4.8 }
          ]
        },
        insights: [
          {
            id: '1',
            type: 'positive',
            title: 'Revenue Growth Accelerating',
            description: 'Monthly revenue growth increased from 12.1% to 15.2% this month',
            impact: 'High',
            action: 'Continue current marketing strategies',
            priority: 'high'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Customer Acquisition Cost Rising',
            description: 'Cost per customer increased by 18% in the last 30 days',
            impact: 'Medium',
            action: 'Review marketing spend and optimize campaigns',
            priority: 'medium'
          },
          {
            id: '3',
            type: 'info',
            title: 'New Artist Performance',
            description: 'Emma Thompson shows strong early performance with 26.8% conversion rate',
            impact: 'Medium',
            action: 'Consider featuring in marketing materials',
            priority: 'low'
          }
        ]
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600'
    if (growth < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'info': return <SparklesIcon className="h-5 w-5 text-blue-500" />
      default: return <SparklesIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to access analytics.</p>
      </div>
    )
  }

  if (isLoading || !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-gray-600 mt-1">Business intelligence and performance tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <ChartBarIcon className="h-5 w-5" /> },
              { id: 'revenue', label: 'Revenue', icon: <CurrencyDollarIcon className="h-5 w-5" /> },
              { id: 'customers', label: 'Customers', icon: <UsersIcon className="h-5 w-5" /> },
              { id: 'artists', label: 'Artists', icon: <PaintBrushIcon className="h-5 w-5" /> },
              { id: 'insights', label: 'Insights', icon: <SparklesIcon className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {getGrowthIcon(analyticsData.overview.monthlyGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData.overview.monthlyGrowth)}`}>
                    {analyticsData.overview.monthlyGrowth}% from last month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalAppointments)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formatNumber(analyticsData.overview.totalCustomers)} unique customers
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer Retention</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.customerRetention}%</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {formatNumber(analyticsData.overview.totalArtists)} active artists
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {analyticsData.overview.averageRating}★ average rating
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>

            {/* Top Performing Artists */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Artists</h3>
              <div className="space-y-4">
                {analyticsData.artists.slice(0, 3).map((artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{artist.name}</h4>
                        <p className="text-sm text-gray-600">
                          {artist.appointments} appointments • {artist.rating}★ rating
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(artist.revenue)}</p>
                      <div className="flex items-center gap-1">
                        {getGrowthIcon(artist.growth)}
                        <span className={`text-sm ${getGrowthColor(artist.growth)}`}>
                          {artist.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Service */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
                <div className="space-y-3">
                  {analyticsData.revenue.byService.map((service) => (
                    <div key={service.service} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{service.service}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(service.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Artist */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Artist</h3>
                <div className="space-y-3">
                  {analyticsData.revenue.byArtist.map((artist) => (
                    <div key={artist.artist} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{artist.artist}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(artist.revenue)}</p>
                        <p className="text-xs text-gray-500">{artist.appointments} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Projections */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.revenue.projections.map((projection) => (
                  <div key={projection.month} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">{projection.month}</h4>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(projection.projected)}</p>
                    <p className="text-sm text-gray-500">
                      Confidence: {(projection.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Demographics */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Demographics</h3>
                <div className="space-y-3">
                  {analyticsData.customers.demographics.map((demo) => (
                    <div key={demo.age} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{demo.age}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{demo.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Acquisition */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition</h3>
                <div className="space-y-3">
                  {analyticsData.customers.acquisition.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{source.source}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{source.count} customers</p>
                        <p className="text-xs text-gray-500">${source.cost} cost</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.customers.lifetimeValue.map((segment) => (
                  <div key={segment.segment} className="p-4 border border-gray-200 rounded-lg text-center">
                    <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                    <p className="text-2xl font-bold text-indigo-600">{formatCurrency(segment.value)}</p>
                    <p className="text-sm text-gray-500">{segment.count} customers</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.artists.map((artist) => (
                      <tr key={artist.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold text-gray-600">
                                {artist.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{artist.name}</div>
                              <div className="text-sm text-gray-500">{artist.portfolioViews} portfolio views</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-gray-900">{artist.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(artist.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{artist.conversionRate}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {getGrowthIcon(artist.growth)}
                            <span className={`text-sm ${getGrowthColor(artist.growth)}`}>
                              {artist.growth}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
              <div className="space-y-4">
                {analyticsData.insights.map((insight) => (
                  <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Impact: {insight.impact}</span>
                          <span className="text-indigo-600 font-medium">{insight.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
