import { NextRequest } from 'next/server'

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  requestId?: string
  userId?: string
  sessionId?: string
  ip?: string
  userAgent?: string
  url?: string
  method?: string
  statusCode?: number
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  metadata?: Record<string, any>
  tags?: string[]
}

// Performance metrics interface
export interface PerformanceMetrics {
  requestId: string
  method: string
  url: string
  duration: number
  statusCode: number
  memoryUsage?: NodeJS.MemoryUsage
  timestamp: string
  userId?: string
  ip?: string
}

// Business metrics interface
export interface BusinessMetrics {
  event: string
  userId?: string
  sessionId?: string
  properties?: Record<string, any>
  timestamp: string
  value?: number
}

// Logger class
export class Logger {
  private static instance: Logger
  private logLevel: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.logLevel = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO
    this.isDevelopment = process.env.NODE_ENV === 'development'
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Log an error message
   */
  error(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.ERROR, message, metadata, request)
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.WARN, message, metadata, request)
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.INFO, message, metadata, request)
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    this.log(LogLevel.DEBUG, message, metadata, request)
  }

  /**
   * Log API request
   */
  logRequest(request: NextRequest, response?: Response, duration?: number): void {
    const metadata = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: this.getClientIP(request),
      statusCode: response?.status,
      duration
    }

    const level = response && response.status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(level, 'API Request', metadata, request)
  }

  /**
   * Log API error
   */
  logError(error: Error, request?: NextRequest, context?: Record<string, any>): void {
    const metadata = {
      error: {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      },
      ...context
    }

    this.error('API Error', metadata, request)
  }

  /**
   * Log business event
   */
  logBusinessEvent(event: string, properties?: Record<string, any>, request?: NextRequest): void {
    const metadata = {
      event,
      properties,
      userId: this.getUserId(request),
      sessionId: this.getSessionId(request)
    }

    this.info('Business Event', metadata, request)
  }

  /**
   * Log performance metrics
   */
  logPerformance(metrics: PerformanceMetrics): void {
    const metadata = {
      ...metrics,
      memoryUsage: this.isDevelopment ? metrics.memoryUsage : undefined
    }

    this.info('Performance Metrics', metadata)
  }

  /**
   * Log security event
   */
  logSecurityEvent(event: string, metadata?: Record<string, any>, request?: NextRequest): void {
    const securityMetadata = {
      event,
      severity: this.getSecuritySeverity(event),
      ...metadata,
      ip: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent'),
      url: request?.url
    }

    this.warn('Security Event', securityMetadata, request)
  }

  /**
   * Log database query
   */
  logDatabaseQuery(query: string, duration: number, metadata?: Record<string, any>): void {
    const logMetadata = {
      query: this.isDevelopment ? query : this.sanitizeQuery(query),
      duration,
      ...metadata
    }

    this.debug('Database Query', logMetadata)
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, any>, request?: NextRequest): void {
    // Check if we should log this level
    if (!this.shouldLog(level)) {
      return
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.getRequestId(request),
      userId: this.getUserId(request),
      sessionId: this.getSessionId(request),
      ip: this.getClientIP(request),
      userAgent: request?.headers.get('user-agent'),
      url: request?.url,
      method: request?.method,
      metadata: this.sanitizeMetadata(metadata),
      tags: this.getTags(level, metadata)
    }

    // Output to console in development
    if (this.isDevelopment) {
      this.logToConsole(logEntry)
    }

    // Send to external logging service in production
    if (!this.isDevelopment) {
      this.sendToExternalService(logEntry)
    }
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex <= currentLevelIndex
  }

  /**
   * Log to console (development)
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp
    const level = entry.level.toUpperCase().padEnd(5)
    const message = entry.message
    const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : ''

    console.log(`[${timestamp}] ${level} ${message}${metadata}`)
  }

  /**
   * Send to external logging service (production)
   */
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // In production, you would send to services like:
      // - Datadog
      // - New Relic
      // - CloudWatch
      // - Sentry
      // - LogRocket
      
      // For now, we'll just log to console
      console.log(JSON.stringify(entry))
    } catch (error) {
      console.error('Failed to send log to external service:', error)
    }
  }

  /**
   * Get client IP address
   */
  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined

    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip
  }

  /**
   * Get request ID
   */
  private getRequestId(request?: NextRequest): string | undefined {
    return request?.headers.get('x-request-id') || undefined
  }

  /**
   * Get user ID from request
   */
  private getUserId(request?: NextRequest): string | undefined {
    // This would typically come from authentication middleware
    return request?.headers.get('x-user-id') || undefined
  }

  /**
   * Get session ID from request
   */
  private getSessionId(request?: NextRequest): string | undefined {
    return request?.headers.get('x-session-id') || undefined
  }

  /**
   * Get security severity level
   */
  private getSecuritySeverity(event: string): string {
    const highSeverityEvents = [
      'AUTHENTICATION_FAILURE',
      'AUTHORIZATION_FAILURE',
      'SUSPICIOUS_ACTIVITY',
      'RATE_LIMIT_EXCEEDED',
      'INVALID_TOKEN',
      'ACCOUNT_LOCKOUT'
    ]

    return highSeverityEvents.includes(event) ? 'HIGH' : 'MEDIUM'
  }

  /**
   * Get tags for log entry
   */
  private getTags(level: LogLevel, metadata?: Record<string, any>): string[] {
    const tags = [level]

    if (metadata?.error) {
      tags.push('error')
    }

    if (metadata?.security) {
      tags.push('security')
    }

    if (metadata?.performance) {
      tags.push('performance')
    }

    if (metadata?.database) {
      tags.push('database')
    }

    return tags
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'credential']
    const sanitized = { ...metadata }

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]'
      }
    }

    return sanitized
  }

  /**
   * Sanitize database query
   */
  private sanitizeQuery(query: string): string {
    // Remove sensitive data from queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password = '[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '[REDACTED]'")
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetrics> = new Map()

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Start timing a request
   */
  startTiming(requestId: string, method: string, url: string, userId?: string, ip?: string): void {
    const startTime = Date.now()
    const memoryUsage = process.memoryUsage()

    this.metrics.set(requestId, {
      requestId,
      method,
      url,
      duration: 0,
      statusCode: 0,
      memoryUsage,
      timestamp: new Date().toISOString(),
      userId,
      ip
    })
  }

  /**
   * End timing a request
   */
  endTiming(requestId: string, statusCode: number): void {
    const metric = this.metrics.get(requestId)
    if (!metric) return

    const endTime = Date.now()
    metric.duration = endTime - Date.now()
    metric.statusCode = statusCode

    // Log performance metrics
    logger.logPerformance(metric)

    // Clean up
    this.metrics.delete(requestId)
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage()
  }

  /**
   * Get current CPU usage
   */
  getCPUUsage(): number {
    const usage = process.cpuUsage()
    return (usage.user + usage.system) / 1000000 // Convert to seconds
  }
}

