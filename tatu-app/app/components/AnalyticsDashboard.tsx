import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  DoughnutController
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { format, subDays } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend
)

interface DailyStats {
  date: string
  views: number
  uniqueViews: number
  likes: number
  comments: number
  shares: number
}

interface TrendAnalysis {
  metric: string
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  averageGrowth: number
  predictedValue: number
}

interface PeakTime {
  hour: number
  count: number
}

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

interface MonthlyComparisons {
  current: {
    month: string
    metrics: {
      total: number
      daily: number[]
    }
  }
  previous: {
    month: string
    metrics: {
      total: number
      daily: number[]
    }
  }
}

interface Analytics {
  views: number
  uniqueViews: number
  dailyStats: DailyStats[]
  trends: TrendAnalysis[]
  engagementTrend: TrendAnalysis
  movingAverages: {
    views: number[]
    uniqueViews: number[]
    likes: number[]
    comments: number[]
    shares: number[]
  }
  peakActivityTimes: PeakTime[]
  comparisons: MetricComparisons
  monthlyComparisons: MonthlyComparisons
}

interface Props {
  itemId: string
}

type ChartType = 'line' | 'bar' | 'pie' | 'doughnut'
type MetricType = 'views' | 'uniqueViews' | 'likes' | 'comments' | 'shares'

const CHART_COLORS = {
  views: 'rgb(99, 102, 241)',
  uniqueViews: 'rgb(79, 70, 229)',
  likes: 'rgb(239, 68, 68)',
  comments: 'rgb(34, 197, 94)',
  shares: 'rgb(249, 115, 22)',
  engagement: 'rgb(168, 85, 247)'
}

const ANIMATIONS = {
  line: {
    tension: {
      duration: 1000,
      easing: 'linear',
      from: 0,
      to: 0.4,
      loop: false
    }
  },
  bar: {
    y: {
      duration: 2000,
      from: 1000
    }
  },
  pie: {
    animateRotate: true,
    animateScale: true
  },
  doughnut: {
    animateRotate: true,
    animateScale: true
  }
}

