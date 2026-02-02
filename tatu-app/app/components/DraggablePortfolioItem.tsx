import { Draggable } from 'react-beautiful-dnd'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { PortfolioItem } from '@/app/types/portfolio'
import Comments from './Comments'
import SocialActions from './SocialActions'
import AnalyticsDashboard from './AnalyticsDashboard'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  item: PortfolioItem
  index: number
  view: 'grid' | 'masonry'
  onEdit: (item: PortfolioItem) => void
  onDelete: (id: string) => void
  onSelect: (id: string, selected: boolean) => void
  isSelected: boolean
  openLightbox: () => void
}

export default function DraggablePortfolioItem({
  item,
  index,
  view,
  onEdit,
  onDelete,
  onSelect,
  isSelected,
  openLightbox
}: Props) {
  const [showComments, setShowComments] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [sessionId] = useState(() => {
    // Get or create a session ID for view tracking
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('viewerSessionId')
      if (storedId) return storedId
      const newId = uuidv4()
      localStorage.setItem('viewerSessionId', newId)
      return newId
    }
    return ''
  })

  useEffect(() => {
    // Record view when component mounts
    if (sessionId) {
      fetch(`/api/portfolio/${item.id}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      }).catch(error => {
        console.error('Error recording view:', error)
      })
    }
  }, [item.id, sessionId])

  const handleEngagementUpdate = async (type: 'likes' | 'comments' | 'shares', increment: boolean) => {
    try {
      await fetch(`/api/portfolio/${item.id}/analytics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, increment })
      })
    } catch (error) {
      console.error('Error updating engagement metrics:', error)
    }
  }

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white shadow rounded-2xl overflow-hidden ${
            view === 'masonry' ? 'row-span-1' : ''
          } ${isSelected ? 'ring-2 ring-white' : ''}`}
        >
          <div className="relative">
            <div className="aspect-w-3 aspect-h-2">
              <Image
                src={item.imageUrl}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                className="cursor-pointer"
                onClick={openLightbox}
              />
            </div>
            <div className="absolute top-2 right-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(item.id, e.target.checked)}
                className="h-4 w-4 text-white focus:ring-white border-gray-300 rounded-full"
              />
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
            {item.description && (
              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <SocialActions
                itemId={item.id}
                title={item.title}
                onLikeChange={(isLiked) => handleEngagementUpdate('likes', isLiked)}
                onShare={() => handleEngagementUpdate('shares', true)}
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                </button>
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  {showComments ? 'Hide Comments' : 'Show Comments'}
                </button>
                <button
                  onClick={() => onEdit(item)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-sm text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>

            {showAnalytics && (
              <div className="mt-4 border-t pt-4">
                <AnalyticsDashboard itemId={item.id} />
              </div>
            )}

            {showComments && (
              <div className="mt-4 border-t pt-4">
                <Comments
                  itemId={item.id}
                  onCommentAdded={() => handleEngagementUpdate('comments', true)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
} 