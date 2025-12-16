'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  VideoCameraIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { CheckIcon, CheckCheckIcon } from 'lucide-react'
import { useWebSocketContext } from './WebSocketProvider'

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
  delivered: boolean
  attachments?: {
    type: 'image' | 'file'
    url: string
    name: string
  }[]
}

interface Conversation {
  id: string
  participants: {
    id: string
    name: string
    avatar?: string
    online: boolean
    lastSeen?: string
  }[]
  lastMessage?: Message
  unreadCount: number
}

interface MessagingInterfaceProps {
  currentUserId: string
  conversations: Conversation[]
  messages: Message[]
  onSendMessage: (content: string, receiverId: string, attachments?: File[]) => Promise<void>
  onLoadMoreMessages?: (conversationId: string) => void
  onMarkAsRead?: (messageId: string) => void
}

export default function MessagingInterface({
  currentUserId,
  conversations,
  messages,
  onSendMessage,
  onLoadMoreMessages,
  onMarkAsRead
}: MessagingInterfaceProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // WebSocket context
  const { 
    isConnected, 
    messages: wsMessages, 
    typingUsers, 
    addMessage, 
    joinConversation, 
    leaveConversation, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useWebSocketContext()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)
  const otherParticipant = selectedConversationData?.participants.find(p => p.id !== currentUserId)

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const other = conv.participants.find(p => p.id !== currentUserId)
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const conversationMessages = messages.filter(m => 
    (m.senderId === currentUserId && m.receiverId === otherParticipant?.id) ||
    (m.senderId === otherParticipant?.id && m.receiverId === currentUserId)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !otherParticipant || !selectedConversation) return

    // Send via WebSocket for real-time delivery
    if (isConnected) {
      sendMessage({
        conversationId: selectedConversation,
        content: messageInput,
        type: 'text'
      })
    }

    // Also send via API for persistence
    await onSendMessage(messageInput, otherParticipant.id)
    setMessageInput('')
    setShowEmojiPicker(false)
    
    // Stop typing indicator
    if (selectedConversation) {
      stopTyping(selectedConversation)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle typing indicators
  const handleInputChange = (value: string) => {
    setMessageInput(value)
    
    if (selectedConversation) {
      if (!isTyping) {
        setIsTyping(true)
        startTyping(selectedConversation)
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        stopTyping(selectedConversation)
      }, 1000)
    }
  }

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    // Leave previous conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation)
    }
    
    // Join new conversation
    setSelectedConversation(conversationId)
    joinConversation(conversationId)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Handle file upload
      console.log('Files selected:', files)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Offline'
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-screen bg-black">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-gray-950 border-r border-gray-900 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-900">
          <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-gray-500">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const other = conversation.participants.find(p => p.id !== currentUserId)
              if (!other) return null

              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 border-b border-gray-900 hover:bg-gray-900 transition-colors text-left ${
                    selectedConversation === conversation.id ? 'bg-gray-900' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {other.avatar ? (
                        <img
                          src={other.avatar}
                          alt={other.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {other.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      {other.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                      )}
                    </div>

                    {/* Message Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold truncate">{other.name}</h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-400 truncate">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && otherParticipant ? (
          <>
            {/* Chat Header */}
            <div className="bg-gray-950 border-b border-gray-900 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    {otherParticipant.avatar ? (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {otherParticipant.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                    {otherParticipant.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div>
                    <h2 className="text-white font-semibold">{otherParticipant.name}</h2>
                    <p className="text-sm text-gray-400">
                      {otherParticipant.online ? 'Online' : formatLastSeen(otherParticipant.lastSeen)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                    <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-900 rounded-full transition-colors">
                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversationMessages.map((message) => {
                const isSent = message.senderId === currentUserId

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isSent
                            ? 'bg-white text-black rounded-br-sm'
                            : 'bg-gray-900 text-white border border-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <div className={`flex items-center justify-end space-x-1 mt-1 ${
                          isSent ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          <span className="text-xs">{formatTime(message.timestamp)}</span>
                          {isSent && (
                            message.read ? (
                              <CheckCheckIcon className="w-4 h-4 text-blue-500" />
                            ) : message.delivered ? (
                              <CheckCheckIcon className="w-4 h-4" />
                            ) : (
                              <CheckIcon className="w-4 h-4" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicators */}
            {typingUsers
              .filter(t => t.conversationId === selectedConversation && t.userId !== currentUserId)
              .map((typingUser) => (
                <div key={typingUser.userId} className="px-4 py-2">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span>{typingUser.userName} is typing...</span>
                  </div>
                </div>
              ))}

            {/* Message Input */}
            <div className="bg-gray-950 border-t border-gray-900 p-4">
              <div className="flex items-end space-x-2">
                {/* Attachments */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-900 rounded-full transition-colors flex-shrink-0"
                >
                  <PaperClipIcon className="w-6 h-6 text-gray-400" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>

                {/* Emoji */}
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-900 rounded-full transition-colors flex-shrink-0"
                >
                  <FaceSmileIcon className="w-6 h-6 text-gray-400" />
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSubmitMessage}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-white rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <PaperAirplaneIcon className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Conversation Selected</h3>
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

