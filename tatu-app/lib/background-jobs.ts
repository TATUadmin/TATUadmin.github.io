/**
 * @deprecated This file is kept for backward compatibility.
 * New code should import directly from '@/lib/bullmq-jobs'
 * 
 * This file re-exports BullMQ functions for backward compatibility.
 * The old custom job queue has been replaced with enterprise-grade BullMQ.
 */

// Re-export from BullMQ for backward compatibility
export {
  addEmailJob,
  addAppointmentReminderJob,
  addReviewRequestJob,
  addImageProcessingJob,
  addCleanupJob,
} from './bullmq-jobs'

// Re-export job types for backward compatibility
export enum JobType {
  SEND_EMAIL = 'send_email',
  SEND_APPOINTMENT_REMINDER = 'send_appointment_reminder',
  SEND_REVIEW_REQUEST = 'send_review_request',
  PROCESS_IMAGE = 'process_image',
  GENERATE_THUMBNAIL = 'generate_thumbnail',
  CLEANUP_EXPIRED_TOKENS = 'cleanup_expired_tokens',
  SYNC_EXTERNAL_DATA = 'sync_external_data',
  SEND_NOTIFICATION = 'send_notification',
  UPDATE_ANALYTICS = 'update_analytics',
  BACKUP_DATABASE = 'backup_database'
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Legacy code below - kept for reference but not used
// All job processing now happens in bullmq-jobs.ts

import { Redis } from 'ioredis'
import { logger } from './monitoring'
import { emailService } from './email-service'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Job types
export enum JobType {
  SEND_EMAIL = 'send_email',
  SEND_APPOINTMENT_REMINDER = 'send_appointment_reminder',
  SEND_REVIEW_REQUEST = 'send_review_request',
  PROCESS_IMAGE = 'process_image',
  GENERATE_THUMBNAIL = 'generate_thumbnail',
  CLEANUP_EXPIRED_TOKENS = 'cleanup_expired_tokens',
  SYNC_EXTERNAL_DATA = 'sync_external_data',
  SEND_NOTIFICATION = 'send_notification',
  UPDATE_ANALYTICS = 'update_analytics',
  BACKUP_DATABASE = 'backup_database'
}

// Job priority levels
export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

// Job status
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Job interface
export interface Job {
  id: string
  type: JobType
  priority: JobPriority
  status: JobStatus
  data: any
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledFor?: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  result?: any
  tags?: string[]
}

// Job processor interface
export interface JobProcessor {
  process(job: Job): Promise<any>
  onSuccess?(job: Job, result: any): Promise<void>
  onFailure?(job: Job, error: Error): Promise<void>
  onRetry?(job: Job, error: Error): Promise<void>
}

// Job queue configuration
export interface JobQueueConfig {
  redis: Redis
  queueName: string
  concurrency: number
  retryDelay: number
  maxRetries: number
  removeOnComplete: number
  removeOnFail: number
}

// Job queue class
export class JobQueue {
  private static instance: JobQueue
  private redis: Redis
  private config: JobQueueConfig
  private processors: Map<JobType, JobProcessor>
  private isProcessing: boolean
  private processingJobs: Set<string>

  constructor(config: JobQueueConfig) {
    this.config = config
    this.redis = config.redis
    this.processors = new Map()
    this.isProcessing = false
    this.processingJobs = new Set()
  }

  public static getInstance(config?: JobQueueConfig): JobQueue {
    if (!JobQueue.instance) {
      if (!config) {
        throw new Error('Job queue configuration is required for first initialization')
      }
      JobQueue.instance = new JobQueue(config)
    }
    return JobQueue.instance
  }

  /**
   * Register a job processor
   */
  registerProcessor(type: JobType, processor: JobProcessor): void {
    this.processors.set(type, processor)
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: JobType,
    data: any,
    options: {
      priority?: JobPriority
      delay?: number
      maxAttempts?: number
      tags?: string[]
    } = {}
  ): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const job: Job = {
      id: jobId,
      type,
      priority: options.priority || JobPriority.NORMAL,
      status: JobStatus.PENDING,
      data,
      attempts: 0,
      maxAttempts: options.maxAttempts || this.config.maxRetries,
      createdAt: new Date(),
      scheduledFor: options.delay ? new Date(Date.now() + options.delay) : undefined,
      tags: options.tags
    }

