import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  name: string | null
  artistProfile: {
    avatar: string | null
  } | null
  customerProfile: {
    avatar: string | null
  } | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
  replies: Comment[]
}

interface Props {
  itemId: string
  onCommentAdded?: () => void
}

export default function Comments({ itemId, onCommentAdded }: Props) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [itemId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/portfolio/${itemId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error('Please sign in to comment')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/portfolio/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          parentId: null
        })
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const comment = await response.json()
      setComments([comment, ...comments])
      setNewComment('')
      onCommentAdded?.()
      toast.success('Comment posted successfully')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!session) {
      toast.error('Please sign in to reply')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/portfolio/${itemId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          parentId
        })
      })

      if (!response.ok) throw new Error('Failed to post reply')

      const reply = await response.json()
      setComments(comments.map(comment => 
        comment.id === parentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ))
      setReplyTo(null)
      setReplyContent('')
      toast.success('Reply posted successfully')
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {session && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <div key={comment.id} className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                {(comment.user.artistProfile?.avatar || comment.user.customerProfile?.avatar) ? (
                  <Image
                    src={comment.user.artistProfile?.avatar || comment.user.customerProfile?.avatar || ''}
                    alt={comment.user.name || 'User'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {comment.user.name || 'Anonymous'}
                </div>
                <div className="mt-1 text-sm text-gray-700">
                  {comment.content}
                </div>
                <div className="mt-2 text-xs text-gray-500 flex items-center space-x-4">
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  {session && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Replies */}
            <div className="ml-12 space-y-4">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {(reply.user.artistProfile?.avatar || reply.user.customerProfile?.avatar) ? (
                      <Image
                        src={reply.user.artistProfile?.avatar || reply.user.customerProfile?.avatar || ''}
                        alt={reply.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {reply.user.name || 'Anonymous'}
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
                      {reply.content}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {replyTo === comment.id && session && (
                <div className="space-y-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={2}
                    required
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent('')
                      }}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 