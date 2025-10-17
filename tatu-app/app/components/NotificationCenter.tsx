'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserPlusIcon,
  CreditCardIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useWebSocketContext } from './WebSocketProvider'

export type NotificationType = 
  | 'booking' 
  | 'message' 
  | 'review' 
  | 'payment' 
  | 'follow' 
  | 'like' 
  | 'system'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  avatar?: string
  metadata?: Record<string, any>
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
  onNotificationClick?: (notification: Notification) => void
}

export default function NotificationCenter({
  notifications: propNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick
}: NotificationCenterProps) {
  // Use WebSocket notifications if available, otherwise fall back to props
  const { 
    notifications: wsNotifications, 
    unreadCount, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useWebSocketContext()
  
  const notifications = wsNotifications.length > 0 ? wsNotifications : propNotifications
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [showActions, setShowActions] = useState<string | null>(null)

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' ? true : !n.read
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return <CalendarIcon className="w-6 h-6 text-white" />
      case 'message':
        return <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
      case 'review':
        return <HeartIcon className="w-6 h-6 text-white" />
      case 'payment':
        return <CreditCardIcon className="w-6 h-6 text-white" />
      case 'follow':
        return <UserPlusIcon className="w-6 h-6 text-white" />
      case 'like':
        return <HeartIcon className="w-6 h-6 text-white" />
      case 'system':
        return <ExclamationTriangleIcon className="w-6 h-6 text-white" />
      default:
        return <BellIcon className="w-6 h-6 text-white" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      // Use WebSocket method if available, otherwise fall back to prop method
      if (wsNotifications.length > 0) {
        markNotificationRead(notification.id)
      } else {
        onMarkAsRead(notification.id)
      }
    }
    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const handleSelectNotification = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'read' | 'delete') => {
    selectedNotifications.forEach(id => {
      if (action === 'read') {
        // Use WebSocket method if available, otherwise fall back to prop method
        if (wsNotifications.length > 0) {
          markNotificationRead(id)
        } else {
          onMarkAsRead(id)
        }
      } else {
        onDelete(id)
      }
    })
    setSelectedNotifications([])
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <BellIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400">{unreadCount} unread</p>
              )}
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    // Use WebSocket method if available, otherwise fall back to prop method
                    if (wsNotifications.length > 0) {
                      markAllNotificationsRead()
                    } else {
                      onMarkAllAsRead()
                    }
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClearAll}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors border border-gray-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <span className="text-white text-sm">
              {selectedNotifications.length} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('read')}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Mark as read
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedNotifications([])}
                className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <BellIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-gray-900 border rounded-lg hover:border-gray-700 transition-all ${
                notification.read ? 'border-gray-800' : 'border-gray-700 bg-gray-900/50'
              }`}
            >
              <div className="flex items-start p-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="mt-1 mr-3 w-4 h-4 bg-gray-800 border-gray-700 rounded"
                />

                {/* Icon */}
                <div className={`p-2 rounded-lg mr-3 flex-shrink-0 ${
                  notification.read ? 'bg-gray-800' : 'bg-gray-700'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <button
                  onClick={() => handleNotificationClick(notification)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className={`font-semibold ${
                      notification.read ? 'text-gray-300' : 'text-white'
                    }`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm ${
                    notification.read ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="mt-2">
                      <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                    </div>
                  )}
                </button>

                {/* Actions Menu */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setShowActions(showActions === notification.id ? null : notification.id)}
                    className="p-1 hover:bg-gray-800 rounded transition-colors"
                  >
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {showActions === notification.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                      {!notification.read && (
                        <button
                          onClick={() => {
                            onMarkAsRead(notification.id)
                            setShowActions(null)
                          }}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center rounded-t-lg"
                        >
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onDelete(notification.id)
                          setShowActions(null)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center rounded-b-lg"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

