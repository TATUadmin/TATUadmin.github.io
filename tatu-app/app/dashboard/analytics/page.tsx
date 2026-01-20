'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'
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
      return <ArrowTrendingUpIcon className="h-4 w-4 text-white" />
    } else if (growth < 0) {
      return <ArrowTrendingDownIcon className="h-4 w-4 text-gray-500" />
    }
    return null
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-white'
    if (growth < 0) return 'text-gray-500'
    return 'text-gray-400'
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircleIcon className="h-5 w-5 text-white" />
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
      case 'info': return <SparklesIcon className="h-5 w-5 text-gray-300" />
      default: return <SparklesIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-white/20 text-white border border-white/30'
      case 'medium': return 'bg-gray-800 text-gray-300 border border-gray-700'
      case 'low': return 'bg-gray-900 text-gray-400 border border-gray-800'
      default: return 'bg-gray-900 text-gray-400 border border-gray-800'
    }
  }

  if (!session?.user) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Please sign in to access analytics.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading || !analyticsData) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
              <p className="text-gray-400 mt-1">Business intelligence and performance tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors font-medium">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-950 border-b border-gray-900">
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
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
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
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.overview.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg border border-gray-800">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {getGrowthIcon(analyticsData.overview.monthlyGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analyticsData.overview.monthlyGrowth)}`}>
                    {analyticsData.overview.monthlyGrowth}% from last month
                  </span>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Appointments</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analyticsData.overview.totalAppointments)}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg border border-gray-800">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {formatNumber(analyticsData.overview.totalCustomers)} unique customers
                  </span>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Customer Retention</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.customerRetention}%</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg border border-gray-800">
                    <UsersIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {formatNumber(analyticsData.overview.totalArtists)} active artists
                  </span>
                </div>
              </div>

              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.overview.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-lg border border-gray-800">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {analyticsData.overview.averageRating}★ average rating
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue Trend Chart */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Trend</h3>
              <div className="h-64 bg-black rounded-lg flex items-center justify-center border border-gray-900">
                <p className="text-gray-500">Chart visualization would go here</p>
              </div>
            </div>

            {/* Top Performing Artists */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performing Artists</h3>
              <div className="space-y-4">
                {analyticsData.artists.slice(0, 3).map((artist) => (
                  <div key={artist.id} className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-gray-900">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-gray-800">
                        <span className="text-lg font-semibold text-white">
                          {artist.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{artist.name}</h4>
                        <p className="text-sm text-gray-400">
                          {artist.appointments} appointments • {artist.rating}★ rating
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-white">{formatCurrency(artist.revenue)}</p>
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
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue by Service</h3>
                <div className="space-y-3">
                  {analyticsData.revenue.byService.map((service) => (
                    <div key={service.service} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{service.service}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-900 rounded-full h-2 border border-gray-800">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${service.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white">{formatCurrency(service.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue by Artist */}
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Revenue by Artist</h3>
                <div className="space-y-3">
                  {analyticsData.revenue.byArtist.map((artist) => (
                    <div key={artist.artist} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{artist.artist}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{formatCurrency(artist.revenue)}</p>
                        <p className="text-xs text-gray-500">{artist.appointments} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue Projections */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Revenue Projections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.revenue.projections.map((projection) => (
                  <div key={projection.month} className="p-4 border border-gray-800 rounded-lg bg-gray-900">
                    <h4 className="font-medium text-white">{projection.month}</h4>
                    <p className="text-2xl font-bold text-white">{formatCurrency(projection.projected)}</p>
                    <p className="text-sm text-gray-400">
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
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Demographics</h3>
                <div className="space-y-3">
                  {analyticsData.customers.demographics.map((demo) => (
                    <div key={demo.age} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{demo.age}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-900 rounded-full h-2 border border-gray-800">
                          <div
                            className="bg-white h-2 rounded-full"
                            style={{ width: `${demo.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white">{demo.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Acquisition */}
              <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Acquisition</h3>
                <div className="space-y-3">
                  {analyticsData.customers.acquisition.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{source.source}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{source.count} customers</p>
                        <p className="text-xs text-gray-500">${source.cost} cost</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Customer Lifetime Value</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analyticsData.customers.lifetimeValue.map((segment) => (
                  <div key={segment.segment} className="p-4 border border-gray-800 rounded-lg text-center bg-gray-900">
                    <h4 className="font-medium text-white">{segment.segment}</h4>
                    <p className="text-2xl font-bold text-white">{formatCurrency(segment.value)}</p>
                    <p className="text-sm text-gray-400">{segment.count} customers</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === 'artists' && (
          <div className="space-y-6">
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Artist Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead className="bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Artist</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Appointments</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Conversion</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Growth</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-950 divide-y divide-gray-800">
                    {analyticsData.artists.map((artist) => (
                      <tr key={artist.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-gray-800">
                              <span className="text-sm font-semibold text-white">
                                {artist.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{artist.name}</div>
                              <div className="text-sm text-gray-400">{artist.portfolioViews} portfolio views</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-white fill-current" />
                            <span className="ml-1 text-sm text-white">{artist.rating}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{artist.appointments}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatCurrency(artist.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{artist.conversionRate}%</td>
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
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Business Insights</h3>
              <div className="space-y-4">
                {analyticsData.insights.map((insight) => (
                  <div key={insight.id} className="p-4 border border-gray-800 rounded-lg bg-gray-900">
                    <div className="flex items-start gap-3">
                      {getInsightIcon(insight.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-white">{insight.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{insight.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">Impact: {insight.impact}</span>
                          <span className="text-white font-medium">{insight.action}</span>
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
    </DashboardLayout>
  )
}