export default function AnalyticsDashboard({ itemId }: Props) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('views')
  const [chartType, setChartType] = useState<ChartType>('line')
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30)
  const [comparisonPeriod, setComparisonPeriod] = useState<7 | 14 | 30>(30)

  useEffect(() => {
    fetchAnalytics()
  }, [itemId, comparisonPeriod])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/portfolio/${itemId}/analytics?period=${comparisonPeriod}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateEngagementRate = () => {
    if (!analytics) return 0
    const totalViews = analytics.views || 1 // Prevent division by zero
    const totalEngagements = analytics.dailyStats.reduce((sum, stat) => 
      sum + stat.likes + stat.comments + stat.shares, 0)
    return (totalEngagements / totalViews) * 100
  }

  const getFilteredData = () => {
    if (!analytics?.dailyStats) return []
    return analytics.dailyStats
      .slice(0, timeRange)
      .reverse()
  }

  const formatTooltipLabel = (value: number, type: string) => {
    if (type.includes('rate')) {
      return `${value.toFixed(2)}%`
    }
    return value.toLocaleString()
  }

  const lineChartData: ChartData<'line'> = {
    labels: getFilteredData().map(stat => format(new Date(stat.date), 'MMM d')),
    datasets: [
      {
        label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
        data: getFilteredData().map(stat => stat[selectedMetric]),
        borderColor: CHART_COLORS[selectedMetric],
        backgroundColor: CHART_COLORS[selectedMetric].replace('rgb', 'rgba').replace(')', ', 0.5)'),
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  }

  const barChartData: ChartData<'bar'> = {
    labels: getFilteredData().map(stat => format(new Date(stat.date), 'MMM d')),
    datasets: [
      {
        label: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1),
        data: getFilteredData().map(stat => stat[selectedMetric]),
        backgroundColor: CHART_COLORS[selectedMetric].replace('rgb', 'rgba').replace(')', ', 0.7)'),
        borderColor: CHART_COLORS[selectedMetric],
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  }

  const pieChartData: ChartData<'pie'> = {
    labels: ['Views', 'Unique Views', 'Likes', 'Comments', 'Shares'],
    datasets: [{
      data: [
        analytics?.views || 0,
        analytics?.uniqueViews || 0,
        analytics?.dailyStats.reduce((sum, stat) => sum + stat.likes, 0) || 0,
        analytics?.dailyStats.reduce((sum, stat) => sum + stat.comments, 0) || 0,
        analytics?.dailyStats.reduce((sum, stat) => sum + stat.shares, 0) || 0
      ],
      backgroundColor: Object.values(CHART_COLORS).slice(0, 5),
      borderWidth: 1
    }]
  }

  const engagementRate = calculateEngagementRate()
  const doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Engagement Rate', 'Non-Engaged'],
    datasets: [{
      data: [engagementRate, 100 - engagementRate],
      backgroundColor: [
        CHART_COLORS.engagement,
        'rgb(229, 231, 235)'
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: -90
    }]
  }

  const baseChartOptions: ChartOptions<any> = {
    responsive: true,
    animation: ANIMATIONS[chartType],
    plugins: {
      legend: {
        display: ['pie', 'doughnut'].includes(chartType),
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: chartType === 'doughnut' 
          ? 'Engagement Rate' 
          : `Last ${timeRange} Days`,
        padding: 20,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        enabled: true,
        mode: ['line', 'bar'].includes(chartType) ? 'index' : 'point',
        intersect: false,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed || 0;
            const type = chartType === 'doughnut' ? 'rate' : 'value';
            return `${label}: ${formatTooltipLabel(value, type)}`;
          }
        }
      }
    },
    scales: ['line', 'bar'].includes(chartType) ? {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          callback: function(value: any) {
            return value.toLocaleString()
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    } : undefined,
    cutout: chartType === 'doughnut' ? '80%' : undefined,
    maintainAspectRatio: false
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↑'
      case 'down':
        return '↓'
      default:
        return '→'
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatTime = (hour: number) => {
    return new Date(2000, 0, 1, hour).toLocaleTimeString([], { 
      hour: 'numeric',
      hour12: true 
    })
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getComparisonColor = (value: number) => {
    if (Math.abs(value) < 5) return 'text-gray-600'
    return value > 0 ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select
          value={comparisonPeriod}
          onChange={(e) => setComparisonPeriod(Number(e.target.value) as 7 | 14 | 30)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(analytics?.comparisons || {}).map(([metric, comparison]) => (
          <div key={metric} className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm font-medium text-gray-500 capitalize">{metric}</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">
              {metric === 'engagement' 
                ? `${comparison.current.total.toFixed(1)}%`
                : comparison.current.total.toLocaleString()}
            </div>
            <div className={`text-sm ${getComparisonColor(comparison.percentageChange)}`}>
              {formatPercentage(comparison.percentageChange)}
              <span className="text-gray-500 ml-1">vs previous</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">
              {analytics?.monthlyComparisons.current.month}
            </h4>
            <div className="text-2xl font-semibold text-gray-900">
              {analytics?.monthlyComparisons.current.metrics.total.toLocaleString()}
              <span className="text-sm text-gray-500 ml-2">views</span>
            </div>
            <Line
              data={{
                labels: Array.from({ length: analytics?.monthlyComparisons.current.metrics.daily.length || 0 }, (_, i) => i + 1),
                datasets: [{
                  label: 'Current Month',
                  data: analytics?.monthlyComparisons.current.metrics.daily || [],
                  borderColor: CHART_COLORS.views,
                  backgroundColor: 'transparent',
                  tension: 0.4
                }]
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">
              {analytics?.monthlyComparisons.previous.month}
            </h4>
            <div className="text-2xl font-semibold text-gray-900">
              {analytics?.monthlyComparisons.previous.metrics.total.toLocaleString()}
              <span className="text-sm text-gray-500 ml-2">views</span>
            </div>
            <Line
              data={{
                labels: Array.from({ length: analytics?.monthlyComparisons.previous.metrics.daily.length || 0 }, (_, i) => i + 1),
                datasets: [{
                  label: 'Previous Month',
                  data: analytics?.monthlyComparisons.previous.metrics.daily || [],
                  borderColor: CHART_COLORS.views.replace('rgb', 'rgba').replace(')', ', 0.5)'),
                  backgroundColor: 'transparent',
                  tension: 0.4
                }]
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: { display: false }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Period Comparison</h3>
        <Line
          data={{
            labels: getFilteredData().map(stat => format(new Date(stat.date), 'MMM d')),
            datasets: [
              {
                label: `Current ${selectedMetric}`,
                data: analytics?.comparisons[selectedMetric].current.daily || [],
                borderColor: CHART_COLORS[selectedMetric],
                backgroundColor: 'transparent',
                borderWidth: 2
              },
              {
                label: `Previous ${selectedMetric}`,
                data: analytics?.comparisons[selectedMetric].previous.daily || [],
                borderColor: CHART_COLORS[selectedMetric].replace('rgb', 'rgba').replace(')', ', 0.5)'),
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderDash: [5, 5]
              }
            ]
          }}
          options={{
            ...baseChartOptions,
            plugins: {
              ...baseChartOptions.plugins,
              legend: { display: true, position: 'top' }
            }
          }}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Views</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics?.views.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Unique Views</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics?.uniqueViews.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Likes</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics?.dailyStats.reduce((sum, stat) => sum + stat.likes, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Comments</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics?.dailyStats.reduce((sum, stat) => sum + stat.comments, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Shares</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">
            {analytics?.dailyStats.reduce((sum, stat) => sum + stat.shares, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Metric Trends</h4>
            {analytics?.trends.map((trend) => (
              <div key={trend.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900 capitalize">
                    {trend.metric}
                  </div>
                  <div className="text-sm text-gray-500">
                    {trend.percentageChange > 0 ? '+' : ''}{trend.percentageChange.toFixed(1)}% change
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getTrendColor(trend.trend)}`}>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Predicted: {trend.predictedValue}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500">Peak Activity Hours</h4>
            <div className="space-y-2">
              {analytics?.peakActivityTimes.map((time, index) => (
                <div key={time.hour} className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 w-20">
                    {formatTime(time.hour)}
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ 
                        width: `${(time.count / analytics.peakActivityTimes[0].count) * 100}%`,
                        opacity: 1 - (index * 0.15)
                      }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 w-16 text-right">
                    {time.count} views
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Trend Analysis</h3>
          <div className="flex flex-wrap gap-4">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Engagement Rate</option>
            </select>
            {['line', 'bar'].includes(chartType) && (
              <>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="views">Views</option>
                  <option value="uniqueViews">Unique Views</option>
                  <option value="likes">Likes</option>
                  <option value="comments">Comments</option>
                  <option value="shares">Shares</option>
                </select>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(Number(e.target.value) as 7 | 14 | 30)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={7}>Last 7 Days</option>
                  <option value={14}>Last 14 Days</option>
                  <option value={30}>Last 30 Days</option>
                </select>
              </>
            )}
          </div>
        </div>
        <div className="h-64">
          {chartType === 'line' && <Line data={lineChartData} options={baseChartOptions} />}
          {chartType === 'bar' && <Bar data={barChartData} options={baseChartOptions} />}
          {chartType === 'pie' && <Pie data={pieChartData} options={baseChartOptions} />}
          {chartType === 'doughnut' && (
            <div className="relative h-full flex items-center justify-center">
              <Doughnut data={doughnutChartData} options={baseChartOptions} />
              <div className="absolute text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Engagement</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {['line', 'bar'].includes(chartType) && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">7-Day Moving Average</h3>
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: getFilteredData().map(stat => format(new Date(stat.date), 'MMM d')),
                datasets: [
                  {
                    label: `${selectedMetric} (Actual)`,
                    data: getFilteredData().map(stat => stat[selectedMetric]),
                    borderColor: CHART_COLORS[selectedMetric],
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    pointRadius: 2
                  },
                  {
                    label: `${selectedMetric} (Moving Average)`,
                    data: analytics?.movingAverages[selectedMetric] || [],
                    borderColor: CHART_COLORS[selectedMetric].replace('rgb', 'rgba').replace(')', ', 0.5)'),
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 0
                  }
                ]
              }}
              options={{
                ...baseChartOptions,
                plugins: {
                  ...baseChartOptions.plugins,
                  legend: {
                    display: true,
                    position: 'top'
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 