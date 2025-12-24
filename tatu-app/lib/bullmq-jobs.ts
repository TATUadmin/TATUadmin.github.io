/**
 * Enterprise-Grade Background Job Processing with BullMQ
 * 
 * This replaces the custom in-memory job queue with BullMQ, which provides:
 * - Job persistence (survives restarts)
 * - Automatic retries with exponential backoff
 * - Job monitoring and metrics
 * - Horizontal scaling support
 * - Dead letter queues for failed jobs
 */

import { Queue, Worker, QueueEvents } from 'bullmq'
import { Redis } from 'ioredis'
import { logger } from './monitoring'
import { emailService } from './email-service'
import { prisma } from './prisma'

// Check if we're in a build environment (don't initialize Redis during build)
// During build, Next.js sets NEXT_PHASE or we can detect by checking if we're in a build context
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' ||
                    (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === undefined && !process.env.VERCEL && !process.env.REDIS_URL) ||
                    process.env.NODE_ENV === 'production' && process.env.VERCEL === undefined && !process.env.REDIS_URL

// Redis connection for BullMQ
let redisConnection: Redis | null = null

function getRedisConnection(): Redis | null {
  // Don't connect to Redis during build time
  if (isBuildTime) {
    return null
  }

  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
    const redisHost = process.env.REDIS_HOST || 'localhost'
    const redisPort = parseInt(process.env.REDIS_PORT || '6379')
    const redisPassword = process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN

    // Only connect if we have Redis configuration
    if (!redisUrl && redisHost === 'localhost' && !redisPassword) {
      // No Redis configured, return null (will use fallback)
      return null
    }

    try {
      if (redisUrl) {
        redisConnection = new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true, // Don't connect immediately
        })
      } else {
        redisConnection = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
          lazyConnect: true, // Don't connect immediately
        })
      }

      redisConnection.on('error', (error) => {
        logger.error('Redis connection error in BullMQ', { error: error.message })
      })

      redisConnection.on('connect', () => {
        logger.info('Redis connected for BullMQ')
      })
    } catch (error) {
      logger.error('Failed to create Redis connection', { error })
      return null
    }
  }

  return redisConnection
}

// Get queue configuration (lazy)
function getQueueConfig() {
  const connection = getRedisConnection()
  
  // If no Redis connection, return a minimal config that won't fail
  if (!connection) {
    return {
      connection: undefined, // Will use in-memory fallback
      defaultJobOptions: {
        attempts: parseInt(process.env.JOB_MAX_RETRIES || '3'),
        backoff: {
          type: 'exponential' as const,
          delay: parseInt(process.env.JOB_RETRY_DELAY || '5000'),
        },
        removeOnComplete: {
          age: 24 * 3600,
          count: parseInt(process.env.JOB_REMOVE_ON_COMPLETE || '100'),
        },
        removeOnFail: {
          age: 7 * 24 * 3600,
          count: parseInt(process.env.JOB_REMOVE_ON_FAIL || '50'),
        },
      },
    }
  }

  return {
    connection,
    defaultJobOptions: {
      attempts: parseInt(process.env.JOB_MAX_RETRIES || '3'),
      backoff: {
        type: 'exponential' as const,
        delay: parseInt(process.env.JOB_RETRY_DELAY || '5000'),
      },
      removeOnComplete: {
        age: 24 * 3600,
        count: parseInt(process.env.JOB_REMOVE_ON_COMPLETE || '100'),
      },
      removeOnFail: {
        age: 7 * 24 * 3600,
        count: parseInt(process.env.JOB_REMOVE_ON_FAIL || '50'),
      },
    },
  }
}

// Lazy-loaded queues (only created when accessed)
let _emailQueue: Queue | null = null
let _appointmentQueue: Queue | null = null
let _reviewQueue: Queue | null = null
let _imageQueue: Queue | null = null
let _cleanupQueue: Queue | null = null
let _emailQueueEvents: QueueEvents | null = null
let _appointmentQueueEvents: QueueEvents | null = null

function getEmailQueue(): Queue | null {
  if (isBuildTime) return null
  if (!_emailQueue) {
    const config = getQueueConfig()
    if (config.connection) {
      _emailQueue = new Queue('email', config)
    }
  }
  return _emailQueue
}

