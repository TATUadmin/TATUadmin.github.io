'use client'

import { useState } from 'react'
import { 
  Mail, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Phone,
  Search,
  Settings,
  Star,
  Archive,
  Trash2,
  Reply,
  Calendar as CalendarIcon,
  DollarSign,
  AlertCircle,
  Check,
  Clock,
  User,
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
  platform: 'EMAIL' | 'INSTAGRAM' | 'FACEBOOK' | 'SMS' | 'WHATSAPP' | 'INTERNAL'
  sender: string
  senderName: string
  subject?: string
  preview: string
  fullContent: string
  timestamp: Date
  isRead: boolean
  category?: 'BOOKING' | 'INQUIRY' | 'CANCELLATION' | 'FOLLOW_UP' | 'GENERAL' | 'URGENT'
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  threadId?: string
  attachments?: number
}

interface UnifiedInboxProps {
  userId: string
  userTier: 'FREE' | 'PRO' | 'STUDIO'
}

const platformIcons = {
  EMAIL: Mail,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  SMS: MessageCircle,
  WHATSAPP: Phone,
  INTERNAL: MessageCircle,
}

const platformColors = {
  EMAIL: '#3B82F6',
  INSTAGRAM: '#E4405F',
  FACEBOOK: '#1877F2',
  SMS: '#10B981',
  WHATSAPP: '#25D366',
  INTERNAL: '#06B6D4',
}

const categoryColors = {
  BOOKING: '#EAB308',
  INQUIRY: '#3B82F6',
  CANCELLATION: '#EF4444',
  FOLLOW_UP: '#8B5CF6',
  GENERAL: '#6B7280',
  URGENT: '#DC2626',
}

