import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // For now, simplify auth - in production use proper auth
    const { 
      artistId, 
      serviceType, 
      preferredDate, 
      preferredTime, 
      duration, 
      budget, 
      projectDescription, 
      tattooSize, 
      placement, 
      isFirstTattoo 
    } = await request.json()

    if (!artistId || !preferredDate || !preferredTime || !projectDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify artist exists
    const artist = await prisma.user.findUnique({
      where: { 
        id: artistId,
        role: 'ARTIST'
      }
    })

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // For Phase 2, we'll log the appointment request instead of saving to DB
    // This allows the booking flow to work while we finalize the schema
    console.log('Appointment Request:', {
      artistId,
      serviceType,
      scheduledAt: `${preferredDate}T${preferredTime}:00`,
      duration: parseInt(duration) || 60,
      notes: `Project: ${projectDescription}\nPlacement: ${placement}\nSize: ${tattooSize}\nBudget: ${budget}\nFirst tattoo: ${isFirstTattoo ? 'Yes' : 'No'}`
    })

    return NextResponse.json({ 
      success: true, 
      appointmentId: 'temp-' + Date.now(),
      message: 'Consultation request submitted successfully' 
    })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
} 