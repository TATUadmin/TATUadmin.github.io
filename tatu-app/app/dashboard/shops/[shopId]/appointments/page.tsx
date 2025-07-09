'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import AppointmentForm from './AppointmentForm'
import styles from './styles.module.css'

interface Appointment {
  id: string
  title: string
  start: string
  end: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  artistId: string
  clientId: string
  serviceId: string
  notes?: string
  client: {
    name: string | null
    email: string
  }
}

interface Artist {
  id: string
  name: string | null
  email: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

export default function AppointmentsPage({ params }: { params: { shopId: string } }) {
  const { data: session } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<{ start: Date; end: Date } | null>(null)

  useEffect(() => {
    fetchAppointments()
    fetchArtists()
    fetchServices()
  }, [params.shopId])

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}/appointments`)
      if (!response.ok) throw new Error('Failed to fetch appointments')
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast.error('Failed to load appointments')
    }
  }

  const fetchArtists = async () => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}/artists`)
      if (!response.ok) throw new Error('Failed to fetch artists')
      const data = await response.json()
      setArtists(data)
    } catch (error) {
      console.error('Error fetching artists:', error)
      toast.error('Failed to load artists')
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/shops/${params.shopId}/services`)
      if (!response.ok) throw new Error('Failed to fetch services')
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast.error('Failed to load services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate({
      start: selectInfo.start,
      end: selectInfo.end,
    })
    setSelectedAppointment(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (clickInfo: any) => {
    const appointment = appointments.find(apt => apt.id === clickInfo.event.id)
    if (appointment) {
      setSelectedAppointment(appointment)
      setSelectedDate(null)
      setIsModalOpen(true)
    }
  }

  const handleAppointmentSubmit = async (formData: any) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/shops/${params.shopId}/appointments${selectedAppointment ? `/${selectedAppointment.id}` : ''}`, {
        method: selectedAppointment ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save appointment')
      }

      toast.success(`Appointment ${selectedAppointment ? 'updated' : 'created'} successfully`)
      fetchAppointments()
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error saving appointment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getEventClassNames = (status: Appointment['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.eventConfirmed
      case 'CANCELLED':
        return styles.eventCancelled
      case 'COMPLETED':
        return styles.eventCompleted
      default:
        return styles.eventPending
    }
  }

  const renderEventContent = (eventInfo: any) => {
    const appointment = appointments.find(apt => apt.id === eventInfo.event.id)
    if (!appointment) return null

    return (
      <>
        <div className={styles.eventTitle}>{eventInfo.event.title}</div>
        <div className={styles.eventTime}>
          {format(new Date(eventInfo.event.start), 'h:mm a')} - {format(new Date(eventInfo.event.end), 'h:mm a')}
        </div>
        <div className={styles.eventClient}>
          {appointment.client.name || appointment.client.email}
        </div>
      </>
    )
  }

  if (!session?.user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <button
            onClick={() => {
              setSelectedAppointment(null)
              setSelectedDate(null)
              setIsModalOpen(true)
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            New Appointment
          </button>
        </div>

        <div className="mt-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={appointments.map(apt => ({
              id: apt.id,
              title: apt.title,
              start: apt.start,
              end: apt.end,
              className: getEventClassNames(apt.status),
              extendedProps: {
                status: apt.status,
                artistId: apt.artistId,
                clientId: apt.clientId,
                serviceId: apt.serviceId,
                notes: apt.notes,
              },
            }))}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="auto"
          />
        </div>
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <AppointmentForm
              shopId={params.shopId}
              artists={artists}
              services={services}
              initialData={selectedAppointment ? {
                ...selectedAppointment,
                startTime: format(new Date(selectedAppointment.start), "yyyy-MM-dd'T'HH:mm"),
                endTime: format(new Date(selectedAppointment.end), "yyyy-MM-dd'T'HH:mm"),
              } : selectedDate ? {
                startTime: format(selectedDate.start, "yyyy-MM-dd'T'HH:mm"),
                endTime: format(selectedDate.end, "yyyy-MM-dd'T'HH:mm"),
              } : undefined}
              onSubmit={handleAppointmentSubmit}
              onCancel={() => setIsModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  )
} 