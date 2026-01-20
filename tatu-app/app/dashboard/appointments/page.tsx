'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PaintBrushIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  StarIcon,
  CalendarDaysIcon,
  ClockIcon as ClockSolid
} from '@heroicons/react/24/outline'
import { 
  ChevronLeftIcon as ChevronLeftSolid,
  ChevronRightIcon as ChevronRightSolid
} from '@heroicons/react/24/solid'

interface Appointment {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string
  serviceType: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show'
  amount: number
  notes?: string
  isFirstTime: boolean
  tattooSize?: string
  placement?: string
  referenceImages?: string[]
  createdAt: string
}

interface TimeSlot {
  time: string
  available: boolean
  appointment?: Appointment
  isBlocked: boolean
}

interface DaySchedule {
  date: string
  dayOfWeek: string
  dayNumber: number
  isToday: boolean
  isCurrentMonth: boolean
  appointments: Appointment[]
  timeSlots: TimeSlot[]
}

interface CalendarView {
  type: 'month' | 'week' | 'day'
  currentDate: Date
  startDate: Date
  endDate: Date
}

const WORKING_HOURS = {
  start: 9, // 9 AM
  end: 18,  // 6 PM
  slotDuration: 60 // 60 minutes
}

const TIME_SLOTS = Array.from({ length: (WORKING_HOURS.end - WORKING_HOURS.start) }, (_, i) => {
  const hour = WORKING_HOURS.start + i
  return `${hour.toString().padStart(2, '0')}:00`
})

