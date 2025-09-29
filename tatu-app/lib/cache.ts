import { Redis } from 'ioredis'
import { logger } from './monitoring'

// Cache configuration
export interface CacheConfig {
  host: string
  port: number
  password?: string
  db?: number
  retryDelayOnFailover?: number
  maxRetriesPerRequest?: number
  lazyConnect?: boolean
  keyPrefix?: string
  defaultTTL?: number
}

// Cache key generator interface
export interface CacheKeyGenerator {
  (prefix: string, ...args: any[]): string
}

// Cache entry interface
export interface CacheEntry<T = any> {
  data: T
  ttl: number
  createdAt: number
  tags?: string[]
}

// Cache statistics
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
  hitRate: number
}

// Cache service class
export class CacheService {
  private static instance: CacheService
  private redis: Redis
  private config: CacheConfig
  private stats: CacheStats
  private keyGenerators: Map<string, CacheKeyGenerator>

  constructor(config: CacheConfig) {
    this.config = {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keyPrefix: 'tatu:',
      defaultTTL: 3600, // 1 hour
      ...config
    }

    this.redis = new Redis({
      host: this.config.host,
      port: this.config.port,
      password: this.config.password,
      db: this.config.db,
      retryDelayOnFailover: this.config.retryDelayOnFailover,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: this.config.lazyConnect,
      keyPrefix: this.config.keyPrefix
    })

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    }

