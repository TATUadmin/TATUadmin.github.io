import { z } from 'zod'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Base validation schemas
export const BaseSchemas = {
  id: z.string().cuid(),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/).max(20),
  url: z.string().url().max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  datetime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  positiveNumber: z.number().positive(),
  nonNegativeNumber: z.number().min(0),
  percentage: z.number().min(0).max(100),
  rating: z.number().min(1).max(5),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']),
  role: z.enum(['CUSTOMER', 'ARTIST', 'SHOP_OWNER', 'ADMIN']),
  appointmentStatus: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED']),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  tattooStyle: z.enum([
    'TRADITIONAL', 'REALISTIC', 'WATERCOLOR', 'GEOMETRIC', 'MINIMALIST',
    'BLACKWORK', 'COLOR', 'JAPANESE', 'TRIBAL', 'SURREAL', 'PORTRAIT',
    'NATURE', 'ABSTRACT', 'LETTERING', 'MANDALA', 'OTHER'
  ])
}

// User validation schemas
export const UserSchemas = {
  create: z.object({
    email: BaseSchemas.email,
    password: BaseSchemas.password,
    name: z.string().min(1).max(100),
    role: BaseSchemas.role.optional().default('CUSTOMER')
  }),

  update: z.object({
    name: z.string().min(1).max(100).optional(),
    email: BaseSchemas.email.optional(),
    phone: BaseSchemas.phone.optional(),
    bio: z.string().max(1000).optional(),
    instagram: z.string().max(100).optional(),
    website: BaseSchemas.url.optional(),
    location: z.string().max(200).optional()
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1),
    newPassword: BaseSchemas.password,
    confirmPassword: z.string().min(1)
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  })
}

// Profile validation schemas
export const ProfileSchemas = {
  create: z.object({
    bio: z.string().max(1000).optional(),
    phone: BaseSchemas.phone.optional(),
    instagram: z.string().max(100).optional(),
    website: BaseSchemas.url.optional(),
    location: z.string().max(200).optional(),
    specialties: z.array(BaseSchemas.tattooStyle).max(10).optional(),
    experience: BaseSchemas.nonNegativeNumber.optional(),
    hourlyRate: BaseSchemas.positiveNumber.optional(),
    availability: z.object({
      monday: z.array(z.string()).optional(),
      tuesday: z.array(z.string()).optional(),
      wednesday: z.array(z.string()).optional(),
      thursday: z.array(z.string()).optional(),
      friday: z.array(z.string()).optional(),
      saturday: z.array(z.string()).optional(),
      sunday: z.array(z.string()).optional()
    }).optional()
  }),

  update: z.object({
    bio: z.string().max(1000).optional(),
    phone: BaseSchemas.phone.optional(),
    instagram: z.string().max(100).optional(),
    website: BaseSchemas.url.optional(),
    location: z.string().max(200).optional(),
    specialties: z.array(BaseSchemas.tattooStyle).max(10).optional(),
    experience: BaseSchemas.nonNegativeNumber.optional(),
    hourlyRate: BaseSchemas.positiveNumber.optional(),
    availability: z.object({
      monday: z.array(z.string()).optional(),
      tuesday: z.array(z.string()).optional(),
      wednesday: z.array(z.string()).optional(),
      thursday: z.array(z.string()).optional(),
      friday: z.array(z.string()).optional(),
      saturday: z.array(z.string()).optional(),
      sunday: z.array(z.string()).optional()
    }).optional()
  })
}

// Shop validation schemas
export const ShopSchemas = {
  create: z.object({
    name: z.string().min(1).max(200),
    address: z.string().max(500).optional(),
    phone: BaseSchemas.phone.optional(),
    website: BaseSchemas.url.optional(),
    description: z.string().max(2000).optional(),
    services: z.array(z.string()).max(20).optional(),
    amenities: z.array(z.string()).max(20).optional(),
    operatingHours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional()
    }).optional()
  }),

  update: z.object({
    name: z.string().min(1).max(200).optional(),
    address: z.string().max(500).optional(),
    phone: BaseSchemas.phone.optional(),
    website: BaseSchemas.url.optional(),
    description: z.string().max(2000).optional(),
    services: z.array(z.string()).max(20).optional(),
    amenities: z.array(z.string()).max(20).optional(),
    operatingHours: z.object({
      monday: z.object({ open: z.string(), close: z.string() }).optional(),
      tuesday: z.object({ open: z.string(), close: z.string() }).optional(),
      wednesday: z.object({ open: z.string(), close: z.string() }).optional(),
      thursday: z.object({ open: z.string(), close: z.string() }).optional(),
      friday: z.object({ open: z.string(), close: z.string() }).optional(),
      saturday: z.object({ open: z.string(), close: z.string() }).optional(),
      sunday: z.object({ open: z.string(), close: z.string() }).optional()
    }).optional()
  })
}

