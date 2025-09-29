import { NextRequest, NextResponse } from 'next/server'
import { logger } from './monitoring'
import { ApiResponse, ErrorCodes, HttpStatus } from './api-response'

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (request: NextRequest) => string // Custom key generator
  onLimitReached?: (request: NextRequest, key: string) => void // Callback when limit is reached
  standardHeaders?: boolean // Add standard rate limit headers
  legacyHeaders?: boolean // Add legacy rate limit headers
}

// Rate limit store interface
export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetTime: number } | null>
  set(key: string, count: number, ttl: number): Promise<void>
  increment(key: string, ttl: number): Promise<{ count: number; resetTime: number }>
  reset(key: string): Promise<void>
}

// In-memory store implementation (for development)
class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>()

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const item = this.store.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.resetTime) {
      this.store.delete(key)
      return null
    }

    return item
  }

  async set(key: string, count: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count,
      resetTime: Date.now() + ttl
    })
  }

  async increment(key: string, ttl: number): Promise<{ count: number; resetTime: number }> {
    const existing = await this.get(key)
    
    if (existing) {
      const updated = {
        count: existing.count + 1,
        resetTime: existing.resetTime
      }
      this.store.set(key, updated)
      return updated
    } else {
      const newItem = {
        count: 1,
        resetTime: Date.now() + ttl
      }
      this.store.set(key, newItem)
      return newItem
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key)
  }
}

// Redis store implementation (for production)
class RedisRateLimitStore implements RateLimitStore {
  private redis: any // Redis client

  constructor(redisClient: any) {
    this.redis = redisClient
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const data = await this.redis.get(key)
    if (!data) return null

    const parsed = JSON.parse(data)
    if (Date.now() > parsed.resetTime) {
      await this.redis.del(key)
      return null
    }

    return parsed
  }

  async set(key: string, count: number, ttl: number): Promise<void> {
    const data = {
      count,
      resetTime: Date.now() + ttl
    }
    await this.redis.setex(key, Math.ceil(ttl / 1000), JSON.stringify(data))
  }

  async increment(key: string, ttl: number): Promise<{ count: number; resetTime: number }> {
    const script = `
      local key = KEYS[1]
      local ttl = tonumber(ARGV[1])
      local current = redis.call('GET', key)
      
      if current then
        local data = cjson.decode(current)
        if redis.call('TIME')[1] * 1000 > data.resetTime then
          redis.call('DEL', key)
          local newData = {count = 1, resetTime = redis.call('TIME')[1] * 1000 + ttl}
          redis.call('SETEX', key, math.ceil(ttl / 1000), cjson.encode(newData))
          return cjson.encode(newData)
        else
          data.count = data.count + 1
          redis.call('SETEX', key, math.ceil((data.resetTime - redis.call('TIME')[1] * 1000) / 1000), cjson.encode(data))
          return cjson.encode(data)
        end
      else
        local newData = {count = 1, resetTime = redis.call('TIME')[1] * 1000 + ttl}
        redis.call('SETEX', key, math.ceil(ttl / 1000), cjson.encode(newData))
        return cjson.encode(newData)
      end
    `

    const result = await this.redis.eval(script, 1, key, ttl)
    return JSON.parse(result)
  }

  async reset(key: string): Promise<void> {
    await this.redis.del(key)
  }
}

// Rate limiter class
export class RateLimiter {
  private store: RateLimitStore
  private config: RateLimitConfig

  constructor(config: RateLimitConfig, store?: RateLimitStore) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      standardHeaders: true,
      legacyHeaders: false,
      ...config
    }
    this.store = store || new MemoryRateLimitStore()
  }

  /**
   * Check if request should be rate limited
   */
  async check(request: NextRequest): Promise<{
    allowed: boolean
    count: number
    resetTime: number
    retryAfter?: number
  }> {
    const key = this.getKey(request)
    const now = Date.now()
    const ttl = this.config.windowMs

    try {
      const result = await this.store.increment(key, ttl)
      const allowed = result.count <= this.config.maxRequests
      const retryAfter = allowed ? undefined : Math.ceil((result.resetTime - now) / 1000)

      if (!allowed && this.config.onLimitReached) {
        this.config.onLimitReached(request, key)
      }

      // Log rate limit events
      if (!allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          count: result.count,
          limit: this.config.maxRequests,
          windowMs: this.config.windowMs,
          ip: this.getClientIP(request),
          userAgent: request.headers.get('user-agent'),
          url: request.url
        })
      }

      return {
        allowed,
        count: result.count,
        resetTime: result.resetTime,
        retryAfter
      }
    } catch (error) {
      logger.error('Rate limiter error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        ip: this.getClientIP(request)
      })

      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        count: 0,
        resetTime: now + ttl
      }
    }
  }

  /**
   * Generate rate limit key
   */
  private getKey(request: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request)
    }

    // Default key generation
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const path = new URL(request.url).pathname
    
    return `rate_limit:${ip}:${path}:${userAgent.slice(0, 50)}`
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }

  /**
   * Add rate limit headers to response
   */
  addHeaders(response: NextResponse, result: {
    count: number
    resetTime: number
    retryAfter?: number
  }): NextResponse {
    const remaining = Math.max(0, this.config.maxRequests - result.count)
    const resetTime = Math.ceil(result.resetTime / 1000)

    if (this.config.standardHeaders) {
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', resetTime.toString())
      
      if (result.retryAfter) {
        response.headers.set('Retry-After', result.retryAfter.toString())
      }
    }

    if (this.config.legacyHeaders) {
      response.headers.set('X-Rate-Limit-Limit', this.config.maxRequests.toString())
      response.headers.set('X-Rate-Limit-Remaining', remaining.toString())
      response.headers.set('X-Rate-Limit-Reset', resetTime.toString())
    }

    return response
  }

  /**
   * Create middleware function
   */
  middleware() {
    return async (request: NextRequest): Promise<NextResponse | void> => {
      const result = await this.check(request)

      if (!result.allowed) {
        const response = ApiResponse.rateLimited(
          'Too many requests',
          result.retryAfter
        )
        return this.addHeaders(response, result)
      }

      // Continue to next middleware/handler
      return undefined
    }
  }
}

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // General API rate limiting
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    standardHeaders: true
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    standardHeaders: true
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    standardHeaders: true
  },

  // Search endpoints
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    standardHeaders: true
  },

  // Messaging endpoints
  messaging: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
    standardHeaders: true
  },

  // Payment endpoints
  payment: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
    standardHeaders: true
  },

  // Admin endpoints
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 50,
    standardHeaders: true
  }
}

// Security headers middleware
export function securityHeaders(request: NextRequest): NextResponse | void {
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return response
}

// CORS configuration
export function corsHeaders(request: NextRequest): NextResponse | void {
  const response = NextResponse.next()
  const origin = request.headers.get('origin')

  // Allow specific origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tatu-app.vercel.app',
    'https://tatu-admin.vercel.app'
  ]

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Request-ID')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  return response
}

// Create rate limiter instances
export const createRateLimiter = (config: RateLimitConfig, store?: RateLimitStore) => 
  new RateLimiter(config, store)

// Default rate limiters
export const rateLimiters = {
  api: createRateLimiter(RateLimitConfigs.api),
  auth: createRateLimiter(RateLimitConfigs.auth),
  upload: createRateLimiter(RateLimitConfigs.upload),
  search: createRateLimiter(RateLimitConfigs.search),
  messaging: createRateLimiter(RateLimitConfigs.messaging),
  payment: createRateLimiter(RateLimitConfigs.payment),
  admin: createRateLimiter(RateLimitConfigs.admin)
}

export default rateLimiters
