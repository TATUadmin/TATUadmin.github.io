'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '../../components/DashboardLayout'
import { toast } from 'react-hot-toast'
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  isSent: boolean // true if sent by current user
}

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantAvatar?: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline?: boolean
  isNotification?: boolean
  notificationId?: string
  actionUrl?: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isCustomer = session?.user?.role === 'CUSTOMER'
  const currentUserId = session?.user?.id || ''

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  // Refetch conversations when notifications change
  useEffect(() => {
    if (session?.user) {
      fetchConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, notifications])

  useEffect(() => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation)
      // If it's a notification-based conversation, show the notification message
      if (conversation?.isNotification) {
        setMessages([{
          id: conversation.notificationId || conversation.id,
          senderId: conversation.participantId,
          senderName: conversation.participantName,
          senderAvatar: conversation.participantAvatar,
          content: conversation.lastMessage,
          timestamp: conversation.lastMessageTime,
          isRead: conversation.unreadCount === 0,
          isSent: false,
        }])
      } else {
        fetchMessages(selectedConversation)
      }
    }
  }, [selectedConversation, conversations])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=100')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/messages/conversations')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to fetch conversations')
      }
      const data = await response.json()
      
      // Convert message-type notifications into conversations
      // Use current notifications state
      const currentNotifications = notifications
      const notificationConversations = currentNotifications
        .filter(n => n.type === 'message')
        .map((notification) => {
          // Extract sender name from notification title or message
          const senderMatch = notification.title.match(/^New Message from (.+)$/) || 
                             notification.title.match(/^(.+?) sent you a message$/) ||
                             notification.message.match(/(.+?) sent you a message/)
          const senderName = senderMatch ? senderMatch[1] : 
                            notification.metadata?.senderName || 
                            'Unknown User'
          
          return {
            id: `notification-${notification.id}`,
            participantId: notification.metadata?.senderId || `notif-${notification.id}`,
            participantName: senderName,
            participantAvatar: notification.avatar || notification.metadata?.avatar,
            lastMessage: notification.message,
            lastMessageTime: notification.timestamp,
            unreadCount: notification.read ? 0 : 1,
            isNotification: true,
            notificationId: notification.id,
            actionUrl: notification.actionUrl
          }
        })
      
      // Merge with existing conversations
      const allConversations = [...(data.conversations || []), ...notificationConversations]
      
      // Remove duplicates based on participantId, keeping the most recent
      const uniqueConversations = allConversations.reduce((acc: Conversation[], conv) => {
        const existing = acc.find(c => c.participantId === conv.participantId)
        if (!existing) {
          acc.push(conv)
        } else if (new Date(conv.lastMessageTime) > new Date(existing.lastMessageTime)) {
          // Replace with more recent conversation
          const index = acc.indexOf(existing)
          acc[index] = conv
        }
        return acc
      }, [])
      
      // Sort by last message time (most recent first)
      uniqueConversations.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      )
      
      setConversations(uniqueConversations)
    } catch (error: any) {
      console.error('Error fetching conversations:', error)
      toast.error(error.message || 'Failed to load conversations')
      
      // Convert notifications to conversations even if API fails
      const currentNotifications = notifications
      const notificationConversations = currentNotifications
        .filter(n => n.type === 'message')
        .map((notification) => {
          const senderMatch = notification.title.match(/^New Message from (.+)$/) || 
                             notification.title.match(/^(.+?) sent you a message$/) ||
                             notification.message.match(/(.+?) sent you a message/)
          const senderName = senderMatch ? senderMatch[1] : 
                            notification.metadata?.senderName || 
                            'Unknown User'
          
          return {
            id: `notification-${notification.id}`,
            participantId: notification.metadata?.senderId || `notif-${notification.id}`,
            participantName: senderName,
            participantAvatar: notification.avatar || notification.metadata?.avatar,
            lastMessage: notification.message,
            lastMessageTime: notification.timestamp,
            unreadCount: notification.read ? 0 : 1,
            isNotification: true,
            notificationId: notification.id,
            actionUrl: notification.actionUrl
          }
        })
      
      setConversations(notificationConversations.length > 0 ? notificationConversations : [
        {
          id: '1',
          participantId: 'artist1',
          participantName: 'Alex Rodriguez',
          participantAvatar: undefined,
          lastMessage: 'Thanks for reaching out! I have availability next week.',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          unreadCount: 0,
        },
        {
          id: '2',
          participantId: 'artist2',
          participantName: 'Sarah Chen',
          participantAvatar: undefined,
          lastMessage: 'The design looks great! See you tomorrow.',
          lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          unreadCount: 1,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      toast.error(error.message || 'Failed to load messages')
      // Use mock data for now
      const conversation = conversations.find(c => c.id === conversationId)
      if (conversation) {
        setMessages([
          {
            id: '1',
            senderId: conversation.participantId,
            senderName: conversation.participantName,
            content: conversation.lastMessage,
            timestamp: conversation.lastMessageTime,
            isRead: true,
            isSent: false,
          },
          {
            id: '2',
            senderId: currentUserId,
            senderName: session?.user?.name || 'You',
            content: 'Hi! I\'m interested in booking a session.',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            isRead: true,
            isSent: true,
          },
        ])
      }
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation) return

    setIsSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          content: messageInput.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to send message')
      }

      const newMessage = await response.json()
      setMessages(prev => [...prev, newMessage])
      setMessageInput('')
      
      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversation
            ? {
                ...conv,
                lastMessage: newMessage.content,
                lastMessageTime: newMessage.timestamp,
              }
            : conv
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find(c => c.id === selectedConversation)

  return (
    <DashboardLayout userRole={isCustomer ? 'client' : 'artist'}>
      <div className="h-[calc(100vh-8rem)] flex bg-black w-full">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-950">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white mb-4">Messages</h1>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <p className="text-gray-400">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    // If it's a notification-based conversation, mark notification as read and navigate
                    if (conversation.isNotification && conversation.notificationId) {
                      fetch(`/api/notifications/${conversation.notificationId}/read`, { method: 'POST' })
                        .catch(err => console.error('Failed to mark notification as read:', err))
                      
                      // If there's an action URL, navigate there, otherwise open conversation
                      if (conversation.actionUrl) {
                        window.location.href = conversation.actionUrl
                        return
                      }
                    }
                    setSelectedConversation(conversation.id)
                  }}
                  className={`w-full p-4 border-b border-gray-800 hover:bg-gray-900 transition-colors text-left ${
                    selectedConversation === conversation.id ? 'bg-gray-900' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {conversation.participantAvatar ? (
                        <img
                          src={conversation.participantAvatar}
                          alt={conversation.participantName}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                          <UserCircleIcon className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium truncate">
                            {conversation.participantName}
                          </h3>
                          {conversation.isNotification && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" title="From notification" />
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="flex-shrink-0 ml-2 bg-white text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(conversation.lastMessageTime)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col bg-black">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-800 bg-gray-950">
                <div className="flex items-center gap-3">
                  {selectedConv?.participantAvatar ? (
                    <img
                      src={selectedConv.participantAvatar}
                      alt={selectedConv.participantName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                      <UserCircleIcon className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-white font-semibold">
                      {selectedConv?.participantName}
                    </h2>
                    {selectedConv?.isOnline && (
                      <p className="text-xs text-green-500">Online</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.isSent
                          ? 'bg-white text-black'
                          : 'bg-gray-800 text-white'
                      } rounded-lg px-4 py-2`}
                    >
                      {!message.isSent && (
                        <p className="text-xs text-gray-400 mb-1">
                          {message.senderName}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.isSent && (
                          <span className="flex items-center">
                            {message.isRead ? (
                              <span className="relative inline-flex items-center">
                                <CheckIcon className="w-4 h-4 text-blue-500" />
                                <CheckIcon className="w-4 h-4 text-blue-500 -ml-1.5" />
                              </span>
                            ) : (
                              <CheckIcon className="w-4 h-4 text-gray-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800 bg-gray-950">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Attach file"
                  >
                    <PaperClipIcon className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSending}
                    className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Send message"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <UserCircleIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-400">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