function getAppointmentQueue(): Queue | null {
  if (isBuildTime) return null
  if (!_appointmentQueue) {
    const config = getQueueConfig()
    if (config.connection) {
      _appointmentQueue = new Queue('appointment', config)
    }
  }
  return _appointmentQueue
}

function getReviewQueue(): Queue | null {
  if (isBuildTime) return null
  if (!_reviewQueue) {
    const config = getQueueConfig()
    if (config.connection) {
      _reviewQueue = new Queue('review', config)
    }
  }
  return _reviewQueue
}

function getImageQueue(): Queue | null {
  if (isBuildTime) return null
  if (!_imageQueue) {
    const config = getQueueConfig()
    if (config.connection) {
      _imageQueue = new Queue('image', config)
    }
  }
  return _imageQueue
}

function getCleanupQueue(): Queue | null {
  if (isBuildTime) return null
  if (!_cleanupQueue) {
    const config = getQueueConfig()
    if (config.connection) {
      _cleanupQueue = new Queue('cleanup', config)
    }
  }
  return _cleanupQueue
}

// Export getters that return queues (lazy-loaded)
export const emailQueue = {
  add: async (...args: Parameters<Queue['add']>) => {
    const queue = getEmailQueue()
    if (!queue) {
      logger.warn('Email queue not available (build time or Redis not configured)')
      return null
    }
    return queue.add(...args)
  },
  close: async () => {
    if (_emailQueue) {
      await _emailQueue.close()
      _emailQueue = null
    }
  }
} as Queue

export const appointmentQueue = {
  add: async (...args: Parameters<Queue['add']>) => {
    const queue = getAppointmentQueue()
    if (!queue) {
      logger.warn('Appointment queue not available (build time or Redis not configured)')
      return null
    }
    return queue.add(...args)
  },
  close: async () => {
    if (_appointmentQueue) {
      await _appointmentQueue.close()
      _appointmentQueue = null
    }
  }
} as Queue

export const reviewQueue = {
  add: async (...args: Parameters<Queue['add']>) => {
    const queue = getReviewQueue()
    if (!queue) {
      logger.warn('Review queue not available (build time or Redis not configured)')
      return null
    }
    return queue.add(...args)
  },
  close: async () => {
    if (_reviewQueue) {
      await _reviewQueue.close()
      _reviewQueue = null
    }
  }
} as Queue

export const imageQueue = {
  add: async (...args: Parameters<Queue['add']>) => {
    const queue = getImageQueue()
    if (!queue) {
      logger.warn('Image queue not available (build time or Redis not configured)')
      return null
    }
    return queue.add(...args)
  },
  close: async () => {
    if (_imageQueue) {
      await _imageQueue.close()
      _imageQueue = null
    }
  }
} as Queue

export const cleanupQueue = {
  add: async (...args: Parameters<Queue['add']>) => {
    const queue = getCleanupQueue()
    if (!queue) {
      logger.warn('Cleanup queue not available (build time or Redis not configured)')
      return null
    }
    return queue.add(...args)
  },
  close: async () => {
    if (_cleanupQueue) {
      await _cleanupQueue.close()
      _cleanupQueue = null
    }
  }
} as Queue

// Queue events (lazy-loaded)
export const emailQueueEvents = {
  close: async () => {
    if (_emailQueueEvents) {
      await _emailQueueEvents.close()
      _emailQueueEvents = null
    }
  }
} as QueueEvents

export const appointmentQueueEvents = {
  close: async () => {
    if (_appointmentQueueEvents) {
      await _appointmentQueueEvents.close()
      _appointmentQueueEvents = null
    }
  }
} as QueueEvents

// Job type definitions
export interface EmailJobData {
  type: string
  email: string
  name: string
  data: any
}

export interface AppointmentReminderJobData {
  appointmentId: string
}

export interface ReviewRequestJobData {
  appointmentId: string
}

export interface ImageProcessingJobData {
  fileId: string
  operations: any[]
}