// Appointment validation schemas
export const AppointmentSchemas = {
  create: z.object({
    artistId: BaseSchemas.id,
    serviceType: z.string().min(1).max(100),
    preferredDate: BaseSchemas.date,
    preferredTime: BaseSchemas.time,
    duration: z.number().min(30).max(480), // 30 minutes to 8 hours
    budget: BaseSchemas.positiveNumber,
    projectDescription: z.string().min(10).max(2000),
    referenceImages: z.array(z.string().url()).max(10).optional(),
    specialRequests: z.string().max(1000).optional(),
    emergencyContact: z.object({
      name: z.string().min(1).max(100),
      phone: BaseSchemas.phone
    }).optional()
  }),

  update: z.object({
    serviceType: z.string().min(1).max(100).optional(),
    preferredDate: BaseSchemas.date.optional(),
    preferredTime: BaseSchemas.time.optional(),
    duration: z.number().min(30).max(480).optional(),
    budget: BaseSchemas.positiveNumber.optional(),
    projectDescription: z.string().min(10).max(2000).optional(),
    referenceImages: z.array(z.string().url()).max(10).optional(),
    specialRequests: z.string().max(1000).optional(),
    status: BaseSchemas.appointmentStatus.optional()
  }),

  reschedule: z.object({
    newDate: BaseSchemas.date,
    newTime: BaseSchemas.time,
    reason: z.string().max(500).optional()
  })
}

// Portfolio validation schemas
export const PortfolioSchemas = {
  create: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    images: z.array(z.string().url()).min(1).max(20),
    style: BaseSchemas.tattooStyle,
    size: z.string().max(100).optional(),
    placement: z.string().max(100).optional(),
    duration: z.number().min(30).max(480).optional(),
    price: BaseSchemas.positiveNumber.optional(),
    isPublic: z.boolean().default(true),
    tags: z.array(z.string().max(50)).max(20).optional(),
    collectionId: BaseSchemas.id.optional()
  }),

  update: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    images: z.array(z.string().url()).min(1).max(20).optional(),
    style: BaseSchemas.tattooStyle.optional(),
    size: z.string().max(100).optional(),
    placement: z.string().max(100).optional(),
    duration: z.number().min(30).max(480).optional(),
    price: BaseSchemas.positiveNumber.optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    collectionId: BaseSchemas.id.optional()
  })
}

// Review validation schemas
export const ReviewSchemas = {
  create: z.object({
    artistId: BaseSchemas.id,
    appointmentId: BaseSchemas.id.optional(),
    rating: BaseSchemas.rating,
    content: z.string().min(10).max(2000),
    images: z.array(z.string().url()).max(5).optional(),
    categories: z.object({
      cleanliness: BaseSchemas.rating.optional(),
      professionalism: BaseSchemas.rating.optional(),
      skill: BaseSchemas.rating.optional(),
      communication: BaseSchemas.rating.optional(),
      value: BaseSchemas.rating.optional()
    }).optional()
  }),

  update: z.object({
    rating: BaseSchemas.rating.optional(),
    content: z.string().min(10).max(2000).optional(),
    images: z.array(z.string().url()).max(5).optional(),
    categories: z.object({
      cleanliness: BaseSchemas.rating.optional(),
      professionalism: BaseSchemas.rating.optional(),
      skill: BaseSchemas.rating.optional(),
      communication: BaseSchemas.rating.optional(),
      value: BaseSchemas.rating.optional()
    }).optional()
  })
}

