import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from './monitoring'
import { ApiResponse, ApiErrorFactory, ErrorCodes, HttpStatus } from './api-response'

// Custom error classes
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    code: string = ErrorCodes.INTERNAL_ERROR,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCodes.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY, true, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, ErrorCodes.UNAUTHORIZED, HttpStatus.UNAUTHORIZED)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, ErrorCodes.FORBIDDEN, HttpStatus.FORBIDDEN)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, ErrorCodes.NOT_FOUND, HttpStatus.NOT_FOUND)
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, ErrorCodes.CONFLICT, HttpStatus.CONFLICT, true, details)
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, code: string, details?: any) {
    super(message, code, HttpStatus.UNPROCESSABLE_ENTITY, true, details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(`${service} error: ${message}`, ErrorCodes.EXTERNAL_SERVICE_ERROR, HttpStatus.BAD_GATEWAY, true, details)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, HttpStatus.TOO_MANY_REQUESTS, true, { retryAfter })
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle different types of errors and convert to appropriate responses
   */
  public handleError(error: unknown, request?: NextRequest): NextResponse {
    // Log the error
    this.logError(error, request)

    // Handle specific error types
    if (error instanceof AppError) {
      return this.handleAppError(error)
    }

    if (error instanceof ZodError) {
      return this.handleZodError(error)
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(error)
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return this.handlePrismaUnknownError(error)
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return this.handlePrismaValidationError(error)
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return this.handlePrismaInitializationError(error)
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return this.handlePrismaRustPanicError(error)
    }

    // Handle generic errors
    return this.handleGenericError(error)
  }

  /**
   * Handle custom AppError instances
   */
  private handleAppError(error: AppError): NextResponse {
    return ApiResponse.error({
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.statusCode
    })
  }

  /**
   * Handle Zod validation errors
   */
  private handleZodError(error: ZodError): NextResponse {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
      value: err.input
    }))

    return ApiResponse.validationError(formattedErrors)
  }

  /**
   * Handle Prisma known request errors
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[]
        return ApiResponse.conflict(
          `A record with this ${field?.join(', ') || 'field'} already exists`,
          { field, code: error.code }
        )

      case 'P2025':
        // Record not found
        return ApiResponse.notFound('Record')

      case 'P2003':
        // Foreign key constraint violation
        return ApiResponse.conflict(
          'Cannot perform this action due to related records',
          { code: error.code }
        )

      case 'P2014':
        // Required relation violation
        return ApiResponse.conflict(
          'Cannot perform this action due to missing required relations',
          { code: error.code }
        )

      case 'P2021':
        // Table does not exist
        return ApiResponse.internalError(
          'Database table not found',
          { code: error.code }
        )

      case 'P2022':
        // Column does not exist
        return ApiResponse.internalError(
          'Database column not found',
          { code: error.code }
        )

      default:
        return ApiResponse.internalError(
          'Database operation failed',
          { code: error.code, meta: error.meta }
        )
    }
  }

  /**
   * Handle Prisma unknown request errors
   */
  private handlePrismaUnknownError(error: Prisma.PrismaClientUnknownRequestError): NextResponse {
    return ApiResponse.internalError(
      'Database operation failed',
      { message: error.message }
    )
  }

  /**
   * Handle Prisma validation errors
   */
  private handlePrismaValidationError(error: Prisma.PrismaClientValidationError): NextResponse {
    return ApiResponse.validationError([{
      field: 'database',
      message: 'Database validation failed',
      code: 'VALIDATION_ERROR',
      value: error.message
    }])
  }

  /**
   * Handle Prisma initialization errors
   */
  private handlePrismaInitializationError(error: Prisma.PrismaClientInitializationError): NextResponse {
    return ApiResponse.serviceUnavailable(
      'Database connection failed',
      { errorCode: error.error_code }
    )
  }

  /**
   * Handle Prisma Rust panic errors
   */
  private handlePrismaRustPanicError(error: Prisma.PrismaClientRustPanicError): NextResponse {
    return ApiResponse.internalError(
      'Database engine error',
      { message: error.message }
    )
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: unknown): NextResponse {
    if (error instanceof Error) {
      return ApiResponse.internalError(
        'An unexpected error occurred',
        process.env.NODE_ENV === 'development' ? error.message : undefined
      )
    }

    return ApiResponse.internalError('An unknown error occurred')
  }

  /**
   * Log error with context
   */
  private logError(error: unknown, request?: NextRequest): void {
    const errorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      url: request?.url,
      method: request?.method,
      userAgent: request?.headers.get('user-agent'),
      ip: request?.ip || request?.headers.get('x-forwarded-for'),
      timestamp: new Date().toISOString()
    }

    if (error instanceof AppError && error.isOperational) {
      logger.warn('Operational Error', errorInfo)
    } else {
      logger.error('System Error', errorInfo)
    }
  }

  /**
   * Handle async errors in route handlers
   */
  public withErrorHandling<T extends any[]>(
    handler: (...args: T) => Promise<NextResponse>
  ) {
    return async (...args: T): Promise<NextResponse> => {
      try {
        return await handler(...args)
      } catch (error) {
        return this.handleError(error, args[0] as NextRequest)
      }
    }
  }

  /**
   * Handle errors in middleware
   */
  public withMiddlewareErrorHandling<T extends any[]>(
    handler: (...args: T) => Promise<NextResponse | void>
  ) {
    return async (...args: T): Promise<NextResponse | void> => {
      try {
        return await handler(...args)
      } catch (error) {
        logger.error('Middleware Error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
        
        return NextResponse.json(
          { error: 'Middleware error' },
          { status: HttpStatus.INTERNAL_SERVER_ERROR }
        )
      }
    }
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance()

// Convenience functions
export const handleError = (error: unknown, request?: NextRequest) => 
  errorHandler.handleError(error, request)

export const withErrorHandling = <T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) => errorHandler.withErrorHandling(handler)

export const withMiddlewareErrorHandling = <T extends any[]>(
  handler: (...args: T) => Promise<NextResponse | void>
) => errorHandler.withMiddlewareErrorHandling(handler)

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(message: string, public componentStack?: string) {
    super(message)
    this.name = 'ErrorBoundary'
  }
}

// Utility functions
export const isOperationalError = (error: unknown): boolean => {
  return error instanceof AppError && error.isOperational
}

export const isPrismaError = (error: unknown): boolean => {
  return error instanceof Prisma.PrismaClientKnownRequestError ||
         error instanceof Prisma.PrismaClientUnknownRequestError ||
         error instanceof Prisma.PrismaClientValidationError ||
         error instanceof Prisma.PrismaClientInitializationError ||
         error instanceof Prisma.PrismaClientRustPanicError
}

export const isValidationError = (error: unknown): boolean => {
  return error instanceof ZodError || error instanceof ValidationError
}

export const isAuthenticationError = (error: unknown): boolean => {
  return error instanceof AuthenticationError || 
         (error instanceof AppError && error.code === ErrorCodes.UNAUTHORIZED)
}

export const isAuthorizationError = (error: unknown): boolean => {
  return error instanceof AuthorizationError || 
         (error instanceof AppError && error.code === ErrorCodes.FORBIDDEN)
}

export default errorHandler
