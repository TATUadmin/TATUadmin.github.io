// Notification API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'
import type { Notification, NotificationType } from '@/app/components/NotificationCenter'

export interface NotificationPreferences {
  email: {
    bookings: boolean
    messages: boolean
    reviews: boolean
    payments: boolean
    marketing: boolean
  }
  push: {
    bookings: boolean
    messages: boolean
    reviews: boolean
    payments: boolean
  }
  sms: {
    bookings: boolean
    reminders: boolean
  }
}

export class NotificationAPI {
  private static instance: NotificationAPI

  static getInstance(): NotificationAPI {
    if (!this.instance) {
      this.instance = new NotificationAPI()
    }
    return this.instance
  }

  // Get all notifications
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
    type?: NotificationType
  }): Promise<ApiResponse<Notification[]>> {
    return apiClient.get('/notifications', { params })
  }

  // Get single notification
  async getNotification(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.get(`/notifications/${id}`)
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/notifications/${id}/read`)
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('notifications_mark_all_read')

    return apiClient.post('/notifications/mark-all-read')
  }

  // Delete notification
  async deleteNotification(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/notifications/${id}`)
  }

  // Clear all notifications
  async clearAll(): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('notifications_clear_all')

    return apiClient.delete('/notifications')
  }

  // Get unread count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get('/notifications/unread/count')
  }

  // Get notification preferences
  async getPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get('/notifications/preferences')
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<ApiResponse<NotificationPreferences>> {
    AnalyticsTracker.track('notification_preferences_updated')

    return apiClient.patch('/notifications/preferences', preferences)
  }

  // Register device for push notifications
  async registerDevice(data: {
    token: string
    platform: 'ios' | 'android' | 'web'
    deviceId: string
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/notifications/devices', data)
  }

  // Unregister device
  async unregisterDevice(deviceId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/notifications/devices/${deviceId}`)
  }

  // Test push notification
  async testPushNotification(): Promise<ApiResponse<any>> {
    return apiClient.post('/notifications/test-push')
  }

  // Get notification history (archived)
  async getHistory(params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    type?: NotificationType
  }): Promise<ApiResponse<Notification[]>> {
    return apiClient.get('/notifications/history', { params })
  }

  // Snooze notification
  async snoozeNotification(id: string, duration: number): Promise<ApiResponse<any>> {
    return apiClient.post(`/notifications/${id}/snooze`, { duration })
  }

  // Get snoozed notifications
  async getSnoozedNotifications(): Promise<ApiResponse<Notification[]>> {
    return apiClient.get('/notifications/snoozed')
  }

  // Subscribe to notification channel
  async subscribe(channel: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/notifications/subscribe/${channel}`)
  }

  // Unsubscribe from notification channel
  async unsubscribe(channel: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/notifications/unsubscribe/${channel}`)
  }

  // Get subscribed channels
  async getSubscriptions(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/notifications/subscriptions')
  }
}

export const notificationAPI = NotificationAPI.getInstance()

