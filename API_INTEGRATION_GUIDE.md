# API Integration Guide

Complete guide for integrating all frontend components with backend APIs.

## Table of Contents

1. [Overview](#overview)
2. [API Client Setup](#api-client-setup)
3. [Security & Middleware](#security--middleware)
4. [Analytics Tracking](#analytics-tracking)
5. [Search API Integration](#search-api-integration)
6. [Review API Integration](#review-api-integration)
7. [Payment API Integration](#payment-api-integration)
8. [Messaging API Integration](#messaging-api-integration)
9. [Notification API Integration](#notification-api-integration)
10. [Dashboard API Integration](#dashboard-api-integration)
11. [Error Handling](#error-handling)
12. [Testing](#testing)

---

## Overview

The API integration layer includes:

- **Comprehensive API Client** with security middleware, CSRF protection, rate limiting
- **Analytics Tracker** for all user interactions
- **Domain-Specific APIs**: Search, Review, Payment, Messaging, Notification, Dashboard
- **React Hooks** for easy component integration
- **TypeScript Types** for all requests and responses

### File Structure

```
tatu-app/lib/
├── api-client.ts           # Main API client with security
├── api/
│   ├── search.api.ts       # Search API
│   ├── review.api.ts       # Review API
│   ├── payment.api.ts      # Payment API
│   ├── messaging.api.ts    # Messaging API
│   ├── notification.api.ts # Notification API
│   └── dashboard.api.ts    # Dashboard API
└── hooks/
    └── useAPI.ts           # React hooks for all APIs
```

---

## API Client Setup

### Configuration

```typescript
// .env.local
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXTAUTH_SECRET=your_secret_key
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Basic Usage

```typescript
import { apiClient } from '@/lib/api-client'

// GET request
const response = await apiClient.get('/endpoint', { params: { key: 'value' } })

// POST request
const response = await apiClient.post('/endpoint', { data: 'value' })

// PUT request
const response = await apiClient.put('/endpoint', { data: 'value' })

// DELETE request
const response = await apiClient.delete('/endpoint')
```

### Response Format

```typescript
interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}
```

---

## Security & Middleware

### CSRF Protection

Automatically handled for all non-GET requests:

```typescript
// CSRF token is automatically fetched and added to headers
headers['X-CSRF-Token'] = csrfToken
```

### Rate Limiting

Client-side rate limiting (100 requests per minute per endpoint):

```typescript
if (!SecurityMiddleware.checkRateLimit(endpoint)) {
  throw new Error('Rate limit exceeded')
}
```

### Input Sanitization

All request data is automatically sanitized:

```typescript
const sanitized = SecurityMiddleware.sanitizeInput(data)
```

### Authentication

JWT tokens are automatically added:

```typescript
const token = await getSession()
headers['Authorization'] = `Bearer ${token.accessToken}`
```

---

## Analytics Tracking

### Usage

```typescript
import { AnalyticsTracker } from '@/lib/api-client'

// Track page view
AnalyticsTracker.trackPageView('/artist/123')

// Track click
AnalyticsTracker.trackClick('book-button', { artistId: '123' })

// Track form submission
AnalyticsTracker.trackFormSubmit('review-form', { rating: 5 })

// Track error
AnalyticsTracker.trackError('api_error', { endpoint: '/reviews', status: 500 })

// Custom event
AnalyticsTracker.track('custom_event', { key: 'value' })
```

### Automatic Tracking

Analytics are automatically tracked for:
- Search queries
- Form submissions (reviews, appointments, payments)
- Errors (API errors, timeouts, network errors)
- User actions (likes, follows, shares)

---

## Search API Integration

### Using the Hook

```typescript
import { useSearch, useSearchSuggestions } from '@/lib/hooks/useAPI'

function SearchComponent() {
  const [filters, setFilters] = useState({
    query: 'traditional',
    location: 'New York',
    styles: ['Traditional', 'Realism'],
    minRating: 4.5,
    sortBy: 'relevance'
  })

  const { data, loading, error, refetch } = useSearch(filters)

  // Search suggestions for autocomplete
  const { data: suggestions } = useSearchSuggestions(searchQuery)

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error.message} />

  return (
    <div>
      {data?.map(result => (
        <SearchResultCard key={result.id} result={result} />
      ))}
    </div>
  )
}
```

### Direct API Usage

```typescript
import { searchAPI } from '@/lib/api/search.api'

// Search artists
const results = await searchAPI.searchArtists({
  query: 'tattoo',
  location: 'Los Angeles',
  page: 1,
  limit: 20
})

// Get suggestions
const suggestions = await searchAPI.getSuggestions('tra')

// Save search
await searchAPI.saveSearch(filters, 'My Favorite Search')
```

---

## Review API Integration

### ReviewSubmission Component

```typescript
import { useSubmitReview, useReviewStats } from '@/lib/hooks/useAPI'

function ReviewSubmissionForm({ artistId }: { artistId: string }) {
  const { loading, error, success, submit, reset } = useSubmitReview()
  const { data: stats } = useReviewStats(artistId)

  const handleSubmit = async (formData) => {
    const success = await submit({
      artistId,
      rating: formData.rating,
      title: formData.title,
      comment: formData.comment
    })

    if (success) {
      toast.success('Review submitted!')
      reset()
    } else {
      toast.error(error?.message || 'Failed to submit review')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}
```

### ReviewList Component

```typescript
import { useReviews } from '@/lib/hooks/useAPI'
import { reviewAPI } from '@/lib/api/review.api'

function ReviewList({ artistId }: { artistId: string }) {
  const [filters, setFilters] = useState({
    artistId,
    sortBy: 'newest',
    page: 1,
    limit: 10
  })

  const { data: reviews, loading, refetch } = useReviews(filters)

  const handleHelpful = async (reviewId: string) => {
    await reviewAPI.markHelpful(reviewId)
    refetch() // Refresh the list
  }

  return (
    <div>
      {reviews?.map(review => (
        <ReviewDisplay 
          key={review.id} 
          review={review}
          onHelpful={handleHelpful}
        />
      ))}
    </div>
  )
}
```

---

## Payment API Integration

### CheckoutFlow Component

```typescript
import { useProcessPayment, usePaymentMethods } from '@/lib/hooks/useAPI'
import { paymentAPI } from '@/lib/api/payment.api'

function CheckoutFlow({ appointmentDetails }) {
  const { data: paymentMethods } = usePaymentMethods()
  const { loading, error, processDeposit, paymentIntent } = useProcessPayment()

  const handlePayment = async () => {
    const intent = await processDeposit(
      appointmentDetails.id,
      appointmentDetails.deposit
    )

    if (intent) {
      // Redirect to Stripe payment page
      window.location.href = intent.clientSecret
    } else {
      toast.error('Payment failed')
    }
  }

  return (
    <div>
      {/* Payment form */}
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : `Pay $${appointmentDetails.deposit}`}
      </button>
    </div>
  )
}
```

### Transaction History

```typescript
import { useTransactions } from '@/lib/hooks/useAPI'

function TransactionHistory() {
  const { data: transactions, loading } = useTransactions({
    page: 1,
    limit: 20,
    startDate: '2024-01-01'
  })

  return (
    <table>
      {transactions?.map(transaction => (
        <tr key={transaction.id}>
          <td>{transaction.description}</td>
          <td>${transaction.amount}</td>
          <td>{transaction.status}</td>
        </tr>
      ))}
    </table>
  )
}
```

---

## Messaging API Integration

### MessagingInterface Component

```typescript
import { useConversations, useMessages, useSendMessage } from '@/lib/hooks/useAPI'
import { messagingAPI } from '@/lib/api/messaging.api'

function MessagingInterface({ currentUserId }) {
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  
  const { data: conversations, refetch: refetchConversations } = useConversations()
  const { data: messages, refetch: refetchMessages } = useMessages(selectedConversationId)
  const { loading, send } = useSendMessage()

  const handleSendMessage = async (content: string, files?: File[]) => {
    const message = await send({
      conversationId: selectedConversationId,
      content,
      attachments: files
    })

    if (message) {
      refetchMessages()
      refetchConversations()
    }
  }

  // Mark as read when viewing
  useEffect(() => {
    if (selectedConversationId) {
      messagingAPI.markConversationAsRead(selectedConversationId)
    }
  }, [selectedConversationId])

  // Send typing indicator
  const handleTyping = useCallback(() => {
    if (selectedConversationId) {
      messagingAPI.sendTypingIndicator(selectedConversationId, true)
    }
  }, [selectedConversationId])

  return (
    <div className="flex">
      {/* Conversations list */}
      <ConversationList 
        conversations={conversations}
        onSelect={setSelectedConversationId}
      />

      {/* Messages */}
      <MessageList 
        messages={messages}
        onSend={handleSendMessage}
        onTyping={handleTyping}
        loading={loading}
      />
    </div>
  )
}
```

### Real-time Updates (WebSocket)

```typescript
import { useEffect } from 'react'

function useMessageWebSocket(conversationId: string) {
  useEffect(() => {
    const ws = new WebSocket(`wss://api.yourapp.com/messages/ws`)

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', conversationId }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'new_message') {
        // Update messages state
        refetchMessages()
      }
    }

    return () => ws.close()
  }, [conversationId])
}
```

---

## Notification API Integration

### NotificationCenter Component

```typescript
import { useNotifications, useNotificationActions } from '@/lib/hooks/useAPI'

function NotificationCenter() {
  const [filter, setFilter] = useState('all')
  
  const { data: notifications, loading, refetch } = useNotifications({
    unreadOnly: filter === 'unread'
  })

  const { markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationActions()

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    refetch()
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    refetch()
  }

  return (
    <div>
      <button onClick={handleMarkAllAsRead}>Mark All Read</button>
      {notifications?.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  )
}
```

### NotificationDropdown Component

```typescript
import { useUnreadNotificationCount } from '@/lib/hooks/useAPI'

function NotificationDropdown() {
  const { count, refetch } = useUnreadNotificationCount()

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return (
    <button className="relative">
      <BellIcon />
      {count > 0 && (
        <span className="badge">{count > 9 ? '9+' : count}</span>
      )}
    </button>
  )
}
```

---

## Dashboard API Integration

### Dashboard Page

```typescript
import {
  useDashboardStats,
  useRecentActivity,
  useUpcomingAppointments
} from '@/lib/hooks/useAPI'

function DashboardPage() {
  const { data: stats, loading: statsLoading } = useDashboardStats()
  const { data: activity } = useRecentActivity(10)
  const { data: appointments } = useUpcomingAppointments({ limit: 5 })

  if (statsLoading) return <DashboardSkeleton />

  return (
    <DashboardLayout>
      <DashboardStats stats={stats} />
      <RecentActivity activities={activity} />
      <UpcomingAppointments appointments={appointments} />
    </DashboardLayout>
  )
}
```

### Appointment Management

```typescript
import { useAppointmentActions, useAppointments } from '@/lib/hooks/useAPI'

function AppointmentManager() {
  const { data: appointments, refetch } = useAppointments()
  const {
    loading,
    createAppointment,
    cancelAppointment,
    confirmAppointment
  } = useAppointmentActions()

  const handleCreate = async (data) => {
    const appointment = await createAppointment(data)
    if (appointment) {
      toast.success('Appointment created!')
      refetch()
    }
  }

  const handleCancel = async (id: string) => {
    const success = await cancelAppointment(id, 'Client request')
    if (success) {
      toast.success('Appointment cancelled')
      refetch()
    }
  }

  return (
    <div>
      {appointments?.map(appointment => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={handleCancel}
        />
      ))}
    </div>
  )
}
```

---

## Error Handling

### Global Error Handler

```typescript
// In your root layout or app component
function GlobalErrorHandler({ children }) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      AnalyticsTracker.trackError('uncaught_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno
      })
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return children
}
```

### Component Error Handling

```typescript
import { ErrorState } from '@/app/components/ErrorState'

function MyComponent() {
  const { data, loading, error, refetch } = useSearch(filters)

  if (loading) return <LoadingState />
  
  if (error) {
    return (
      <ErrorState
        type="error"
        title="Failed to load data"
        message={error.message}
        action={{ label: 'Try Again', onClick: refetch }}
      />
    )
  }

  return <div>{/* Your content */}</div>
}
```

---

## Testing

### API Mock Setup

```typescript
// __mocks__/api-client.ts
export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}

// In your test
import { apiClient } from '@/lib/api-client'

jest.mock('@/lib/api-client')

test('fetches data', async () => {
  (apiClient.get as jest.Mock).mockResolvedValue({
    data: { results: [] },
    success: true
  })

  render(<SearchComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('No results')).toBeInTheDocument()
  })
})
```

### Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useSearch } from '@/lib/hooks/useAPI'

test('useSearch hook', async () => {
  const { result } = renderHook(() => useSearch({ query: 'test' }))

  expect(result.current.loading).toBe(true)

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeDefined()
  })
})
```

---

## Summary

### What's Integrated

✅ **API Client** with security, rate limiting, CSRF protection  
✅ **Search API** for artists, portfolios, suggestions  
✅ **Review API** for submissions, ratings, moderation  
✅ **Payment API** for checkout, deposits, transactions  
✅ **Messaging API** for real-time chat  
✅ **Notification API** for alerts and inbox  
✅ **Dashboard API** for stats, appointments, analytics  
✅ **Analytics Tracking** for all user interactions  
✅ **React Hooks** for easy integration  
✅ **TypeScript Types** for all APIs  
✅ **Error Handling** at all levels  

### Backend Requirements

Your backend should implement these endpoints:

```
POST /api/auth/csrf
GET /api/search
GET /api/reviews
POST /api/reviews
GET /api/payments/methods
POST /api/payments/intent
GET /api/messages/conversations
POST /api/messages
GET /api/notifications
GET /api/dashboard/stats
POST /api/analytics/events
```

### Next Steps

1. Set up environment variables
2. Implement backend endpoints
3. Replace mock data in components with API hooks
4. Test with real data
5. Add WebSocket for real-time features
6. Deploy!

All components are now ready to connect to your backend APIs! 🚀