    try {
      const jobData = JSON.stringify(job)
      const score = job.scheduledFor ? job.scheduledFor.getTime() : Date.now()
      
      await this.redis.zadd(
        `${this.config.queueName}:pending`,
        score,
        jobData
      )

      logger.info('Job added to queue', {
        jobId,
        type,
        priority: job.priority,
        scheduledFor: job.scheduledFor
      })

      return jobId

    } catch (error) {
      logger.error('Failed to add job to queue', {
        error: error instanceof Error ? error.message : 'Unknown error',
        jobId,
        type
      })
      throw error
    }
  }

  /**
   * Start processing jobs
   */
  async startProcessing(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Job processing is already running')
      return
    }

    this.isProcessing = true
    logger.info('Starting job processing', {
      concurrency: this.config.concurrency,
      queueName: this.config.queueName
    })

    // Start multiple workers
    const workers = Array.from({ length: this.config.concurrency }, (_, i) => 
      this.processWorker(i)
    )

    await Promise.all(workers)
  }

  /**
   * Stop processing jobs
   */
  async stopProcessing(): Promise<void> {
    this.isProcessing = false
    logger.info('Stopping job processing')
  }

  /**
   * Process a single job
   */
  async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type)
    if (!processor) {
      logger.error('No processor found for job type', {
        jobId: job.id,
        type: job.type
      })
      return
    }

    try {
      // Update job status
      await this.updateJobStatus(job.id, JobStatus.PROCESSING, {
        startedAt: new Date()
      })

      // Process the job
      const result = await processor.process(job)

      // Update job status to completed
      await this.updateJobStatus(job.id, JobStatus.COMPLETED, {
        completedAt: new Date(),
        result
      })

      // Call success handler
      if (processor.onSuccess) {
        await processor.onSuccess(job, result)
      }

      logger.info('Job completed successfully', {
        jobId: job.id,
        type: job.type,
        duration: Date.now() - job.createdAt.getTime()
      })

    } catch (error) {
      await this.handleJobFailure(job, error as Error, processor)
    }
  }

  /**
   * Handle job failure
   */
  private async handleJobFailure(job: Job, error: Error, processor: JobProcessor): Promise<void> {
    job.attempts++
    job.error = error.message

    logger.error('Job failed', {
      jobId: job.id,
      type: job.type,
      attempt: job.attempts,
      maxAttempts: job.maxAttempts,
      error: error.message
    })

    if (job.attempts < job.maxAttempts) {
      // Retry the job
      await this.retryJob(job)
      
      if (processor.onRetry) {
        await processor.onRetry(job, error)
      }
    } else {
      // Mark job as failed
      await this.updateJobStatus(job.id, JobStatus.FAILED, {
        completedAt: new Date()
      })

      if (processor.onFailure) {
        await processor.onFailure(job, error)
      }
    }
  }

  /**
   * Retry a failed job
   */
  private async retryJob(job: Job): Promise<void> {
    const delay = this.config.retryDelay * Math.pow(2, job.attempts - 1) // Exponential backoff
    const scheduledFor = new Date(Date.now() + delay)

    job.status = JobStatus.PENDING
    job.scheduledFor = scheduledFor

    const jobData = JSON.stringify(job)
    const score = scheduledFor.getTime()

    await this.redis.zadd(
      `${this.config.queueName}:pending`,
      score,
      jobData
    )

    logger.info('Job scheduled for retry', {
      jobId: job.id,
      type: job.type,
      attempt: job.attempts,
      scheduledFor
    })
  }

  /**
   * Update job status
   */
  private async updateJobStatus(
    jobId: string,
    status: JobStatus,
    updates: Partial<Job> = {}
  ): Promise<void> {
    // This would typically update a database record
    // For now, we'll just log the update
    logger.debug('Job status updated', {
      jobId,
      status,
      updates
    })
  }

  /**
   * Worker process
   */
  private async processWorker(workerId: number): Promise<void> {
    logger.info(`Worker ${workerId} started`)

    while (this.isProcessing) {
      try {
        const job = await this.getNextJob()
        if (!job) {
          // No jobs available, wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        if (this.processingJobs.has(job.id)) {
          continue
        }

        this.processingJobs.add(job.id)
        await this.processJob(job)
        this.processingJobs.delete(job.id)

      } catch (error) {
        logger.error(`Worker ${workerId} error`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    logger.info(`Worker ${workerId} stopped`)
  }

  /**
   * Get next job from queue
   */
  private async getNextJob(): Promise<Job | null> {
    try {
      const now = Date.now()
      const result = await this.redis.zrangebyscore(
        `${this.config.queueName}:pending`,
        0,
        now,
        'LIMIT',
        0,
        1
      )

      if (result.length === 0) {
        return null
      }

      const jobData = result[0]
      const job: Job = JSON.parse(jobData)

      // Remove from pending queue
      await this.redis.zrem(`${this.config.queueName}:pending`, jobData)

      return job

    } catch (error) {
      logger.error('Failed to get next job', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Get job statistics
   */
  async getStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    try {
      const pending = await this.redis.zcard(`${this.config.queueName}:pending`)
      const processing = this.processingJobs.size
      
      // These would typically come from a database
      const completed = 0
      const failed = 0

      return {
        pending,
        processing,
        completed,
        failed
      }
    } catch (error) {
      logger.error('Failed to get job stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      }
    }
  }
}

// Job processors
export class EmailJobProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    const { email, name, type, data } = job.data

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
  }

  async onSuccess(job: Job, result: any): Promise<void> {
    logger.info('Email sent successfully', {
      jobId: job.id,
      email: job.data.email,
      type: job.data.type
    })
  }

  async onFailure(job: Job, error: Error): Promise<void> {
    logger.error('Email sending failed', {
      jobId: job.id,
      email: job.data.email,
      type: job.data.type,
      error: error.message
    })
  }
}

export class AppointmentReminderProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    const { appointmentId } = job.data

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        artist: {
          include: { profile: true }
        },
        client: true
      }
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
        date: appointment.preferredDate,
        time: appointment.preferredTime,
        service: appointment.serviceType,
        duration: appointment.duration,
        location: appointment.artist.shop?.address
      }
    )
  }
}

