'use client'

import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface ReviewSubmissionProps {
  artistId: string
  artistName: string
  onSubmit: (review: ReviewData) => Promise<void>
  onCancel?: () => void
}

export interface ReviewData {
  rating: number
  title: string
  comment: string
  wouldRecommend: boolean
  categories: {
    professionalism: number
    cleanliness: number
    communication: number
    artQuality: number
  }
}

export default function ReviewSubmission({ 
  artistId, 
  artistName, 
  onSubmit, 
  onCancel 
}: ReviewSubmissionProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState(true)
  const [categories, setCategories] = useState({
    professionalism: 0,
    cleanliness: 0,
    communication: 0,
    artQuality: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (rating === 0) {
      newErrors.push('Please select a rating')
    }
    if (!title.trim()) {
      newErrors.push('Please enter a review title')
    }
    if (title.length > 100) {
      newErrors.push('Title must be less than 100 characters')
    }
    if (!comment.trim()) {
      newErrors.push('Please write a review')
    }
    if (comment.length < 20) {
      newErrors.push('Review must be at least 20 characters')
    }
    if (comment.length > 1000) {
      newErrors.push('Review must be less than 1000 characters')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        rating,
        title,
        comment,
        wouldRecommend,
        categories
      })
    } catch (error) {
      console.error('Error submitting review:', error)
      setErrors(['Failed to submit review. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (value: number, onChange: (value: number) => void, size: 'small' | 'large' = 'large') => {
    const starSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5'
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => size === 'large' && setHoverRating(star)}
            onMouseLeave={() => size === 'large' && setHoverRating(0)}
            className="transition-transform hover:scale-110"
          >
            {star <= (size === 'large' ? (hoverRating || value) : value) ? (
              <StarSolidIcon className={`${starSize} text-white`} />
            ) : (
              <StarIcon className={`${starSize} text-gray-600`} />
            )}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Write a Review</h2>
          <p className="text-gray-400 mt-1">Share your experience with {artistName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-4">
              {renderStars(rating, setRating)}
              {rating > 0 && (
                <span className="text-white font-semibold text-lg">
                  {rating}.0
                </span>
              )}
            </div>
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Professionalism
              </label>
              {renderStars(categories.professionalism, (value) => 
                setCategories({ ...categories, professionalism: value }), 'small'
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Cleanliness
              </label>
              {renderStars(categories.cleanliness, (value) => 
                setCategories({ ...categories, cleanliness: value }), 'small'
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Communication
              </label>
              {renderStars(categories.communication, (value) => 
                setCategories({ ...categories, communication: value }), 'small'
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Art Quality
              </label>
              {renderStars(categories.artQuality, (value) => 
                setCategories({ ...categories, artQuality: value }), 'small'
              )}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Review Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              placeholder="Summarize your experience"
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
              placeholder="Tell others about your experience with this artist..."
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {comment.length}/1000 characters (minimum 20)
            </p>
          </div>

          {/* Would Recommend */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recommend"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
              className="w-5 h-5 bg-black border-gray-800 rounded text-white focus:ring-white"
            />
            <label htmlFor="recommend" className="text-white font-medium cursor-pointer">
              I would recommend this artist to others
            </label>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-950 border border-red-800 rounded-lg p-4">
              <ul className="space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-300 text-sm">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold border border-gray-700 hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

