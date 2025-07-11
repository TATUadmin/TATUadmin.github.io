'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import ImageDropzone from '@/app/components/ImageDropzone'
import { useRouter, useSearchParams } from 'next/navigation'
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd'
import DraggablePortfolioItem from '@/app/components/DraggablePortfolioItem'
import { PortfolioItem, Collection, FilterOptions } from '@/app/types/portfolio'
import PortfolioFilters from '@/app/components/PortfolioFilters'
import PortfolioAnalytics from '@/app/components/PortfolioAnalytics'
import Link from 'next/link'
import { PlusIcon, FolderIcon, PhotoIcon, PencilIcon, TrashIcon, EyeIcon, TagIcon } from '@heroicons/react/24/outline'

interface PortfolioCollection {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  itemCount: number
}

const TATTOO_STYLES = [
  'Traditional', 'Realism', 'Watercolor', 'Geometric', 'Minimalist',
  'Blackwork', 'Neo-Traditional', 'Japanese', 'Tribal', 'Portrait',
  'Abstract', 'Dotwork', 'Linework', 'Biomechanical', 'New School',
  'Old School', 'Fine Line', 'Illustrative', 'Surrealism', 'Cover-up'
]

export default function PortfolioPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'items' | 'analytics'>('items')
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [collections, setCollections] = useState<PortfolioCollection[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isAddingCollection, setIsAddingCollection] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterOptions>(() => {
    // Try to load filters from localStorage
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('portfolioFilters')
      if (savedFilters) {
        try {
          return JSON.parse(savedFilters)
        } catch (e) {
          console.error('Error parsing saved filters:', e)
        }
      }
    }
    
    // Default filters
    return {
      style: searchParams.get('style') || '',
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
      collection: searchParams.get('collection') || '',
      dateRange: {
        start: null,
        end: null
      },
      featured: null,
      search: ''
    }
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: '',
    style: '',
    collectionId: null as string | null,
  })
  const [collectionFormData, setCollectionFormData] = useState({
    name: '',
    description: '',
    coverImage: '',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [view, setView] = useState<'grid' | 'masonry'>('grid')
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false)
  const [targetCollectionId, setTargetCollectionId] = useState<string>('')
  const [featuredItems, setFeaturedItems] = useState<PortfolioItem[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    style: '',
    image: null as File | null
  })

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('portfolioFilters', JSON.stringify(filters))
  }, [filters])

  // Update URL with filter parameters
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.style) params.set('style', filters.style)
    if (filters.tags.length) params.set('tags', filters.tags.join(','))
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
    if (filters.collection) params.set('collection', filters.collection)
    if (filters.dateRange.start) params.set('dateStart', filters.dateRange.start)
    if (filters.dateRange.end) params.set('dateEnd', filters.dateRange.end)
    if (filters.featured !== null) params.set('featured', filters.featured.toString())
    if (filters.search) params.set('search', filters.search)

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
    window.history.replaceState({}, '', newUrl)
  }, [filters])

  // Convert portfolio items to lightbox slides
  const slides = items.map(item => ({
    src: item.imageUrl,
    alt: item.title,
    description: item.description,
  }))

  useEffect(() => {
    if (session?.user) {
      fetchCollections()
      fetchFeaturedItems()
    }
  }, [session])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/portfolio/collections')
      if (!response.ok) throw new Error('Failed to fetch collections')
      const data = await response.json()
      setCollections(data)
    } catch (error) {
      console.error('Error fetching collections:', error)
      toast.error('Failed to load collections')
    }
  }

  const fetchFeaturedItems = async () => {
    try {
      const response = await fetch('/api/portfolio/items?featured=true')
      if (!response.ok) throw new Error('Failed to fetch featured items')
      const data = await response.json()
      setFeaturedItems(data)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching featured items:', error)
      toast.error('Failed to load featured items')
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setFormData(prev => ({ ...prev, imageUrl: data.url }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collectionFormData),
      })

      if (!response.ok) {
        throw new Error('Failed to create collection')
      }

      toast.success('Collection created successfully')
      setIsAddingCollection(false)
      setCollectionFormData({
        name: '',
        description: '',
        coverImage: '',
      })
      fetchCollections()
    } catch (error) {
      console.error('Error creating collection:', error)
      toast.error('Failed to create collection')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPortfolioItems = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.style && { style: filters.style }),
        ...(filters.tags.length && { tags: filters.tags.join(',') }),
        ...(filters.search && { search: filters.search }),
        ...(filters.collection && { collection: filters.collection }),
        ...(filters.dateRange.start && { dateStart: filters.dateRange.start }),
        ...(filters.dateRange.end && { dateEnd: filters.dateRange.end }),
        ...(filters.featured !== null && { featured: filters.featured.toString() })
      })

      const response = await fetch(`/api/portfolio?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio items')
      }
      const data = await response.json()
      setItems(data)
    } catch (error) {
      console.error('Error fetching portfolio items:', error)
      toast.error('Failed to load portfolio items')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const endpoint = editingItem 
        ? `/api/portfolio/${editingItem.id}`
        : '/api/portfolio'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error(editingItem ? 'Failed to update item' : 'Failed to add item')
      }

      toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully')
      setIsAddingNew(false)
      setEditingItem(null)
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        tags: '',
        style: '',
        collectionId: null,
      })
      fetchPortfolioItems()
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error(editingItem ? 'Failed to update item' : 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      tags: item.tags.join(', '),
      style: item.style,
      collectionId: item.collectionId,
    })
    setIsAddingNew(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete item')
      }

      toast.success('Item deleted successfully')
      fetchPortfolioItems()
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
      toast.error('Failed to delete item')
    }
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleBulkAction = async (action: 'delete' | 'move' | 'feature') => {
    if (!selectedItems.length) {
      toast.error('No items selected')
      return
    }

    try {
      switch (action) {
        case 'delete':
          if (!confirm('Are you sure you want to delete the selected items?')) return
          await Promise.all(
            selectedItems.map(id => fetch(`/api/portfolio/${id}`, { method: 'DELETE' }))
          )
          toast.success('Items deleted successfully')
          break

        case 'move':
          setIsMoveModalOpen(true)
          return // Exit early as the actual move will happen in handleMove

        case 'feature':
          await Promise.all(
            selectedItems.map(id =>
              fetch(`/api/portfolio/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  featured: true
                })
              })
            )
          )
          toast.success('Items featured successfully')
          break
      }

      fetchPortfolioItems()
      setSelectedItems([])
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  const handleMove = async () => {
    try {
      const collectionId = targetCollectionId === 'none' ? null : targetCollectionId

      // Update all selected items with new collection ID
      await Promise.all(
        selectedItems.map(id =>
          fetch(`/api/portfolio/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              collectionId
            })
          })
        )
      )

      toast.success('Items moved successfully')
      setIsMoveModalOpen(false)
      setTargetCollectionId('')
      fetchPortfolioItems()
      setSelectedItems([])
    } catch (error) {
      console.error('Error moving items:', error)
      toast.error('Failed to move items')
    }
  }

  const allTags = Array.from(
    new Set(items.flatMap(item => item.tags))
  ).sort()

  const sortOptions = [
    { value: 'createdAt', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'style', label: 'Style' },
    { value: 'featured', label: 'Featured' }
  ]

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const itemsCopy = Array.from(items)
    const [removed] = itemsCopy.splice(sourceIndex, 1)
    itemsCopy.splice(destinationIndex, 0, removed)

    // Update the UI immediately
    setItems(itemsCopy)

    // Send the reorder request to the server
    try {
      const response = await fetch('/api/portfolio/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsCopy.map((item, index) => ({
            id: item.id,
            collectionId: item.collectionId,
            order: index
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to reorder items')
      }

      toast.success('Items reordered successfully')
    } catch (error) {
      console.error('Error reordering items:', error)
      toast.error('Failed to reorder items')
      // Revert the UI if the server request fails
      fetchPortfolioItems()
    }
  }

  const uploadPortfolioItem = async () => {
    if (!uploadData.title || !uploadData.style || !uploadData.image) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsUploading(true)
    try {
      // First upload the image
      const formData = new FormData()
      formData.append('file', uploadData.image)
      formData.append('type', 'portfolio')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url: imageUrl } = await uploadResponse.json()

      // Then create the portfolio item
      const portfolioResponse = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadData.title,
          description: uploadData.description,
          style: uploadData.style,
          imageUrl
        })
      })

      if (portfolioResponse.ok) {
        toast.success('Portfolio item uploaded successfully!')
        setShowUploadModal(false)
        setUploadData({ title: '', description: '', style: '', image: null })
        fetchPortfolioItems()
      } else {
        throw new Error('Failed to create portfolio item')
      }
    } catch (error) {
      console.error('Error uploading portfolio item:', error)
      toast.error('Failed to upload portfolio item')
    } finally {
      setIsUploading(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please sign in to manage your portfolio.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Management</h1>
              <p className="text-gray-600 mt-1">Manage your tattoo portfolio and showcase your work</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Work
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No portfolio items yet</h3>
            <p className="text-gray-600 mb-6">Start building your portfolio by uploading your best work</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Upload Your First Piece
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
                <div className="relative aspect-square">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                        <EyeIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                        <PencilIcon className="h-4 w-4 text-gray-700" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <TagIcon className="h-4 w-4 mr-1" />
                    {item.style}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Portfolio Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter piece title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style *
                </label>
                <select
                  value={uploadData.style}
                  onChange={(e) => setUploadData(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select style</option>
                  {TATTOO_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe this piece..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {uploadData.image && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {uploadData.image.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadData({ title: '', description: '', style: '', image: null })
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadPortfolioItem}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 