'use client'

import { useEffect, useState } from 'react'

interface PerformanceMetrics {
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
  deviceType: string
  connectionType: string
  memoryUsage?: number
  batteryLevel?: number
}

export default function MobilePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development or for admin users
    if (process.env.NODE_ENV === 'production') return

    const measurePerformance = () => {
      const performance = window.performance
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      // Core Web Vitals
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart
      const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      const largestContentfulPaint = performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0
      
      // Layout shift
      let cumulativeLayoutShift = 0
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift') {
              cumulativeLayoutShift += (entry as any).value
            }
          }
        })
        observer.observe({ entryTypes: ['layout-shift'] })
      }

      // Device and connection info
      const deviceType = getDeviceType()
      const connectionType = getConnectionType()
      
      // Memory usage (if available)
      let memoryUsage: number | undefined
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100
      }

      // Battery level (if available)
      let batteryLevel: number | undefined
      if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
          batteryLevel = battery.level * 100
        })
      }

      const performanceMetrics: PerformanceMetrics = {
        loadTime,
        firstContentfulPaint,
        largestContentfulPaint,
        cumulativeLayoutShift,
        firstInputDelay: 0, // Would need to measure user interactions
        deviceType,
        connectionType,
        memoryUsage,
        batteryLevel
      }

      setMetrics(performanceMetrics)
      setIsVisible(true)

      // Auto-hide after 10 seconds
      setTimeout(() => setIsVisible(false), 10000)
    }

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance()
    } else {
      window.addEventListener('load', measurePerformance)
    }

    return () => {
      window.removeEventListener('load', measurePerformance)
    }
  }, [])

  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent
    if (/Android/i.test(userAgent)) return 'Android'
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
    if (/Windows/i.test(userAgent)) return 'Windows'
    if (/Mac/i.test(userAgent)) return 'Mac'
    if (/Linux/i.test(userAgent)) return 'Linux'
    return 'Unknown'
  }

  const getConnectionType = (): string => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection.effectiveType || connection.type || 'Unknown'
    }
    return 'Unknown'
  }

  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100

    // Load time penalty
    if (metrics.loadTime > 3000) score -= 20
    else if (metrics.loadTime > 2000) score -= 10

    // First contentful paint penalty
    if (metrics.firstContentfulPaint > 2000) score -= 20
    else if (metrics.firstContentfulPaint > 1500) score -= 10

    // Layout shift penalty
    if (metrics.cumulativeLayoutShift > 0.25) score -= 20
    else if (metrics.cumulativeLayoutShift > 0.1) score -= 10

    return Math.max(0, score)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isVisible || !metrics) return null

  const score = getPerformanceScore(metrics)

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Performance Score */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Score:</span>
          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
            {score}/100
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Load Time:</span>
          <span className={metrics.loadTime > 2000 ? 'text-red-600' : 'text-gray-900'}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">FCP:</span>
          <span className={metrics.firstContentfulPaint > 1500 ? 'text-red-600' : 'text-gray-900'}>
            {metrics.firstContentfulPaint.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">LCP:</span>
          <span className={metrics.largestContentfulPaint > 2500 ? 'text-red-600' : 'text-gray-900'}>
            {metrics.largestContentfulPaint.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">CLS:</span>
          <span className={metrics.cumulativeLayoutShift > 0.1 ? 'text-red-600' : 'text-gray-900'}>
            {metrics.cumulativeLayoutShift.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Device Info */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Device: {metrics.deviceType}</div>
          <div>Connection: {metrics.connectionType}</div>
          {metrics.memoryUsage && (
            <div>Memory: {metrics.memoryUsage.toFixed(1)}%</div>
          )}
          {metrics.batteryLevel && (
            <div>Battery: {metrics.batteryLevel.toFixed(0)}%</div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {score < 90 && (
        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
          <strong>Recommendations:</strong>
          {metrics.loadTime > 2000 && <div>• Optimize page load time</div>}
          {metrics.firstContentfulPaint > 1500 && <div>• Improve First Contentful Paint</div>}
          {metrics.cumulativeLayoutShift > 0.1 && <div>• Reduce layout shifts</div>}
        </div>
      )}
    </div>
  )
}
