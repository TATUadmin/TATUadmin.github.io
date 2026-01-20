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
import { 
  PlusIcon, 
  FolderIcon, 
  PhotoIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  TagIcon,
  ChartBarIcon,
  StarIcon,
  HeartIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline'

interface PortfolioCollection {
  id: string
  name: string
  description: string | null
  coverImage: string | null
  itemCount: number
}

interface PortfolioStats {
  totalItems: number
  totalViews: number
  totalLikes: number
  featuredItems: number
  recentUploads: number
  popularStyles: { style: string; count: number }[]
  monthlyGrowth: number
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
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'collections' | 'analytics'>('overview')
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
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalItems: 0,
    totalViews: 0,
    totalLikes: 0,
    featuredItems: 0,
    recentUploads: 0,
    popularStyles: [],
    monthlyGrowth: 0
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
      fetchPortfolioStats()
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

  const fetchPortfolioStats = async () => {
    try {
      // Mock stats for now - in real app, this would come from API
      setPortfolioStats({
        totalItems: 24,
        totalViews: 1247,
        totalLikes: 89,
        featuredItems: 6,
        recentUploads: 3,
        popularStyles: [
          { style: 'Minimalist', count: 8 },
          { style: 'Traditional', count: 6 },
          { style: 'Watercolor', count: 4 },
          { style: 'Realism', count: 3 },
          { style: 'Geometric', count: 3 }
        ],
        monthlyGrowth: 12.5
      })
    } catch (error) {
      console.error('Error fetching portfolio stats:', error)
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
          return

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

    setItems(itemsCopy)

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
        fetchPortfolioStats()
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-950 shadow-sm border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Portfolio Management</h1>
              <p className="text-gray-400 mt-1">Manage your tattoo portfolio and showcase your work</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Work
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-950 border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <SparklesIcon className="h-5 w-5" /> },
              { id: 'items', label: 'Portfolio Items', icon: <PhotoIcon className="h-5 w-5" /> },
              { id: 'collections', label: 'Collections', icon: <FolderIcon className="h-5 w-5" /> },
              { id: 'analytics', label: 'Analytics', icon: <ChartBarIcon className="h-5 w-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <PhotoIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Items</p>
                    <p className="text-2xl font-bold text-white">{portfolioStats.totalItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <EyeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-white">{portfolioStats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Total Likes</p>
                    <p className="text-2xl font-bold text-white">{portfolioStats.totalLikes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Featured Items</p>
                    <p className="text-2xl font-bold text-white">{portfolioStats.featuredItems}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth & Popular Styles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Growth</h3>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${portfolioStats.monthlyGrowth >= 0 ? 'bg-gray-800' : 'bg-gray-800'}`}>
                    {portfolioStats.monthlyGrowth >= 0 ? (
                      <ArrowUpIcon className="h-6 w-6 text-white" />
                    ) : (
                      <ArrowDownIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">
                      {portfolioStats.monthlyGrowth >= 0 ? '+' : ''}{portfolioStats.monthlyGrowth}%
                    </p>
                    <p className="text-sm text-gray-400">vs last month</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Popular Styles</h3>
                <div className="space-y-3">
                  {portfolioStats.popularStyles.slice(0, 5).map((style, index) => (
                    <div key={style.style} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{style.style}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full" 
                            style={{ width: `${(style.count / portfolioStats.totalItems) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-white">{style.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center p-4 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                    <PlusIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">Upload New Work</h4>
                    <p className="text-sm text-gray-400">Add to your portfolio</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('collections')}
                  className="flex items-center p-4 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                    <FolderIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">Organize Collections</h4>
                    <p className="text-sm text-gray-400">Group your work</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center p-4 border border-gray-800 rounded-lg hover:border-gray-700 hover:bg-gray-800 transition-colors group"
                >
                  <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-white">View Analytics</h4>
                    <p className="text-sm text-gray-400">Track performance</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Items Tab */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <PhotoIcon className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">No portfolio items yet</h3>
                <p className="text-gray-400 mb-6">Start building your portfolio by uploading your best work</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload Your First Piece
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden group">
                    <div className="relative aspect-square">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors">
                            <EyeIcon className="h-4 w-4 text-black" />
                          </button>
                          <button className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors">
                            <PencilIcon className="h-4 w-4 text-black" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4 text-black" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-white mb-1">{item.title}</h3>
                      <div className="flex items-center text-sm text-gray-400 mb-2">
                        <TagIcon className="h-4 w-4 mr-1" />
                        {item.style}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Portfolio Collections</h2>
              <button
                onClick={() => setIsAddingCollection(true)}
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Collection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-gray-950 border border-gray-900 rounded-xl p-6 hover:border-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-gray-800">
                      <FolderIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm text-gray-400">{collection.itemCount} items</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{collection.name}</h3>
                  {collection.description && (
                    <p className="text-gray-400 text-sm mb-4">{collection.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button className="text-white hover:text-gray-300 text-sm font-medium">
                      View Items
                    </button>
                    <button className="text-gray-400 hover:text-gray-300 text-sm font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Portfolio Analytics</h2>
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-6">
              <p className="text-gray-400">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-950 border border-gray-900 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add New Portfolio Item</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white placeholder-gray-600 focus:ring-2 focus:ring-white focus:border-white transition-colors"
                  placeholder="Enter piece title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Style *
                </label>
                <select
                  value={uploadData.style}
                  onChange={(e) => setUploadData(prev => ({ ...prev, style: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                >
                  <option value="">Select style</option>
                  {TATTOO_STYLES.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white placeholder-gray-600 focus:ring-2 focus:ring-white focus:border-white transition-colors"
                  placeholder="Describe this piece..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setUploadData(prev => ({ ...prev, image: file }))
                  }}
                  className="w-full px-3 py-2 bg-black border border-gray-800 rounded-md text-white focus:ring-2 focus:ring-white focus:border-white transition-colors"
                />
                {uploadData.image && (
                  <p className="text-sm text-gray-400 mt-1">
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
                className="px-4 py-2 text-gray-400 bg-gray-900 border border-gray-800 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadPortfolioItem}
                disabled={isUploading}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
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