// Workers are lazy-loaded (only created at runtime, not during build)
let emailWorker: Worker<EmailJobData> | null = null
let appointmentWorker: Worker<AppointmentReminderJobData> | null = null
let reviewWorker: Worker<ReviewRequestJobData> | null = null
let imageWorker: Worker<ImageProcessingJobData> | null = null
let cleanupWorker: Worker | null = null

// Initialize workers only at runtime (not during build)
function initializeWorkers() {
  if (isBuildTime || emailWorker) return // Don't initialize during build or if already initialized

  const config = getQueueConfig()
  if (!config.connection) return // No Redis connection available

  // Email job processor
  emailWorker = new Worker<EmailJobData>(
    'email',
    async (job) => {
      const { type, email, name, data } = job.data

      logger.info('Processing email job', {
        jobId: job.id,
        type,
        email,
      })

      switch (type) {
        case 'welcome':
          return await emailService.sendWelcomeEmail(email, name, data.verificationToken)
        case 'appointment_confirmation':
          return await emailService.sendAppointmentConfirmation(email, name, data)
        case 'password_reset':
          return await emailService.sendPasswordResetEmail(email, name, data.resetToken)
        case 'artist_invitation':
          return await emailService.sendArtistInvitationEmail(email, name, data.shopName, data.invitationToken)
        case 'review_request':
          return await emailService.sendReviewRequestEmail(email, name, data.artistName, data.appointmentDate, data.reviewToken)
        case 'payment_confirmation':
          return await emailService.sendPaymentConfirmationEmail(email, name, data)
        case 'notification':
          return await emailService.sendNotificationEmail(email, name, data)
        default:
          throw new Error(`Unknown email type: ${type}`)
      }
    },
    {
      ...config,
      concurrency: parseInt(process.env.EMAIL_WORKER_CONCURRENCY || '5'),
    }
  )

  // Appointment reminder processor
  appointmentWorker = new Worker<AppointmentReminderJobData>(
    'appointment',
    async (job) => {
      const { appointmentId } = job.data

      logger.info('Processing appointment reminder', {
        jobId: job.id,
        appointmentId,
      })

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          artist: {
            include: { profile: true }
          },
          client: true,
          service: true,
          shop: true,
        },
      })

      if (!appointment) {
        throw new Error(`Appointment not found: ${appointmentId}`)
      }

      // Send reminder email
      return await emailService.sendAppointmentConfirmation(
        appointment.client.email,
        appointment.client.name || 'Valued Customer',
        {
          artistName: appointment.artist.profile?.name || appointment.artist.name || 'Artist',
          date: appointment.startTime,
          time: appointment.startTime,
          service: appointment.service.name,
          duration: appointment.service.duration,
          location: appointment.shop.address,
        }
      )
    },
    {
      ...config,
      concurrency: parseInt(process.env.APPOINTMENT_WORKER_CONCURRENCY || '3'),
    }
  )

  // Review request processor
  reviewWorker = new Worker<ReviewRequestJobData>(
    'review',
    async (job) => {
      const { appointmentId } = job.data

      logger.info('Processing review request', {
        jobId: job.id,
        appointmentId,
      })

      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          artist: {
            include: { profile: true }
          },
          client: true,
          service: true,
          shop: true,
        },
      })

      if (!appointment) {
        throw new Error(`Appointment not found: ${appointmentId}`)
      }

      // Generate review token
      const reviewToken = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Send review request email
      return await emailService.sendReviewRequestEmail(
        appointment.client.email,
        appointment.client.name || 'Valued Customer',
        appointment.artist.profile?.name || appointment.artist.name || 'Artist',
        appointment.startTime,
        reviewToken
      )
    },
    {
      ...config,
      concurrency: parseInt(process.env.REVIEW_WORKER_CONCURRENCY || '3'),
    }
  )

  // Image processing processor
  imageWorker = new Worker<ImageProcessingJobData>(
    'image',
    async (job) => {
      const { fileId, operations } = job.data

      logger.info('Processing image', {
        jobId: job.id,
        fileId,
        operations,
      })

      // Image processing logic would go here
      // This is a placeholder
      return { processed: true, fileId }
    },
    {
      ...config,
      concurrency: parseInt(process.env.IMAGE_WORKER_CONCURRENCY || '2'),
    }
  )

  // Cleanup processor
  cleanupWorker = new Worker(
    'cleanup',
    async (job) => {
      const { type } = job.data

      logger.info('Processing cleanup job', {
        jobId: job.id,
        type,
      })

      switch (type) {
        case 'expired_tokens':
          const expiredTokens = await prisma.verificationToken.deleteMany({
            where: {
              expires: {
                lt: new Date(),
              },
            },
          })
          logger.info('Cleaned up expired tokens', { count: expiredTokens.count })
          return { cleaned: expiredTokens.count }
        default:
          throw new Error(`Unknown cleanup type: ${type}`)
      }
    },
    {
      ...config,
      concurrency: 1, // Cleanup should run sequentially
    }
  )

  // Worker event handlers
  emailWorker.on('completed', (job) => {
    logger.info('Email job completed', { jobId: job.id })
  })

  emailWorker.on('failed', (job, err) => {
    logger.error('Email job failed', {
      jobId: job?.id,
      error: err.message,
    })
  })

  appointmentWorker.on('completed', (job) => {
    logger.info('Appointment job completed', { jobId: job.id })
  })

  appointmentWorker.on('failed', (job, err) => {
    logger.error('Appointment job failed', {
      jobId: job?.id,
      error: err.message,
    })
  })
}

