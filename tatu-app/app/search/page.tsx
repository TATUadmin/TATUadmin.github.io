'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  MapIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PaintBrushIcon,
  UserIcon,
  SparklesIcon,
  BookmarkIcon,
  ShareIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FireIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

interface Artist {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  location: string
  distance?: number
  specialties: string[]
  styles: string[]
  experience: number
  consultationFee: number
  isAvailable: boolean
  nextAvailable: string
  isVerified: boolean
  isFeatured: boolean
  portfolioCount: number
  responseTime: string
  languages: string[]
  certifications: string[]
}

interface SearchFilters {
  location: string
  radius: number
  styles: string[]
  specialties: string[]
  rating: number
  maxPrice: number
  availability: string
  experience: number
  verified: boolean
  featured: boolean
  languages: string[]
}

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  resultCount: number
  lastUsed: string
}

const TATTOO_STYLES = [
  'Traditional', 'Realism', 'Watercolor', 'Minimalist', 'Japanese', 
  'Blackwork', 'Neo-Traditional', 'Tribal', 'Geometric', 'Dotwork',
  'Chicano', 'New School', 'Old School', 'Fine Line', 'Color'
]

const SPECIALTIES = [
  'Portraits', 'Animals', 'Nature', 'Religious', 'Cultural', 'Abstract',
  'Lettering', 'Cover-ups', 'Scar Camouflage', 'White Ink', 'UV Ink',
  'Hand Poked', 'Machine', 'Black & Grey', 'Color'
]

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian'
]

