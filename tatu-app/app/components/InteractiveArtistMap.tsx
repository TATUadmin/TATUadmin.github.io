'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid'

// Mock artist data with coordinates (NYC area)
const mockArtists = [
  { 
    id: '1', 
    name: 'Alex Rivera', 
    specialty: 'Traditional American', 
    rating: 4.8, 
    reviewCount: 127, 
    bio: 'Professional tattoo artist with over 8 years of experience.',
    latitude: 40.7128, 
    longitude: -74.0060,
    location: 'Lower Manhattan, NY'
  },
  { 
    id: '2', 
    name: 'Sarah Chen', 
    specialty: 'Watercolor', 
    rating: 4.9, 
    reviewCount: 89, 
    bio: 'Watercolor and minimalist tattoo specialist.',
    latitude: 40.7580, 
    longitude: -73.9855,
    location: 'Times Square, NY'
  },
  { 
    id: '3', 
    name: 'Marcus Johnson', 
    specialty: 'Realism', 
    rating: 4.7, 
    reviewCount: 156, 
    bio: 'Realism and portrait artist known for detailed work.',
    latitude: 40.7061, 
    longitude: -74.0113,
    location: 'Financial District, NY'
  },
  { 
    id: '4', 
    name: 'Elena Rodriguez', 
    specialty: 'Japanese Traditional', 
    rating: 4.6, 
    reviewCount: 94, 
    bio: 'Japanese traditional and geometric tattoo artist.',
    latitude: 40.7831, 
    longitude: -73.9712,
    location: 'Upper West Side, NY'
  },
  { 
    id: '5', 
    name: 'David Kim', 
    specialty: 'Neo-Traditional', 
    rating: 4.8, 
    reviewCount: 112, 
    bio: 'Neo-traditional and new school artist.',
    latitude: 40.7291, 
    longitude: -73.9965,
    location: 'East Village, NY'
  },
  { 
    id: '6', 
    name: 'Lisa Thompson', 
    specialty: 'Geometric', 
    rating: 4.9, 
    reviewCount: 67, 
    bio: 'Fine line and minimalist specialist.',
    latitude: 40.6782, 
    longitude: -73.9442,
    location: 'Brooklyn, NY'
  },
  { 
    id: '7', 
    name: 'Mike Chen', 
    specialty: 'Minimalist', 
    rating: 4.6, 
    reviewCount: 89, 
    bio: 'Geometric designs and minimalist blackwork.',
    latitude: 40.7650, 
    longitude: -73.9780,
    location: 'Midtown East, NY'
  },
  { 
    id: '8', 
    name: 'Sarah Wilson', 
    specialty: 'Blackwork', 
    rating: 4.7, 
    reviewCount: 134, 
    bio: 'Traditional American and neo-traditional styles.',
    latitude: 40.7000, 
    longitude: -73.9500,
    location: 'Williamsburg, NY'
  }
]

const specialtyColors: { [key: string]: string } = {
  'Traditional American': '#FF8C00',
  'Neo-Traditional': '#FFD700',
  'Blackwork': '#20B2AA',
  'Realism': '#8A2BE2',
  'Watercolor': '#DC143C',
  'Geometric': '#00BFFF',
  'Minimalist': '#ADFF2F',
  'Japanese Traditional': '#FF6347',
  'Tribal': '#6A5ACD',
  'Other': '#D3D3D3'
}

