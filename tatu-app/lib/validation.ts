// Comprehensive validation utilities for the TATU application

export interface ValidationResult {
  isValid: boolean
  errors: { [key: string]: string }
}

export class Validator {
  private errors: { [key: string]: string } = {}

  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation (supports international formats)
  static isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(cleanPhone)
  }

  // URL validation
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Password strength validation
  static isStrongPassword(password: string): {
    isValid: boolean
    message?: string
  } {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' }
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character' }
    }
    return { isValid: true }
  }

  // Date validation
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  static isFutureDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date > new Date()
  }

  static isPastDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date < new Date()
  }

  // Credit card validation (Luhn algorithm)
  static isValidCreditCard(cardNumber: string): boolean {
    const cleanNumber = cardNumber.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(cleanNumber)) return false

    let sum = 0
    let isEven = false
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber[i])
      
      if (isEven) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      
      sum += digit
      isEven = !isEven
    }
    
    return sum % 10 === 0
  }

  // CVV validation
  static isValidCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv)
  }

  // Expiry date validation (MM/YY format)
  static isValidExpiryDate(expiry: string): boolean {
    const match = expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)
    if (!match) return false

    const month = parseInt(match[1])
    const year = parseInt('20' + match[2])
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    if (year < currentYear) return false
    if (year === currentYear && month < currentMonth) return false

    return true
  }

  // String validations
  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0
  }

  static hasMinLength(value: string, min: number): boolean {
    return value.trim().length >= min
  }

  static hasMaxLength(value: string, max: number): boolean {
    return value.trim().length <= max
  }

  static isInRange(value: string, min: number, max: number): boolean {
    const length = value.trim().length
    return length >= min && length <= max
  }

  // Number validations
  static isNumber(value: any): boolean {
    return !isNaN(parseFloat(value)) && isFinite(value)
  }

  static isPositive(value: number): boolean {
    return value > 0
  }

  static isInNumericRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max
  }

  // File validations
  static isValidFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.includes('*')) {
        const prefix = type.split('/')[0]
        return file.type.startsWith(prefix)
      }
      return file.type === type
    })
  }

  static isValidFileSize(file: File, maxSizeInBytes: number): boolean {
    return file.size <= maxSizeInBytes
  }

  // Chaining validation methods
  required(fieldName: string, value: any, message?: string): this {
    if (!value || (typeof value === 'string' && !this.constructor.isNotEmpty(value))) {
      this.errors[fieldName] = message || `${fieldName} is required`
    }
    return this
  }

  email(fieldName: string, value: string, message?: string): this {
    if (value && !Validator.isValidEmail(value)) {
      this.errors[fieldName] = message || 'Invalid email address'
    }
    return this
  }

  phone(fieldName: string, value: string, message?: string): this {
    if (value && !Validator.isValidPhone(value)) {
      this.errors[fieldName] = message || 'Invalid phone number'
    }
    return this
  }

  url(fieldName: string, value: string, message?: string): this {
    if (value && !Validator.isValidUrl(value)) {
      this.errors[fieldName] = message || 'Invalid URL'
    }
    return this
  }

  minLength(fieldName: string, value: string, min: number, message?: string): this {
    if (value && !Validator.hasMinLength(value, min)) {
      this.errors[fieldName] = message || `Must be at least ${min} characters`
    }
    return this
  }

  maxLength(fieldName: string, value: string, max: number, message?: string): this {
    if (value && !Validator.hasMaxLength(value, max)) {
      this.errors[fieldName] = message || `Must be at most ${max} characters`
    }
    return this
  }

  pattern(fieldName: string, value: string, pattern: RegExp, message?: string): this {
    if (value && !pattern.test(value)) {
      this.errors[fieldName] = message || 'Invalid format'
    }
    return this
  }

  custom(fieldName: string, isValid: boolean, message: string): this {
    if (!isValid) {
      this.errors[fieldName] = message
    }
    return this
  }

  getResult(): ValidationResult {
    return {
      isValid: Object.keys(this.errors).length === 0,
      errors: this.errors
    }
  }

  reset(): this {
    this.errors = {}
    return this
  }
}

// Pre-built validation schemas
export const ValidationSchemas = {
  // User registration
  registration: (data: any) => {
    const validator = new Validator()
    return validator
      .required('name', data.name)
      .minLength('name', data.name, 2)
      .maxLength('name', data.name, 50)
      .required('email', data.email)
      .email('email', data.email)
      .required('password', data.password)
      .custom('password', Validator.isStrongPassword(data.password).isValid, 
        Validator.isStrongPassword(data.password).message || '')
      .getResult()
  },

  // Login
  login: (data: any) => {
    const validator = new Validator()
    return validator
      .required('email', data.email)
      .email('email', data.email)
      .required('password', data.password)
      .getResult()
  },

  // Contact form
  contact: (data: any) => {
    const validator = new Validator()
    return validator
      .required('name', data.name)
      .minLength('name', data.name, 2)
      .required('email', data.email)
      .email('email', data.email)
      .required('subject', data.subject)
      .minLength('subject', data.subject, 5)
      .required('message', data.message)
      .minLength('message', data.message, 20)
      .maxLength('message', data.message, 1000)
      .getResult()
  },

  // Appointment booking
  appointment: (data: any) => {
    const validator = new Validator()
    return validator
      .required('title', data.title)
      .minLength('title', data.title, 3)
      .maxLength('title', data.title, 100)
      .required('clientName', data.clientName)
      .minLength('clientName', data.clientName, 2)
      .required('clientEmail', data.clientEmail)
      .email('clientEmail', data.clientEmail)
      .required('clientPhone', data.clientPhone)
      .phone('clientPhone', data.clientPhone)
      .required('startTime', data.startTime)
      .custom('startTime', Validator.isFutureDate(data.startTime), 'Start time must be in the future')
      .required('endTime', data.endTime)
      .custom('endTime', new Date(data.endTime) > new Date(data.startTime), 'End time must be after start time')
      .required('artistId', data.artistId)
      .required('serviceId', data.serviceId)
      .getResult()
  },

  // Review submission
  review: (data: any) => {
    const validator = new Validator()
    return validator
      .required('rating', data.rating)
      .custom('rating', data.rating >= 1 && data.rating <= 5, 'Rating must be between 1 and 5')
      .required('title', data.title)
      .minLength('title', data.title, 5)
      .maxLength('title', data.title, 100)
      .required('comment', data.comment)
      .minLength('comment', data.comment, 20)
      .maxLength('comment', data.comment, 1000)
      .getResult()
  },

  // Portfolio item
  portfolioItem: (data: any) => {
    const validator = new Validator()
    return validator
      .required('title', data.title)
      .minLength('title', data.title, 3)
      .maxLength('title', data.title, 100)
      .required('imageUrl', data.imageUrl)
      .required('style', data.style)
      .maxLength('description', data.description, 500)
      .getResult()
  },

  // Payment details
  payment: (data: any) => {
    const validator = new Validator()
    return validator
      .required('cardNumber', data.cardNumber)
      .custom('cardNumber', Validator.isValidCreditCard(data.cardNumber), 'Invalid card number')
      .required('cardExpiry', data.cardExpiry)
      .custom('cardExpiry', Validator.isValidExpiryDate(data.cardExpiry), 'Invalid or expired date')
      .required('cardCvc', data.cardCvc)
      .custom('cardCvc', Validator.isValidCVV(data.cardCvc), 'Invalid CVC')
      .getResult()
  }
}

export default Validator
