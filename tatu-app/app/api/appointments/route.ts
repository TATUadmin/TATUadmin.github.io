import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { addAppointmentReminderJob } from '@/lib/background-jobs'

const prisma = new PrismaClient()

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResult = await rateLimiters.api.check(request)
  if (!rateLimitResult.allowed) {
    return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
  }

  // Authentication
  const authContext = await requireAuth(request)
  const { user, requestId } = authContext

  // Validate request data
  const body = await request.json()
  const validationResult = ValidationSchemas.Appointment.create.safeParse(body)
  
  if (!validationResult.success) {
    return ApiResponse.validationError(validationResult.error.errors, { requestId })
  }

  const {
    artistId,
    serviceType,
    preferredDate,
    preferredTime,
    duration,
    budget,
    projectDescription,
    referenceImages,
    specialRequests,
    emergencyContact
  } = validationResult.data

  // Verify artist exists and is available
  const artist = await prisma.user.findUnique({
    where: { 
      id: artistId,
      role: 'ARTIST'
    },
    include: {
      profile: true,
      shop: true
    }
  })

  if (!artist) {
    return ApiResponse.notFound('Artist', { requestId })
  }

  // Check for appointment conflicts
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      artistId,
      preferredDate,
      preferredTime,
      status: {
        in: ['PENDING', 'CONFIRMED']
      }
    }
  })

  if (existingAppointment) {
    return ApiResponse.conflict(
      'Artist is not available at the requested time',
      { conflictingAppointmentId: existingAppointment.id },
      { requestId }
    )
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      artistId,
      clientId: user.id,
      serviceType,
      preferredDate,
      preferredTime,
      duration,
      budget,
      projectDescription,
      referenceImages,
      specialRequests,
      emergencyContact,
      status: 'PENDING'
    },
    include: {
      artist: {
        include: {
          profile: true,
          shop: true
        }
      },
      client: true
    }
  })

  // Schedule appointment reminder (24 hours before)
  const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}:00`)
  const reminderDelay = appointmentDateTime.getTime() - Date.now() - (24 * 60 * 60 * 1000)
  
  if (reminderDelay > 0) {
    await addAppointmentReminderJob(appointment.id, reminderDelay)
  }

  // Log business event
  logger.logBusinessEvent('appointment_created', {
    appointmentId: appointment.id,
    artistId: appointment.artistId,
    clientId: appointment.clientId,
    serviceType: appointment.serviceType,
    budget: appointment.budget
  }, request)

  return ApiResponse.success({
    appointmentId: appointment.id,
    status: appointment.status,
    message: 'Appointment request submitted successfully',
    appointment: {
      id: appointment.id,
      artist: {
        name: appointment.artist.profile?.name || appointment.artist.name,
        shop: appointment.artist.shop?.name
      },
      date: appointment.preferredDate,
      time: appointment.preferredTime,
      service: appointment.serviceType,
      duration: appointment.duration,
      budget: appointment.budget
    }
  }, 201, { requestId })
}) 