export class ReviewRequestProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    const { appointmentId } = job.data

    // Get appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        artist: {
          include: { profile: true }
        },
        client: true
      }
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
      appointment.preferredDate,
      reviewToken
    )
  }
}

export class ImageProcessingProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    const { fileId, operations } = job.data

    // Process image based on operations
    // This would integrate with your image processing service
    logger.info('Processing image', {
      fileId,
      operations
    })

    return { processed: true, fileId }
  }
}

export class CleanupProcessor implements JobProcessor {
  async process(job: Job): Promise<any> {
    const { type } = job.data

    switch (type) {
      case 'expired_tokens':
        return await this.cleanupExpiredTokens()
      case 'old_jobs':
        return await this.cleanupOldJobs()
      default:
        throw new Error(`Unknown cleanup type: ${type}`)
    }
  }

  private async cleanupExpiredTokens(): Promise<any> {
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })

    logger.info('Cleaned up expired tokens', {
      count: expiredTokens.count
    })

    return { cleaned: expiredTokens.count }
  }

  private async cleanupOldJobs(): Promise<any> {
    // Clean up old completed/failed jobs
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    
    // This would clean up job records from database
    logger.info('Cleaned up old jobs', {
      cutoffDate
    })

    return { cleaned: 0 }
  }
}

// Create job queue instance
export const createJobQueue = (redis: Redis): JobQueue => {
  const config: JobQueueConfig = {
    redis,
    queueName: 'tatu_jobs',
    concurrency: parseInt(process.env.JOB_CONCURRENCY || '5'),
    retryDelay: parseInt(process.env.JOB_RETRY_DELAY || '5000'),
    maxRetries: parseInt(process.env.JOB_MAX_RETRIES || '3'),
    removeOnComplete: parseInt(process.env.JOB_REMOVE_ON_COMPLETE || '100'),
    removeOnFail: parseInt(process.env.JOB_REMOVE_ON_FAIL || '50')
  }

  const queue = JobQueue.getInstance(config)

  // Register processors
  queue.registerProcessor(JobType.SEND_EMAIL, new EmailJobProcessor())
  queue.registerProcessor(JobType.SEND_APPOINTMENT_REMINDER, new AppointmentReminderProcessor())
  queue.registerProcessor(JobType.SEND_REVIEW_REQUEST, new ReviewRequestProcessor())
  queue.registerProcessor(JobType.PROCESS_IMAGE, new ImageProcessingProcessor())
  queue.registerProcessor(JobType.CLEANUP_EXPIRED_TOKENS, new CleanupProcessor())

  return queue
}

// Note: Convenience functions are re-exported from './bullmq-jobs' at the top of this file
// The old implementations below are kept for reference but should not be used
// All job processing now happens in bullmq-jobs.ts

export default JobQueue
