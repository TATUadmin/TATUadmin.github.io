'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ArtistLocation {
  id: string
  name: string
  specialty: string
  rating: number
  lat: number
  lng: number
  avatar?: string
  bio?: string
  portfolioCount?: number
}

// Mock artist data for NYC
const mockArtists: ArtistLocation[] = [
  { 
    id: '1', 
    name: 'Sarah Chen', 
    specialty: 'Realism', 
    rating: 4.9, 
    lat: 40.7589, 
    lng: -73.9851, 
    bio: 'Specializing in photorealistic portraits and nature scenes',
    portfolioCount: 24
  },
  { 
    id: '2', 
    name: 'Mike Rodriguez', 
    specialty: 'Traditional', 
    rating: 4.8, 
    lat: 40.7505, 
    lng: -73.9934,
    bio: 'Classic American traditional with bold lines and colors',
    portfolioCount: 18
  },
  { 
    id: '3', 
    name: 'Emma Wilson', 
    specialty: 'Watercolor', 
    rating: 4.7, 
    lat: 40.7614, 
    lng: -73.9776,
    bio: 'Delicate watercolor-style tattoos with flowing designs',
    portfolioCount: 31
  },
  { 
    id: '4', 
    name: 'Alex Kim', 
    specialty: 'Geometric', 
    rating: 4.9, 
    lat: 40.7282, 
    lng: -73.7949,
    bio: 'Precision geometric and mandala designs',
    portfolioCount: 22
  },
  { 
    id: '5', 
    name: 'Jordan Taylor', 
    specialty: 'Blackwork', 
    rating: 4.6, 
    lat: 40.6892, 
    lng: -74.0445,
    bio: 'Bold blackwork and dotwork tattoos',
    portfolioCount: 19
  },
  { 
    id: '6', 
    name: 'Casey Martinez', 
    specialty: 'Japanese', 
    rating: 4.8, 
    lat: 40.7831, 
    lng: -73.9712,
    bio: 'Traditional Japanese and neo-traditional styles',
    portfolioCount: 28
  },
  { 
    id: '7', 
    name: 'Riley Johnson', 
    specialty: 'Minimalist', 
    rating: 4.7, 
    lat: 40.7505, 
    lng: -73.9934,
    bio: 'Clean, minimal line work and simple designs',
    portfolioCount: 15
  },
  { 
    id: '8', 
    name: 'Taylor Swift', 
    specialty: 'Portrait', 
    rating: 4.9, 
    lat: 40.7614, 
    lng: -73.9776,
    bio: 'Detailed portrait and memorial tattoos',
    portfolioCount: 26
  },
]

export default function WorkingMap() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<ArtistLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false)
      setMapLoaded(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.log('Location access denied:', error)
          // Keep default NYC center
        }
      )
    }
  }

  const getArtistIconColor = (specialty: string) => {
    const colors: { [key: string]: string } = {
      'Realism': '#FF6B6B',
      'Traditional': '#4ECDC4',
      'Watercolor': '#45B7D1',
      'Geometric': '#96CEB4',
      'Blackwork': '#FFEAA7',
      'Japanese': '#DDA0DD',
      'Minimalist': '#98D8C8',
      'Portrait': '#F7DC6F'
    }
    return colors[specialty] || '#FF6B6B'
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-sm">Loading NYC map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg relative overflow-hidden">
      {/* Real NYC Map using OpenStreetMap */}
      <iframe
        src="https://www.openstreetmap.org/export/embed.html?bbox=-74.1%2C40.6%2C-73.8%2C40.9&layer=mapnik&marker=40.7128%2C-74.0060"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        className="opacity-80"
        title="NYC Map"
      />
      
      {/* Overlay for artist markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Artist Icons */}
        {mockArtists.map((artist) => (
          <div
            key={artist.id}
            className="absolute pointer-events-auto group"
            style={{
              left: `${((artist.lng + 74.1) / 0.3) * 100}%`, // Convert lng to percentage
              top: `${((40.9 - artist.lat) / 0.2) * 100}%`, // Convert lat to percentage
              transform: 'translate(-50%, -50%)'
            }}
            onMouseEnter={() => setSelectedArtist(artist)}
            onMouseLeave={() => setSelectedArtist(null)}
          >
            <Link href={`/artist/${artist.id}`}>
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: getArtistIconColor(artist.specialty) }}
              >
                {artist.name.charAt(0)}
              </div>
            </Link>
            
            {/* Artist Info Tooltip */}
            {selectedArtist?.id === artist.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white p-3 rounded-lg text-xs whitespace-nowrap z-30 min-w-[200px] pointer-events-none">
                <div className="font-semibold text-sm">{artist.name}</div>
                <div className="text-gray-300 text-xs mb-1">{artist.specialty}</div>
                <div className="text-xs text-gray-400 mb-2">{artist.bio}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-yellow-400">
                    ⭐ {artist.rating}
                  </div>
                  <div className="text-gray-400">
                    {artist.portfolioCount} works
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute pointer-events-auto"
            style={{
              left: `${((userLocation.lng + 74.1) / 0.3) * 100}%`,
              top: `${((40.9 - userLocation.lat) / 0.2) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-6 h-6 rounded-full border-3 border-red-500 bg-red-500 shadow-lg animate-pulse">
              <div className="w-full h-full rounded-full bg-red-500"></div>
            </div>
          </div>
        )}
      </div>

      {/* Map controls overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 text-black px-3 py-2 rounded-lg shadow-lg">
          <h3 className="font-semibold text-sm">NYC Artists</h3>
          <p className="text-xs text-gray-600">{mockArtists.length} artists available</p>
        </div>
      </div>

      {/* Location button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={requestLocation}
          className="bg-white/90 text-black px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors text-sm font-medium"
        >
          📍 My Location
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 text-black p-2 rounded-lg shadow-lg text-xs">
          <div className="font-semibold mb-1">Specialties</div>
          <div className="flex flex-wrap gap-1">
            {['Realism', 'Traditional', 'Watercolor', 'Geometric'].map(specialty => (
              <div key={specialty} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getArtistIconColor(specialty) }}
                />
                <span className="text-xs">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Link
          href="/explore"
          className="bg-white/90 text-black px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors text-sm font-medium"
        >
          Explore All
        </Link>
      </div>
    </div>
  )
}