export default function InteractiveArtistMap() {
  const [selectedArtist, setSelectedArtist] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null)
  const [mapState, setMapState] = useState({
    center: { lat: 40.7128, lng: -74.0060 },
    zoom: 12
  })
  const mapRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 })

  const defaultLatitude = 40.7128 // NYC latitude
  const defaultLongitude = -74.0060 // NYC longitude

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setMapState({
            center: { lat: position.coords.latitude, lng: position.coords.longitude },
            zoom: 14
          })
        },
        (error) => {
          console.error('Error getting user location:', error)
          alert('Could not retrieve your location. Please ensure location services are enabled.')
        }
      )
    } else {
      alert('Geolocation is not supported by your browser.')
    }
  }

  // Touch/Mouse event handlers for panning
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setDragStart({ x: clientX, y: clientY })
  }

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    
    e.preventDefault()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    
    setMapOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setDragStart({ x: clientX, y: clientY })
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setMapState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }))
  }

  const handleZoomOut = () => {
    setMapState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 8) }))
  }

  // Convert lat/lng to pixel coordinates (simplified)
  const latLngToPixel = (lat: number, lng: number) => {
    const center = mapState.center
    const zoom = mapState.zoom
    
    // Simplified conversion - in a real implementation, you'd use proper map projection
    const scale = Math.pow(2, zoom)
    const x = (lng - center.lng) * scale * 100 + 50 + mapOffset.x
    const y = (center.lat - lat) * scale * 100 + 50 + mapOffset.y
    
    return { x, y }
  }

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg relative overflow-hidden">
      {/* Map Background - NYC-style map */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1a1a2e 75%, #16213e 100%),
            radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)
          `,
          transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${Math.pow(2, mapState.zoom - 12)})`
        }}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
      >
        {/* Street Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Water Areas */}
        <div className="absolute top-0 left-0 w-full h-1/3 bg-blue-900 opacity-40" />
        <div className="absolute bottom-0 right-0 w-1/3 h-1/4 bg-blue-900 opacity-40" />
        
        {/* NYC Landmarks */}
        <div className="absolute top-1/4 left-1/4 w-12 h-8 bg-green-600 rounded-lg opacity-70" title="Central Park" />
        <div className="absolute top-1/3 left-1/2 w-8 h-6 bg-yellow-500 rounded-lg opacity-70" title="Times Square" />
        <div className="absolute top-2/3 left-1/3 w-6 h-4 bg-blue-500 rounded-lg opacity-70" title="Brooklyn Bridge" />
        <div className="absolute top-1/2 right-1/4 w-4 h-6 bg-red-500 rounded-lg opacity-70" title="Empire State Building" />
        
        {/* Major Streets */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-400 opacity-60" />
        <div className="absolute top-0 left-1/2 w-1 h-full bg-yellow-400 opacity-60" />
      </div>

      {/* Artist Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {mockArtists.map(artist => {
          const pixel = latLngToPixel(artist.latitude, artist.longitude)
          return (
            <div
              key={artist.id}
              className="absolute flex flex-col items-center cursor-pointer pointer-events-auto"
              style={{
                left: `${pixel.x}px`,
                top: `${pixel.y}px`,
                transform: 'translate(-50%, -100%)'
              }}
              onMouseEnter={() => setSelectedArtist(artist)}
              onMouseLeave={() => setSelectedArtist(null)}
              onClick={() => window.location.href = `/artist/${artist.id}`}
            >
              <MapPinIcon
                className="w-8 h-8"
                style={{ color: specialtyColors[artist.specialty] || specialtyColors['Other'] }}
              />
              {selectedArtist?.id === artist.id && (
                <div className="absolute bottom-full mb-2 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{artist.name}</h3>
                  <p className="text-gray-300 text-xs mb-1">{artist.specialty}</p>
                  <p className="text-gray-400 text-xs mb-2">{artist.location}</p>
                  <div className="flex items-center text-gray-400 text-xs mb-2">
                    <StarIcon className="w-3 h-3 mr-1 text-yellow-400" />
                    <span>{artist.rating} ({artist.reviewCount} reviews)</span>
                  </div>
                  <Link 
                    href={`/artist/${artist.id}`} 
                    className="text-blue-400 hover:underline text-xs block"
                  >
                    View Profile →
                  </Link>
                </div>
              )}
            </div>
          )
        })}

        {/* User Location Marker */}
        {userLocation && (
          <div
            className="absolute flex flex-col items-center pointer-events-auto"
            style={{
              left: `${latLngToPixel(userLocation.latitude, userLocation.longitude).x}px`,
              top: `${latLngToPixel(userLocation.latitude, userLocation.longitude).y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <MapPinIcon className="w-8 h-8 text-red-500" />
            <div className="absolute bottom-full mb-2 p-2 bg-gray-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap">
              Your Location
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
      </div>

      {/* Location Button */}
      <button
        onClick={handleUseMyLocation}
        className="absolute bottom-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 transition-colors z-10"
      >
        Use My Location
      </button>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-gray-800 text-white p-3 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
        <h4 className="font-bold text-sm mb-2">Specialties</h4>
        {Object.entries(specialtyColors).map(([specialty, color]) => (
          <div key={specialty} className="flex items-center text-xs mb-1">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            {specialty}
          </div>
        ))}
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md shadow-lg text-sm">
        Zoom: {mapState.zoom}
      </div>
    </div>
  )
}