export default function AppointmentsPage() {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [calendarView, setCalendarView] = useState<CalendarView>({
    type: 'month',
    currentDate: new Date(),
    startDate: new Date(),
    endDate: new Date()
  })
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [blockTimeData, setBlockTimeData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: ''
  })

  useEffect(() => {
    if (session?.user) {
      fetchAppointments()
      updateCalendarDates()
    }
  }, [session, calendarView.currentDate, calendarView.type])

  const updateCalendarDates = () => {
    const current = new Date(calendarView.currentDate)
    let start: Date
    let end: Date

    switch (calendarView.type) {
      case 'month':
        start = new Date(current.getFullYear(), current.getMonth(), 1)
        end = new Date(current.getFullYear(), current.getMonth() + 1, 0)
        break
      case 'week':
        const dayOfWeek = current.getDay()
        start = new Date(current)
        start.setDate(current.getDate() - dayOfWeek)
        end = new Date(start)
        end.setDate(start.getDate() + 6)
        break
      case 'day':
        start = new Date(current)
        end = new Date(current)
        break
    }

    setCalendarView(prev => ({ ...prev, startDate: start, endDate: end }))
  }

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/appointments')
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      
      const data = await response.json()
      const appointments: Appointment[] = data.map((appointment: any) => ({
        id: appointment.id,
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        clientEmail: appointment.clientEmail,
        clientPhone: appointment.clientPhone,
        serviceName: appointment.serviceName,
        serviceType: appointment.serviceType,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        status: appointment.status,
        amount: appointment.amount,
        notes: appointment.notes,
        isFirstTime: appointment.isFirstTime || false,
        tattooSize: appointment.tattooSize,
        placement: appointment.placement,
        createdAt: appointment.createdAt
      }))
      
      setAppointments(appointments)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthDays = (): DaySchedule[] => {
    const days: DaySchedule[] = []
    const start = new Date(calendarView.startDate)
    const end = new Date(calendarView.endDate)
    
    // Add days from previous month to fill first week
    const firstDayOfMonth = new Date(start)
    const dayOfWeek = firstDayOfMonth.getDay()
    for (let i = dayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDayOfMonth)
      date.setDate(date.getDate() - i - 1)
      days.push(createDaySchedule(date, false))
    }

    // Add days of current month
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(createDaySchedule(new Date(d), true))
    }

    // Add days from next month to fill last week
    const lastDayOfMonth = new Date(end)
    const lastDayOfWeek = lastDayOfMonth.getDay()
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = new Date(lastDayOfMonth)
      date.setDate(date.getDate() + i)
      days.push(createDaySchedule(date, false))
    }

    return days
  }

  const createDaySchedule = (date: Date, isCurrentMonth: boolean): DaySchedule => {
    const dateString = date.toISOString().split('T')[0]
    const dayAppointments = appointments.filter(apt => apt.date === dateString)
    
    const timeSlots: TimeSlot[] = TIME_SLOTS.map(time => {
      const appointment = dayAppointments.find(apt => apt.startTime === time)
      return {
        time,
        available: !appointment && !isTimeBlocked(dateString, time),
        appointment,
        isBlocked: isTimeBlocked(dateString, time)
      }
    })

    return {
      date: dateString,
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString(),
      isCurrentMonth,
      appointments: dayAppointments,
      timeSlots
    }
  }

  const isTimeBlocked = (date: string, time: string): boolean => {
    // Mock blocked times - in real app, this would come from artist settings
    return false
  }

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarView.currentDate)
    
    switch (calendarView.type) {
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

    setCalendarView(prev => ({ ...prev, currentDate: newDate }))
  }

  const goToToday = () => {
    const today = new Date()
    setCalendarView(prev => ({ ...prev, currentDate: today }))
    setSelectedDate(today)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentModal(true)
  }

  const handleStatusChange = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      // In real app, make API call to update status
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      )
      toast.success('Appointment status updated')
    } catch (error) {
      console.error('Error updating appointment status:', error)
      toast.error('Failed to update appointment status')
    }
  }

  const handleBlockTime = async () => {
    if (!blockTimeData.date || !blockTimeData.startTime || !blockTimeData.endTime) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // In real app, make API call to block time
      toast.success('Time blocked successfully')
      setShowBlockTimeModal(false)
      setBlockTimeData({ date: '', startTime: '', endTime: '', reason: '' })
      fetchAppointments()
    } catch (error) {
      console.error('Error blocking time:', error)
      toast.error('Failed to block time')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-white/20 text-white border border-white/30'
      case 'pending': return 'bg-gray-800 text-gray-300 border border-gray-700'
      case 'completed': return 'bg-white/10 text-gray-300 border border-gray-800'
      case 'cancelled': return 'bg-gray-900 text-gray-500 border border-gray-800'
      case 'no-show': return 'bg-gray-900 text-gray-600 border border-gray-800'
      default: return 'bg-gray-900 text-gray-400 border border-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4" />
      case 'pending': return <ClockIcon className="h-4 w-4" />
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />
      case 'cancelled': return <XMarkIcon className="h-4 w-4" />
      case 'no-show': return <ExclamationTriangleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-gray-400">Please sign in to manage your appointments.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gray-950 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Appointment Calendar</h1>
              <p className="text-gray-400 mt-1">Manage your schedule and client appointments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBlockTimeModal(true)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-gray-700"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Block Time
              </button>
              <button
                onClick={goToToday}
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-gray-950 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              
              <h2 className="text-xl font-semibold text-white">
                {calendarView.currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {[
                { type: 'month', label: 'Month' },
                { type: 'week', label: 'Week' },
                { type: 'day', label: 'Day' }
              ].map((view) => (
                <button
                  key={view.type}
                  onClick={() => setCalendarView(prev => ({ ...prev, type: view.type as any }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    calendarView.type === view.type
                      ? 'bg-white text-black'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {calendarView.type === 'month' && (
          <div className="bg-gray-950 rounded-xl border border-gray-900 overflow-hidden">
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
                      {day.dayNumber}
                    </span>
                    {day.appointments.length > 0 && (
                      <span className="text-xs bg-white text-black px-2 py-1 rounded-full font-medium">
                        {day.appointments.length}
                      </span>
                    )}
                  </div>

                  {/* Appointments for this day */}
                  <div className="space-y-1">
                    {day.appointments.slice(0, 2).map((appointment) => (
                      <button
                        key={appointment.id}
                        onClick={() => handleAppointmentClick(appointment)}
                        className="w-full text-left p-2 bg-white/10 hover:bg-white/20 rounded text-xs transition-colors border border-gray-800"
                      >
                        <div className="font-medium text-white truncate">
                          {appointment.clientName}
                        </div>
                        <div className="text-gray-400 truncate">
                          {formatTime(appointment.startTime)}
                        </div>
                      </button>
                    ))}
                    {day.appointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.appointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {calendarView.type === 'week' && (
          <div className="bg-gray-950 rounded-xl border border-gray-900 overflow-hidden">
            <div className="grid grid-cols-8 border-b border-gray-800">
              <div className="p-3 bg-gray-900 border-r border-gray-800"></div>
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date(calendarView.startDate)
                date.setDate(date.getDate() + i)
                return (
                  <div key={i} className="p-3 bg-gray-900 border-r border-gray-800 text-center">
                    <div className="text-sm font-medium text-gray-400">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-lg font-bold text-white">
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-8">
              <div className="border-r border-gray-800">
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="h-16 border-b border-gray-800 p-2 text-sm text-gray-500">
                    {formatTime(time)}
                  </div>
                ))}
              </div>
              
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const date = new Date(calendarView.startDate)
                date.setDate(date.getDate() + dayIndex)
                const dateString = date.toISOString().split('T')[0]
                const dayAppointments = appointments.filter(apt => apt.date === dateString)
                
                return (
                  <div key={dayIndex} className="border-r border-gray-800">
                    {TIME_SLOTS.map((time) => {
                      const appointment = dayAppointments.find(apt => apt.startTime === time)
                      return (
                        <div key={time} className="h-16 border-b border-gray-800 p-1">
                          {appointment && (
                            <button
                              onClick={() => handleAppointmentClick(appointment)}
                              className="w-full h-full bg-white/10 hover:bg-white/20 rounded text-xs p-1 transition-colors text-left border border-gray-800"
                            >
                              <div className="font-medium text-white truncate">
                                {appointment.clientName}
                              </div>
                              <div className="text-gray-400 truncate">
                                {appointment.serviceName}
                              </div>
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {calendarView.type === 'day' && (
          <div className="bg-gray-950 rounded-xl border border-gray-900 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>

            <div className="divide-y divide-gray-800">
              {TIME_SLOTS.map((time) => {
                const appointment = appointments.find(apt => 
                  apt.date === selectedDate.toISOString().split('T')[0] && 
                  apt.startTime === time
                )
                
                return (
                  <div key={time} className="flex items-center p-4">
                    <div className="w-20 text-sm font-medium text-gray-400">
                      {formatTime(time)}
                    </div>
                    <div className="flex-1 ml-4">
                      {appointment ? (
                        <button
                          onClick={() => handleAppointmentClick(appointment)}
                          className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-gray-800"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-white">{appointment.clientName}</div>
                              <div className="text-sm text-gray-400">{appointment.serviceName}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </button>
                      ) : (
                        <div className="p-3 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
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

      {/* Appointment Detail Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950 border border-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Appointment Details</h2>
                <button
                  onClick={() => setShowAppointmentModal(false)}
                  className="p-2 hover:bg-gray-900 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-white">{selectedAppointment.clientName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-400">{selectedAppointment.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PhoneIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-400">{selectedAppointment.clientPhone}</span>
                    </div>
                    {selectedAppointment.isFirstTime && (
                      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                        <span className="text-sm text-gray-300 font-medium">First-time client</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Appointment Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-400">
                        {new Date(selectedAppointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ClockIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-400">
                        {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <PaintBrushIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-400">{selectedAppointment.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                      <span className="text-white font-medium">{formatPrice(selectedAppointment.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(selectedAppointment.tattooSize || selectedAppointment.placement || selectedAppointment.notes) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Additional Details</h3>
                  <div className="space-y-3">
                    {selectedAppointment.tattooSize && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Size:</span>
                        <span className="ml-2 text-gray-300">{selectedAppointment.tattooSize}</span>
                      </div>
                    )}
                    {selectedAppointment.placement && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Placement:</span>
                        <span className="ml-2 text-gray-300">{selectedAppointment.placement}</span>
                      </div>
                    )}
                    {selectedAppointment.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-400">Notes:</span>
                        <p className="mt-1 text-gray-300">{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Management */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Manage Status</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { status: 'confirmed', label: 'Confirm', color: 'bg-white hover:bg-gray-200 text-black' },
                    { status: 'completed', label: 'Complete', color: 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' },
                    { status: 'cancelled', label: 'Cancel', color: 'bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800' },
                    { status: 'no-show', label: 'No Show', color: 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800' }
                  ].map((action) => (
                    <button
                      key={action.status}
                      onClick={() => handleStatusChange(selectedAppointment.id, action.status as any)}
                      disabled={selectedAppointment.status === action.status}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedAppointment.status === action.status
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800'
                          : action.color
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Time Modal */}
      {showBlockTimeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950 border border-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Block Time</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                <input
                  type="date"
                  value={blockTimeData.date}
                  onChange={(e) => setBlockTimeData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Start Time</label>
                  <select
                    value={blockTimeData.startTime}
                    onChange={(e) => setBlockTimeData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                  >
                    <option value="">Select time</option>
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">End Time</label>
                  <select
                    value={blockTimeData.endTime}
                    onChange={(e) => setBlockTimeData(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                  >
                    <option value="">Select time</option>
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Reason (Optional)</label>
                <textarea
                  value={blockTimeData.reason}
                  onChange={(e) => setBlockTimeData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white placeholder-gray-600 focus:ring-2 focus:ring-white focus:border-white transition-colors"
                  placeholder="Why are you blocking this time?"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowBlockTimeModal(false)
                  setBlockTimeData({ date: '', startTime: '', endTime: '', reason: '' })
                }}
                className="px-4 py-2 text-gray-400 bg-gray-900 border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockTime}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors font-medium"
              >
                Block Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
