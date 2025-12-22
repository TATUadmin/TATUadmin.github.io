/**
 * Enterprise-Grade Security Utilities
 * 
 * Provides configurable security settings including:
 * - Configurable bcrypt salt rounds
 * - Enhanced password hashing
 * - Security constants
 */

import bcrypt from 'bcryptjs'

// Security configuration
export const SECURITY_CONFIG = {
  // Bcrypt salt rounds - configurable via environment variable
  // Recommended: 12 for production (balance of security and performance)
  // Higher values = more secure but slower
  HASH_SALT_ROUNDS: parseInt(process.env.HASH_SALT_ROUNDS || '12'),

  // Minimum password length
  MIN_PASSWORD_LENGTH: 8,

  // Session timeout (in milliseconds)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours

  // CSRF token expiration (in milliseconds)
  CSRF_TOKEN_EXPIRATION: 60 * 60 * 1000, // 1 hour
}

/**
 * Hash a password using bcrypt with configurable salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`)
  }

  return await bcrypt.hash(password, SECURITY_CONFIG.HASH_SALT_ROUNDS)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} characters`)
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const crypto = require('crypto')
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

