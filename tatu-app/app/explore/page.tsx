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
  }, [])

  const fetchArtists = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (locationFilter) params.append('location', locationFilter)
      if (styleFilter) params.append('style', styleFilter)
      if (sortBy) params.append('sort', sortBy)
      else params.append('sort', 'rating')

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
        body: JSON.stringify({ artistId })
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

  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <section className="pt-20 pb-12">
        <div className="container">
          <h1 className="display text-4xl md:text-5xl text-white mb-4">
            Browse Artists
          </h1>
          <p className="body text-lg text-gray-400 max-w-2xl">
            Discover verified tattoo artists from around the world. Browse portfolios, read reviews, and book your next session.
          </p>
        </div>
      </section>

      {/* Search and Filters Section */}
      <section className="py-12 bg-surface">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search artists, styles, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input pr-4"
                style={{paddingLeft: '3.5rem'}}
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="input pr-4 appearance-none"
                style={{paddingLeft: '3.5rem'}}
              >
                <option value="">All Locations</option>
                <option value="new-york">New York</option>
                <option value="los-angeles">Los Angeles</option>
                <option value="london">London</option>
                <option value="tokyo">Tokyo</option>
                <option value="berlin">Berlin</option>
              </select>
            </div>

            {/* Style Filter */}
            <div>
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="input appearance-none"
              >
                <option value="">All Styles</option>
                {styles.map((style) => (
                  <option key={style} value={style.toLowerCase()}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort and Search Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border border-gray-600 text-white px-3 py-2 rounded text-sm"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="portfolio">Portfolio Size</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>
            
            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              Search Artists
            </button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-400 text-sm">
                  {artists.length} artists found
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <div key={artist.id} className="card p-6 card-hover group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-700"
                        />
                        <div>
                          <h3 className="headline text-lg text-white group-hover:text-gray-100 transition-colors">
                            {artist.name}
                          </h3>
                          <p className="text-gray-400 text-sm flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {artist.location}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(artist.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {favoriteArtists.includes(artist.id) ? (
                          <HeartSolid className="w-5 h-5 text-white" />
                        ) : (
                          <HeartOutline className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {artist.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.specialties.slice(0, 3).map((specialty) => (
                        <span
                          key={specialty}
                          className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-400">
                          <StarIcon className="w-4 h-4 mr-1" />
                          <span>{artist.rating}</span>
                          <span className="text-gray-500 ml-1">({artist.reviewCount})</span>
                        </div>
                        <div className="text-gray-400">
                          {artist.portfolioCount} works
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t" style={{borderColor: '#171717'}}>
                      <Link
                        href={`/artist/${artist.id}`}
                        className="btn btn-secondary w-full text-sm"
                      >
                        View Portfolio
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {artists.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg mb-4">No artists found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setLocationFilter('')
                      setStyleFilter('')
                      fetchArtists()
                    }}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
} 