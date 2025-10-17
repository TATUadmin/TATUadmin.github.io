import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextRequest } from 'next/server'

// WebSocket event types
export interface ServerToClientEvents {
  // Notifications
  notification: (notification: NotificationData) => void
  notificationRead: (notificationId: string) => void
  
  // Messages
  message: (message: MessageData) => void
  messageRead: (messageId: string, userId: string) => void
  typing: (data: TypingData) => void
  typingStop: (data: TypingData) => void
  
  // Appointments
  appointmentUpdate: (appointment: AppointmentData) => void
  appointmentCancelled: (appointmentId: string) => void
  
  // Portfolio
  portfolioLike: (data: PortfolioLikeData) => void
  portfolioComment: (data: PortfolioCommentData) => void
  
  // System
  connection: (status: 'connected' | 'disconnected') => void
  error: (error: string) => void
}

export interface ClientToServerEvents {
  // Authentication
  authenticate: (token: string) => void
  
  // Notifications
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  
  // Messages
  joinConversation: (conversationId: string) => void
  leaveConversation: (conversationId: string) => void
  sendMessage: (data: SendMessageData) => void
  startTyping: (conversationId: string) => void
  stopTyping: (conversationId: string) => void
  
  // Appointments
  joinAppointment: (appointmentId: string) => void
  leaveAppointment: (appointmentId: string) => void
  
  // Portfolio
  joinPortfolio: (portfolioId: string) => void
  leavePortfolio: (portfolioId: string) => void
}

// Data interfaces
export interface NotificationData {
  id: string
  type: 'booking' | 'message' | 'review' | 'payment' | 'like' | 'follow' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  userId: string
}

export interface MessageData {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  type: 'text' | 'image' | 'file'
  attachments?: AttachmentData[]
}

export interface TypingData {
  conversationId: string
  userId: string
  userName: string
}

export interface SendMessageData {
  conversationId: string
  content: string
  type?: 'text' | 'image' | 'file'
  attachments?: AttachmentData[]
}

export interface AttachmentData {
  id: string
  name: string
  url: string
  type: string
  size: number
}

export interface AppointmentData {
  id: string
  clientId: string
  artistId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  date: string
  startTime: string
  endTime: string
  serviceName: string
  amount: number
}

export interface PortfolioLikeData {
  portfolioId: string
  userId: string
  userName: string
  action: 'like' | 'unlike'
}

export interface PortfolioCommentData {
  portfolioId: string
  userId: string
  userName: string
  comment: string
  timestamp: string
}

// WebSocket server setup
export function createWebSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : ['http://localhost:3000', 'http://0.0.0.0:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Store user connections
  const userSockets = new Map<string, string>() // userId -> socketId
  const socketUsers = new Map<string, string>() // socketId -> userId

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle authentication
    socket.on('authenticate', async (token) => {
      try {
        // TODO: Verify JWT token and get user info
        // For now, we'll use a simple approach
        const userId = token // In production, decode JWT to get userId
        
        userSockets.set(userId, socket.id)
        socketUsers.set(socket.id, userId)
        
        socket.emit('connection', 'connected')
        console.log(`User ${userId} authenticated`)
      } catch (error) {
        console.error('Authentication error:', error)
        socket.emit('error', 'Authentication failed')
        socket.disconnect()
      }
    })

    // Handle notification events
    socket.on('markNotificationRead', async (notificationId) => {
      const userId = socketUsers.get(socket.id)
      if (!userId) return

      try {
        // TODO: Update notification in database
        socket.emit('notificationRead', notificationId)
      } catch (error) {
        console.error('Error marking notification as read:', error)
      }
    })

    socket.on('markAllNotificationsRead', async () => {
      const userId = socketUsers.get(socket.id)
      if (!userId) return

      try {
        // TODO: Update all notifications in database
        console.log(`Marking all notifications as read for user ${userId}`)
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
      }
    })

    // Handle message events
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`)
    })

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`)
      console.log(`Socket ${socket.id} left conversation ${conversationId}`)
    })

    socket.on('sendMessage', async (data) => {
      const userId = socketUsers.get(socket.id)
      if (!userId) return

      try {
        // TODO: Save message to database
        const messageData: MessageData = {
          id: `msg_${Date.now()}`,
          conversationId: data.conversationId,
          senderId: userId,
          receiverId: '', // TODO: Get from conversation data
          content: data.content,
          timestamp: new Date().toISOString(),
          read: false,
          type: data.type || 'text',
          attachments: data.attachments
        }

        // Broadcast to conversation participants
        io.to(`conversation:${data.conversationId}`).emit('message', messageData)
      } catch (error) {
        console.error('Error sending message:', error)
        socket.emit('error', 'Failed to send message')
      }
    })

    socket.on('startTyping', (conversationId) => {
      const userId = socketUsers.get(socket.id)
      if (!userId) return

      const typingData: TypingData = {
        conversationId,
        userId,
        userName: 'User' // TODO: Get from user data
      }

      socket.to(`conversation:${conversationId}`).emit('typing', typingData)
    })

    socket.on('stopTyping', (conversationId) => {
      const userId = socketUsers.get(socket.id)
      if (!userId) return

      const typingData: TypingData = {
        conversationId,
        userId,
        userName: 'User' // TODO: Get from user data
      }

      socket.to(`conversation:${conversationId}`).emit('typingStop', typingData)
    })

    // Handle appointment events
    socket.on('joinAppointment', (appointmentId) => {
      socket.join(`appointment:${appointmentId}`)
    })

    socket.on('leaveAppointment', (appointmentId) => {
      socket.leave(`appointment:${appointmentId}`)
    })

    // Handle portfolio events
    socket.on('joinPortfolio', (portfolioId) => {
      socket.join(`portfolio:${portfolioId}`)
    })

    socket.on('leavePortfolio', (portfolioId) => {
      socket.leave(`portfolio:${portfolioId}`)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = socketUsers.get(socket.id)
      if (userId) {
        userSockets.delete(userId)
        socketUsers.delete(socket.id)
        console.log(`User ${userId} disconnected`)
      }
    })
  })

  return io
}

// Helper functions for sending events
export function sendNotificationToUser(io: SocketIOServer, userId: string, notification: NotificationData) {
  const socketId = userSockets.get(userId)
  if (socketId) {
    io.to(socketId).emit('notification', notification)
  }
}

export function sendMessageToConversation(io: SocketIOServer, conversationId: string, message: MessageData) {
  io.to(`conversation:${conversationId}`).emit('message', message)
}

export function sendAppointmentUpdate(io: SocketIOServer, appointmentId: string, appointment: AppointmentData) {
  io.to(`appointment:${appointmentId}`).emit('appointmentUpdate', appointment)
}

export function sendPortfolioLike(io: SocketIOServer, portfolioId: string, likeData: PortfolioLikeData) {
  io.to(`portfolio:${portfolioId}`).emit('portfolioLike', likeData)
}

export function sendPortfolioComment(io: SocketIOServer, portfolioId: string, commentData: PortfolioCommentData) {
  io.to(`portfolio:${portfolioId}`).emit('portfolioComment', commentData)
}
