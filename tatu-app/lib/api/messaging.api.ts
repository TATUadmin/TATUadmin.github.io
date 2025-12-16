// Messaging API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  delivered: boolean
  attachments?: Attachment[]
  replyTo?: string
}

export interface Attachment {
  id: string
  type: 'image' | 'file' | 'voice'
  url: string
  name: string
  size: number
  mimeType: string
}

export interface Conversation {
  id: string
  participants: Participant[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

export interface Participant {
  id: string
  name: string
  avatar?: string
  online: boolean
  lastSeen?: string
}

export interface SendMessageData {
  conversationId?: string
  receiverId?: string
  content: string
  attachments?: File[]
  replyTo?: string
}

export class MessagingAPI {
  private static instance: MessagingAPI

  static getInstance(): MessagingAPI {
    if (!this.instance) {
      this.instance = new MessagingAPI()
    }
    return this.instance
  }

  // Get all conversations
  async getConversations(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<ApiResponse<Conversation[]>> {
    return apiClient.get('/messages/conversations', { params })
  }

  // Get a single conversation
  async getConversation(id: string): Promise<ApiResponse<Conversation>> {
    return apiClient.get(`/messages/conversations/${id}`)
  }

  // Create or get conversation with a user
  async createConversation(participantId: string): Promise<ApiResponse<Conversation>> {
    return apiClient.post('/messages/conversations', { participantId })
  }

  // Get messages in a conversation
  async getMessages(conversationId: string, params?: {
    page?: number
    limit?: number
    before?: string
    after?: string
  }): Promise<ApiResponse<Message[]>> {
    return apiClient.get(`/messages/conversations/${conversationId}/messages`, { params })
  }

  // Send a message
  async sendMessage(data: SendMessageData): Promise<ApiResponse<Message>> {
    AnalyticsTracker.track('message_sent', {
      conversationId: data.conversationId,
      hasAttachments: !!data.attachments?.length
    })

    // If there are attachments, use FormData
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData()
      formData.append('content', data.content)
      if (data.conversationId) formData.append('conversationId', data.conversationId)
      if (data.receiverId) formData.append('receiverId', data.receiverId)
      if (data.replyTo) formData.append('replyTo', data.replyTo)
      
      data.attachments.forEach((file, index) => {
        formData.append(`attachments`, file)
      })

      // Use fetch directly for FormData
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${await this.getAuthToken()}`
        }
      })

      return response.json()
    }

    return apiClient.post('/messages', data)
  }

  private async getAuthToken(): Promise<string> {
    // Get token from session - implement based on your auth setup
    return ''
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/messages/${messageId}/read`)
  }

  // Mark conversation as read
  async markConversationAsRead(conversationId: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/messages/conversations/${conversationId}/read`)
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('message_deleted', { messageId })

    return apiClient.delete(`/messages/${messageId}`)
  }

  // Delete a conversation
  async deleteConversation(conversationId: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('conversation_deleted', { conversationId })

    return apiClient.delete(`/messages/conversations/${conversationId}`)
  }

  // Search messages
  async searchMessages(query: string, conversationId?: string): Promise<ApiResponse<Message[]>> {
    return apiClient.get('/messages/search', {
      params: { query, conversationId }
    })
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get('/messages/unread/count')
  }

  // Send typing indicator
  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    // This could be a WebSocket event rather than HTTP
    try {
      await apiClient.post(`/messages/conversations/${conversationId}/typing`, { isTyping })
    } catch (error) {
      // Silently fail for typing indicators
      console.debug('Typing indicator failed:', error)
    }
  }

  // Get online status
  async getOnlineStatus(userIds: string[]): Promise<ApiResponse<Record<string, boolean>>> {
    return apiClient.post('/messages/online-status', { userIds })
  }

  // Archive conversation
  async archiveConversation(conversationId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/messages/conversations/${conversationId}/archive`)
  }

  // Unarchive conversation
  async unarchiveConversation(conversationId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/messages/conversations/${conversationId}/unarchive`)
  }

  // Mute conversation
  async muteConversation(conversationId: string, duration?: number): Promise<ApiResponse<any>> {
    return apiClient.post(`/messages/conversations/${conversationId}/mute`, { duration })
  }

  // Unmute conversation
  async unmuteConversation(conversationId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/messages/conversations/${conversationId}/unmute`)
  }

  // Block user
  async blockUser(userId: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('user_blocked', { userId })

    return apiClient.post(`/messages/block/${userId}`)
  }

  // Unblock user
  async unblockUser(userId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/messages/unblock/${userId}`)
  }

  // Get blocked users
  async getBlockedUsers(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/messages/blocked')
  }

  // Report conversation
  async reportConversation(conversationId: string, reason: string, details?: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('conversation_reported', { conversationId, reason })

    return apiClient.post(`/messages/conversations/${conversationId}/report`, {
      reason,
      details
    })
  }
}

export const messagingAPI = MessagingAPI.getInstance()

