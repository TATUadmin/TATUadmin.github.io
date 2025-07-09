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
  ChartOptions
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import { format, parseISO, subDays } from 'date-fns'
import { CHART_COLORS } from '@/app/constants/charts'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DetailViewProps {
  itemId: string
  metric: string
  date: string
  onClose: () => void
}

interface HourlyData {
  hour: number
  count: number
}

interface DetailedStats {
  hourlyBreakdown: HourlyData[]
  referrers: { source: string; count: number }[]
  deviceTypes: { type: string; count: number }[]
  locations: { country: string; count: number }[]
  userSegments: { segment: string; count: number }[]
}

export default function AnalyticsDetailView({ itemId, metric, date, onClose }: DetailViewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null)
  const [selectedView, setSelectedView] = useState<'hourly' | 'referrers' | 'devices' | 'locations' | 'segments'>('hourly')

  useEffect(() => {
    fetchDetailedStats()
  }, [itemId, metric, date])

  const fetchDetailedStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/portfolio/${itemId}/analytics/detail?metric=${metric}&date=${date}`
      )
      if (!response.ok) throw new Error('Failed to fetch detailed stats')
      const data = await response.json()
      setDetailedStats(data)
    } catch (error) {
      console.error('Error fetching detailed stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatHour = (hour: number) => {
    return new Date(2000, 0, 1, hour).toLocaleTimeString([], {
      hour: 'numeric',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {metric.charAt(0).toUpperCase() + metric.slice(1)} Details
            <span className="ml-2 text-sm font-normal text-gray-500">
              {format(parseISO(date), 'MMMM d, yyyy')}
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['hourly', 'referrers', 'devices', 'locations', 'segments'].map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view as typeof selectedView)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedView === view
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {selectedView === 'hourly' && detailedStats?.hourlyBreakdown && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hourly Breakdown</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: detailedStats.hourlyBreakdown.map(data => formatHour(data.hour)),
                    datasets: [{
                      label: metric,
                      data: detailedStats.hourlyBreakdown.map(data => data.count),
                      backgroundColor: CHART_COLORS[metric as keyof typeof CHART_COLORS],
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `${context.parsed.y} ${metric}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {selectedView === 'referrers' && detailedStats?.referrers && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Sources</h3>
              <div className="space-y-2">
                {detailedStats.referrers.map(ref => (
                  <div key={ref.source} className="flex items-center">
                    <div className="w-32 text-sm text-gray-500">{ref.source}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{
                            width: `${(ref.count / Math.max(...detailedStats.referrers.map(r => r.count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-500">{ref.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'devices' && detailedStats?.deviceTypes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Device Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detailedStats.deviceTypes.map(device => (
                  <div key={device.type} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">{device.type}</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{device.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'locations' && detailedStats?.locations && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
              <div className="space-y-2">
                {detailedStats.locations.map(loc => (
                  <div key={loc.country} className="flex items-center">
                    <div className="w-32 text-sm text-gray-500">{loc.country}</div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{
                            width: `${(loc.count / Math.max(...detailedStats.locations.map(l => l.count))) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm text-gray-500">{loc.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'segments' && detailedStats?.userSegments && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">User Segments</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailedStats.userSegments.map(segment => (
                  <div key={segment.segment} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-500">{segment.segment}</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{segment.count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 