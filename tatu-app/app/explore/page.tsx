'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import LeafletMap from '../components/LeafletMap'
import { classifySearch, formatSearchClassification } from '@/lib/smart-search'
import { ALL_ARTISTS, Artist } from '@/lib/all-artists-data'

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const [artists, setArtists] = useState<Artist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '')
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '')
  const [styleFilter, setStyleFilter] = useState(searchParams.get('style') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || '')
  const [minReviews, setMinReviews] = useState(0)
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([])
  const [mapLocation, setMapLocation] = useState('') // Separate state for map panning
  const [lastSearchClassification, setLastSearchClassification] = useState<any>(null) // Track what was detected
  
  // Track whether user manually edited filter boxes (resets on each search)
  const [manualLocationEdit, setManualLocationEdit] = useState(false)
  const [manualStyleEdit, setManualStyleEdit] = useState(false)

  const styles = [
    'Traditional', 'Realism', 'Watercolor', 'Geometric', 'Minimalist',
    'Japanese', 'Blackwork', 'Neo-Traditional', 'Tribal', 'Portrait', 'Other'
  ]

  useEffect(() => {
    fetchArtists()
  }, [])

  // Only trigger search on initial load if there's a URL search param
  useEffect(() => {
    const urlSearch = searchParams.get('search') || searchParams.get('q')
    if (urlSearch && urlSearch.trim().length > 0) {
      // Parse search query to determine if it's a location or person
      parseSearchQuery(urlSearch)
      fetchArtists()
    }
  }, []) // Empty dependency array - only runs once on mount

  // Handle URL location parameter for map panning (runs on mount and URL changes)
  useEffect(() => {
    const urlLocation = searchParams.get('location')
    const urlSearch = searchParams.get('search')
    console.log('🗺️ URL params changed - location:', urlLocation, 'search:', urlSearch)
    console.log('🗺️ Current mapLocation state before update:', mapLocation)
    if (urlLocation && urlLocation.trim().length > 0) {
      console.log('🗺️ ⚠️ Setting map location from URL to:', urlLocation)
      setMapLocation(urlLocation)
      setLocationFilter(urlLocation)
      console.log('🗺️ mapLocation state should now be:', urlLocation)
    } else {
      console.log('🗺️ ❌ No location parameter in URL or empty')
    }
  }, [searchParams])

  // Parse search query using smart AI-like classification
  const parseSearchQuery = (query: string) => {
    console.log('🔍 Smart Search: Analyzing query:', query)
    
    // Use the smart search classifier
    const classification = classifySearch(query)
    console.log('📊 Classification Result:', formatSearchClassification(classification))
    
    // Save classification for UI display
    setLastSearchClassification(classification)
    
    // Reset filters first
    setLocationFilter('')
    setStyleFilter('')
    setMapLocation('')
    
    // Apply classification results based on type
    switch (classification.type) {
      case 'location':
        console.log('📍 Location detected:', classification.location)
        if (classification.location) {
          setLocationFilter(classification.location)
          setMapLocation(classification.location)
        }
        break
        
      case 'style':
        console.log('🎨 Style detected:', classification.style)
        if (classification.style) {
          setStyleFilter(classification.style)
        }
        break
        
      case 'artist_name':
        console.log('👤 Artist name detected:', classification.artistName)
        // Keep in main search query for name matching
        break
        
      case 'combined':
        console.log('🔄 Combined search detected')
        if (classification.location) {
          console.log('  📍 Location:', classification.location)
          setLocationFilter(classification.location)
          setMapLocation(classification.location)
        }
        if (classification.style) {
          console.log('  🎨 Style:', classification.style)
          setStyleFilter(classification.style)
        }
        if (classification.artistName) {
          console.log('  👤 Artist:', classification.artistName)
          // This will be used in general search filtering
        }
        break
        
      case 'general':
        console.log('🔎 General search - will search all fields')
        // Keep query as-is for general search
        break
    }
    
    console.log('✅ Filters applied:', {
      location: locationFilter,
      style: styleFilter,
      mapLocation: mapLocation
    })
  }

  // Use centralized artist data
  const mockArtists: Artist[] = ALL_ARTISTS

  const fetchArtists = async () => {
    setIsLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredArtists = [...mockArtists]
      
      // Enhanced search by name, bio, specialties, or location
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(term => term.length > 0)
        
        if (searchTerms.length > 0) {
          filteredArtists = filteredArtists.filter(artist => {
            // Check if ALL search terms match somewhere in the artist's profile
            return searchTerms.every(term => 
              artist.name.toLowerCase().includes(term) ||
              artist.bio.toLowerCase().includes(term) ||
              artist.specialties.some(specialty => specialty.toLowerCase().includes(term)) ||
              artist.location.toLowerCase().includes(term) ||
              artist.instagram.toLowerCase().includes(term)
            )
          })
        }
      }
      
      // Filter by location (more flexible matching)
      if (locationFilter) {
        const searchLocation = locationFilter.toLowerCase().trim()
        filteredArtists = filteredArtists.filter(artist => {
          // Check if the artist's location contains the searched city or state
          const artistLocation = artist.location.toLowerCase()
          const cityMatch = artistLocation.includes(searchLocation)
          const stateMatch = artistLocation.includes(searchLocation)
          return cityMatch || stateMatch
        })
      }
      
      // Filter by style (more flexible matching)
      if (styleFilter) {
        const style = styleFilter.toLowerCase()
        console.log('Filtering by style:', style)
        const beforeCount = filteredArtists.length
        filteredArtists = filteredArtists.filter(artist => {
          const hasStyle = artist.specialties.some(specialty => 
            specialty.toLowerCase().includes(style) ||
            specialty.toLowerCase().replace(/\s+/g, '').includes(style.replace(/\s+/g, ''))
          )
          console.log(`Artist ${artist.name} has style ${style}:`, hasStyle, 'Specialties:', artist.specialties)
          return hasStyle
        })
        console.log(`Style filter applied: ${beforeCount} -> ${filteredArtists.length} artists`)
      }
      
      // Note: When both locationFilter and styleFilter are specified,
      // the filtering above will show only artists that meet BOTH criteria
      // because the filters are applied sequentially (AND logic)
      
      // Sort artists
      if (sortBy) {
        switch (sortBy) {
          case 'rating':
            filteredArtists.sort((a, b) => b.rating - a.rating)
            break
          case 'reviews':
            filteredArtists.sort((a, b) => b.reviewCount - a.reviewCount)
            break
          case 'portfolio':
            filteredArtists.sort((a, b) => b.portfolioCount - a.portfolioCount)
            break
          case 'recent':
            // For demo purposes, sort by ID (newer artists have higher IDs)
            filteredArtists.sort((a, b) => parseInt(b.id) - parseInt(a.id))
            break
          default:
            break
        }
      }
      
      setArtists(filteredArtists)
    } catch (error) {
      console.error('Error fetching artists:', error)
      // Fallback to mock data on error
      setArtists(mockArtists)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    console.log('🔍 Starting fresh search - clearing previous results')
    
    // Clear previous search results and classification indicator
    setArtists([])
    setIsLoading(true)
    setLastSearchClassification(null) // Clear previous classification
    
    // Start with filter box values (these take priority if manually filled)
    let finalLocationFilter = locationFilter
    let finalStyleFilter = styleFilter
    let finalMapLocation = locationFilter // Map location follows location filter (will be updated below)
    
    // ALWAYS run smart search if there's a query in the main search box
    // This allows users to do new searches even after previous filters are populated
    if (searchQuery && searchQuery.trim().length > 0) {
      const classification = classifySearch(searchQuery.trim())
      console.log('🔍 Search classification:', classification)

      // Save classification for UI display
      setLastSearchClassification(classification)

      // Smart search populates filter boxes ONLY if user hasn't manually edited them
      if (classification.style && !manualStyleEdit) {
        finalStyleFilter = classification.style
        console.log('✅ Populating style filter with:', classification.style)
      } else if (manualStyleEdit) {
        console.log('⏭️ Skipping style override - user manually edited it')
      }
      
      if (classification.location && !manualLocationEdit) {
        finalLocationFilter = classification.location
        console.log('✅ Populating location filter with:', classification.location)
      } else if (classification.type === 'location' && !manualLocationEdit) {
        // If classified as location but no specific location extracted, use the whole query
        finalLocationFilter = searchQuery.trim()
        console.log('✅ Populating location filter with full query:', searchQuery.trim())
      } else if (manualLocationEdit) {
        console.log('⏭️ Skipping location override - user manually edited it')
      }
    }
    
    // Update finalMapLocation AFTER determining the final location filter
    finalMapLocation = finalLocationFilter
    
    // Update state with final filter values - this will populate the input boxes
    console.log('📝 Setting filters - Location:', finalLocationFilter, 'Style:', finalStyleFilter, 'Map:', finalMapLocation)
    setStyleFilter(finalStyleFilter)
    setLocationFilter(finalLocationFilter)
    setMapLocation(finalMapLocation)
    
    // Reset manual edit flags after search completes - ready for next search
    setManualLocationEdit(false)
    setManualStyleEdit(false)

    // Small delay to ensure state updates are applied, then fetch
    setTimeout(() => {
      fetchArtists()
    }, 50)
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
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="pt-20 pb-8">
        <div className="container">
          <h1 className="display text-4xl md:text-5xl text-white mb-4">
            Browse Artists
          </h1>
          <p className="body text-lg text-gray-400 max-w-2xl">
            Discover verified tattoo artists from around the world. Browse portfolios, read reviews, and book your next session.
          </p>
        </div>
      </section>

      {/* Map Section - Full Width Edge to Edge */}
      <section className="relative">
        {/* Full Width Interactive Map - Edge to Edge */}
        <div className="w-full">
          <LeafletMap searchLocation={mapLocation} styleFilter={styleFilter} minReviews={minReviews} />
        </div>
      </section>

      {/* Search Section */}
      <section className="py-10 -mt-8 bg-black relative z-10">
        <div className="container">
          {/* First Row - Search input and Sort By */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="md:col-span-2 relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none z-10" style={{top: '50%', transform: 'translateY(-50%)'}} />
              <input
                type="text"
                placeholder="Search artists, styles, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full py-3 pl-14 pr-4 bg-transparent border-2 border-gray-400 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all duration-200"
              />
            </div>

            {/* Min Reviews Slider */}
            <div className="relative px-2">
              <label className="block text-sm text-gray-400 font-medium mb-2">
                Min Reviews: {minReviews}+
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={minReviews}
                onChange={(e) => setMinReviews(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #20B2AA 0%, #20B2AA ${(minReviews / 200) * 100}%, #374151 ${(minReviews / 200) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>200</span>
              </div>
            </div>
          </div>

          {/* Second Row - Location, Style, Search Button, and Clear Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Location Filter */}
            <div className="relative">
              <MapPinIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Enter a location"
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value)
                  setManualLocationEdit(true) // User manually edited this field
                }}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all duration-200"
                style={{paddingLeft: '3.5rem'}}
              />
            </div>

            {/* Style Filter */}
            <div className="relative">
              <select
                value={styleFilter}
                onChange={(e) => {
                  setStyleFilter(e.target.value)
                  setManualStyleEdit(true) // User manually edited this field
                }}
                className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all duration-200 appearance-none cursor-pointer"
                style={{paddingRight: '3rem'}}
              >
                <option value="" className="bg-gray-800 text-white">All Styles</option>
                {styles.map((style) => (
                  <option key={style} value={style.toLowerCase()} className="bg-gray-800 text-white">
                    {style}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={handleSearch}
                className="w-full px-8 py-3 bg-white border-2 border-gray-400 text-black rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 text-center"
              >
                Search
              </button>
            </div>

            {/* Clear Filters Button */}
            <div>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setLocationFilter('')
                  setStyleFilter('')
                  setMinReviews(0)
                  // Don't reset mapLocation - keep map where user left it
                  setLastSearchClassification(null)
                  setManualLocationEdit(false)
                  setManualStyleEdit(false)
                  fetchArtists()
                }}
                className="w-full px-8 py-3 bg-transparent border-2 border-gray-400 text-white rounded-full font-semibold hover:bg-gray-700 transition-all duration-200 text-center"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Smart Search Indicator */}
          {lastSearchClassification && lastSearchClassification.type !== 'general' && (
            <div className="mt-3 py-2 px-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">Smart Search detected:</span>
                {lastSearchClassification.type === 'location' && (
                  <span className="text-orange-400 font-medium">
                    📍 Location: {lastSearchClassification.location}
                  </span>
                )}
                {lastSearchClassification.type === 'style' && (
                  <span className="text-yellow-400 font-medium">
                    🎨 Style: {lastSearchClassification.style}
                  </span>
                )}
                {lastSearchClassification.type === 'artist_name' && (
                  <span className="text-teal-400 font-medium">
                    👤 Artist: {lastSearchClassification.artistName}
                  </span>
                )}
                {lastSearchClassification.type === 'combined' && (
                  <div className="flex flex-wrap items-center gap-2">
                    {lastSearchClassification.location && (
                      <span className="text-orange-400 font-medium">
                        📍 {lastSearchClassification.location}
                      </span>
                    )}
                    {lastSearchClassification.style && (
                      <span className="text-yellow-400 font-medium">
                        🎨 {lastSearchClassification.style}
                      </span>
                    )}
                    {lastSearchClassification.artistName && (
                      <span className="text-teal-400 font-medium">
                        👤 {lastSearchClassification.artistName}
                      </span>
                    )}
                  </div>
                )}
                <span className="ml-auto text-xs text-gray-500">
                  {(lastSearchClassification.confidence * 100).toFixed(0)}% confidence
                </span>
          </div>
            </div>
          )}

        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-black">
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