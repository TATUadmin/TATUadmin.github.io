'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Calendar, Plus, Settings, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import CalendarService, {
  CalendarEvent as CalendarServiceEvent,
  CalendarView as CalendarServiceView
} from './CalendarService'

type UserTier = 'FREE' | 'PRO' | 'STUDIO'

interface CalendarSource {
  id: string
  name: string
  provider: string
  color: string
  enabled: boolean
  isDefault: boolean
}

interface CalendarEvent {
  id: string
  calendarId: string
  title: string
  description?: string | null
  location?: string | null
  startTime: Date
  endTime: Date
  status?: string | null
  hasConflict?: boolean
  clientName?: string | null
  calendar: {
    id: string
    name: string
    provider: string
    color: string
  }
}

interface UnifiedCalendarProps {
  userId: string
  userTier: UserTier
}

const defaultEventForm = {
  calendarId: '',
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  description: '',
  clientName: '',
  location: '',
  eventType: 'PERSONAL' as 'BOOKING' | 'MANUAL_BLOCK' | 'PERSONAL',
  visibility: 'PRIVATE' as 'PRIVATE' | 'PUBLIC_BUSY' | 'PUBLIC_AVAILABLE'
}

const defaultCalendarForm = {
  name: '',
      provider: 'TATU',
  color: '#FFFFFF'
}

const mapStatus = (status?: string | null): CalendarServiceEvent['status'] => {
  switch (status) {
    case 'CONFIRMED':
      return 'confirmed'
    case 'TENTATIVE':
      return 'pending'
    case 'COMPLETED':
      return 'completed'
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'cancelled'
    default:
      return 'pending'
  }
}