    this.keyGenerators = new Map()
    this.setupEventHandlers()
  }

  public static getInstance(config?: CacheConfig): CacheService {
    if (!CacheService.instance) {
      if (!config) {
        throw new Error('Cache configuration is required for first initialization')
      }
      CacheService.instance = new CacheService(config)
    }
    return CacheService.instance
  }

  /**
   * Set up Redis event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      logger.info('Redis connected successfully')
    })

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message })
      this.stats.errors++
    })

    this.redis.on('close', () => {
      logger.warn('Redis connection closed')
    })

    this.redis.on('reconnecting', () => {
      logger.info('Redis reconnecting...')
    })
  }

  /**
   * Register a key generator function
   */
  registerKeyGenerator(name: string, generator: CacheKeyGenerator): void {
    this.keyGenerators.set(name, generator)
  }

  /**
   * Generate cache key
   */
  generateKey(prefix: string, ...args: any[]): string {
    const generator = this.keyGenerators.get(prefix)
    if (generator) {
      return generator(prefix, ...args)
    }
    return `${prefix}:${args.join(':')}`
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redis.get(key)
      
      if (result === null) {
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      const entry: CacheEntry<T> = JSON.parse(result)
      
      // Check if expired
      if (Date.now() > entry.createdAt + entry.ttl * 1000) {
        await this.del(key)
        this.stats.misses++
        this.updateHitRate()
        return null
      }

      this.stats.hits++
      this.updateHitRate()
      return entry.data

    } catch (error) {
      logger.error('Cache get error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      })
      this.stats.errors++
      return null
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    tags?: string[]
  ): Promise<boolean> {
    try {
      const entry: CacheEntry<T> = {
        data: value,
        ttl: ttl || this.config.defaultTTL,
        createdAt: Date.now(),
        tags
      }

      const serialized = JSON.stringify(entry)
      await this.redis.setex(key, entry.ttl, serialized)

      // Store tags for invalidation
      if (tags && tags.length > 0) {
        await this.addTagsToKey(key, tags)
      }

      this.stats.sets++
      return true

    } catch (error) {
      logger.error('Cache set error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key)
      this.stats.deletes++
      return result > 0
    } catch (error) {
      logger.error('Cache delete error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * Delete multiple keys
   */
  async delMultiple(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0
      
      const result = await this.redis.del(...keys)
      this.stats.deletes += result
      return result
    } catch (error) {
      logger.error('Cache delete multiple error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keys
      })
      this.stats.errors++
      return 0
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      logger.error('Cache exists error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results = await this.redis.mget(...keys)
      return results.map(result => {
        if (result === null) {
          this.stats.misses++
          return null
        }

        try {
          const entry: CacheEntry<T> = JSON.parse(result)
          
          // Check if expired
          if (Date.now() > entry.createdAt + entry.ttl * 1000) {
            this.stats.misses++
            return null
          }

          this.stats.hits++
          return entry.data
        } catch {
          this.stats.misses++
          return null
        }
      })
    } catch (error) {
      logger.error('Cache mget error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        keys
      })
      this.stats.errors++
      return keys.map(() => null)
    } finally {
      this.updateHitRate()
    }
  }

  /**
   * Set multiple values
   */
  async mset<T>(
    entries: Array<{ key: string; value: T; ttl?: number; tags?: string[] }>
  ): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline()
      
      for (const entry of entries) {
        const cacheEntry: CacheEntry<T> = {
          data: entry.value,
          ttl: entry.ttl || this.config.defaultTTL,
          createdAt: Date.now(),
          tags: entry.tags
        }

        const serialized = JSON.stringify(cacheEntry)
        pipeline.setex(entry.key, cacheEntry.ttl, serialized)

        // Store tags for invalidation
        if (entry.tags && entry.tags.length > 0) {
          pipeline.sadd(`tags:${entry.key}`, ...entry.tags)
        }
      }

      await pipeline.exec()
      this.stats.sets += entries.length
      return true

    } catch (error) {
      logger.error('Cache mset error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        entryCount: entries.length
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0

      for (const tag of tags) {
        const keys = await this.redis.smembers(`tag:${tag}`)
        if (keys.length > 0) {
          const deleted = await this.delMultiple(keys)
          totalDeleted += deleted
          
          // Clean up tag sets
          await this.redis.del(`tag:${tag}`)
        }
      }

      return totalDeleted

    } catch (error) {
      logger.error('Cache invalidate by tags error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tags
      })
      this.stats.errors++
      return 0
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await this.redis.flushdb()
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        hitRate: 0
      }
      return true
    } catch (error) {
      logger.error('Cache clear error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      this.stats.errors++
      return false
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRate: 0
    }
  }

  /**
   * Get cache info
   */
  async getInfo(): Promise<any> {
    try {
      return await this.redis.info()
    } catch (error) {
      logger.error('Cache info error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Add tags to a key
   */
  private async addTagsToKey(key: string, tags: string[]): Promise<void> {
    try {
      const pipeline = this.redis.pipeline()
      
      for (const tag of tags) {
        pipeline.sadd(`tag:${tag}`, key)
        pipeline.sadd(`tags:${key}`, tag)
      }

      await pipeline.exec()
    } catch (error) {
      logger.error('Add tags to key error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        key,
        tags
      })
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    try {
      await this.redis.quit()
    } catch (error) {
      logger.error('Cache close error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// Cache decorator for methods
export function Cacheable(
  keyPrefix: string,
  ttl?: number,
  tags?: string[]
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const cache = CacheService.getInstance()
      const key = cache.generateKey(keyPrefix, ...args)

      // Try to get from cache
      const cached = await cache.get(key)
      if (cached !== null) {
        return cached
      }

      // Execute method and cache result
      const result = await method.apply(this, args)
      await cache.set(key, result, ttl, tags)

      return result
    }
  }
}

// Cache invalidation decorator
export function CacheInvalidate(tags: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)
      
      // Invalidate cache after method execution
      const cache = CacheService.getInstance()
      await cache.invalidateByTags(tags)

      return result
    }
  }
}

// Predefined cache key generators
export const CacheKeyGenerators = {
  user: (prefix: string, userId: string) => `${prefix}:user:${userId}`,
  userProfile: (prefix: string, userId: string) => `${prefix}:user:${userId}:profile`,
  artist: (prefix: string, artistId: string) => `${prefix}:artist:${artistId}`,
  shop: (prefix: string, shopId: string) => `${prefix}:shop:${shopId}`,
  appointment: (prefix: string, appointmentId: string) => `${prefix}:appointment:${appointmentId}`,
  portfolio: (prefix: string, portfolioId: string) => `${prefix}:portfolio:${portfolioId}`,
  search: (prefix: string, query: string, filters: any) => `${prefix}:search:${query}:${JSON.stringify(filters)}`,
  stats: (prefix: string, type: string, period: string) => `${prefix}:stats:${type}:${period}`,
  session: (prefix: string, sessionId: string) => `${prefix}:session:${sessionId}`
}

// Cache tags
export const CacheTags = {
  USER: 'user',
  ARTIST: 'artist',
  SHOP: 'shop',
  APPOINTMENT: 'appointment',
  PORTFOLIO: 'portfolio',
  SEARCH: 'search',
  STATS: 'stats',
  SESSION: 'session'
}

// Create cache service instance
export const createCacheService = (config: CacheConfig): CacheService => {
  return CacheService.getInstance(config)
}

// Default cache service (for development)
export const cacheService = process.env.REDIS_URL 
  ? CacheService.getInstance({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0')
    })
  : null

export default cacheService
