'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'
import { 
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  StarIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  BellIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  clientId: string
  clientName: string
  clientAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  lastSeen: string
  appointmentId?: string
  appointmentDate?: string
}

interface Conversation {
  id: string
  clientId: string
  clientName: string
  clientAvatar: string
  messages: ChatMessage[]
  appointmentId?: string
  appointmentDate?: string
  status: 'active' | 'archived' | 'resolved'
}

interface ChatMessage {
  id: string
  senderId: string
  senderType: 'artist' | 'client'
  content: string
  timestamp: string
  isRead: boolean
  messageType: 'text' | 'image' | 'file' | 'template'
  attachments?: string[]
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'appointment' | 'follow-up' | 'reminder' | 'custom'
  isDefault: boolean
  variables: string[]
}

interface QuickResponse {
  id: string
  title: string
  content: string
  category: 'greeting' | 'pricing' | 'availability' | 'aftercare' | 'custom'
  useCount: number
}

export default function CommunicationsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'history' | 'quick-responses'>('messages')
  const [conversations, setConversations] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false)
  const [showNewResponseModal, setShowNewResponseModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'appointment' as EmailTemplate['category']
  })
  const [responseForm, setResponseForm] = useState({
    title: '',
    content: '',
    category: 'greeting' as QuickResponse['category']
  })

  useEffect(() => {
    if (session?.user) {
      fetchConversations()
      fetchEmailTemplates()
      fetchQuickResponses()
    }
  }, [session])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - in real app, this would come from API
      const mockConversations: Message[] = [
        {
          id: '1',
          clientId: 'client1',
          clientName: 'Sarah Johnson',
          clientAvatar: '/api/placeholder/40/40',
          lastMessage: 'Hi! I have a question about the consultation tomorrow',
          lastMessageTime: '2024-02-14T15:30:00Z',
          unreadCount: 2,
          isOnline: true,
          lastSeen: '2024-02-14T15:30:00Z',
          appointmentId: 'apt1',
          appointmentDate: '2024-02-15'
        },
        {
          id: '2',
          clientId: 'client2',
          clientName: 'Mike Chen',
          clientAvatar: '/api/placeholder/40/40',
          lastMessage: 'Thanks for the info! Looking forward to it',
          lastMessageTime: '2024-02-14T14:15:00Z',
          unreadCount: 0,
          isOnline: false,
          lastSeen: '2024-02-14T14:15:00Z',
          appointmentId: 'apt2',
          appointmentDate: '2024-02-16'
        },
        {
          id: '3',
          clientId: 'client3',
          clientName: 'Emma Rodriguez',
          clientAvatar: '/api/placeholder/40/40',
          lastMessage: 'Can you send me the aftercare instructions?',
          lastMessageTime: '2024-02-14T12:45:00Z',
          unreadCount: 1,
          isOnline: false,
          lastSeen: '2024-02-14T12:45:00Z',
          appointmentId: 'apt3',
          appointmentDate: '2024-02-17'
        }
      ]

      setConversations(mockConversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEmailTemplates = async () => {
    try {
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Appointment Confirmation',
          subject: 'Your appointment with {artistName} is confirmed',
          content: `Hi {clientName},

Your appointment for {serviceName} on {appointmentDate} at {appointmentTime} has been confirmed.

Please arrive 10 minutes early and bring:
- Valid ID
- Payment method
- Any reference images

If you need to reschedule, please contact us at least 24 hours in advance.

See you soon!
{artistName}`,
          category: 'appointment',
          isDefault: true,
          variables: ['{clientName}', '{artistName}', '{serviceName}', '{appointmentDate}', '{appointmentTime}']
        },
        {
          id: '2',
          name: 'Appointment Reminder',
          subject: 'Reminder: Your appointment tomorrow',
          content: `Hi {clientName},

This is a friendly reminder that you have an appointment tomorrow at {appointmentTime}.

Please remember to:
- Get a good night's sleep
- Stay hydrated
- Avoid alcohol 24 hours before
- Bring your ID and payment

See you tomorrow!
{artistName}`,
          category: 'reminder',
          isDefault: true,
          variables: ['{clientName}', '{artistName}', '{appointmentTime}']
        },
        {
          id: '3',
          name: 'Aftercare Instructions',
          subject: 'Aftercare instructions for your new tattoo',
          content: `Hi {clientName},

Congratulations on your new tattoo! Here are the aftercare instructions:

1. Keep the bandage on for 2-4 hours
2. Wash gently with mild soap and warm water
3. Apply thin layer of ointment 2-3 times daily
4. Keep out of direct sunlight and pools for 2 weeks
5. Don't scratch or pick at scabs

If you have any questions or concerns, don't hesitate to reach out.

Happy healing!
{artistName}`,
          category: 'follow-up',
          isDefault: true,
          variables: ['{clientName}', '{artistName}']
        }
      ]

      setEmailTemplates(mockTemplates)
    } catch (error) {
      console.error('Error fetching email templates:', error)
    }
  }

  const fetchQuickResponses = async () => {
    try {
      const mockResponses: QuickResponse[] = [
        {
          id: '1',
          title: 'Greeting',
          content: 'Hi! Thanks for reaching out. How can I help you today?',
          category: 'greeting',
          useCount: 15
        },
        {
          id: '2',
          title: 'Pricing Info',
          content: 'My consultation fee is $50, which goes toward your tattoo if you book. Small tattoos start at $100, medium at $200, and large pieces are priced by the hour at $150/hour.',
          category: 'pricing',
          useCount: 8
        },
        {
          id: '3',
          title: 'Availability',
          content: 'I typically have availability on Tuesdays, Thursdays, and Saturdays. I can also accommodate evening appointments on weekdays. What works best for you?',
          category: 'availability',
          useCount: 12
        },
        {
          id: '4',
          title: 'Aftercare',
          content: 'Keep the bandage on for 2-4 hours, then wash gently with mild soap. Apply ointment 2-3 times daily and keep it out of direct sunlight for 2 weeks. No swimming or soaking!',
          category: 'aftercare',
          useCount: 6
        }
      ]

      setQuickResponses(mockResponses)
    } catch (error) {
      console.error('Error fetching quick responses:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        senderId: session?.user?.id || '',
        senderType: 'artist',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isRead: false,
        messageType: 'text'
      }

      // In real app, send message via API
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null)

      setNewMessage('')
      toast.success('Message sent!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  const handleUseQuickResponse = (response: QuickResponse) => {
    setNewMessage(response.content)
    // Update use count
    setQuickResponses(prev => 
      prev.map(r => r.id === response.id ? { ...r, useCount: r.useCount + 1 } : r)
    )
  }

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.content) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const newTemplate: EmailTemplate = {
        id: Date.now().toString(),
        name: templateForm.name,
        subject: templateForm.subject,
        content: templateForm.content,
        category: templateForm.category,
        isDefault: false,
        variables: extractVariables(templateForm.content)
      }

      setEmailTemplates(prev => [...prev, newTemplate])
      setShowNewTemplateModal(false)
      setTemplateForm({ name: '', subject: '', content: '', category: 'appointment' })
      toast.success('Email template created!')
    } catch (error) {
      console.error('Error creating template:', error)
      toast.error('Failed to create template')
    }
  }

  const handleCreateQuickResponse = async () => {
    if (!responseForm.title || !responseForm.content) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const newResponse: QuickResponse = {
        id: Date.now().toString(),
        title: responseForm.title,
        content: responseForm.content,
        category: responseForm.category,
        useCount: 0
      }

      setQuickResponses(prev => [...prev, newResponse])
      setShowNewResponseModal(false)
      setResponseForm({ title: '', content: '', category: 'greeting' })
      toast.success('Quick response created!')
    } catch (error) {
      console.error('Error creating quick response:', error)
      toast.error('Failed to create quick response')
    }
  }

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{([^}]+)\}/g
    const variables: string[] = []
    let match

    while ((match = variableRegex.exec(content)) !== null) {
      variables.push(match[0])
    }

    return [...new Set(variables)]
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getUnreadCount = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    return conversation?.unreadCount || 0
  }

  if (!session?.user) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Please sign in to access communications.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="artist">
      <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Client Communications</h1>
              <p className="text-gray-600 mt-1">Manage client relationships and communication</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'messages', label: 'Messages', icon: <ChatBubbleLeftRightIcon className="h-5 w-5" /> },
              { id: 'templates', label: 'Email Templates', icon: <DocumentTextIcon className="h-5 w-5" /> },
              { id: 'quick-responses', label: 'Quick Responses', icon: <SparklesIcon className="h-5 w-5" /> },
              { id: 'history', label: 'Communication History', icon: <ArchiveBoxIcon className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        // In real app, fetch full conversation
                        setSelectedConversation({
                          id: conversation.id,
                          clientId: conversation.clientId,
                          clientName: conversation.clientName,
                          clientAvatar: conversation.clientAvatar,
                          messages: [],
                          appointmentId: conversation.appointmentId,
                          appointmentDate: conversation.appointmentDate,
                          status: 'active'
                        })
                      }}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={conversation.clientAvatar}
                            alt={conversation.clientName}
                            className="w-10 h-10 rounded-full"
                          />
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {conversation.clientName}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatTime(conversation.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.lastMessage}
                          </p>
                          {conversation.appointmentDate && (
                            <div className="flex items-center gap-1 mt-1">
                              <CalendarIcon className="h-3 w-3 text-indigo-500" />
                              <span className="text-xs text-indigo-600">
                                {new Date(conversation.appointmentDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {conversation.unreadCount > 0 && (
                          <div className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedConversation.clientAvatar}
                          alt={selectedConversation.clientName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {selectedConversation.clientName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedConversation.appointmentDate && 
                              `Appointment: ${new Date(selectedConversation.appointmentDate).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <PhoneIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <EnvelopeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === 'artist' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderType === 'artist'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderType === 'artist' ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <PaperAirplaneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border h-[600px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
              <button
                onClick={() => setShowNewTemplateModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {emailTemplates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.category === 'appointment' ? 'bg-blue-100 text-blue-800' :
                          template.category === 'reminder' ? 'bg-yellow-100 text-yellow-800' :
                          template.category === 'follow-up' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {template.category}
                        </span>
                        {template.isDefault && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                      Use Template
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                      Edit
                    </button>
                    {!template.isDefault && (
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Responses Tab */}
        {activeTab === 'quick-responses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Quick Responses</h2>
              <button
                onClick={() => setShowNewResponseModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Response
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickResponses.map((response) => (
                <div key={response.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{response.title}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          response.category === 'greeting' ? 'bg-blue-100 text-blue-800' :
                          response.category === 'pricing' ? 'bg-green-100 text-green-800' :
                          response.category === 'availability' ? 'bg-yellow-100 text-yellow-800' :
                          response.category === 'aftercare' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {response.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          Used {response.useCount} times
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3">{response.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUseQuickResponse(response)}
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Use Response
                    </button>
                    <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Communication History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Communication History</h2>
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <p className="text-gray-600">Communication history and analytics coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* New Template Modal */}
      {showNewTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Email Template</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Appointment Confirmation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="appointment">Appointment</option>
                  <option value="reminder">Reminder</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Your appointment is confirmed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your email template here. Use {variableName} for dynamic content."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variables like {'{clientName}'}, {'{appointmentDate}'}, {'{artistName}'} for dynamic content
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewTemplateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Quick Response Modal */}
      {showNewResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Quick Response</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={responseForm.title}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Pricing Information"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={responseForm.category}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="greeting">Greeting</option>
                  <option value="pricing">Pricing</option>
                  <option value="availability">Availability</option>
                  <option value="aftercare">Aftercare</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Content</label>
                <textarea
                  value={responseForm.content}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your quick response here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewResponseModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateQuickResponse}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create Response
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  )
}
