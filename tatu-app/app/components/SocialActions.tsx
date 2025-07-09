import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import {
  HeartIcon,
  ShareIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface Props {
  itemId: string
  title: string
  onLikeChange?: (isLiked: boolean) => void
}

export default function SocialActions({ itemId, title, onLikeChange }: Props) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLikeStatus()
    fetchShareCount()
  }, [itemId])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/portfolio/${itemId}/likes`)
      if (!response.ok) throw new Error('Failed to fetch like status')
      const data = await response.json()
      setIsLiked(data.isLiked)
      setLikeCount(data.count)
    } catch (error) {
      console.error('Error fetching like status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShareCount = async () => {
    try {
      const response = await fetch(`/api/portfolio/${itemId}/shares`)
      if (!response.ok) throw new Error('Failed to fetch share count')
      const data = await response.json()
      setShareCount(data.count)
    } catch (error) {
      console.error('Error fetching share count:', error)
    }
  }

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like this work')
      return
    }

    try {
      const response = await fetch(`/api/portfolio/${itemId}/likes`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to toggle like')

      const data = await response.json()
      setIsLiked(data.isLiked)
      setLikeCount(prev => data.isLiked ? prev + 1 : prev - 1)
      onLikeChange?.(data.isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error('Failed to update like status')
    }
  }

  const handleShare = async (platform: string) => {
    try {
      // Record the share
      await fetch(`/api/portfolio/${itemId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })

      // Increment share count optimistically
      setShareCount(prev => prev + 1)

      // Handle different sharing platforms
      const shareUrl = window.location.href
      const shareText = `Check out this amazing tattoo work: ${title}`

      switch (platform) {
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank'
          )
          break
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            '_blank'
          )
          break
        case 'instagram':
          // Instagram doesn't have a web sharing API, show instructions
          toast.success('Opening Instagram. Please copy the link to share.')
          window.open('https://instagram.com', '_blank')
          break
        case 'direct':
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Link copied to clipboard!')
          break
      }

      setIsShareModalOpen(false)
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error('Failed to share')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4 animate-pulse">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLike}
        className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
      >
        {isLiked ? (
          <HeartSolidIcon className="h-6 w-6 text-red-500" />
        ) : (
          <HeartIcon className="h-6 w-6" />
        )}
        <span>{likeCount}</span>
      </button>

      <div className="relative">
        <button
          onClick={() => setIsShareModalOpen(!isShareModalOpen)}
          className="flex items-center space-x-1 text-gray-500 hover:text-indigo-500 transition-colors"
        >
          <ShareIcon className="h-6 w-6" />
          <span>{shareCount}</span>
        </button>

        {isShareModalOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <div className="py-1" role="menu">
              <button
                onClick={() => handleShare('facebook')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <FacebookIcon className="h-5 w-5 mr-3" />
                Facebook
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <TwitterIcon className="h-5 w-5 mr-3" />
                Twitter
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <InstagramIcon className="h-5 w-5 mr-3" />
                Instagram
              </button>
              <button
                onClick={() => handleShare('direct')}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
              >
                <LinkIcon className="h-5 w-5 mr-3" />
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 