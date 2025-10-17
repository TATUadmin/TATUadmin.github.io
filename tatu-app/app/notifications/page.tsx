'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NotificationCenter, { Notification } from '../components/NotificationCenter'

// Mock data - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'John Doe wants to book a session for Traditional Rose tattoo on Dec 15, 2023',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    read: false,
    actionUrl: '/dashboard/appointments/123'
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message from Sarah M.',
    message: 'Hey! I love your work. Can we discuss a custom sleeve design?',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    read: false,
    actionUrl: '/messages/456'
  },
  {
    id: '3',
    type: 'review',
    title: 'New Review Received',
    message: 'Mike R. left a 5-star review: "Amazing work! Professional and talented artist."',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    read: true,
    actionUrl: '/reviews/789'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $150 deposit payment for appointment #A1234',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    read: true,
    actionUrl: '/dashboard/payments'
  },
  {
    id: '5',
    type: 'like',
    title: 'Someone liked your portfolio',
    message: 'AlexTattoo liked your "Geometric Wolf" tattoo',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    actionUrl: '/portfolio/item/456'
  },
  {
    id: '6',
    type: 'follow',
    title: 'New Follower',
    message: 'TattooEnthusiast123 started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    read: true,
    actionUrl: '/profile/follower123'
  },
  {
    id: '7',
    type: 'system',
    title: 'Portfolio Featured',
    message: 'Congratulations! Your "Japanese Dragon" tattoo was featured on the homepage',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    read: true,
    actionUrl: '/portfolio/item/789'
  },
  {
    id: '8',
    type: 'booking',
    title: 'Appointment Reminder',
    message: 'You have an appointment with Jane Smith tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    read: true,
    actionUrl: '/dashboard/appointments/124'
  }
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    // In real app: API call to mark as read
    console.log(`Marking notification ${id} as read`)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    // In real app: API call to mark all as read
    console.log('Marking all notifications as read')
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    // In real app: API call to delete notification
    console.log(`Deleting notification ${id}`)
  }

  const handleClearAll = () => {
    setNotifications([])
    // In real app: API call to clear all notifications
    console.log('Clearing all notifications')
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <NotificationCenter
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  )
}

