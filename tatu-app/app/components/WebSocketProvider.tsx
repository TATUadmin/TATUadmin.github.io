'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useWebSocket } from '@/lib/hooks/useWebSocket'
import { 
  NotificationData, 
  MessageData, 
  TypingData 
} from '@/lib/websocket'

interface WebSocketContextType {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Notifications
  notifications: NotificationData[]
  unreadCount: number
  addNotification: (notification: NotificationData) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  
  // Messages
  messages: MessageData[]
  typingUsers: TypingData[]
  addMessage: (message: MessageData) => void
  updateMessage: (id: string, updates: Partial<MessageData>) => void
  addTypingUser: (data: TypingData) => void
  removeTypingUser: (data: TypingData) => void
  
  // Connection
  connect: () => void
  disconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider')
  }
  return context
}

interface WebSocketProviderProps {
  children: React.ReactNode
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [messages, setMessages] = useState<MessageData[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingData[]>([])
  
  const {
    isConnected,
    isConnecting,
    error,
    onNotification,
    markNotificationRead: wsMarkNotificationRead,
    markAllNotificationsRead: wsMarkAllNotificationsRead,
    onMessage,
    onTyping,
    onTypingStop,
    connect,
    disconnect
  } = useWebSocket({
    autoConnect: !!session?.user?.id
  })

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Handle notifications
  useEffect(() => {
    onNotification((notification) => {
      setNotifications(prev => [notification, ...prev])
    })
  }, [onNotification])

  // Handle messages
  useEffect(() => {
    onMessage((message) => {
      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(m => m.id === message.id)
        if (exists) return prev
        return [message, ...prev]
      })
    })
  }, [onMessage])

  // Handle typing indicators
  useEffect(() => {
    onTyping((data) => {
      setTypingUsers(prev => {
        const exists = prev.some(t => t.userId === data.userId && t.conversationId === data.conversationId)
        if (exists) return prev
        return [...prev, data]
      })
    })
  }, [onTyping])

  useEffect(() => {
    onTypingStop((data) => {
      setTypingUsers(prev => 
        prev.filter(t => !(t.userId === data.userId && t.conversationId === data.conversationId))
      )
    })
  }, [onTypingStop])

  // Notification methods
  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev])
  }

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
    wsMarkNotificationRead(id)
  }

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    wsMarkAllNotificationsRead()
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Message methods
  const addMessage = (message: MessageData) => {
    setMessages(prev => {
      const exists = prev.some(m => m.id === message.id)
      if (exists) return prev
      return [message, ...prev]
    })
  }

  const updateMessage = (id: string, updates: Partial<MessageData>) => {
    setMessages(prev => 
      prev.map(m => m.id === id ? { ...m, ...updates } : m)
    )
  }

  const addTypingUser = (data: TypingData) => {
    setTypingUsers(prev => {
      const exists = prev.some(t => t.userId === data.userId && t.conversationId === data.conversationId)
      if (exists) return prev
      return [...prev, data]
    })
  }

  const removeTypingUser = (data: TypingData) => {
    setTypingUsers(prev => 
      prev.filter(t => !(t.userId === data.userId && t.conversationId === data.conversationId))
    )
  }

  // Auto-connect when session is available
  useEffect(() => {
    if (session?.user?.id && !isConnected && !isConnecting) {
      connect()
    }
  }, [session?.user?.id, isConnected, isConnecting, connect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    error,
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    messages,
    typingUsers,
    addMessage,
    updateMessage,
    addTypingUser,
    removeTypingUser,
    connect,
    disconnect
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