// Business metrics tracking
export class BusinessMetricsTracker {
  private static instance: BusinessMetricsTracker
  private events: BusinessMetrics[] = []

  public static getInstance(): BusinessMetricsTracker {
    if (!BusinessMetricsTracker.instance) {
      BusinessMetricsTracker.instance = new BusinessMetricsTracker()
    }
    return BusinessMetricsTracker.instance
  }

  /**
   * Track a business event
   */
  track(event: string, properties?: Record<string, any>, userId?: string, sessionId?: string, value?: number): void {
    const businessEvent: BusinessMetrics = {
      event,
      userId,
      sessionId,
      properties,
      timestamp: new Date().toISOString(),
      value
    }

    this.events.push(businessEvent)
    logger.logBusinessEvent(event, properties)

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }

  /**
   * Track user registration
   */
  trackUserRegistration(userId: string, method: string): void {
    this.track('user_registration', { method }, userId)
  }

  /**
   * Track appointment booking
   */
  trackAppointmentBooking(userId: string, artistId: string, amount: number): void {
    this.track('appointment_booking', { artistId }, userId, undefined, amount)
  }

  /**
   * Track payment completion
   */
  trackPaymentCompletion(userId: string, amount: number, method: string): void {
    this.track('payment_completion', { method }, userId, undefined, amount)
  }

  /**
   * Track portfolio view
   */
  trackPortfolioView(portfolioId: string, userId?: string): void {
    this.track('portfolio_view', { portfolioId }, userId)
  }

  /**
   * Track search query
   */
  trackSearch(query: string, results: number, userId?: string): void {
    this.track('search', { query, results }, userId)
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string): BusinessMetrics[] {
    return this.events.filter(event => event.event === eventType)
  }

  /**
   * Get events by user
   */
  getEventsByUser(userId: string): BusinessMetrics[] {
    return this.events.filter(event => event.userId === userId)
  }
}

// Health check monitoring
export class HealthMonitor {
  private static instance: HealthMonitor
  private checks: Map<string, () => Promise<boolean>> = new Map()

  public static getInstance(): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor()
    }
    return HealthMonitor.instance
  }

  /**
   * Add a health check
   */
  addCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check)
  }

  /**
   * Run all health checks
   */
  async runChecks(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    for (const [name, check] of this.checks) {
      try {
        results[name] = await check()
      } catch (error) {
        logger.error(`Health check failed: ${name}`, { error: error instanceof Error ? error.message : 'Unknown error' })
        results[name] = false
      }
    }

    return results
  }

  /**
   * Get overall health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded'
    checks: Record<string, boolean>
    timestamp: string
  }> {
    const checks = await this.runChecks()
    const allHealthy = Object.values(checks).every(Boolean)
    const someHealthy = Object.values(checks).some(Boolean)

    let status: 'healthy' | 'unhealthy' | 'degraded'
    if (allHealthy) {
      status = 'healthy'
    } else if (someHealthy) {
      status = 'degraded'
    } else {
      status = 'unhealthy'
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    }
  }
}

// Create singleton instances
export const logger = Logger.getInstance()
export const performanceMonitor = PerformanceMonitor.getInstance()
export const businessMetrics = BusinessMetricsTracker.getInstance()
export const healthMonitor = HealthMonitor.getInstance()

// Convenience functions
export const logError = (message: string, metadata?: Record<string, any>, request?: NextRequest) =>
  logger.error(message, metadata, request)

export const logWarn = (message: string, metadata?: Record<string, any>, request?: NextRequest) =>
  logger.warn(message, metadata, request)

export const logInfo = (message: string, metadata?: Record<string, any>, request?: NextRequest) =>
  logger.info(message, metadata, request)

export const logDebug = (message: string, metadata?: Record<string, any>, request?: NextRequest) =>
  logger.debug(message, metadata, request)

export const trackEvent = (event: string, properties?: Record<string, any>, userId?: string, sessionId?: string, value?: number) =>
  businessMetrics.track(event, properties, userId, sessionId, value)

export default logger