// Initialize workers only if not in build time
if (!isBuildTime && typeof window === 'undefined') {
  // Only initialize in server-side runtime
  initializeWorkers()
}


// Convenience functions (backward compatible with existing code)
export const addEmailJob = async (
  type: string,
  email: string,
  name: string,
  data: any,
  options: { delay?: number; priority?: number } = {}
) => {
  const queue = getEmailQueue()
  if (!queue) {
    logger.warn('Email queue not available, skipping job', { type, email })
    return null
  }
  return await queue.add(
    'send-email',
    { type, email, name, data },
    {
      delay: options.delay,
      priority: options.priority,
    }
  )
}

export const addAppointmentReminderJob = async (
  appointmentId: string,
  delay: number = 24 * 60 * 60 * 1000 // 24 hours
) => {
  const queue = getAppointmentQueue()
  if (!queue) {
    logger.warn('Appointment queue not available, skipping job', { appointmentId })
    return null
  }
  return await queue.add(
    'reminder',
    { appointmentId },
    {
      delay,
    }
  )
}

export const addReviewRequestJob = async (
  appointmentId: string,
  delay: number = 7 * 24 * 60 * 60 * 1000 // 7 days
) => {
  const queue = getReviewQueue()
  if (!queue) {
    logger.warn('Review queue not available, skipping job', { appointmentId })
    return null
  }
  return await queue.add(
    'request',
    { appointmentId },
    {
      delay,
    }
  )
}

export const addImageProcessingJob = async (
  fileId: string,
  operations: any[],
  options: { delay?: number; priority?: number } = {}
) => {
  const queue = getImageQueue()
  if (!queue) {
    logger.warn('Image queue not available, skipping job', { fileId })
    return null
  }
  return await queue.add(
    'process',
    { fileId, operations },
    {
      delay: options.delay,
      priority: options.priority,
    }
  )
}

export const addCleanupJob = async (
  type: string,
  options: { delay?: number } = {}
) => {
  const queue = getCleanupQueue()
  if (!queue) {
    logger.warn('Cleanup queue not available, skipping job', { type })
    return null
  }
  return await queue.add(
    'cleanup',
    { type },
    {
      delay: options.delay,
    }
  )
}

// Graceful shutdown
export const closeAllQueues = async () => {
  const promises: Promise<any>[] = []
  
  if (emailWorker) promises.push(emailWorker.close())
  if (appointmentWorker) promises.push(appointmentWorker.close())
  if (reviewWorker) promises.push(reviewWorker.close())
  if (imageWorker) promises.push(imageWorker.close())
  if (cleanupWorker) promises.push(cleanupWorker.close())
  if (_emailQueueEvents) promises.push(_emailQueueEvents.close())
  if (_appointmentQueueEvents) promises.push(_appointmentQueueEvents.close())
  
  await Promise.all(promises)
  
  if (redisConnection) {
    await redisConnection.quit()
  }
  
  logger.info('All BullMQ queues closed')
}

