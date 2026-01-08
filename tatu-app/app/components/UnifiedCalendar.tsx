'use client'

import { useState } from 'react'
import { Calendar, Clock, User, MapPin, AlertCircle, Plus, Settings } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  calendarSource: string
  calendarColor: string
  clientName?: string
  location?: string
  hasConflict?: boolean
  description?: string
}

interface CalendarSource {
  id: string
  name: string
  provider: string
  color: string
  enabled: boolean
  locked?: boolean
  upgradeRequired?: string
}

interface UnifiedCalendarProps {
  userId: string
  userTier: 'FREE' | 'PRO' | 'STUDIO'
}

export default function UnifiedCalendar({ userId, userTier }: UnifiedCalendarProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showConnectModal, setShowConnectModal] = useState(false)

  // Mock data - will be replaced with real API calls
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([
    {
      id: '1',
      name: 'TATU Bookings',
      provider: 'TATU',
      color: '#06B6D4',
      enabled: true,
    },
    {
      id: '2',
      name: 'Google Calendar',
      provider: 'GOOGLE',
      color: '#4285F4',
      enabled: true,
    },
    {
      id: '3',
      name: 'Square Appointments',
      provider: 'SQUARE',
      color: '#000000',
      enabled: false,
      locked: userTier === 'FREE',
      upgradeRequired: userTier === 'FREE' ? 'PRO' : undefined,
    },
  ])

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Full Sleeve Session - Sarah',
      startTime: new Date(2026, 0, 9, 10, 0),
      endTime: new Date(2026, 0, 9, 14, 0),
      calendarSource: 'TATU Bookings',
      calendarColor: '#06B6D4',
      clientName: 'Sarah Johnson',
      location: 'Studio',
    },
    {
      id: '2',
      title: 'Consultation - Mike',
      startTime: new Date(2026, 0, 9, 15, 0),
      endTime: new Date(2026, 0, 9, 16, 0),
      calendarSource: 'Google Calendar',
      calendarColor: '#4285F4',
      clientName: 'Mike Chen',
      hasConflict: false,
    },
  ])

  const toggleCalendarSource = (sourceId: string) => {
    setCalendarSources(sources =>
      sources.map(source =>
        source.id === sourceId ? { ...source, enabled: !source.enabled } : source
      )
    )
  }

  const getEnabledEvents = () => {
    const enabledSources = new Set(
      calendarSources.filter(s => s.enabled).map(s => s.name)
    )
    return events.filter(e => enabledSources.has(e.calendarSource))
  }

  const hasConflicts = events.some(e => e.hasConflict)

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar: Calendar Sources */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Calendar Sources
          </h3>

          <div className="space-y-3">
            {calendarSources.map(source => (
              <div
                key={source.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  source.enabled ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                } ${source.locked ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{source.name}</p>
                    {source.locked && source.upgradeRequired && (
                      <p className="text-xs text-orange-600">
                        Upgrade to {source.upgradeRequired}
                      </p>
                    )}
                  </div>
                </div>
                {!source.locked ? (
                  <button
                    onClick={() => toggleCalendarSource(source.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      source.enabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        source.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : (
                  <span className="text-xs text-gray-400 font-medium px-2 py-1 bg-gray-100 rounded">
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowConnectModal(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Connect Calendar
          </button>
        </div>

        {/* Conflict Warning */}
        {hasConflicts && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Conflicts Detected
                </p>
                <p className="text-xs text-red-700 mt-1">
                  You have overlapping appointments
                </p>
                <button className="text-xs text-red-600 underline mt-2">
                  View conflicts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">This Week</h4>
          <div className="space-y-1 text-sm text-blue-700">
            <p>📅 {getEnabledEvents().length} appointments</p>
            <p>⏰ 12 hours booked</p>
            <p>💰 $2,400 estimated</p>
          </div>
        </div>

        {/* Upgrade Prompt for Free Tier */}
        {userTier === 'FREE' && (
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-bold text-gray-900 mb-2">
              Unlock More Calendars
            </h4>
            <p className="text-xs text-gray-700 mb-3">
              Connect Square, Calendly, and more with PRO
            </p>
            <button className="w-full px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
              Upgrade to PRO
            </button>
          </div>
        )}
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {getEnabledEvents().length} appointments visible
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('day')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'day'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'week'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
            </div>

            {/* Add Event Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <Plus size={18} />
              Add Event
            </button>

            {/* Settings */}
            <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings size={20} className="text-gray-700" />
            </button>
          </div>
        </div>

        {/* Calendar Grid (Simplified for MVP) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="space-y-4">
            {/* Time-based event list (simplified view) */}
            {getEnabledEvents().length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No appointments scheduled</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add an event or connect more calendars
                </p>
              </div>
            ) : (
              getEnabledEvents().map(event => (
                <div
                  key={event.id}
                  className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  style={{ borderLeftColor: event.calendarColor, borderLeftWidth: '4px' }}
                >
                  <div className="flex-shrink-0 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {event.startTime.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {event.startTime.getDate()}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {event.startTime.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                            {' - '}
                            {event.endTime.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {event.clientName && (
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {event.clientName}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: `${event.calendarColor}20`,
                          color: event.calendarColor 
                        }}
                      >
                        {event.calendarSource}
                      </span>
                    </div>
                    {event.hasConflict && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle size={12} />
                        Conflict detected
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Feature Coming Soon Banner */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-2xl">🚀</div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">
                Full Calendar Coming Soon!
              </h4>
              <p className="text-xs text-gray-700 mt-1">
                Interactive drag-and-drop, conflict detection, smart scheduling, and more. 
                This is an early preview - the complete unified calendar is in development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

