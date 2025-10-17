'use client'

import { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { 
  EyeIcon, 
  HeartIcon, 
  ShareIcon, 
  TagIcon,
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  QueueListIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface PortfolioItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  style: string
  tags: string[]
  featured: boolean
  likes: number
  views: number
  createdAt: string
  artist?: {
    id: string
    name: string
    avatar?: string
  }
}

interface PortfolioGalleryProps {
  items: PortfolioItem[]
  onLike?: (itemId: string) => void
  onShare?: (itemId: string) => void
  onView?: (itemId: string) => void
  showFilters?: boolean
  showStats?: boolean
  layout?: 'grid' | 'masonry' | 'list'
  columns?: 2 | 3 | 4 | 5
  enableLightbox?: boolean
  enableSocial?: boolean
  className?: string
}

export default function PortfolioGallery({
  items,
  onLike,
  onShare,
  onView,
  showFilters = true,
  showStats = true,
  layout = 'grid',
  columns = 3,
  enableLightbox = true,
  enableSocial = true,
  className = ''
}: PortfolioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>(layout)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'likes'>('newest')

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items

    // Filter by style
    if (selectedStyle) {
      filtered = filtered.filter(item => item.style === selectedStyle)
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        selectedTags.some(tag => item.tags.includes(tag))
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.style.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'popular':
          return b.views - a.views
        case 'likes':
          return b.likes - a.likes
        default:
          return 0
      }
    })

    return filtered
  }, [items, selectedStyle, selectedTags, searchQuery, sortBy])

  // Get unique styles and tags for filters
  const availableStyles = useMemo(() => {
    return Array.from(new Set(items.map(item => item.style))).sort()
  }, [items])

  const availableTags = useMemo(() => {
    return Array.from(new Set(items.flatMap(item => item.tags))).sort()
  }, [items])

  // Convert items to lightbox slides
  const slides = useMemo(() => {
    return filteredItems.map(item => ({
      src: item.imageUrl,
      alt: item.title,
      description: item.description,
      title: item.title,
      style: item.style,
      tags: item.tags
    }))
  }, [filteredItems])

  const openLightbox = useCallback((index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index)
      setLightboxOpen(true)
    }
  }, [enableLightbox])

  const handleLike = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onLike?.(itemId)
  }, [onLike])

  const handleShare = useCallback((itemId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(itemId)
  }, [onShare])

  const handleView = useCallback((itemId: string) => {
    onView?.(itemId)
  }, [onView])

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSelectedStyle('')
    setSelectedTags([])
    setSearchQuery('')
  }, [])

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      case 5: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters and Controls */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search portfolio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('masonry')}
                  className={`p-2 rounded ${viewMode === 'masonry' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <QueueListIcon className="h-4 w-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="likes">Most Liked</option>
              </select>
            </div>
          </div>

          {/* Style and Tag Filters */}
          <div className="mt-4 space-y-4">
            {/* Style Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStyle('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedStyle === '' 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Styles
                </button>
                {availableStyles.map(style => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedStyle === style 
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-indigo-100 text-indigo-800' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
                {availableTags.length > 10 && (
                  <span className="px-3 py-1 text-sm text-gray-500">
                    +{availableTags.length - 10} more
                  </span>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedStyle || selectedTags.length > 0 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {items.length} items
        </p>
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedStyle || selectedTags.length > 0 
              ? 'Try adjusting your filters or search terms'
              : 'No portfolio items available'
            }
          </p>
          {(searchQuery || selectedStyle || selectedTags.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-6 ${getGridCols()}`}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                      <EyeIcon className="h-4 w-4 text-gray-700" />
                    </button>
                    {enableSocial && (
                      <>
                        <button 
                          onClick={(e) => handleLike(item.id, e)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <HeartIcon className="h-4 w-4 text-gray-700" />
                        </button>
                        <button 
                          onClick={(e) => handleShare(item.id, e)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <ShareIcon className="h-4 w-4 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-2 left-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <StarSolidIcon className="h-3 w-3 mr-1" />
                      Featured
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
                  {showStats && (
                    <div className="flex items-center space-x-3 text-xs text-gray-500 ml-2">
                      <span className="flex items-center">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <HeartIcon className="h-3 w-3 mr-1" />
                        {item.likes}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <TagIcon className="h-4 w-4 mr-1" />
                  <span>{item.style}</span>
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Artist Info */}
                {item.artist && (
                  <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    {item.artist.avatar && (
                      <Image
                        src={item.artist.avatar}
                        alt={item.artist.name}
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                    )}
                    <span className="text-sm text-gray-600">{item.artist.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {enableLightbox && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={slides}
          render={{
            slide: ({ slide }) => (
              <div className="relative">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">{slide.title}</h3>
                  {slide.description && (
                    <p className="text-sm opacity-90 mb-2">{slide.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-white/20 px-2 py-1 rounded">{slide.style}</span>
                    {slide.tags.map(tag => (
                      <span key={tag} className="bg-white/20 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          }}
        />
      )}
    </div>
  )
}
