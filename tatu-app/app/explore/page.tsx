'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'

interface Artist {
  id: string
  name: string
  bio: string
  avatar: string
  location: string
  specialties: string[]
  instagram: string
  portfolioCount: number
  rating: number
  reviewCount: number
  featured?: boolean
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')
  const [styleFilter, setStyleFilter] = useState(searchParams.get('style') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '')
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([])

  const styles = [
    'Traditional', 'Realism', 'Watercolor', 'Geometric', 'Minimalist',
    'Japanese', 'Blackwork', 'Neo-Traditional', 'Tribal', 'Portrait'
  ]

  useEffect(() => {
    fetchArtists()
  }, []) // Only fetch on initial load

  const fetchArtists = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (locationFilter) params.append('location', locationFilter)
      if (styleFilter) params.append('style', styleFilter)
      if (sortBy) params.append('sort', sortBy)
      else params.append('sort', 'rating') // Default to highest rated

      const response = await fetch(`/api/artists?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch artists')
      
      const data = await response.json()
      setArtists(data)
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchArtists()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFavorite = async (artistId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      })

      if (response.ok) {
        setFavoriteArtists(prev => 
          prev.includes(artistId) 
            ? prev.filter(id => id !== artistId)
            : [...prev, artistId]
        )
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-black py-16 pt-24 relative">
      {/* Original gradient background */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-black via-black via-blue-950 via-purple-900 to-yellow-900" />
      {/* 30% dark overlay */}
      <div className="tatu-dark-gradient-bg" aria-hidden="true" />
      <div className="grainy-bg absolute inset-0 w-full h-full z-1" aria-hidden="true" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative z-20">
          <h1 className="text-4xl font-bold text-white mb-4">
            Discover Talented Tattoo Artists
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Browse portfolios, read reviews, and find the perfect artist for your next tattoo
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-black card-z rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-800 text-white placeholder-gray-400"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-800 text-white placeholder-gray-400"
              />
            </div>

            {/* Style Filter */}
            <select
              value={styleFilter}
              onChange={(e) => setStyleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-300 bg-gray-800"
            >
              <option value="">Styles</option>
              {styles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-300 bg-gray-800"
            >
              <option value="">Filter</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="portfolio">Most Portfolio Items</option>
              <option value="newest">Newest Artists</option>
            </select>

            {/* Find Button */}
            <button
              onClick={handleSearch}
              className="w-full bg-amber-500 text-black py-2 px-4 rounded-lg font-medium hover:bg-amber-400 transition-colors focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Find
            </button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-black card-z rounded-lg shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-700 rounded-t-lg"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-4 w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-300">
                {artists.length} artists found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <div key={artist.id} className="bg-black card-z rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  {/* Portfolio Preview */}
                  <div className="relative h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                    {artist.avatar ? (
                      <Image
                        src={artist.avatar}
                        alt={`${artist.name}'s work`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-600">
                        <span className="text-gray-400">No portfolio image</span>
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(artist.id)}
                      className="absolute top-3 right-3 p-2 bg-black bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                    >
                      {favoriteArtists.includes(artist.id) ? (
                        <HeartSolid className="h-5 w-5 text-red-500" />
                      ) : (
                        <HeartOutline className="h-5 w-5 text-gray-300" />
                      )}
                    </button>

                    {/* Featured Badge */}
                    {artist.featured && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Artist Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {artist.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {renderStars(artist.rating)}
                        <span className="text-sm text-gray-400 ml-1">
                          ({artist.reviewCount})
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                      {artist.bio}
                    </p>

                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {artist.location}
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {artist.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {artist.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{artist.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/artist/${artist.id}`}
                        className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        View Portfolio
                      </Link>
                      <Link
                        href={`/artist/${artist.id}/book`}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {artists.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No artists found matching your criteria.
                </p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 