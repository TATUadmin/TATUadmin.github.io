// Search API Service

import { apiClient, ApiResponse } from '../api-client'
import { AnalyticsTracker } from '../api-client'

export interface SearchFilters {
  query?: string
  location?: string
  styles?: string[]
  minRating?: number
  priceRange?: { min: number; max: number }
  availability?: 'available' | 'all'
  sortBy?: 'relevance' | 'rating' | 'price' | 'distance'
  page?: number
  limit?: number
}

export interface SearchResult {
  id: string
  type: 'artist' | 'portfolio' | 'shop'
  name: string
  description: string
  imageUrl?: string
  rating?: number
  location?: string
  price?: number
  distance?: number
  highlights?: string[]
}

export interface SearchSuggestion {
  text: string
  type: 'artist' | 'style' | 'location'
  count?: number
}

export class SearchAPI {
  private static instance: SearchAPI

  static getInstance(): SearchAPI {
    if (!this.instance) {
      this.instance = new SearchAPI()
    }
    return this.instance
  }

  // Search artists, portfolios, and shops
  async search(filters: SearchFilters): Promise<ApiResponse<SearchResult[]>> {
    AnalyticsTracker.track('search', { query: filters.query, filters })

    return apiClient.get('/search', { params: filters })
  }

  // Get search suggestions (autocomplete)
  async getSuggestions(query: string): Promise<ApiResponse<SearchSuggestion[]>> {
    return apiClient.get('/search/suggestions', { params: { query } })
  }

  // Get popular searches
  async getPopularSearches(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/search/popular')
  }

  // Get trending artists
  async getTrendingArtists(limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiClient.get('/search/trending/artists', { params: { limit } })
  }

  // Get trending styles
  async getTrendingStyles(): Promise<ApiResponse<string[]>> {
    return apiClient.get('/search/trending/styles')
  }

  // Search artists specifically
  async searchArtists(filters: SearchFilters): Promise<ApiResponse<any[]>> {
    AnalyticsTracker.track('search_artists', { filters })

    return apiClient.get('/search/artists', { params: filters })
  }

  // Search portfolio items
  async searchPortfolio(filters: SearchFilters): Promise<ApiResponse<any[]>> {
    AnalyticsTracker.track('search_portfolio', { filters })

    return apiClient.get('/search/portfolio', { params: filters })
  }

  // Get search filters (available options)
  async getSearchFilters(): Promise<ApiResponse<{
    styles: string[]
    locations: string[]
    priceRanges: Array<{ min: number; max: number; label: string }>
  }>> {
    return apiClient.get('/search/filters')
  }

  // Save search (for logged-in users)
  async saveSearch(filters: SearchFilters, name: string): Promise<ApiResponse<any>> {
    return apiClient.post('/search/saved', { filters, name })
  }

  // Get saved searches
  async getSavedSearches(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/search/saved')
  }

  // Delete saved search
  async deleteSavedSearch(id: string): Promise<ApiResponse<any>> {
    return apiClient.delete(`/search/saved/${id}`)
  }
}

export const searchAPI = SearchAPI.getInstance()