export default function UnifiedInbox({ userId, userTier }: UnifiedInboxProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'bookings' | 'today'>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  // Mock data - will be replaced with real API calls
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      platform: 'INSTAGRAM',
      sender: '@sarahmartinez',
      senderName: 'Sarah Martinez',
      subject: '',
      preview: 'Hey! I love your geometric work. Do you have any availability in March for a forearm piece?',
      fullContent: 'Hey! I love your geometric work. Do you have any availability in March for a forearm piece? I\'ve been following your work for about 2 years now.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: false,
      category: 'BOOKING',
      priority: 'HIGH',
      threadId: 'thread-1',
    },
    {
      id: '2',
      platform: 'EMAIL',
      sender: 'john.kim@email.com',
      senderName: 'John Kim',
      subject: 'Following up on consultation',
      preview: 'Hi, I wanted to follow up on the consultation we had last week...',
      fullContent: 'Hi, I wanted to follow up on the consultation we had last week. I\'m ready to move forward with the half-sleeve design we discussed.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      isRead: false,
      category: 'FOLLOW_UP',
      priority: 'MEDIUM',
      threadId: 'thread-2',
    },
    {
      id: '3',
      platform: 'FACEBOOK',
      sender: 'mike.peterson',
      senderName: 'Mike Peterson',
      subject: '',
      preview: 'Unfortunately I need to cancel my appointment on Friday...',
      fullContent: 'Unfortunately I need to cancel my appointment on Friday. Something came up with work. Sorry about the short notice!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      isRead: true,
      category: 'CANCELLATION',
      priority: 'HIGH',
      threadId: 'thread-3',
    },
  ])

  const [connectedPlatforms, setConnectedPlatforms] = useState([
    { platform: 'INSTAGRAM', connected: true, unreadCount: 5 },
    { platform: 'EMAIL', connected: true, unreadCount: 3 },
    { platform: 'FACEBOOK', connected: false, unreadCount: 0 },
    { platform: 'SMS', connected: false, locked: userTier === 'FREE' },
    { platform: 'WHATSAPP', connected: false, locked: userTier === 'FREE' },
  ])

  const aiSuggestions = [
    "Thanks! I have these slots open in March: Tuesday March 5th at 2pm, Thursday March 7th at 10am. Would either work for you?",
    "Thanks for reaching out! I'm booking into March now. Can you tell me more about what you're thinking? (Size, placement, design ideas?)",
    "Thank you! March is filling up but I have some openings. Let me check my calendar and get back to you with exact times.",
  ]

  const unreadCount = messages.filter(m => !m.isRead).length
  const bookingCount = messages.filter(m => m.category === 'BOOKING').length
  const todayCount = messages.filter(m => {
    const today = new Date()
    const msgDate = new Date(m.timestamp)
    return msgDate.toDateString() === today.toDateString()
  }).length

  const filteredMessages = messages.filter(msg => {
    // Apply filter
    if (selectedFilter === 'unread' && msg.isRead) return false
    if (selectedFilter === 'bookings' && msg.category !== 'BOOKING') return false
    if (selectedFilter === 'today') {
      const today = new Date()
      const msgDate = new Date(msg.timestamp)
      if (msgDate.toDateString() !== today.toDateString()) return false
    }
    
    // Apply platform filter
    if (selectedPlatform && msg.platform !== selectedPlatform) return false
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        msg.senderName.toLowerCase().includes(query) ||
        msg.preview.toLowerCase().includes(query) ||
        msg.subject?.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Message List Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Unified Inbox</h2>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('unread')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setSelectedFilter('bookings')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === 'bookings'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bookings ({bookingCount})
            </button>
            <button
              onClick={() => setSelectedFilter('today')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === 'today'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Today ({todayCount})
            </button>
          </div>

          {/* Platform Filters */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSelectedPlatform(null)}
              className={`p-2 rounded-lg transition-colors ${
                selectedPlatform === null
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="All Platforms"
            >
              <MessageCircle size={18} />
            </button>
            {connectedPlatforms.filter(p => p.connected).map(p => {
              const Icon = platformIcons[p.platform as keyof typeof platformIcons]
              return (
                <button
                  key={p.platform}
                  onClick={() => setSelectedPlatform(selectedPlatform === p.platform ? null : p.platform)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    selectedPlatform === p.platform
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={p.platform}
                >
                  <Icon size={18} />
                  {p.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {p.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Mail size={48} className="text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No messages found</p>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery ? 'Try a different search term' : 'Connect more platforms to see messages'}
              </p>
            </div>
          ) : (
            filteredMessages.map(message => {
              const Icon = platformIcons[message.platform]
              const platformColor = platformColors[message.platform]
              
              return (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : !message.isRead
                      ? 'bg-blue-50/30 hover:bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${platformColor}20` }}
                    >
                      <Icon size={18} style={{ color: platformColor }} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.senderName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">{message.sender}</span>
                        {message.category && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: `${categoryColors[message.category]}20`,
                              color: categoryColors[message.category],
                            }}
                          >
                            {message.category}
                          </span>
                        )}
                      </div>
                      
                      {message.subject && (
                        <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                          {message.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.preview}
                      </p>
                      
                      {message.attachments && message.attachments > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          📎 {message.attachments} attachment{message.attachments > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    {!message.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Connected Platforms Status */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 mb-2">
            Connected: {connectedPlatforms.filter(p => p.connected).length} of {connectedPlatforms.length} platforms
          </div>
          <button className="w-full py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
            + Connect More Platforms
          </button>
        </div>
      </div>

      {/* Message Detail / Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Message Header */}
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedMessage.senderName[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedMessage.senderName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {React.createElement(platformIcons[selectedMessage.platform], { size: 14 })}
                      <span>{selectedMessage.sender}</span>
                      <span>•</span>
                      <span>{formatTimestamp(selectedMessage.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Star">
                    <Star size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Archive">
                    <Archive size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {selectedMessage.category && (
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `${categoryColors[selectedMessage.category]}20`,
                      color: categoryColors[selectedMessage.category],
                    }}
                  >
                    {selectedMessage.category} REQUEST
                  </span>
                  {selectedMessage.priority === 'HIGH' && (
                    <span className="text-sm px-3 py-1 rounded-full font-medium bg-red-100 text-red-700">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                {selectedMessage.subject && (
                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    {selectedMessage.subject}
                  </h4>
                )}
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedMessage.fullContent}
                </p>
              </div>

              {/* Quick Actions */}
              {userTier !== 'FREE' && (
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <CalendarIcon size={18} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Book Appointment</span>
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <DollarSign size={18} className="text-green-600" />
                      <span className="text-sm font-medium text-green-900">Send Pricing</span>
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <User size={18} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Save to Profile</span>
                    </button>
                    <button className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                      <MessageCircle size={18} className="text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Use Template</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI-Powered Smart Replies (PRO Feature) */}
              {userTier !== 'FREE' && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles size={16} className="text-purple-500" />
                      AI Reply Suggestions
                    </h4>
                    <button
                      onClick={() => setShowAISuggestions(!showAISuggestions)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAISuggestions ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showAISuggestions && (
                    <div className="space-y-2">
                      {aiSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          className="w-full p-3 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                        >
                          <p className="text-sm text-gray-700">{suggestion}</p>
                          <div className="mt-2 text-xs text-purple-600 font-medium">
                            Click to use this reply
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reply Box */}
            <div className="p-6 bg-white border-t border-gray-200">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <textarea
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        📎 Attach
                      </button>
                      {userTier !== 'FREE' && (
                        <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                          <Sparkles size={14} />
                          AI Enhance
                        </button>
                      )}
                    </div>
                    <button className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                      <Reply size={18} />
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                Reply will be sent via {selectedMessage.platform.toLowerCase()} to {selectedMessage.sender}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Mail size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Select a message to view
            </h3>
            <p className="text-gray-600 max-w-md">
              Choose a message from the list to read and respond. 
              All your conversations from different platforms in one place.
            </p>
            
            {/* Free Tier Upgrade Prompt */}
            {userTier === 'FREE' && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg max-w-md">
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  Unlock Full Unified Inbox
                </h4>
                <ul className="text-sm text-gray-700 text-left space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Connect 5 platforms (Instagram, Email, Facebook, SMS, WhatsApp)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>AI-powered categorization and smart replies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Quick actions: Book, price, template replies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Unlimited message history</span>
                  </li>
                </ul>
                <button className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                  Upgrade to PRO - $39/mo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