export default function SearchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'distance' | 'price' | 'experience'>('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12)

  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    radius: parseInt(searchParams.get('radius') || '25'),
    styles: searchParams.get('styles')?.split(',') || [],
    specialties: searchParams.get('specialties')?.split(',') || [],
    rating: parseInt(searchParams.get('rating') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '500'),
    availability: searchParams.get('availability') || 'any',
    experience: parseInt(searchParams.get('experience') || '0'),
    verified: searchParams.get('verified') === 'true',
    featured: searchParams.get('featured') === 'true',
    languages: searchParams.get('languages')?.split(',') || []
  })

  useEffect(() => {
    fetchArtists()
    fetchSavedSearches()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, artists])

  const fetchArtists = async () => {
    setIsLoading(true)
    try {
      // Mock data for now - in real app, this would come from API
      const mockArtists: Artist[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          avatar: '/api/placeholder/80/80',
          rating: 4.9,
          reviewCount: 127,
          location: 'San Francisco, CA',
          distance: 2.3,
          specialties: ['Portraits', 'Realism', 'Fine Line'],
          styles: ['Realism', 'Fine Line', 'Color'],
          experience: 8,
          consultationFee: 75,
          isAvailable: true,
          nextAvailable: '2024-02-20',
          isVerified: true,
          isFeatured: true,
          portfolioCount: 45,
          responseTime: '2 hours',
          languages: ['English', 'Mandarin'],
          certifications: ['Bloodborne Pathogens', 'First Aid']
        },
        {
          id: '2',
          name: 'Mike Rodriguez',
          avatar: '/api/placeholder/80/80',
          rating: 4.7,
          reviewCount: 89,
          location: 'Oakland, CA',
          distance: 8.1,
          specialties: ['Traditional', 'Japanese', 'Blackwork'],
          styles: ['Traditional', 'Japanese', 'Blackwork'],
          experience: 12,
          consultationFee: 50,
          isAvailable: true,
          nextAvailable: '2024-02-18',
          isVerified: true,
          isFeatured: false,
          portfolioCount: 67,
          responseTime: '4 hours',
          languages: ['English', 'Spanish'],
          certifications: ['Bloodborne Pathogens', 'First Aid', 'CPR']
        },
        {
          id: '3',
          name: 'Emma Thompson',
          avatar: '/api/placeholder/80/80',
          rating: 4.8,
          reviewCount: 156,
          location: 'Berkeley, CA',
          distance: 12.5,
          specialties: ['Watercolor', 'Nature', 'Abstract'],
          styles: ['Watercolor', 'Abstract', 'Color'],
          experience: 6,
          consultationFee: 60,
          isAvailable: false,
          nextAvailable: '2024-02-25',
          isVerified: true,
          isFeatured: true,
          portfolioCount: 38,
          responseTime: '1 hour',
          languages: ['English'],
          certifications: ['Bloodborne Pathogens']
        },
        {
          id: '4',
          name: 'Alex Kim',
          avatar: '/api/placeholder/80/80',
          rating: 4.6,
          reviewCount: 73,
          location: 'San Jose, CA',
          distance: 45.2,
          specialties: ['Geometric', 'Minimalist', 'Dotwork'],
          styles: ['Geometric', 'Minimalist', 'Dotwork'],
          experience: 4,
          consultationFee: 40,
          isAvailable: true,
          nextAvailable: '2024-02-19',
          isVerified: false,
          isFeatured: false,
          portfolioCount: 24,
          responseTime: '6 hours',
          languages: ['English', 'Korean'],
          certifications: ['Bloodborne Pathogens']
        },
        {
          id: '5',
          name: 'David Martinez',
          avatar: '/api/placeholder/80/80',
          rating: 4.9,
          reviewCount: 203,
          location: 'San Francisco, CA',
          distance: 1.8,
          specialties: ['Portraits', 'Realism', 'Cover-ups'],
          styles: ['Realism', 'Portraits', 'Black & Grey'],
          experience: 15,
          consultationFee: 100,
          isAvailable: true,
          nextAvailable: '2024-02-22',
          isVerified: true,
          isFeatured: true,
          portfolioCount: 89,
          responseTime: '30 minutes',
          languages: ['English', 'Spanish'],
          certifications: ['Bloodborne Pathogens', 'First Aid', 'CPR', 'Advanced Life Support']
        },
        {
          id: '6',
          name: 'Lisa Wang',
          avatar: '/api/placeholder/80/80',
          rating: 4.5,
          reviewCount: 67,
          location: 'Fremont, CA',
          distance: 32.7,
          specialties: ['Lettering', 'Minimalist', 'Fine Line'],
          styles: ['Minimalist', 'Fine Line', 'Lettering'],
          experience: 3,
          consultationFee: 35,
          isAvailable: true,
          nextAvailable: '2024-02-21',
          isVerified: false,
          isFeatured: false,
          portfolioCount: 19,
          responseTime: '8 hours',
          languages: ['English', 'Mandarin'],
          certifications: ['Bloodborne Pathogens']
        }
      ]

      setArtists(mockArtists)
    } catch (error) {
      console.error('Error fetching artists:', error)
      toast.error('Failed to load artists')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSavedSearches = async () => {
    try {
      const mockSavedSearches: SavedSearch[] = [
        {
          id: '1',
          name: 'SF Realism Artists',
          filters: {
            location: 'San Francisco, CA',
            radius: 10,
            styles: ['Realism'],
            specialties: ['Portraits'],
            rating: 4.5,
            maxPrice: 200,
            availability: 'any',
            experience: 5,
            verified: true,
            featured: false,
            languages: ['English']
          },
          resultCount: 8,
          lastUsed: '2024-02-14T10:30:00Z'
        },
        {
          id: '2',
          name: 'Traditional Tattoo Masters',
          filters: {
            location: 'Bay Area, CA',
            radius: 50,
            styles: ['Traditional', 'Japanese'],
            specialties: ['Cultural'],
            rating: 4.8,
            maxPrice: 300,
            availability: 'any',
            experience: 10,
            verified: true,
            featured: true,
            languages: ['English', 'Spanish']
          },
          resultCount: 12,
          lastUsed: '2024-02-12T15:45:00Z'
        }
      ]

      setSavedSearches(mockSavedSearches)
    } catch (error) {
      console.error('Error fetching saved searches:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...artists]

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(artist => 
        artist.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Style filter
    if (filters.styles.length > 0) {
      filtered = filtered.filter(artist =>
        filters.styles.some(style => artist.styles.includes(style))
      )
    }

    // Specialty filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(artist =>
        filters.specialties.some(specialty => artist.specialties.includes(specialty))
      )
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(artist => artist.rating >= filters.rating)
    }

    // Price filter
    filtered = filtered.filter(artist => artist.consultationFee <= filters.maxPrice)

    // Availability filter
    if (filters.availability === 'available') {
      filtered = filtered.filter(artist => artist.isAvailable)
    }

    // Experience filter
    if (filters.experience > 0) {
      filtered = filtered.filter(artist => artist.experience >= filters.experience)
    }

    // Verified filter
    if (filters.verified) {
      filtered = filtered.filter(artist => artist.isVerified)
    }

    // Featured filter
    if (filters.featured) {
      filtered = filtered.filter(artist => artist.isFeatured)
    }

    // Language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(artist =>
        filters.languages.some(lang => artist.languages.includes(lang))
      )
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return (a.distance || 0) - (b.distance || 0)
        case 'price':
          return a.consultationFee - b.consultationFee
        case 'experience':
          return b.experience - a.experience
        default:
          // Relevance: featured first, then by rating
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return b.rating - a.rating
      }
    })

    setFilteredArtists(filtered)
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSearch = () => {
    const searchName = prompt('Enter a name for this search:')
    if (!searchName) return

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      filters: { ...filters },
      resultCount: filteredArtists.length,
      lastUsed: new Date().toISOString()
    }

    setSavedSearches(prev => [...prev, newSearch])
    toast.success('Search saved successfully!')
  }

  const handleLoadSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters)
    toast.success(`Loaded search: ${savedSearch.name}`)
  }

  const handleClearFilters = () => {
    setFilters({
      location: '',
      radius: 25,
      styles: [],
      specialties: [],
      rating: 0,
      maxPrice: 500,
      availability: 'any',
      experience: 0,
      verified: false,
      featured: false,
      languages: []
    })
  }

  const paginatedArtists = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredArtists.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredArtists, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Artist</h1>
              <p className="text-gray-600 mt-1">Discover talented tattoo artists in your area</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showMap
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapIcon className="h-5 w-5" />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by location, artist name, or style..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleSaveSearch}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Clear All
                  </button>
                </div>

                {/* Location & Radius */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Radius (miles)</label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={filters.radius}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5</span>
                      <span>{filters.radius}</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Styles */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tattoo Styles</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {TATTOO_STYLES.map((style) => (
                        <label key={style} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.styles.includes(style)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('styles', [...filters.styles, style])
                              } else {
                                handleFilterChange('styles', filters.styles.filter(s => s !== style))
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {SPECIALTIES.map((specialty) => (
                        <label key={specialty} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.specialties.includes(specialty)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('specialties', [...filters.specialties, specialty])
                              } else {
                                handleFilterChange('specialties', filters.specialties.filter(s => s !== specialty))
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={4.5}>4.5+ Stars</option>
                      <option value={4.0}>4.0+ Stars</option>
                      <option value={3.5}>3.5+ Stars</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Consultation Fee</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="500"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="any">Any Availability</option>
                      <option value="available">Available Now</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                    </select>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => handleFilterChange('experience', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Any Experience</option>
                      <option value={1}>1+ Years</option>
                      <option value={3}>3+ Years</option>
                      <option value={5}>5+ Years</option>
                      <option value={10}>10+ Years</option>
                    </select>
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => handleFilterChange('verified', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Verified Artists Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Featured Artists Only</span>
                    </label>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {LANGUAGES.map((language) => (
                        <label key={language} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.languages.includes(language)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleFilterChange('languages', [...filters.languages, language])
                              } else {
                                handleFilterChange('languages', filters.languages.filter(l => l !== language))
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{language}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Searches */}
              {savedSearches.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
                  <div className="space-y-3">
                    {savedSearches.map((search) => (
                      <div key={search.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{search.name}</h4>
                          <span className="text-xs text-gray-500">{search.resultCount} results</span>
                        </div>
                        <button
                          onClick={() => handleLoadSearch(search)}
                          className="w-full text-sm text-indigo-600 hover:text-indigo-700 text-left"
                        >
                          Load Search
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredArtists.length} Artists Found
                </h2>
                {filters.location && (
                  <p className="text-gray-600 mt-1">
                    Near {filters.location} (within {filters.radius} miles)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                  <option value="price">Lowest Price</option>
                  <option value="experience">Most Experienced</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedArtists.map((artist) => (
                  <ArtistListCard key={artist.id} artist={artist} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}

            {/* No Results */}
            {filteredArtists.length === 0 && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or expanding your search area
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Artist Card Component (Grid View)
function ArtistCard({ artist }: { artist: Artist }) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="relative">
        <Image
          src={artist.avatar}
          alt={artist.name}
          width={320}
          height={240}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {artist.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <FireIcon className="h-3 w-3" />
              Featured
            </span>
          )}
          {artist.isVerified && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
              <CheckBadgeIcon className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 left-3 p-2 rounded-full transition-colors ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <HeartIcon className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
          <div className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-900">{artist.rating}</span>
            <span className="text-sm text-gray-500">({artist.reviewCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPinIcon className="h-4 w-4" />
          <span className="text-sm">{artist.location}</span>
          {artist.distance && (
            <span className="text-xs text-gray-500">• {artist.distance} mi</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {artist.specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {artist.specialties.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              +{artist.specialties.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {artist.experience} years
            </span>
            <span className="flex items-center gap-1">
              <PaintBrushIcon className="h-4 w-4" />
              {artist.portfolioCount} works
            </span>
          </div>
          <span className="text-lg font-semibold text-gray-900">
            ${artist.consultationFee}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/artist/${artist.id}`}
            className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            View Profile
          </Link>
          <Link
            href={`/artist/${artist.id}/book`}
            className="flex-1 bg-white text-indigo-600 text-center py-2 px-4 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}

// Artist List Card Component (List View)
function ArtistListCard({ artist }: { artist: Artist }) {
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="relative">
          <Image
            src={artist.avatar}
            alt={artist.name}
            width={120}
            height={120}
            className="w-30 h-30 object-cover rounded-lg"
          />
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`absolute top-2 right-2 p-1 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <HeartIcon className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{artist.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {artist.isFeatured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <FireIcon className="h-3 w-3" />
                    Featured
                  </span>
                )}
                {artist.isVerified && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckBadgeIcon className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <StarIcon className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold text-gray-900">{artist.rating}</span>
                <span className="text-sm text-gray-500">({artist.reviewCount})</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">${artist.consultationFee}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {artist.location}
              {artist.distance && <span className="text-sm">• {artist.distance} mi</span>}
            </span>
            <span className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              {artist.experience} years experience
            </span>
            <span className="flex items-center gap-1">
              <PaintBrushIcon className="h-4 w-4" />
              {artist.portfolioCount} portfolio items
            </span>
            <span className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {artist.responseTime} response
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {artist.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/artist/${artist.id}`}
              className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              View Profile
            </Link>
            <Link
              href={`/artist/${artist.id}/book`}
              className="bg-white text-indigo-600 py-2 px-6 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
            >
              Book Consultation
            </Link>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
