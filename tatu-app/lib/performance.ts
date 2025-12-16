// Performance optimization utilities for TATU application

import { useEffect, useRef, useCallback, useState } from 'react'

/**
 * Debounce hook - delays execution until after wait time has elapsed
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttle hook - limits execution to once per specified time period
 */
export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => {
      clearTimeout(handler)
    }
  }, [value, limit])

  return throttledValue
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [node, setNode] = useState<Element | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (observer.current) observer.current.disconnect()

    observer.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    if (node) observer.current.observe(node)

    return () => {
      if (observer.current) observer.current.disconnect()
    }
  }, [node, options])

  return [setNode, isIntersecting]
}

/**
 * Virtual scrolling for large lists
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 3
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }
  }
}

/**
 * Image lazy loading hook
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const img = new Image()
    
    img.onload = () => {
      setImageSrc(src)
      setIsLoading(false)
    }
    
    img.onerror = () => {
      setError(new Error('Failed to load image'))
      setIsLoading(false)
    }
    
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { imageSrc, isLoading, error }
}

/**
 * Memoization helper for expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map()

  return ((...args: any[]) => {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}

/**
 * Request Animation Frame hook for smooth animations
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current
      callback(deltaTime)
    }
    previousTimeRef.current = time
    requestRef.current = requestAnimationFrame(animate)
  }, [callback])

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])
}

/**
 * Web Worker hook for offloading heavy computations
 */
export function useWebWorker<T, R>(
  workerFunction: (data: T) => R
): [(data: T) => Promise<R>, boolean] {
  const [isRunning, setIsRunning] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // Create worker from function
    const blob = new Blob(
      [`self.onmessage = ${workerFunction.toString()}`],
      { type: 'application/javascript' }
    )
    workerRef.current = new Worker(URL.createObjectURL(blob))

    return () => {
      workerRef.current?.terminate()
    }
  }, [workerFunction])

  const runWorker = useCallback(
    (data: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }

        setIsRunning(true)

        workerRef.current.onmessage = (e: MessageEvent<R>) => {
          setIsRunning(false)
          resolve(e.data)
        }

        workerRef.current.onerror = (error) => {
          setIsRunning(false)
          reject(error)
        }

        workerRef.current.postMessage(data)
      })
    },
    []
  )

  return [runWorker, isRunning]
}

/**
 * Idle callback hook - runs code when browser is idle
 */
export function useIdleCallback(callback: () => void, deps: React.DependencyList = []) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(callback)
      return () => window.cancelIdleCallback(handle)
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      const timeout = setTimeout(callback, 1)
      return () => clearTimeout(timeout)
    }
  }, deps)
}

/**
 * Network information hook - adapts to user's connection
 */
export function useNetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState({
    online: navigator.onLine,
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  })

  useEffect(() => {
    const updateNetworkInfo = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection

      setNetworkInfo({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      })
    }

    updateNetworkInfo()

    window.addEventListener('online', updateNetworkInfo)
    window.addEventListener('offline', updateNetworkInfo)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo)
      window.removeEventListener('offline', updateNetworkInfo)
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
    }
  }, [])

  return networkInfo
}

/**
 * Prefetch link on hover
 */
export function prefetchOnHover(href: string) {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

/**
 * Bundle size optimization - dynamic imports helper
 */
export async function loadComponent<T>(
  importFn: () => Promise<{ default: T }>,
  componentName?: string
): Promise<T> {
  try {
    const module = await importFn()
    return module.default
  } catch (error) {
    console.error(`Failed to load component${componentName ? ` ${componentName}` : ''}:`, error)
    throw error
  }
}

/**
 * Local storage with compression for large data
 */
export class CompressedStorage {
  static set(key: string, value: any): void {
    try {
      const json = JSON.stringify(value)
      // Simple compression using LZ-string could be added here
      localStorage.setItem(key, json)
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Failed to read from localStorage:', error)
      return null
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key)
  }

  static clear(): void {
    localStorage.clear()
  }
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  static measureRender(componentName: string) {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (duration > 16) { // Longer than 1 frame (60fps)
        console.warn(`${componentName} render took ${duration.toFixed(2)}ms`)
      }
    }
  }

  static measureAPI(endpoint: string, startTime: number) {
    const duration = performance.now() - startTime
    
    if (duration > 1000) {
      console.warn(`API call to ${endpoint} took ${duration.toFixed(2)}ms`)
    }
    
    return duration
  }
}

export default {
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useVirtualScroll,
  useLazyImage,
  useAnimationFrame,
  useWebWorker,
  useIdleCallback,
  useNetworkInfo,
  prefetchOnHover,
  loadComponent,
  CompressedStorage,
  PerformanceMonitor,
  memoize
}

