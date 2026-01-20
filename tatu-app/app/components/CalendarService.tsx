'use client'

import { useState, useMemo } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  color?: string
  status?: 'confirmed' | 'pending' | 'completed' | 'cancelled'
}

export interface CalendarView {
  type: 'month' | 'week' | 'day'
  currentDate: Date
}

interface CalendarServiceProps {
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  onTimeSlotClick?: (date: Date, time: string) => void
  view?: CalendarView
  onViewChange?: (view: CalendarView) => void
  workingHours?: {
    start: number // hour (0-23)
    end: number // hour (0-23)
  }
  showTimeSlots?: boolean
}

export default function CalendarService({
  events = [],
  onEventClick,
  onDateClick,
  onTimeSlotClick,
  view: externalView,
  onViewChange,
  workingHours = { start: 9, end: 18 },
  showTimeSlots = false
}: CalendarServiceProps) {
  const [internalView, setInternalView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date()
  })

  const view = externalView || internalView
  const setView = onViewChange || ((newView: CalendarView) => setInternalView(newView))

  // Generate time slots for day/week views
  const timeSlots = useMemo(() => {
    const slots: string[] = []
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [workingHours])

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventDate = event.start.toISOString().split('T')[0]
      return eventDate === dateStr
    })
  }

  // Get events for a specific time slot
  const getEventsForTimeSlot = (date: Date, time: string): CalendarEvent[] => {
    const [hours, minutes] = time.split(':').map(Number)
    const slotStart = new Date(date)
    slotStart.setHours(hours, minutes, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + 30)

    return events.filter(event => {
      return event.start >= slotStart && event.start < slotEnd
    })
  }

  // Navigate calendar
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(view.currentDate)
    
    switch (view.type) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }

    setView({ ...view, currentDate: newDate })
  }

  // Go to today
  const goToToday = () => {
    setView({ ...view, currentDate: new Date() })
  }

  // Generate month days
  const generateMonthDays = () => {
    const year = view.currentDate.getFullYear()
    const month = view.currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isToday: boolean
      events: CalendarEvent[]
    }> = []

    // Previous month days
    const prevMonth = new Date(year, month - 1, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === new Date().toDateString(),
        events: getEventsForDate(date)
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === new Date().toDateString(),
        events: getEventsForDate(date)
      })
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === new Date().toDateString(),
        events: getEventsForDate(date)
      })
    }

    return days
  }

  // Generate week days
  const generateWeekDays = () => {
    const startOfWeek = new Date(view.currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const days: Array<{
      date: Date
      events: CalendarEvent[]
    }> = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push({
        date,
        events: getEventsForDate(date)
      })
    }

    return days
  }

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const hour12 = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    const ampm = hours >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`
  }

  // Get event color based on status
  const getEventColor = (event: CalendarEvent) => {
    if (event.color) return event.color
    
    switch (event.status) {
      case 'confirmed':
        return 'bg-white/20 border-white/30'
      case 'pending':
        return 'bg-gray-800 border-gray-700'
      case 'completed':
        return 'bg-white/10 border-gray-800'
      case 'cancelled':
        return 'bg-gray-900 border-gray-800'
      default:
        return 'bg-white/10 border-gray-800'
    }
  }

  return (
    <div className="w-full">
      {/* Calendar Controls */}
      <div className="bg-gray-950 border-b border-gray-900 mb-6">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
              {view.currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            <button
              onClick={goToToday}
              className="ml-4 px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[
              { type: 'month', label: 'Month' },
              { type: 'week', label: 'Week' },
              { type: 'day', label: 'Day' }
            ].map((v) => (
              <button
                key={v.type}
                onClick={() => setView({ ...view, type: v.type as any })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view.type === v.type
                    ? 'bg-white text-black'
                    : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view.type === 'month' && (
        <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 bg-gray-900 border-b border-gray-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {generateMonthDays().map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-800 p-2 ${
                  !day.isCurrentMonth ? 'bg-gray-900/50' : 'bg-gray-950'
                } ${day.isToday ? 'bg-white/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    day.isToday 
                      ? 'text-white bg-white/10 px-2 py-1 rounded' 
                      : day.isCurrentMonth 
                        ? 'text-white' 
                        : 'text-gray-600'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.events.length > 0 && (
                    <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-medium">
                      {day.events.length}
                    </span>
                  )}
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {day.events.slice(0, 2).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`w-full text-left p-2 rounded text-xs transition-colors border ${getEventColor(event)}`}
                    >
                      <div className="font-medium text-white truncate">
                        {event.title}
                      </div>
                      <div className="text-gray-400 truncate">
                        {formatTime(event.start.toTimeString().slice(0, 5))}
                      </div>
                    </button>
                  ))}
                  {day.events.length > 2 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view.type === 'week' && (
        <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
          <div className="grid grid-cols-8 border-b border-gray-800">
            <div className="p-3 bg-gray-900 border-r border-gray-800"></div>
            {generateWeekDays().map((day, i) => (
              <div key={i} className="p-3 bg-gray-900 border-r border-gray-800 text-center">
                <div className="text-sm font-medium text-gray-400">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold text-white">
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-8">
            <div className="border-r border-gray-800">
              {timeSlots.map((time) => (
                <div key={time} className="h-16 border-b border-gray-800 p-2 text-sm text-gray-500">
                  {formatTime(time)}
                </div>
              ))}
            </div>
            
            {generateWeekDays().map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-800">
                {timeSlots.map((time) => {
                  const slotEvents = getEventsForTimeSlot(day.date, time)
                  return (
                    <div key={time} className="h-16 border-b border-gray-800 p-1">
                      {slotEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className={`w-full h-full rounded text-xs p-1 transition-colors text-left border ${getEventColor(event)}`}
                        >
                          <div className="font-medium text-white truncate">
                            {event.title}
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view.type === 'day' && (
        <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-lg font-semibold text-white">
              {view.currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>

          <div className="divide-y divide-gray-800">
            {timeSlots.map((time) => {
              const slotEvents = getEventsForTimeSlot(view.currentDate, time)
              return (
                <div key={time} className="flex items-center p-4">
                  <div className="w-20 text-sm font-medium text-gray-400">
                    {formatTime(time)}
                  </div>
                  <div className="flex-1 ml-4">
                    {slotEvents.length > 0 ? (
                      slotEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => onEventClick?.(event)}
                          className={`w-full text-left p-3 rounded-lg transition-colors border mb-2 ${getEventColor(event)}`}
                        >
                          <div className="font-medium text-white">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-gray-400 mt-1">{event.description}</div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div 
                        className="p-3 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg cursor-pointer hover:border-gray-700 transition-colors"
                        onClick={() => onTimeSlotClick?.(view.currentDate, time)}
                      >
                        Available
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

