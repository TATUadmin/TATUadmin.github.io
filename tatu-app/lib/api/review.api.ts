// Review API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'

export interface Review {
  id: string
  artistId: string
  clientId: string
  clientName: string
  clientAvatar?: string
  rating: number
  title: string
  comment: string
  createdAt: string
  helpfulCount: number
  unhelpfulCount: number
  artistResponse?: {
    message: string
    createdAt: string
  }
  verified: boolean
}

export interface ReviewSubmission {
  artistId: string
  rating: number
  title: string
  comment: string
  appointmentId?: string
}

export interface ReviewFilters {
  artistId?: string
  rating?: number
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
  page?: number
  limit?: number
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    [key: number]: number // 1-5 stars
  }
}

export class ReviewAPI {
  private static instance: ReviewAPI

  static getInstance(): ReviewAPI {
    if (!this.instance) {
      this.instance = new ReviewAPI()
    }
    return this.instance
  }

  // Get reviews for an artist
  async getReviews(filters: ReviewFilters): Promise<ApiResponse<Review[]>> {
    return apiClient.get('/reviews', { params: filters })
  }

  // Get a single review
  async getReview(id: string): Promise<ApiResponse<Review>> {
    return apiClient.get(`/reviews/${id}`)
  }

  // Submit a new review
  async submitReview(data: ReviewSubmission): Promise<ApiResponse<Review>> {
    AnalyticsTracker.trackFormSubmit('review', {
      artistId: data.artistId,
      rating: data.rating
    })

    return apiClient.post('/reviews', data)
  }

  // Update a review
  async updateReview(id: string, data: Partial<ReviewSubmission>): Promise<ApiResponse<Review>> {
    return apiClient.patch(`/reviews/${id}`, data)
  }

  // Delete a review
  async deleteReview(id: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('review_deleted', { reviewId: id })

    return apiClient.delete(`/reviews/${id}`)
  }

  // Mark review as helpful
  async markHelpful(id: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('review_helpful', { reviewId: id })

    return apiClient.post(`/reviews/${id}/helpful`)
  }

  // Mark review as unhelpful
  async markUnhelpful(id: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('review_unhelpful', { reviewId: id })

    return apiClient.post(`/reviews/${id}/unhelpful`)
  }

  // Report a review
  async reportReview(id: string, reason: string, details?: string): Promise<ApiResponse<any>> {
    AnalyticsTracker.track('review_reported', { reviewId: id, reason })

    return apiClient.post(`/reviews/${id}/report`, { reason, details })
  }

  // Get review statistics for an artist
  async getReviewStats(artistId: string): Promise<ApiResponse<ReviewStats>> {
    return apiClient.get(`/reviews/stats/${artistId}`)
  }

  // Artist responds to a review
  async respondToReview(reviewId: string, message: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/reviews/${reviewId}/response`, { message })
  }

  // Update artist response
  async updateResponse(reviewId: string, message: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`/reviews/${reviewId}/response`, { message })
  }

  // Delete artist response
  async deleteResponse(reviewId: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/reviews/${reviewId}/response`)
  }

  // Get reviews written by current user
  async getMyReviews(filters?: ReviewFilters): Promise<ApiResponse<Review[]>> {
    return apiClient.get('/reviews/me', { params: filters })
  }

  // Check if user can review an artist
  async canReview(artistId: string): Promise<ApiResponse<{ canReview: boolean; reason?: string }>> {
    return apiClient.get(`/reviews/can-review/${artistId}`)
  }

  // Get pending reviews (appointments that need review)
  async getPendingReviews(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/reviews/pending')
  }
}

export const reviewAPI = ReviewAPI.getInstance()

