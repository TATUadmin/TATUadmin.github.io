'use client'

import { useState, useEffect, useCallback } from 'react'
import Map, { Marker, Popup } from 'react-map-gl'
import Link from 'next/link'
import 'mapbox-gl/dist/mapbox-gl.css'

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

// Mock artist data for NYC - these would come from your API
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

export default function InteractiveMap() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<ArtistLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewState, setViewState] = useState({
    longitude: -73.9851, // NYC center
    latitude: 40.7589,
    zoom: 11
  })

  // You'll need to add your Mapbox token to environment variables
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const requestLocation = useCallback(async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          setViewState(prev => ({
            ...prev,
            latitude,
            longitude,
            zoom: 12
          }))
        },
        (error) => {
          console.log('Location access denied:', error)
          // Keep default NYC center
        }
      )
    }
  }, [])

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
    <div className="w-full h-96 rounded-lg overflow-hidden relative">
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

      {/* Interactive Map */}
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        attributionControl={false}
      >
        {/* Artist Markers */}
        {mockArtists.map((artist) => (
          <Marker
            key={artist.id}
            longitude={artist.lng}
            latitude={artist.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation()
              setSelectedArtist(artist)
            }}
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: getArtistIconColor(artist.specialty) }}
            >
              {artist.name.charAt(0)}
            </div>
          </Marker>
        ))}

        {/* Artist Popup */}
        {selectedArtist && (
          <Popup
            longitude={selectedArtist.lng}
            latitude={selectedArtist.lat}
            onClose={() => setSelectedArtist(null)}
            closeButton={true}
            closeOnClick={false}
            className="custom-popup"
          >
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: getArtistIconColor(selectedArtist.specialty) }}
                >
                  {selectedArtist.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedArtist.name}</h3>
                  <p className="text-sm text-gray-600">{selectedArtist.specialty}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">{selectedArtist.bio}</p>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center text-yellow-600">
                  ⭐ {selectedArtist.rating}
                </div>
                <div className="text-gray-600">
                  {selectedArtist.portfolioCount} works
                </div>
              </div>
              
              <Link
                href={`/artist/${selectedArtist.id}`}
                className="w-full bg-black text-white px-3 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors text-center block"
              >
                View Portfolio
              </Link>
            </div>
          </Popup>
        )}
      </Map>

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
