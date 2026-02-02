import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as Sentry from '@sentry/nextjs'
import { requireAuth } from '@/lib/auth-middleware'
import { ValidationSchemas } from '@/lib/validation'
import { ApiResponse, withErrorHandling } from '@/lib/api-response'
import { rateLimiters } from '@/lib/rate-limit'
import { logger } from '@/lib/monitoring'
import { addAppointmentReminderJob } from '@/lib/background-jobs'

const prisma = new PrismaClient()

// GET - Fetch appointments for the current user
export async function GET(request: NextRequest) {
  try {
    const authContext = await requireAuth(request)
    const { user } = authContext

    // Fetch appointments based on user role
    const whereClause = user.role === 'ARTIST' 
      ? { artistId: user.id }
      : { clientId: user.id }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        Appointment_artistIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            ArtistProfile: {
              select: {
                avatar: true,
                phone: true
              }
            }
          }
        },
        Appointment_clientIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            CustomerProfile: {
              select: {
                phone: true
              }
            }
          }
        },
        Service: true
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    // Transform the data for the frontend
    const transformedAppointments = appointments.map(apt => ({
      id: apt.id,
      artistId: apt.artistId,
      artistName: apt.Appointment_artistIdToUser?.name || 'Unknown Artist',
      artistEmail: apt.Appointment_artistIdToUser?.email || '',
      artistAvatar: apt.Appointment_artistIdToUser?.ArtistProfile?.avatar || null,
      clientId: apt.clientId,
      clientName: apt.Appointment_clientIdToUser?.name || 'Unknown Client',
      clientEmail: apt.Appointment_clientIdToUser?.email || '',
      clientPhone: apt.Appointment_clientIdToUser?.CustomerProfile?.phone || '',
      serviceName: apt.Service?.name || apt.notes || 'Tattoo Session',
      serviceType: apt.Service?.name || 'Tattoo',
      date: apt.startTime.toISOString().split('T')[0],
      startTime: apt.startTime.toISOString().split('T')[1].substring(0, 5),
      endTime: apt.endTime.toISOString().split('T')[1].substring(0, 5),
      duration: Math.round((apt.endTime.getTime() - apt.startTime.getTime()) / 60000),
      status: apt.status.toLowerCase(),
      amount: 0,
      notes: apt.notes,
      isFirstTime: false,
      createdAt: apt.createdAt.toISOString()
    }))

    return NextResponse.json(transformedAppointments)
  } catch (error: any) {
    console.error('Error fetching appointments:', error)
    
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/appointments',
    },
    async (span: any) => {
      // Rate limiting
      const rateLimitResult = await rateLimiters.api.check(request)
      if (!rateLimitResult.allowed) {
        span.setAttribute('rate_limited', true)
        return ApiResponse.rateLimited('Too many requests', rateLimitResult.retryAfter)
      }

      // Authentication
      const authContext = await requireAuth(request)
      const { user, requestId } = authContext
      span.setAttribute('user_id', user.id)
      span.setAttribute('request_id', requestId)

      // Validate request data
      const body = await request.json()
      const validationResult = ValidationSchemas.Appointment.create.safeParse(body)
      
      if (!validationResult.success) {
        span.setAttribute('validation_failed', true)
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

      span.setAttribute('artist_id', artistId)
      span.setAttribute('service_type', serviceType)
      span.setAttribute('preferred_date', preferredDate)

      // Verify artist exists and is available
      const artist = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'Find Artist',
        },
        async (artistSpan: any) => {
          artistSpan.setAttribute('artist_id', artistId)
          return await prisma.user.findUnique({
            where: { 
              id: artistId,
              role: 'ARTIST'
            },
            include: {
              ArtistProfile: true,
              Shop: true
            }
          })
        }
      )

      if (!artist) {
        span.setAttribute('artist_not_found', true)
        return ApiResponse.notFound('Artist', { requestId })
      }

      // Check for appointment conflicts
      const existingAppointment = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'Check Appointment Conflicts',
        },
        async (conflictSpan: any) => {
          conflictSpan.setAttribute('artist_id', artistId)
          conflictSpan.setAttribute('preferred_date', preferredDate)
          conflictSpan.setAttribute('preferred_time', preferredTime)
          return await prisma.appointment.findFirst({
            where: {
              artistId,
              preferredDate,
              preferredTime,
              status: {
                in: ['PENDING', 'CONFIRMED']
              }
            }
          })
        }
      )

      if (existingAppointment) {
        span.setAttribute('conflict_detected', true)
        span.setAttribute('conflicting_appointment_id', existingAppointment.id)
        return ApiResponse.conflict(
          'Artist is not available at the requested time',
          { conflictingAppointmentId: existingAppointment.id },
          { requestId }
        )
      }

      // Create appointment
      const appointment = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'Create Appointment',
        },
        async (createSpan: any) => {
          createSpan.setAttribute('artist_id', artistId)
          createSpan.setAttribute('client_id', user.id)
          createSpan.setAttribute('service_type', serviceType)
          return await prisma.appointment.create({
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
              Appointment_artistIdToUser: {
                include: {
                  ArtistProfile: true,
                  Shop: true
                }
              },
              Appointment_clientIdToUser: true
            }
          })
        }
      )

      span.setAttribute('appointment_id', appointment.id)

      // Schedule appointment reminder (24 hours before)
      const appointmentDateTime = new Date(`${preferredDate}T${preferredTime}:00`)
      const reminderDelay = appointmentDateTime.getTime() - Date.now() - (24 * 60 * 60 * 1000)
      
      if (reminderDelay > 0) {
        await Sentry.startSpan(
          {
            op: 'queue.job',
            name: 'Schedule Appointment Reminder',
          },
          async (jobSpan: any) => {
            jobSpan.setAttribute('appointment_id', appointment.id)
            jobSpan.setAttribute('reminder_delay_ms', reminderDelay)
            await addAppointmentReminderJob(appointment.id, reminderDelay)
          }
        )
      }

      // Log business event
      logger.logBusinessEvent('appointment_created', {
        appointmentId: appointment.id,
        artistId: appointment.artistId,
        clientId: appointment.clientId,
        serviceType: appointment.serviceType,
        budget: appointment.budget
      }, request)

      span.setAttribute('status', 'success')
      const appointmentArtist = appointment.Appointment_artistIdToUser
      return ApiResponse.success({
        appointmentId: appointment.id,
        status: appointment.status,
        message: 'Appointment request submitted successfully',
        appointment: {
          id: appointment.id,
          artist: {
            name: appointmentArtist?.ArtistProfile?.bio || appointmentArtist?.name || 'Artist',
            shop: appointmentArtist?.Shop?.[0]?.name
          },
          date: appointment.preferredDate,
          time: appointment.preferredTime,
          service: appointment.serviceType,
          duration: appointment.duration,
          budget: appointment.budget
        }
      }, 201, { requestId })
    }
  )
}) 