const getDateRangeForView = (view: CalendarServiceView) => {
  const current = new Date(view.currentDate)
  let start = new Date(current)
  let end = new Date(current)

  if (view.type === 'month') {
    start = new Date(current.getFullYear(), current.getMonth(), 1)
    end = new Date(current.getFullYear(), current.getMonth() + 1, 0)
  } else if (view.type === 'week') {
    const dayOfWeek = current.getDay()
    start = new Date(current)
    start.setDate(current.getDate() - dayOfWeek)
    end = new Date(start)
    end.setDate(start.getDate() + 6)
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

const getDefaultEndTime = (startTime: string) => {
  if (!startTime) return ''
  const [hours, minutes] = startTime.split(':').map(Number)
  const endDate = new Date()
  endDate.setHours(hours, minutes || 0, 0, 0)
  endDate.setHours(endDate.getHours() + 1)
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

export default function UnifiedCalendar({ userId, userTier }: UnifiedCalendarProps) {
  const [view, setView] = useState<CalendarServiceView>({
    type: 'month',
    currentDate: new Date()
  })
  const [calendars, setCalendars] = useState<CalendarSource[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState({ calendars: true, events: true })
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [eventForm, setEventForm] = useState(defaultEventForm)
  const [calendarForm, setCalendarForm] = useState(defaultCalendarForm)
  const [isSaving, setIsSaving] = useState(false)

  const enabledCalendarIds = useMemo(() => {
    return new Set(calendars.filter(calendar => calendar.enabled).map(calendar => calendar.id))
  }, [calendars])

  const visibleEvents = useMemo(() => {
    return events.filter(event => enabledCalendarIds.has(event.calendarId))
  }, [events, enabledCalendarIds])

  const calendarServiceEvents: CalendarServiceEvent[] = useMemo(() => {
    return visibleEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startTime,
      end: event.endTime,
      description: event.description || undefined,
      status: mapStatus(event.status),
      color: event.calendar?.color || '#FFFFFF'
    }))
  }, [visibleEvents])

  const hasConflicts = visibleEvents.some(event => event.hasConflict)

  const loadCalendars = async () => {
    setIsLoading(prev => ({ ...prev, calendars: true }))
    try {
      const response = await fetch('/api/calendar')
      if (!response.ok) {
        throw new Error('Failed to fetch calendars')
      }
      const data = await response.json()
      let fetchedCalendars: CalendarSource[] = (data.calendars || []).map((calendar: any) => ({
        id: calendar.id,
        name: calendar.name,
        provider: calendar.provider,
        color: calendar.color || '#FFFFFF',
        enabled: calendar.syncEnabled !== false, // Default to true if not specified
        isDefault: calendar.isDefault
      }))
      
      // Deduplicate calendars: keep only one calendar per name+provider combination
      // Prefer the default calendar if multiple exist, otherwise keep the first one
      const seen = new Map<string, CalendarSource>()
      fetchedCalendars.forEach(calendar => {
        const key = `${calendar.name}|${calendar.provider}`
        const existing = seen.get(key)
        if (!existing) {
          seen.set(key, calendar)
        } else {
          // If current calendar is default, replace the existing one
          if (calendar.isDefault && !existing.isDefault) {
            seen.set(key, calendar)
          }
          // Otherwise keep the existing one (first occurrence)
        }
      })
      fetchedCalendars = Array.from(seen.values())
      
      // If no calendars exist, create a default one
      if (fetchedCalendars.length === 0) {
        try {
          const createResponse = await fetch('/api/calendar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'My Calendar',
              provider: 'TATU',
              color: '#FFFFFF',
              isDefault: true
            })
          })
          if (createResponse.ok) {
            const newCalendar = await createResponse.json()
            fetchedCalendars = [{
              id: newCalendar.calendar.id,
              name: newCalendar.calendar.name,
              provider: newCalendar.calendar.provider,
              color: newCalendar.calendar.color || '#FFFFFF',
              enabled: true,
              isDefault: true
            }]
          }
        } catch (createError) {
          console.error('Error creating default calendar:', createError)
        }
      }
      
      setCalendars(fetchedCalendars)
    } catch (error) {
      console.error('Error loading calendars:', error)
      toast.error('Failed to load calendars')
    } finally {
      setIsLoading(prev => ({ ...prev, calendars: false }))
    }
  }

  const loadEvents = async () => {
    setIsLoading(prev => ({ ...prev, events: true }))
    try {
      const { start, end } = getDateRangeForView(view)
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })
      const response = await fetch(`/api/calendar/events?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }
      const data = await response.json()
      const fetchedEvents: CalendarEvent[] = (data.events || []).map((event: any) => ({
        id: event.id,
        calendarId: event.calendarId,
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        status: event.status,
        hasConflict: event.hasConflict,
        clientName: event.clientName,
        calendar: event.calendar
      }))
      setEvents(fetchedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setIsLoading(prev => ({ ...prev, events: false }))
    }
  }

  useEffect(() => {
    loadCalendars()
  }, [])

  // Update event form calendarId when calendars load and modal is open
  useEffect(() => {
    if (showCreateEventModal && calendars.length > 0 && !eventForm.calendarId) {
      const defaultCalendarId =
        calendars.find(calendar => calendar.isDefault)?.id || calendars[0]?.id || ''
      if (defaultCalendarId) {
        setEventForm(prev => ({ ...prev, calendarId: defaultCalendarId }))
      }
    }
  }, [calendars, showCreateEventModal])

  useEffect(() => {
    loadEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.type, view.currentDate])

  const toggleCalendar = (calendarId: string) => {
    setCalendars(prev =>
      prev.map(calendar =>
        calendar.id === calendarId ? { ...calendar, enabled: !calendar.enabled } : calendar
      )
    )
  }

  const openCreateEventModal = (date?: Date, time?: string, eventType: 'BOOKING' | 'MANUAL_BLOCK' | 'PERSONAL' = 'PERSONAL') => {
    const defaultCalendarId =
      calendars.find(calendar => calendar.isDefault)?.id || calendars[0]?.id || ''
    const prefillDate = date ? date.toISOString().split('T')[0] : ''
    const prefillStartTime = time || ''
    const prefillEndTime = time ? getDefaultEndTime(time) : ''

    setEventForm({
      ...defaultEventForm,
      calendarId: defaultCalendarId,
      date: prefillDate,
      startTime: prefillStartTime,
      endTime: prefillEndTime,
      eventType: eventType
    })
    setShowCreateEventModal(true)
  }

  const handleCreateEvent = async () => {
    // Validate required fields with specific error messages
    if (!eventForm.calendarId) {
      toast.error('Please select a calendar')
      return
    }
    if (!eventForm.title || eventForm.title.trim() === '') {
      toast.error('Please enter an event title')
      return
    }
    if (!eventForm.date) {
      toast.error('Please select a date')
      return
    }
    if (!eventForm.startTime) {
      toast.error('Please enter a start time')
      return
    }

    const endTime = eventForm.endTime || getDefaultEndTime(eventForm.startTime)
    if (!endTime) {
      toast.error('Please provide an end time')
      return
    }

    const startDateTime = new Date(`${eventForm.date}T${eventForm.startTime}`)
    const endDateTime = new Date(`${eventForm.date}T${endTime}`)

    setIsSaving(true)
    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: eventForm.calendarId,
          title: eventForm.title,
          description: eventForm.description || undefined,
          location: eventForm.location || undefined,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          clientName: eventForm.clientName || undefined,
          eventType: eventForm.eventType || 'PERSONAL',
          visibility: eventForm.visibility || 'PRIVATE',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 409) {
          throw new Error(errorData.error || 'Time slot is already booked')
        }
        throw new Error(errorData.error || 'Failed to create event')
      }

      toast.success('Event created')
      setShowCreateEventModal(false)
      setEventForm(defaultEventForm)
      loadEvents()
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error?.message || 'Failed to create event')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateCalendar = async () => {
    if (!calendarForm.name || !calendarForm.provider) {
      toast.error('Please provide a calendar name')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: calendarForm.name,
          provider: calendarForm.provider,
          color: calendarForm.color,
          isDefault: calendars.length === 0
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create calendar')
      }

      toast.success('Calendar created')
      setShowCreateCalendarModal(false)
      setCalendarForm(defaultCalendarForm)
      loadCalendars()
    } catch (error: any) {
      console.error('Error creating calendar:', error)
      toast.error(error?.message || 'Failed to create calendar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEventClick = (event: CalendarServiceEvent) => {
    const matchedEvent = visibleEvents.find(item => item.id === event.id) || null
    setSelectedEvent(matchedEvent)
    setShowEventModal(true)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-900 bg-gray-950 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Calendars
          </h3>

          {isLoading.calendars ? (
            <div className="text-sm text-gray-500">Loading calendars...</div>
          ) : calendars.length === 0 ? (
            <div className="rounded-lg border border-gray-800 bg-black p-4 text-sm text-gray-400">
              No calendars yet. Create one to start scheduling.
            </div>
          ) : (
          <div className="space-y-3">
              {calendars.map(calendar => (
                <div
                  key={calendar.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-black px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div
                      className="h-2.5 w-2.5 rounded-full" 
                      style={{ backgroundColor: calendar.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{calendar.name}</p>
                      <p className="text-xs text-gray-500">{calendar.provider}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCalendar(calendar.id)}
                    className={`text-xs font-medium px-2 py-1 rounded border ${
                      calendar.enabled
                        ? 'bg-white text-black border-white'
                        : 'bg-black text-gray-400 border-gray-800'
                    }`}
                  >
                    {calendar.enabled ? 'On' : 'Off'}
                  </button>
              </div>
            ))}
          </div>
          )}

          <button
            onClick={() => setShowCreateCalendarModal(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus size={18} />
            New Calendar
          </button>
        </div>

        {hasConflicts && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-white mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-white">Conflicts detected</p>
                <p className="text-xs text-gray-400 mt-1">
                  Some events overlap. Review the event details to resolve.
                </p>
              </div>
            </div>
          </div>
        )}

        {userTier === 'FREE' && (
          <div className="mt-6 p-4 border border-gray-800 rounded-lg bg-black">
            <h4 className="text-sm font-semibold text-white">Upgrade for more syncs</h4>
            <p className="text-xs text-gray-500 mt-1">
              Connect more calendars and unlock advanced scheduling tools.
            </p>
            <button className="mt-3 w-full px-3 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Upgrade Plan
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <section className="flex-1 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Unified Calendar</h2>
            <p className="text-sm text-gray-400">
              {visibleEvents.length} events in view
            </p>
          </div>
          <div className="flex items-center gap-2">
              <button
              onClick={() => openCreateEventModal()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Plus size={18} />
              Add Event
            </button>
            <button className="p-2 bg-black border border-gray-800 rounded-lg hover:bg-gray-900 transition-colors">
              <Settings size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        {isLoading.events ? (
          <div className="text-sm text-gray-500">Loading events...</div>
        ) : (
          <CalendarService
            events={calendarServiceEvents}
            view={view}
            onViewChange={setView}
            onEventClick={handleEventClick}
            onDateClick={(date) => openCreateEventModal(date, undefined, 'PERSONAL')}
            onTimeSlotClick={(date, time) => openCreateEventModal(date, time, 'PERSONAL')}
            showTimeSlots
          />
        )}
      </section>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl rounded-lg border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Event Details</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-900 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <p className="text-xs text-gray-500">Title</p>
                <p className="text-white">{selectedEvent.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Calendar</p>
                <p className="text-white">{selectedEvent.calendar?.name}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Start</p>
                  <p className="text-white">
                    {selectedEvent.startTime.toLocaleString()}
                  </p>
                    </div>
                <div>
                  <p className="text-xs text-gray-500">End</p>
                  <p className="text-white">{selectedEvent.endTime.toLocaleString()}</p>
                    </div>
                  </div>
              {selectedEvent.location && (
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-white">{selectedEvent.location}</p>
                </div>
              )}
              {selectedEvent.clientName && (
                      <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="text-white">{selectedEvent.clientName}</p>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-white">{selectedEvent.description}</p>
                </div>
                          )}
                        </div>
                      </div>
                      </div>
                    )}

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl rounded-lg border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Event</h3>
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-900 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Calendar <span className="text-red-500">*</span>
                </label>
                <select
                  value={eventForm.calendarId}
                  onChange={event => setEventForm(prev => ({ ...prev, calendarId: event.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 text-sm text-white focus:outline-none ${
                    !eventForm.calendarId ? 'border-red-500 bg-black' : 'border-gray-800 bg-black focus:border-white'
                  }`}
                  required
                >
                  <option value="">Select calendar</option>
                  {calendars.map(calendar => (
                    <option key={calendar.id} value={calendar.id}>
                      {calendar.name}
                    </option>
                  ))}
                </select>
                {calendars.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No calendars available. Please create a calendar first.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={event => setEventForm(prev => ({ ...prev, title: event.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 text-sm text-white focus:outline-none ${
                    !eventForm.title ? 'border-red-500 bg-black' : 'border-gray-800 bg-black focus:border-white'
                  }`}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={event => setEventForm(prev => ({ ...prev, date: event.target.value }))}
                    className={`w-full rounded-md border px-3 py-2 text-sm text-white focus:outline-none ${
                      !eventForm.date ? 'border-red-500 bg-black' : 'border-gray-800 bg-black focus:border-white'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Start <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={event =>
                      setEventForm(prev => ({
                        ...prev,
                        startTime: event.target.value,
                        endTime: prev.endTime || getDefaultEndTime(event.target.value)
                      }))
                    }
                    className={`w-full rounded-md border px-3 py-2 text-sm text-white focus:outline-none ${
                      !eventForm.startTime ? 'border-red-500 bg-black' : 'border-gray-800 bg-black focus:border-white'
                    }`}
                    required
                  />
                  </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">End</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={event => setEventForm(prev => ({ ...prev, endTime: event.target.value }))}
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Client</label>
                <input
                  type="text"
                  value={eventForm.clientName}
                  onChange={event => setEventForm(prev => ({ ...prev, clientName: event.target.value }))}
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={event => setEventForm(prev => ({ ...prev, location: event.target.value }))}
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={eventForm.description}
                  onChange={event => setEventForm(prev => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Event Type</label>
                  <select
                    value={eventForm.eventType}
                    onChange={event => setEventForm(prev => ({ ...prev, eventType: event.target.value as any }))}
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="PERSONAL">Personal Event</option>
                    <option value="MANUAL_BLOCK">Block Time</option>
                    <option value="BOOKING">Client Booking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Visibility</label>
                  <select
                    value={eventForm.visibility}
                    onChange={event => setEventForm(prev => ({ ...prev, visibility: event.target.value as any }))}
                    className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  >
                    <option value="PRIVATE">Private</option>
                    <option value="PUBLIC_BUSY">Public (Shows as Busy)</option>
                    <option value="PUBLIC_AVAILABLE">Public (Shows as Available)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateEventModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-800 text-gray-300 hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-60"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Calendar Modal */}
      {showCreateCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">New Calendar</h3>
              <button
                onClick={() => setShowCreateCalendarModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-900 hover:text-white"
              >
                <X size={18} />
              </button>
        </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={calendarForm.name}
                  onChange={event => setCalendarForm(prev => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                />
              </div>
            <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Provider</label>
                <select
                  value={calendarForm.provider}
                  onChange={event => setCalendarForm(prev => ({ ...prev, provider: event.target.value }))}
                  className="w-full rounded-md border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                >
                  <option value="TATU">TATU</option>
                  <option value="MANUAL">Manual</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateCalendarModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-800 text-gray-300 hover:bg-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCalendar}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 disabled:opacity-60"
              >
                Create Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