// Message validation schemas
export const MessageSchemas = {
  create: z.object({
    recipientId: BaseSchemas.id,
    subject: z.string().min(1).max(200),
    content: z.string().min(1).max(5000),
    attachments: z.array(z.string().url()).max(10).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL')
  }),

  reply: z.object({
    content: z.string().min(1).max(5000),
    attachments: z.array(z.string().url()).max(10).optional()
  })
}

// Search validation schemas
export const SearchSchemas = {
  artists: z.object({
    query: z.string().max(200).optional(),
    location: z.string().max(200).optional(),
    style: BaseSchemas.tattooStyle.optional(),
    minPrice: BaseSchemas.nonNegativeNumber.optional(),
    maxPrice: BaseSchemas.positiveNumber.optional(),
    rating: BaseSchemas.rating.optional(),
    availability: z.object({
      date: BaseSchemas.date,
      time: BaseSchemas.time
    }).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['rating', 'price', 'distance', 'recent']).default('rating'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  portfolio: z.object({
    query: z.string().max(200).optional(),
    style: BaseSchemas.tattooStyle.optional(),
    artistId: BaseSchemas.id.optional(),
    minPrice: BaseSchemas.nonNegativeNumber.optional(),
    maxPrice: BaseSchemas.positiveNumber.optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    sortBy: z.enum(['recent', 'popular', 'price', 'rating']).default('recent'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  })
}

// File upload validation schemas
export const FileUploadSchemas = {
  image: z.object({
    file: z.any(), // File object
    type: BaseSchemas.fileType,
    size: z.number().max(10 * 1024 * 1024), // 10MB max
    width: z.number().min(100).max(4000).optional(),
    height: z.number().min(100).max(4000).optional()
  }),

  document: z.object({
    file: z.any(),
    type: z.enum(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    size: z.number().max(5 * 1024 * 1024) // 5MB max
  })
}

// Payment validation schemas
export const PaymentSchemas = {
  create: z.object({
    amount: BaseSchemas.positiveNumber,
    currency: z.string().length(3).default('USD'),
    appointmentId: BaseSchemas.id.optional(),
    description: z.string().max(500).optional(),
    metadata: z.record(z.string()).optional()
  }),

  refund: z.object({
    amount: BaseSchemas.positiveNumber.optional(), // Partial refund
    reason: z.string().max(500).optional()
  })
}

// Admin validation schemas
export const AdminSchemas = {
  userUpdate: z.object({
    status: BaseSchemas.status.optional(),
    role: BaseSchemas.role.optional(),
    verified: z.boolean().optional()
  }),

  shopUpdate: z.object({
    verified: z.boolean().optional(),
    featured: z.boolean().optional(),
    status: BaseSchemas.status.optional()
  })
}

// Custom validation functions
export const CustomValidators = {
  /**
   * Validate that user exists
   */
  async userExists(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    return !!user
  },

  /**
   * Validate that shop exists
   */
  async shopExists(shopId: string): Promise<boolean> {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true }
    })
    return !!shop
  },

  /**
   * Validate that appointment exists
   */
  async appointmentExists(appointmentId: string): Promise<boolean> {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true }
    })
    return !!appointment
  },

  /**
   * Validate email uniqueness
   */
  async emailUnique(email: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return !user || user.id === excludeId
  },

  /**
   * Validate phone number format
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  },

  /**
   * Validate URL format
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  /**
   * Validate date is in the future
   */
  isFutureDate(date: string): boolean {
    return new Date(date) > new Date()
  },

  /**
   * Validate time is within business hours
   */
  isBusinessHours(time: string, dayOfWeek: number): boolean {
    const hour = parseInt(time.split(':')[0])
    return hour >= 9 && hour <= 21 // 9 AM to 9 PM
  }
}

// Export all schemas
export const ValidationSchemas = {
  Base: BaseSchemas,
  User: UserSchemas,
  Profile: ProfileSchemas,
  Shop: ShopSchemas,
  Appointment: AppointmentSchemas,
  Portfolio: PortfolioSchemas,
  Review: ReviewSchemas,
  Message: MessageSchemas,
  Search: SearchSchemas,
  FileUpload: FileUploadSchemas,
  Payment: PaymentSchemas,
  Admin: AdminSchemas,
  Custom: CustomValidators
}

export default ValidationSchemas
