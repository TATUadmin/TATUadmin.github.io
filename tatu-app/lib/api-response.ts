import { NextResponse } from 'next/server'
import { logger } from './monitoring'

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    requestId: string
    timestamp: string
    version: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
  total?: number
}

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

// Standard HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// Error codes mapping
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource Management
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Business Logic
  APPOINTMENT_CONFLICT: 'APPOINTMENT_CONFLICT',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  BOOKING_UNAVAILABLE: 'BOOKING_UNAVAILABLE',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR'
} as const

// Success response builder
export class ApiResponseBuilder {
  private static version = '1.0.0'

  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    statusCode: number = HttpStatus.OK,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta: {
        requestId: meta?.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        version: this.version,
        ...meta
      }
    }

    return NextResponse.json(response, { status: statusCode })
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationParams,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse<T[]>> {
    const page = pagination.page || 1
    const limit = pagination.limit || 20
    const total = pagination.total || 0
    const totalPages = Math.ceil(total / limit)

    const response: ApiResponse<T[]> = {
      success: true,
      data,
      meta: {
        requestId: meta?.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        version: this.version,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        ...meta
      }
    }

    return NextResponse.json(response, { status: HttpStatus.OK })
  }

  /**
   * Create an error response
   */
  static error(
    error: ApiError,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      },
      meta: {
        requestId: meta?.requestId || 'unknown',
        timestamp: new Date().toISOString(),
        version: this.version,
        ...meta
      }
    }

    // Log error for monitoring
    logger.error('API Error Response', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      requestId: meta?.requestId,
      details: error.details
    })

    return NextResponse.json(response, { status: error.statusCode })
  }

  /**
   * Create a validation error response
   */
  static validationError(
    errors: any[],
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed',
      details: errors,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY
    }, meta)
  }

  /**
   * Create a not found response
   */
  static notFound(
    resource: string = 'Resource',
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.NOT_FOUND,
      message: `${resource} not found`,
      statusCode: HttpStatus.NOT_FOUND
    }, meta)
  }

  /**
   * Create an unauthorized response
   */
  static unauthorized(
    message: string = 'Unauthorized',
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.UNAUTHORIZED,
      message,
      statusCode: HttpStatus.UNAUTHORIZED
    }, meta)
  }

  /**
   * Create a forbidden response
   */
  static forbidden(
    message: string = 'Forbidden',
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.FORBIDDEN,
      message,
      statusCode: HttpStatus.FORBIDDEN
    }, meta)
  }

  /**
   * Create a conflict response
   */
  static conflict(
    message: string = 'Conflict',
    details?: any,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.CONFLICT,
      message,
      details,
      statusCode: HttpStatus.CONFLICT
    }, meta)
  }

  /**
   * Create a rate limit response
   */
  static rateLimited(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    const response = this.error({
      code: ErrorCodes.RATE_LIMIT_EXCEEDED,
      message,
      statusCode: HttpStatus.TOO_MANY_REQUESTS
    }, meta)

    if (retryAfter) {
      response.headers.set('Retry-After', retryAfter.toString())
    }

    return response
  }

  /**
   * Create an internal server error response
   */
  static internalError(
    message: string = 'Internal server error',
    details?: any,
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.INTERNAL_ERROR,
      message,
      details,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR
    }, meta)
  }

  /**
   * Create a service unavailable response
   */
  static serviceUnavailable(
    message: string = 'Service temporarily unavailable',
    meta?: Partial<ApiResponse['meta']>
  ): NextResponse<ApiResponse> {
    return this.error({
      code: ErrorCodes.SERVICE_UNAVAILABLE,
      message,
      statusCode: HttpStatus.SERVICE_UNAVAILABLE
    }, meta)
  }
}

// Convenience functions for common responses
export const ApiResponse = {
  success: ApiResponseBuilder.success,
  paginated: ApiResponseBuilder.paginated,
  error: ApiResponseBuilder.error,
  validationError: ApiResponseBuilder.validationError,
  notFound: ApiResponseBuilder.notFound,
  unauthorized: ApiResponseBuilder.unauthorized,
  forbidden: ApiResponseBuilder.forbidden,
  conflict: ApiResponseBuilder.conflict,
  rateLimited: ApiResponseBuilder.rateLimited,
  internalError: ApiResponseBuilder.internalError,
  serviceUnavailable: ApiResponseBuilder.serviceUnavailable
}

// Error factory for creating standardized errors
export class ApiErrorFactory {
  static create(
    code: keyof typeof ErrorCodes,
    message: string,
    statusCode: number,
    details?: any
  ): ApiError {
    return {
      code: ErrorCodes[code],
      message,
      statusCode,
      details
    }
  }

  static validationError(errors: any[]): ApiError {
    return this.create('VALIDATION_ERROR', 'Validation failed', HttpStatus.UNPROCESSABLE_ENTITY, errors)
  }

  static notFound(resource: string = 'Resource'): ApiError {
    return this.create('NOT_FOUND', `${resource} not found`, HttpStatus.NOT_FOUND)
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return this.create('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED)
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return this.create('FORBIDDEN', message, HttpStatus.FORBIDDEN)
  }

  static conflict(message: string = 'Conflict', details?: any): ApiError {
    return this.create('CONFLICT', message, HttpStatus.CONFLICT, details)
  }

  static internalError(message: string = 'Internal server error', details?: any): ApiError {
    return this.create('INTERNAL_ERROR', message, HttpStatus.INTERNAL_SERVER_ERROR, details)
  }
}

// Response interceptor for consistent error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Log error
      logger.error('Unhandled API Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })

      // Capture exception in Sentry
      if (typeof window === 'undefined') {
        // Server-side: Use @sentry/nextjs
        const Sentry = await import('@sentry/nextjs')
        Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          level: 'error',
          tags: {
            error_type: 'unhandled_api_error',
            handler: handler.name || 'unknown'
          },
          extra: {
            error_message: error instanceof Error ? error.message : String(error),
            error_stack: error instanceof Error ? error.stack : undefined
          }
        })
      }

      return ApiResponse.internalError(
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? error : undefined
      )
    }
  }
}

export default ApiResponse
