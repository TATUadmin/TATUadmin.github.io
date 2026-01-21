import { prisma } from '@/lib/prisma'

interface TimeSlot {
  start: Date
  end: Date
}

/**
 * Checks if two time slots overlap
 */
export function doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  return slot1.start < slot2.end && slot2.start < slot1.end
}

/**
 * Detects conflicts for a specific event against all other events
 * @param userId - The user's ID
 * @param eventId - The event to check (optional, for updates)
 * @param startTime - Start time of the event
 * @param endTime - End time of the event
 * @returns Array of conflicting event IDs
 */
export async function detectEventConflicts(
  userId: string,
  startTime: Date,
  endTime: Date,
  eventId?: string
): Promise<string[]> {
  // Get all events for the user in the same time range
  const potentialConflicts = await prisma.calendarEvent.findMany({
    where: {
      userId,
      deletedAt: null,
      status: {
        not: 'CANCELLED',
      },
      id: eventId ? { not: eventId } : undefined, // Exclude current event if updating
      OR: [
        {
          // Event starts during this period
          startTime: {
            gte: startTime,
            lt: endTime,
          },
        },
        {
          // Event ends during this period
          endTime: {
            gt: startTime,
            lte: endTime,
          },
        },
        {
          // Event spans the entire period
          AND: [
            {
              startTime: {
                lte: startTime,
              },
            },
            {
              endTime: {
                gte: endTime,
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
  })

  // Double-check overlaps (database query might miss edge cases)
  const conflicts = potentialConflicts.filter(event =>
    doTimeSlotsOverlap(
      { start: startTime, end: endTime },
      { start: event.startTime, end: event.endTime }
    )
  )

  return conflicts.map(c => c.id)
}

/**
 * Updates conflict flags for an event and its conflicts
 * @param eventId - The event ID to update
 * @param conflictIds - Array of conflicting event IDs
 */
export async function updateEventConflicts(
  eventId: string,
  conflictIds: string[]
): Promise<void> {
  // Update the event with conflict information
  await prisma.calendarEvent.update({
    where: { id: eventId },
    data: {
      hasConflict: conflictIds.length > 0,
      conflictWith: conflictIds,
    },
  })

  // Update all conflicting events to include this event in their conflicts
  if (conflictIds.length > 0) {
    for (const conflictId of conflictIds) {
      const conflictingEvent = await prisma.calendarEvent.findUnique({
        where: { id: conflictId },
        select: { conflictWith: true },
      })

      if (conflictingEvent) {
        const updatedConflicts = Array.from(
          new Set([...conflictingEvent.conflictWith, eventId])
        )

        await prisma.calendarEvent.update({
          where: { id: conflictId },
          data: {
            hasConflict: true,
            conflictWith: updatedConflicts,
          },
        })
      }
    }
  }
}

/**
 * Recalculates conflicts for all events in a time range
 * Useful after deleting or resolving a conflict
 * @param userId - The user's ID
 * @param startDate - Start of time range
 * @param endDate - End of time range
 */
export async function recalculateConflictsInRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId,
      deletedAt: null,
      status: { not: 'CANCELLED' },
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  // For each event, detect conflicts
  for (const event of events) {
    const conflicts = await detectEventConflicts(
      userId,
      event.startTime,
      event.endTime,
      event.id
    )

    await prisma.calendarEvent.update({
      where: { id: event.id },
      data: {
        hasConflict: conflicts.length > 0,
        conflictWith: conflicts,
      },
    })
  }
}

/**
 * Suggests alternative time slots when conflicts are detected
 * @param userId - The user's ID
 * @param preferredStart - Preferred start time
 * @param duration - Duration in minutes
 * @param daysToSearch - How many days ahead to search
 * @returns Array of available time slots
 */
export async function suggestAlternativeTimeSlots(
  userId: string,
  preferredStart: Date,
  duration: number,
  daysToSearch: number = 7
): Promise<Date[]> {
  const suggestions: Date[] = []
  const durationMs = duration * 60 * 1000

  // Get user's working hours (default 9 AM - 6 PM)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workingHours: true, bufferTime: true },
  })

  const bufferTimeMs = (user?.bufferTime || 15) * 60 * 1000
  const workingHours = (user?.workingHours as any) || {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '18:00' },
    saturday: { start: '10:00', end: '16:00' },
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

  // Get all existing events in the search range
  const endDate = new Date(preferredStart)
  endDate.setDate(endDate.getDate() + daysToSearch)

  const existingEvents = await prisma.calendarEvent.findMany({
    where: {
      userId,
      deletedAt: null,
      status: { not: 'CANCELLED' },
      startTime: {
        gte: preferredStart,
        lte: endDate,
      },
    },
    select: {
      startTime: true,
      endTime: true,
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  // For each day, find available slots
  for (let day = 0; day < daysToSearch && suggestions.length < 5; day++) {
    const checkDate = new Date(preferredStart)
    checkDate.setDate(checkDate.getDate() + day)
    
    const dayName = dayNames[checkDate.getDay()]
    const dayHours = workingHours[dayName]
    
    if (!dayHours) continue // Day is not a working day

    // Parse working hours for this day
    const [startHour, startMin] = dayHours.start.split(':').map(Number)
    const [endHour, endMin] = dayHours.end.split(':').map(Number)
    
    let currentSlot = new Date(checkDate)
    currentSlot.setHours(startHour, startMin, 0, 0)
    
    const dayEnd = new Date(checkDate)
    dayEnd.setHours(endHour, endMin, 0, 0)

    // Check each potential slot
    while (currentSlot < dayEnd && suggestions.length < 5) {
      const slotEnd = new Date(currentSlot.getTime() + durationMs)
      
      if (slotEnd > dayEnd) break // Slot extends beyond working hours

      // Check if this slot conflicts with existing events
      const hasConflict = existingEvents.some(event => {
        const eventStart = new Date(event.startTime).getTime() - bufferTimeMs
        const eventEnd = new Date(event.endTime).getTime() + bufferTimeMs
        const slotStart = currentSlot.getTime()
        const slotEndTime = slotEnd.getTime()
        
        return slotStart < eventEnd && slotEndTime > eventStart
      })

      if (!hasConflict) {
        suggestions.push(new Date(currentSlot))
      }

      // Move to next potential slot (30-minute increments)
      currentSlot = new Date(currentSlot.getTime() + 30 * 60 * 1000)
    }
  }

  return suggestions.slice(0, 5) // Return top 5 suggestions
}
