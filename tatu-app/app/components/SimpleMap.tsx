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

export default function SimpleMap() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<ArtistLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
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
          <p className="text-white text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg relative overflow-hidden">
      {/* NYC Map Background with Streets */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20h60v60H20z' stroke='%23ffffff' stroke-opacity='0.2' stroke-width='0.5'/%3E%3Cpath d='M30 30h40v40H30z' fill='%23ffffff' fill-opacity='0.05'/%3E%3Cpath d='M40 40h20v20H40z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* NYC Streets/Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23ffffff' stroke-opacity='0.3' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Location Request Button */}
      {!userLocation && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <button
            onClick={requestLocation}
            className="w-full bg-white/90 text-black px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors text-sm"
          >
            📍 Use My Location
          </button>
        </div>
      )}

      {/* Map Title */}
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-white font-semibold text-sm bg-black/70 px-2 py-1 rounded">
          {userLocation ? 'Artists Near You' : 'Artists in NYC'}
        </h3>
        <p className="text-gray-300 text-xs bg-black/70 px-2 py-1 rounded mt-1">
          {mockArtists.length} artists available
        </p>
      </div>

      {/* NYC Landmarks */}
      <div className="absolute top-1/2 left-1/4 z-5">
        <div className="w-2 h-2 bg-yellow-400 rounded-full opacity-60"></div>
        <div className="text-xs text-yellow-400 mt-1 font-medium">Central Park</div>
      </div>
      
      <div className="absolute top-3/4 left-1/3 z-5">
        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
        <div className="text-xs text-blue-400 mt-1 font-medium">Times Square</div>
      </div>
      
      <div className="absolute top-1/3 right-1/4 z-5">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-60"></div>
        <div className="text-xs text-green-400 mt-1 font-medium">Brooklyn Bridge</div>
      </div>

      {/* Artist Icons */}
      {mockArtists.map((artist) => (
        <Link
          key={artist.id}
          href={`/artist/${artist.id}`}
          className="absolute z-20 group"
          style={{
            left: `${((artist.lng + 74.1) / 0.3) * 100}%`, // Convert lng to percentage
            top: `${((40.9 - artist.lat) / 0.2) * 100}%`, // Convert lat to percentage
            transform: 'translate(-50%, -50%)'
          }}
          onMouseEnter={() => setSelectedArtist(artist)}
          onMouseLeave={() => setSelectedArtist(null)}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform cursor-pointer"
            style={{ backgroundColor: getArtistIconColor(artist.specialty) }}
          >
            {artist.name.charAt(0)}
          </div>
          
          {/* Artist Info Tooltip */}
          {selectedArtist?.id === artist.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white p-3 rounded-lg text-xs whitespace-nowrap z-30 min-w-[200px]">
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
        </Link>
      ))}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/70 text-white p-2 rounded-lg text-xs">
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

      {/* Explore Button */}
      <div className="absolute bottom-4 right-4 z-10">
        <Link
          href="/explore"
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
        >
          Explore All
        </Link>
      </div>
    </div>
  )
}
