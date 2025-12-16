// Dashboard API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'

export interface DashboardStats {
  totalAppointments: number
  totalRevenue: number
  activeClients: number
  portfolioViews: number
  averageRating: number
  completionRate: number
  responseTime: number
}

export interface RecentActivity {
  id: string
  type: 'booking' | 'review' | 'payment' | 'message' | 'portfolio'
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientAvatar?: string
  artistId: string
  artistName: string
  serviceId: string
  serviceName: string
  title: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  totalPrice: number
  deposit: number
  depositPaid: boolean
  location: string
  notes?: string
  specialRequests?: string
  createdAt: string
}

export interface AnalyticsData {
  period: string
  revenue: number[]
  appointments: number[]
  portfolioViews: number[]
  newClients: number[]
  labels: string[]
}

export class DashboardAPI {
  private static instance: DashboardAPI

  static getInstance(): DashboardAPI {
    if (!this.instance) {
      this.instance = new DashboardAPI()
    }
    return this.instance
  }

  // Get dashboard overview stats
  async getStats(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get('/dashboard/stats', { params })
  }

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<ApiResponse<RecentActivity[]>> {
    return apiClient.get('/dashboard/activity', { params: { limit } })
  }

  // Get upcoming appointments
  async getUpcomingAppointments(params?: {
    limit?: number
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get('/dashboard/appointments/upcoming', { params })
  }

  // Get all appointments
  async getAppointments(params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
    artistId?: string
    clientId?: string
  }): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get('/dashboard/appointments', { params })
  }

  // Get single appointment
  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get(`/dashboard/appointments/${id}`)
  }

  // Create appointment
  async createAppointment(data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    AnalyticsTracker.trackFormSubmit('appointment_created', {
      artistId: data.artistId,
      service: data.serviceName
    })

    return apiClient.post('/dashboard/appointments', data)
  }

  // Update appointment
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<ApiResponse<Appointment>> {
    return apiClient.patch(`/dashboard/appointments/${id}`, data)
  }

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('appointment_cancelled', { appointmentId: id })

    return apiClient.post(`/dashboard/appointments/${id}/cancel`, { reason })
  }

  // Confirm appointment
  async confirmAppointment(id: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('appointment_confirmed', { appointmentId: id })

    return apiClient.post(`/dashboard/appointments/${id}/confirm`)
  }

  // Complete appointment
  async completeAppointment(id: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/dashboard/appointments/${id}/complete`)
  }

  // Get analytics data
  async getAnalytics(params: {
    period: 'day' | 'week' | 'month' | 'year'
    startDate?: string
    endDate?: string
    metrics?: string[]
  }): Promise<ApiResponse<AnalyticsData>> {
    return apiClient.get('/dashboard/analytics', { params })
  }

  // Get portfolio stats
  async getPortfolioStats(): Promise<ApiResponse<{
    totalItems: number
    totalViews: number
    totalLikes: number
    topPerforming: any[]
    recentUploads: any[]
  }>> {
    return apiClient.get('/dashboard/portfolio/stats')
  }

  // Get revenue breakdown
  async getRevenueBreakdown(params?: {
    startDate?: string
    endDate?: string
    groupBy?: 'day' | 'week' | 'month'
  }): Promise<ApiResponse<{
    total: number
    breakdown: Array<{ period: string; amount: number }>
    byService: Array<{ service: string; amount: number }>
  }>> {
    return apiClient.get('/dashboard/revenue', { params })
  }

  // Get client statistics
  async getClientStats(): Promise<ApiResponse<{
    totalClients: number
    newClients: number
    returningClients: number
    topClients: any[]
  }>> {
    return apiClient.get('/dashboard/clients/stats')
  }

  // Get performance metrics
  async getPerformanceMetrics(params?: {
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{
    averageRating: number
    reviewCount: number
    responseTime: number
    bookingRate: number
    cancellationRate: number
    repeatClientRate: number
  }>> {
    return apiClient.get('/dashboard/performance', { params })
  }

  // Get availability calendar
  async getAvailability(params: {
    artistId?: string
    startDate: string
    endDate: string
  }): Promise<ApiResponse<Array<{
    date: string
    slots: Array<{
      startTime: string
      endTime: string
      available: boolean
    }>
  }>>> {
    return apiClient.get('/dashboard/availability', { params })
  }

  // Update availability
  async updateAvailability(data: {
    date: string
    slots: Array<{
      startTime: string
      endTime: string
      available: boolean
    }>
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/dashboard/availability', data)
  }

  // Get notifications for dashboard
  async getDashboardNotifications(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/dashboard/notifications')
  }

  // Get pending actions
  async getPendingActions(): Promise<ApiResponse<{
    pendingBookings: number
    unansweredMessages: number
    pendingReviews: number
    overduePayments: number
  }>> {
    return apiClient.get('/dashboard/pending-actions')
  }

  // Export data
  async exportData(params: {
    type: 'appointments' | 'revenue' | 'clients'
    format: 'csv' | 'pdf' | 'excel'
    startDate?: string
    endDate?: string
  }): Promise<ApiResponse<{ url: string }>> {
    AnalyticsTracker.track('dashboard_export', params)

    return apiClient.post('/dashboard/export', params)
  }
}

export const dashboardAPI = DashboardAPI.getInstance()

