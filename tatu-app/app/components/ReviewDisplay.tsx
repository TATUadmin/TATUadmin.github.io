'use client'

import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  FlagIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  wouldRecommend: boolean
  categories?: {
    professionalism: number
    cleanliness: number
    communication: number
    artQuality: number
  }
  helpful: number
  notHelpful: number
  createdAt: string
  verified?: boolean
  response?: {
    text: string
    createdAt: string
  }
}

interface ReviewDisplayProps {
  review: Review
  onHelpful?: (reviewId: string) => void
  onNotHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  showCategories?: boolean
}

export default function ReviewDisplay({ 
  review, 
  onHelpful, 
  onNotHelpful, 
  onReport,
  showCategories = true 
}: ReviewDisplayProps) {
  const [hasVoted, setHasVoted] = useState<'helpful' | 'not-helpful' | null>(null)

  const handleVote = (type: 'helpful' | 'not-helpful') => {
    if (hasVoted === type) return
    
    setHasVoted(type)
    if (type === 'helpful' && onHelpful) {
      onHelpful(review.id)
    } else if (type === 'not-helpful' && onNotHelpful) {
      onNotHelpful(review.id)
    }
  }

  const renderStars = (rating: number, size: 'small' | 'medium' = 'medium') => {
    const starSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5'
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-white' : 'text-gray-700'
            }`}
          />
        ))}
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {getInitials(review.userName)}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-white font-semibold">{review.userName}</h4>
              {review.verified && (
                <CheckBadgeIcon className="w-5 h-5 text-white" title="Verified Customer" />
              )}
            </div>
            <div className="flex items-center space-x-3">
              {renderStars(review.rating)}
              <span className="text-gray-500 text-sm">{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Report Button */}
        {onReport && (
          <button
            onClick={() => onReport(review.id)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="Report review"
          >
            <FlagIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Review Title */}
      <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>

      {/* Review Comment */}
      <p className="text-gray-300 leading-relaxed mb-4">{review.comment}</p>

      {/* Would Recommend */}
      {review.wouldRecommend && (
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <CheckBadgeIcon className="w-5 h-5 mr-2 text-white" />
          <span>Would recommend to others</span>
        </div>
      )}

      {/* Category Ratings */}
      {showCategories && review.categories && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-800">
          <div>
            <p className="text-xs text-gray-500 mb-1">Professionalism</p>
            {renderStars(review.categories.professionalism, 'small')}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Cleanliness</p>
            {renderStars(review.categories.cleanliness, 'small')}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Communication</p>
            {renderStars(review.categories.communication, 'small')}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Art Quality</p>
            {renderStars(review.categories.artQuality, 'small')}
          </div>
        </div>
      )}

      {/* Artist Response */}
      {review.response && (
        <div className="bg-black border border-gray-800 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-white font-semibold text-sm">Artist Response</span>
            <span className="text-gray-500 text-xs">{formatDate(review.response.createdAt)}</span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{review.response.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => handleVote('helpful')}
          disabled={hasVoted !== null}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            hasVoted === 'helpful'
              ? 'text-white'
              : 'text-gray-500 hover:text-white'
          } disabled:cursor-not-allowed`}
        >
          <HandThumbUpIcon className="w-5 h-5" />
          <span>Helpful ({review.helpful + (hasVoted === 'helpful' ? 1 : 0)})</span>
        </button>

        <button
          onClick={() => handleVote('not-helpful')}
          disabled={hasVoted !== null}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            hasVoted === 'not-helpful'
              ? 'text-white'
              : 'text-gray-500 hover:text-white'
          } disabled:cursor-not-allowed`}
        >
          <HandThumbDownIcon className="w-5 h-5" />
          <span>Not Helpful ({review.notHelpful + (hasVoted === 'not-helpful' ? 1 : 0)})</span>
        </button>
      </div>
    </div>
  )
}

