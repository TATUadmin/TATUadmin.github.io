// React Hooks for API Integration

import { useState, useEffect, useCallback } from 'use'
import { searchAPI, SearchFilters, SearchResult } from '../api/search.api'
import { reviewAPI, Review, ReviewSubmission, ReviewFilters } from '../api/review.api'
import { paymentAPI, PaymentMethod, Transaction } from '../api/payment.api'
import { messagingAPI, Conversation, Message, SendMessageData } from '../api/messaging.api'
import { notificationAPI } from '../api/notification.api'
import { dashboardAPI, DashboardStats, Appointment } from '../api/dashboard.api'
import type { Notification } from '@/app/components/NotificationCenter'
import { ApiResponse, ApiError } from '../api-client'

// Generic API Hook
interface UseAPIState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseAPIReturn<T> extends UseAPIState<T> {
  refetch: () => Promise<void>
  setData: (data: T | null) => void
}

function useAPI<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = [],
  immediate: boolean = true
): UseAPIReturn<T> {
  const [state, setState] = useState<UseAPIState<T>>({
    data: null,
    loading: immediate,
    error: null
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const response = await apiCall()
      setState({ data: response.data, loading: false, error: null })
    } catch (error: any) {
      setState({ data: null, loading: false, error })
    }
  }, dependencies)

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return { ...state, refetch: fetchData, setData }
}

// Search Hooks
export function useSearch(filters: SearchFilters) {
  return useAPI(
    () => searchAPI.search(filters),
    [JSON.stringify(filters)]
  )
}

export function useSearchSuggestions(query: string) {
  return useAPI(
    () => searchAPI.getSuggestions(query),
    [query],
    query.length >= 2 // Only search when query is 2+ characters
  )
}

export function useTrendingArtists(limit: number = 10) {
  return useAPI(
    () => searchAPI.getTrendingArtists(limit),
    [limit]
  )
}

// Review Hooks
export function useReviews(filters: ReviewFilters) {
  return useAPI(
    () => reviewAPI.getReviews(filters),
    [JSON.stringify(filters)]
  )
}

export function useReviewStats(artistId: string) {
  return useAPI(
    () => reviewAPI.getReviewStats(artistId),
    [artistId]
  )
}

export function useSubmitReview() {
  const [state, setState] = useState<{
    loading: boolean
    error: ApiError | null
    success: boolean
  }>({
    loading: false,
    error: null,
    success: false
  })

  const submit = useCallback(async (data: ReviewSubmission) => {
    setState({ loading: true, error: null, success: false })
    try {
      await reviewAPI.submitReview(data)
      setState({ loading: false, error: null, success: true })
      return true
    } catch (error: any) {
      setState({ loading: false, error, success: false })
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false })
  }, [])

  return { ...state, submit, reset }
}

// Payment Hooks
export function usePaymentMethods() {
  return useAPI(() => paymentAPI.getPaymentMethods(), [])
}

export function useTransactions(params?: any) {
  return useAPI(
    () => paymentAPI.getTransactions(params),
    [JSON.stringify(params)]
  )
}

export function usePaymentStats(params?: any) {
  return useAPI(
    () => paymentAPI.getPaymentStats(params),
    [JSON.stringify(params)]
  )
}

export function useProcessPayment() {
  const [state, setState] = useState<{
    loading: boolean
    error: ApiError | null
    success: boolean
    paymentIntent: any | null
  }>({
    loading: false,
    error: null,
    success: false,
    paymentIntent: null
  })

  const processDeposit = useCallback(async (appointmentId: string, amount: number) => {
    setState({ loading: true, error: null, success: false, paymentIntent: null })
    try {
      const response = await paymentAPI.processDeposit(appointmentId, amount)
      setState({ loading: false, error: null, success: true, paymentIntent: response.data })
      return response.data
    } catch (error: any) {
      setState({ loading: false, error, success: false, paymentIntent: null })
      return null
    }
  }, [])

  const processFullPayment = useCallback(async (appointmentId: string) => {
    setState({ loading: true, error: null, success: false, paymentIntent: null })
    try {
      const response = await paymentAPI.processFullPayment(appointmentId)
      setState({ loading: false, error: null, success: true, paymentIntent: response.data })
      return response.data
    } catch (error: any) {
      setState({ loading: false, error, success: false, paymentIntent: null })
      return null
    }
  }, [])

  return { ...state, processDeposit, processFullPayment }
}

