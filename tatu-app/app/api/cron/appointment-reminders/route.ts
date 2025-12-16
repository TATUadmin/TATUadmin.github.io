import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendAppointmentReminder } from '@/lib/email'
import { addDays, startOfDay, endOfDay } from 'date-fns'

// This endpoint will be called by Vercel Cron Jobs every day at 9 AM
export async function GET() {
  try {
    // Find all confirmed appointments scheduled for tomorrow
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStart = startOfDay(tomorrow)
    const tomorrowEnd = endOfDay(tomorrow)

    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        startTime: {
          gte: tomorrowStart,
          lte: tomorrowEnd,
        },
      },
      include: {
        shop: true,
        artist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: true,
      },
    })

    // Send reminder emails for each appointment
    const reminderPromises = appointments.map(async (appointment) => {
      try {
        await sendAppointmentReminder({
          appointmentTitle: appointment.service.name,
          shopName: appointment.shop.name,
          artistName: appointment.artist.name || 'Your Artist',
          clientName: appointment.client.name || 'Valued Client',
          clientEmail: appointment.client.email,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          serviceName: appointment.service.name,
          notes: appointment.notes || undefined,
        })

        return { success: true, appointmentId: appointment.id }
      } catch (error) {
        console.error(`Error sending reminder for appointment ${appointment.id}:`, error)
        return { success: false, appointmentId: appointment.id, error }
      }
    })

    const results = await Promise.allSettled(reminderPromises)
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length

    return NextResponse.json({
      message: `Successfully sent ${successCount} out of ${appointments.length} reminders`,
      results,
    })
  } catch (error) {
    console.error('Error processing appointment reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Note: Using Node.js runtime (not Edge) because Prisma requires Node.js runtime
// Vercel Cron Jobs work fine with Node.js runtime 