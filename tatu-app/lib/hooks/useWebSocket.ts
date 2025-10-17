'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  NotificationData, 
  MessageData, 
  TypingData,
  SendMessageData 
} from '@/lib/websocket'

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

interface UseWebSocketReturn {
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  
  // Notification methods
  onNotification: (callback: (notification: NotificationData) => void) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  
  // Message methods
  onMessage: (callback: (message: MessageData) => void) => void
  onTyping: (callback: (data: TypingData) => void) => void
  onTypingStop: (callback: (data: TypingData) => void) => void
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (data: SendMessageData) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  
  // Connection methods
  connect: () => void
  disconnect: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const callbacksRef = useRef<{
    onNotification?: (notification: NotificationData) => void
    onMessage?: (message: MessageData) => void
    onTyping?: (data: TypingData) => void
    onTypingStop?: (data: TypingData) => void
  }>({})

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return
    if (!session?.user?.id) return

    setIsConnecting(true)
    setError(null)

    try {
      // In a real implementation, you'd connect to your WebSocket server
      // For now, we'll simulate the connection
      const ws = new WebSocket(`ws://localhost:3001/ws?token=${session.user.id}`)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        reconnectAttemptsRef.current = 0
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: session.user.id
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'notification':
              callbacksRef.current.onNotification?.(data.payload)
              break
            case 'message':
              callbacksRef.current.onMessage?.(data.payload)
              break
            case 'typing':
              callbacksRef.current.onTyping?.(data.payload)
              break
            case 'typingStop':
              callbacksRef.current.onTypingStop?.(data.payload)
              break
            case 'error':
              setError(data.message)
              break
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setIsConnecting(false)
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${reconnectAttempts})`)
            connect()
          }, reconnectInterval)
        } else {
          setError('Failed to reconnect after multiple attempts')
        }
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        setError('WebSocket connection error')
        setIsConnecting(false)
      }

      socketRef.current = ws
    } catch (err) {
      console.error('Error creating WebSocket connection:', err)
      setError('Failed to create WebSocket connection')
      setIsConnecting(false)
    }
  }, [session?.user?.id, reconnectAttempts, reconnectInterval])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
    reconnectAttemptsRef.current = 0
  }, [])

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  // Notification methods
  const onNotification = useCallback((callback: (notification: NotificationData) => void) => {
    callbacksRef.current.onNotification = callback
  }, [])

  const markNotificationRead = useCallback((notificationId: string) => {
    sendMessage({
      type: 'markNotificationRead',
      notificationId
    })
  }, [sendMessage])

  const markAllNotificationsRead = useCallback(() => {
    sendMessage({
      type: 'markAllNotificationsRead'
    })
  }, [sendMessage])

  // Message methods
  const onMessage = useCallback((callback: (message: MessageData) => void) => {
    callbacksRef.current.onMessage = callback
  }, [])

  const onTyping = useCallback((callback: (data: TypingData) => void) => {
    callbacksRef.current.onTyping = callback
  }, [])

  const onTypingStop = useCallback((callback: (data: TypingData) => void) => {
    callbacksRef.current.onTypingStop = callback
  }, [])

  const joinConversation = useCallback((conversationId: string) => {
    sendMessage({
      type: 'joinConversation',
      conversationId
    })
  }, [sendMessage])

  const leaveConversation = useCallback((conversationId: string) => {
    sendMessage({
      type: 'leaveConversation',
      conversationId
    })
  }, [sendMessage])

  const sendMessageToConversation = useCallback((data: SendMessageData) => {
    sendMessage({
      type: 'sendMessage',
      ...data
    })
  }, [sendMessage])

  const startTyping = useCallback((conversationId: string) => {
    sendMessage({
      type: 'startTyping',
      conversationId
    })
  }, [sendMessage])

  const stopTyping = useCallback((conversationId: string) => {
    sendMessage({
      type: 'stopTyping',
      conversationId
    })
  }, [sendMessage])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && session?.user?.id) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, session?.user?.id, connect, disconnect])

  return {
    isConnected,
    isConnecting,
    error,
    onNotification,
    markNotificationRead,
    markAllNotificationsRead,
    onMessage,
    onTyping,
    onTypingStop,
    joinConversation,
    leaveConversation,
    sendMessage: sendMessageToConversation,
    startTyping,
    stopTyping,
    connect,
    disconnect
  }
}
