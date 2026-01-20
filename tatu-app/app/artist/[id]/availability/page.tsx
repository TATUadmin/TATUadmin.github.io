'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CalendarIcon, 
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface TimeSlot {
  time: string
  available: boolean
  bookedBy?: string
}

interface DayAvailability {
  date: Date
  slots: TimeSlot[]
}

// Time slots configuration
const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
]

const DAYS_IN_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Mock function to generate availability data
// In a real app, this would come from an API
const generateAvailability = (artistId: string, startDate: Date): DayAvailability[] => {
  const days: DayAvailability[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Generate 14 days of availability
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    date.setHours(0, 0, 0, 0)
    
    // Skip past dates
    if (date < today) continue
    
    const dayOfWeek = date.getDay()
    const slots: TimeSlot[] = TIME_SLOTS.map(time => {
      // Mock logic: weekends have fewer slots, some random slots are booked
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const isAvailable = !isWeekend || Math.random() > 0.3
      const isBooked = isAvailable && Math.random() < 0.2 // 20% of available slots are booked
      
      return {
        time,
        available: isAvailable && !isBooked,
        bookedBy: isBooked ? 'Client' : undefined,
      }
    })
    
    days.push({ date, slots })
  }
  
  return days
}

export default function ArtistAvailabilityPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [availability, setAvailability] = useState<DayAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    loadAvailability()
  }, [artistId])

  const loadAvailability = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      const avail = generateAvailability(artistId, startDate)
      setAvailability(avail)
      setLoading(false)
    }, 500)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string, available: boolean) => {
    if (!available) {
      alert('This time slot is already booked.')
      return
    }
    setSelectedTime(time)
  }

  const convertTimeTo24Hour = (time12h: string): string => {
    const [time, period] = time12h.split(' ')
    const [hours, minutes] = time.split(':')
    let hour24 = parseInt(hours)
    
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    if (period === 'AM' && hour24 === 12) hour24 = 0
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}`
  }

  const handleBookSlot = () => {
    if (!selectedTime) {
      alert('Please select an available time slot.')
      return
    }

    const confirm = window.confirm(
      `Book appointment on ${formatDate(selectedDate)} at ${selectedTime}?`
    )

    if (confirm) {
      // Convert time to 24-hour format for the booking form
      const time24h = convertTimeTo24Hour(selectedTime)
      // Navigate to booking page with pre-filled date and time
      router.push(`/artist/${artistId}/book?date=${formatDateForURL(selectedDate)}&time=${time24h}`)
    }
  }

  const formatDate = (date: Date): string => {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const formatDateShort = (date: Date): string => {
    return `${DAYS_IN_WEEK[date.getDay()]}, ${MONTHS[date.getMonth()].substring(0, 3)} ${date.getDate()}`
  }

  const formatDateForURL = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const getSelectedDaySlots = (): TimeSlot[] => {
    const day = availability.find(
      d => d.date.getTime() === selectedDate.getTime()
    )
    return day?.slots || []
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="bg-black py-8 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/artist/${artistId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Check Availability</h1>
              <p className="text-gray-400">View available time slots and book an appointment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading availability...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendar Section */}
              <div className="lg:col-span-1">
                <h2 className="text-xl font-bold text-white mb-6">Select a Date</h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {availability.map((day, index) => {
                    const isSelected = day.date.getTime() === selectedDate.getTime()
                    const isToday = day.date.toDateString() === new Date().toDateString()
                    const availableCount = day.slots.filter(s => s.available).length
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(day.date)}
                        className={`w-full p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'bg-[#20B2AA] border-[#20B2AA] text-white'
                            : 'bg-transparent border-gray-600 hover:border-gray-500 text-white'
                        } ${isToday && !isSelected ? 'border-white' : ''}`}
                      >
                        <div className="text-left">
                          <div className="font-semibold text-lg mb-1">
                            {DAYS_IN_WEEK[day.date.getDay()]}
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {day.date.getDate()}
                          </div>
                          <div className="text-sm opacity-80">
                            {MONTHS[day.date.getMonth()].substring(0, 3)}
                          </div>
                          <div className="mt-2 text-xs bg-black/20 px-2 py-1 rounded inline-block">
                            {availableCount} slots available
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-white mb-6">
                  Available Times - {formatDateShort(selectedDate)}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {getSelectedDaySlots().map((slot, index) => {
                    const isSelected = selectedTime === slot.time
                    const isBooked = !slot.available
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleTimeSelect(slot.time, slot.available)}
                        disabled={isBooked}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          isSelected
                            ? 'bg-[#20B2AA] border-[#20B2AA] text-white'
                            : isBooked
                            ? 'bg-gray-900 border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-transparent border-gray-600 hover:border-gray-500 text-white hover:bg-gray-900'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          {isBooked ? (
                            <XCircleIcon className="w-5 h-5" />
                          ) : isSelected ? (
                            <CheckCircleIcon className="w-5 h-5" />
                          ) : (
                            <ClockIcon className="w-5 h-5 opacity-50" />
                          )}
                          <span className={`font-semibold ${isBooked ? 'line-through' : ''}`}>
                            {slot.time}
                          </span>
                        </div>
                        {isBooked && (
                          <div className="text-xs mt-2 text-gray-500">Booked</div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Booking Section */}
                {selectedTime && (
                  <div className="bg-transparent border-2 border-gray-600 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Selected Appointment</h3>
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-[#20B2AA]">
                          <CalendarIcon className="w-5 h-5" />
                          <span className="font-medium">{formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#20B2AA] mt-2">
                          <ClockIcon className="w-5 h-5" />
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleBookSlot}
                      disabled={booking}
                      className="w-full bg-[#20B2AA] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1a9a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {booking ? 'Processing...' : 'Book This Slot'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

