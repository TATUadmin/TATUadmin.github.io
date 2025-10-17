// Comprehensive API Client with Security Middleware and Error Handling

import { getSession } from 'next-auth/react'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = 30000 // 30 seconds

// Request/Response Types
interface ApiRequestConfig extends RequestInit {
  params?: Record<string, any>
  timeout?: number
  skipAuth?: boolean
}

interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

interface ApiError {
  message: string
  code?: string
  field?: string
  status?: number
}

// Security Middleware
class SecurityMiddleware {
  // CSRF Token management
  private static csrfToken: string | null = null

  static async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken

    try {
      const response = await fetch(`${API_BASE_URL}/auth/csrf`)
      const data = await response.json()
      this.csrfToken = data.token
      return data.token
    } catch (error) {
      console.error('Failed to get CSRF token:', error)
      return ''
    }
  }

  // Rate limiting tracker
  private static requestCounts = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(endpoint: string): boolean {
    const now = Date.now()
    const limit = this.requestCounts.get(endpoint)

    if (!limit || now > limit.resetTime) {
      this.requestCounts.set(endpoint, { count: 1, resetTime: now + 60000 }) // 1 minute window
      return true
    }

    if (limit.count >= 100) { // Max 100 requests per minute per endpoint
      return false
    }

    limit.count++
    return true
  }

  // Input sanitization
  static sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data
        .replace(/[<>]/g, '') // Remove potential XSS vectors
        .trim()
    }
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item))
    }
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {}
      for (const key in data) {
        sanitized[key] = this.sanitizeInput(data[key])
      }
      return sanitized
    }
    return data
  }
}

// Analytics Tracker
export class AnalyticsTracker {
  private static queue: Array<any> = []
  private static isProcessing = false

  static track(event: string, properties?: Record<string, any>) {
    const eventData = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    }

    this.queue.push(eventData)
    this.processQueue()

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties)
    }
  }

  private static async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 10) // Process 10 at a time

      try {
        await fetch(`${API_BASE_URL}/analytics/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: batch })
        })
      } catch (error) {
        console.error('Failed to send analytics:', error)
      }
    }

    this.isProcessing = false
  }

  // Convenience methods
  static trackPageView(page: string) {
    this.track('page_view', { page })
  }

  static trackClick(element: string, properties?: Record<string, any>) {
    this.track('click', { element, ...properties })
  }

  static trackFormSubmit(form: string, properties?: Record<string, any>) {
    this.track('form_submit', { form, ...properties })
  }

  static trackError(error: string, properties?: Record<string, any>) {
    this.track('error', { error, ...properties })
  }
}

// Main API Client
class ApiClient {
  private static instance: ApiClient

  static getInstance(): ApiClient {
    if (!this.instance) {
      this.instance = new ApiClient()
    }
    return this.instance
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const session = await getSession()
      return session?.accessToken as string || null
    } catch (error) {
      return null
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, String(params[key]))
        }
      })
    }

    return url.toString()
  }

  private async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      timeout = API_TIMEOUT,
      skipAuth = false,
      ...fetchConfig
    } = config

    // Check rate limit
    if (!SecurityMiddleware.checkRateLimit(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    // Build URL
    const url = this.buildUrl(endpoint, params)

    // Build headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers
    }

    // Add auth token
    if (!skipAuth) {
      const token = await this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Add CSRF token for non-GET requests
    if (fetchConfig.method && fetchConfig.method !== 'GET') {
      const csrfToken = await SecurityMiddleware.getCsrfToken()
      headers['X-CSRF-Token'] = csrfToken
    }

    // Sanitize request body
    if (fetchConfig.body && typeof fetchConfig.body === 'string') {
      try {
        const parsed = JSON.parse(fetchConfig.body)
        const sanitized = SecurityMiddleware.sanitizeInput(parsed)
        fetchConfig.body = JSON.stringify(sanitized)
      } catch (e) {
        // Not JSON, leave as is
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        if (response.ok) {
          return {
            success: true,
            data: await response.text() as any
          }
        }
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (!response.ok) {
        AnalyticsTracker.trackError('api_error', {
          endpoint,
          status: response.status,
          message: data.message
        })

        throw {
          message: data.message || 'Request failed',
          code: data.code,
          status: response.status
        } as ApiError
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        AnalyticsTracker.trackError('api_timeout', { endpoint })
        throw new Error('Request timeout. Please try again.')
      }

      if (error.message || error.code) {
        throw error
      }

      AnalyticsTracker.trackError('api_network_error', { endpoint })
      throw new Error('Network error. Please check your connection.')
    }
  }

  // HTTP Methods
  async get<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put<T = any>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async patch<T = any>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()

// Export types
export type { ApiResponse, ApiError, ApiRequestConfig }

