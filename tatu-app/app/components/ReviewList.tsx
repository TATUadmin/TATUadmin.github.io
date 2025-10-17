'use client'

import { useState, useMemo } from 'react'
import ReviewDisplay, { Review } from './ReviewDisplay'
import { StarIcon } from '@heroicons/react/24/solid'
import { FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  onHelpful?: (reviewId: string) => void
  onNotHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  showCategories?: boolean
}

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  ratingDistribution,
  onHelpful,
  onNotHelpful,
  onReport,
  showCategories = true
}: ReviewListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews

    // Filter by rating
    if (filterRating !== null) {
      filtered = filtered.filter(review => review.rating === filterRating)
    }

    // Sort reviews
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'helpful':
          return b.helpful - a.helpful
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return sorted
  }, [reviews, filterRating, sortBy])

  const calculatePercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0
  }

  return (
    <div className="space-y-8">
      {/* Rating Overview */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
              <div className="text-6xl font-bold text-white">{averageRating.toFixed(1)}</div>
              <div>
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round(averageRating) ? 'text-white' : 'text-gray-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-400 text-sm">{totalReviews} reviews</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                className={`w-full flex items-center space-x-3 group transition-colors ${
                  filterRating === rating ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                }`}
              >
                <span className="text-sm text-white font-medium w-8">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      filterRating === rating ? 'bg-white' : 'bg-gray-600 group-hover:bg-gray-500'
                    }`}
                    style={{ width: `${calculatePercentage(ratingDistribution[rating as keyof typeof ratingDistribution])}%` }}
                  />
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">
                  {ratingDistribution[rating as keyof typeof ratingDistribution]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-800 hover:bg-gray-800 transition-colors"
          >
            <FunnelIcon className="w-5 h-5" />
            <span>Filters</span>
            {filterRating !== null && (
              <span className="ml-2 px-2 py-0.5 bg-white text-black text-xs rounded-full font-semibold">
                1
              </span>
            )}
          </button>

          {filterRating !== null && (
            <button
              onClick={() => setFilterRating(null)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-800 focus:border-white focus:ring-1 focus:ring-white transition-colors text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {filteredAndSortedReviews.length} of {totalReviews} reviews
        {filterRating !== null && ` with ${filterRating} stars`}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
            <p className="text-gray-400">No reviews found matching your filters.</p>
            {filterRating !== null && (
              <button
                onClick={() => setFilterRating(null)}
                className="mt-4 text-white hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <ReviewDisplay
              key={review.id}
              review={review}
              onHelpful={onHelpful}
              onNotHelpful={onNotHelpful}
              onReport={onReport}
              showCategories={showCategories}
            />
          ))
        )}
      </div>
    </div>
  )
}