// Messaging Hooks
export function useConversations(params?: any) {
  return useAPI(
    () => messagingAPI.getConversations(params),
    [JSON.stringify(params)]
  )
}

export function useMessages(conversationId: string, params?: any) {
  return useAPI(
    () => messagingAPI.getMessages(conversationId, params),
    [conversationId, JSON.stringify(params)],
    !!conversationId
  )
}

export function useSendMessage() {
  const [state, setState] = useState<{
    loading: boolean
    error: ApiError | null
  }>({
    loading: false,
    error: null
  })

  const send = useCallback(async (data: SendMessageData) => {
    setState({ loading: true, error: null })
    try {
      const response = await messagingAPI.sendMessage(data)
      setState({ loading: false, error: null })
      return response.data
    } catch (error: any) {
      setState({ loading: false, error })
      return null
    }
  }, [])

  return { ...state, send }
}

export function useUnreadMessageCount() {
  const { data, refetch } = useAPI(() => messagingAPI.getUnreadCount(), [])
  
  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return { count: data?.count || 0, refetch }
}

// Notification Hooks
export function useNotifications(params?: any) {
  return useAPI(
    () => notificationAPI.getNotifications(params),
    [JSON.stringify(params)]
  )
}

export function useUnreadNotificationCount() {
  const { data, refetch } = useAPI(() => notificationAPI.getUnreadCount(), [])
  
  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(refetch, 30000)
    return () => clearInterval(interval)
  }, [refetch])

  return { count: data?.count || 0, refetch }
}

export function useNotificationActions() {
  const [loading, setLoading] = useState(false)

  const markAsRead = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await notificationAPI.markAsRead(id)
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    setLoading(true)
    try {
      await notificationAPI.markAllAsRead()
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await notificationAPI.deleteNotification(id)
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearAll = useCallback(async () => {
    setLoading(true)
    try {
      await notificationAPI.clearAll()
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, markAsRead, markAllAsRead, deleteNotification, clearAll }
}

// Dashboard Hooks
export function useDashboardStats(params?: any) {
  return useAPI(
    () => dashboardAPI.getStats(params),
    [JSON.stringify(params)]
  )
}

export function useRecentActivity(limit: number = 10) {
  return useAPI(
    () => dashboardAPI.getRecentActivity(limit),
    [limit]
  )
}

export function useUpcomingAppointments(params?: any) {
  return useAPI(
    () => dashboardAPI.getUpcomingAppointments(params),
    [JSON.stringify(params)]
  )
}

export function useAppointments(params?: any) {
  return useAPI(
    () => dashboardAPI.getAppointments(params),
    [JSON.stringify(params)]
  )
}

export function useAppointment(id: string) {
  return useAPI(
    () => dashboardAPI.getAppointment(id),
    [id],
    !!id
  )
}

export function useAppointmentActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const createAppointment = useCallback(async (data: Partial<Appointment>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardAPI.createAppointment(data)
      return response.data
    } catch (err: any) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAppointment = useCallback(async (id: string, data: Partial<Appointment>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardAPI.updateAppointment(id, data)
      return response.data
    } catch (err: any) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      await dashboardAPI.cancelAppointment(id, reason)
      return true
    } catch (err: any) {
      setError(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmAppointment = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await dashboardAPI.confirmAppointment(id)
      return true
    } catch (err: any) {
      setError(err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, createAppointment, updateAppointment, cancelAppointment, confirmAppointment }
}

export function useDashboardAnalytics(params: any) {
  return useAPI(
    () => dashboardAPI.getAnalytics(params),
    [JSON.stringify(params)]
  )
}

export function usePerformanceMetrics(params?: any) {
  return useAPI(
    () => dashboardAPI.getPerformanceMetrics(params),
    [JSON.stringify(params)]
  )
}

