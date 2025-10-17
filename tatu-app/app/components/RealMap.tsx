'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamically import the map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const useMap = dynamic(() => import('react-leaflet').then(mod => mod.useMap), { ssr: false })

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

// Custom marker component
function CustomMarker({ artist }: { artist: ArtistLocation }) {
  const getMarkerColor = (specialty: string) => {
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

  const createCustomIcon = (color: string) => {
    if (typeof window === 'undefined') return null
    
    const L = require('leaflet')
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">${artist.name.charAt(0)}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
  }

  return (
    <Marker 
      position={[artist.lat, artist.lng]} 
      icon={createCustomIcon(getMarkerColor(artist.specialty))}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg text-gray-800 mb-1">{artist.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{artist.specialty}</p>
          <div className="text-xs text-gray-500 mb-2">{artist.bio}</div>
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center text-yellow-600">
              ⭐ {artist.rating}
            </div>
            <div className="text-gray-500">
              {artist.portfolioCount} works
            </div>
          </div>
          <Link 
            href={`/artist/${artist.id}`}
            className="inline-block bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </Popup>
    </Marker>
  )
}

// Component to handle user location
function UserLocationMarker() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const map = useMap()

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          map.setView([latitude, longitude], 12)
        },
        (error) => {
          console.log('Location access denied:', error)
        }
      )
    }
  }, [map])

  if (!userLocation) return null

  return (
    <Marker position={userLocation}>
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-sm text-gray-800">Your Location</h3>
          <p className="text-xs text-gray-600">Find artists near you</p>
        </div>
      </Popup>
    </Marker>
  )
}

export default function RealMap() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
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
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[40.7128, -74.0060]} // NYC coordinates
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Artist markers */}
        {mockArtists.map((artist) => (
          <CustomMarker key={artist.id} artist={artist} />
        ))}
        
        {/* User location marker */}
        <UserLocationMarker />
      </MapContainer>
      
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
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // This will be handled by UserLocationMarker component
                },
                (error) => {
                  alert('Location access denied. Please enable location services.')
                }
              )
            }
          }}
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
                  style={{ 
                    backgroundColor: {
                      'Realism': '#FF6B6B',
                      'Traditional': '#4ECDC4', 
                      'Watercolor': '#45B7D1',
                      'Geometric': '#96CEB4'
                    }[specialty] || '#FF6B6B'
                  }}
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
