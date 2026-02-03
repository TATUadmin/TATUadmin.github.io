'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import 'leaflet/dist/leaflet.css'

interface ArtistLocationMapProps {
  latitude?: number | null
  longitude?: number | null
  locationRadius?: number | null
  actualAddress?: string | null
  onLocationChange: (data: {
    latitude: number
    longitude: number
    locationRadius: number
    actualAddress: string
  }) => void
}

export default function ArtistLocationMap({
  latitude,
  longitude,
  locationRadius = 500,
  actualAddress,
  onLocationChange,
}: ArtistLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null) // Store map instance in ref to avoid stale closures
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [circle, setCircle] = useState<any>(null)
  const [addressInput, setAddressInput] = useState(actualAddress || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return

    // Check if map is already initialized on this container
    if (mapInstanceRef.current) {
      return
    }

    // Check if Leaflet has already initialized this container
    if ((mapRef.current as any)._leaflet_id) {
      // Container was already initialized, clean it up
      const existingMap = (mapRef.current as any)._leaflet
      if (existingMap) {
        existingMap.remove()
      }
      // Clear the Leaflet ID
      delete (mapRef.current as any)._leaflet_id
    }

    let isMounted = true

    // Dynamically import Leaflet only on client side
    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return

      // Fix for default markers
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Double-check container is still available and not initialized
      if ((mapRef.current as any)._leaflet_id) {
        return
      }

      const mapInstance = L.default.map(mapRef.current!, {
        center: latitude && longitude ? [latitude, longitude] : [40.7128, -74.0060], // Default to NYC
        zoom: latitude && longitude ? 13 : 10,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true
      })

      mapInstanceRef.current = mapInstance
      setMap(mapInstance)

      // Add CartoDB Dark Matter tiles (dark theme to match website)
      L.default.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(mapInstance)

      // Add marker and circle if location exists
      if (latitude && longitude) {
        const markerInstance = L.default.marker([latitude, longitude]).addTo(mapInstance)
        setMarker(markerInstance)

        // Add circle for privacy radius (convert feet to meters)
        const radiusInMeters = (locationRadius || 500) * 0.3048
        const circleInstance = L.default.circle([latitude, longitude], {
          radius: radiusInMeters,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
        }).addTo(mapInstance)
        setCircle(circleInstance)
      }

      // Handle map clicks
      mapInstance.on('click', async (e: any) => {
        const { lat, lng } = e.latlng
        setIsLoading(true)
        setError(null)

        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'User-Agent': 'TATU-App/1.0'
              }
            }
          )
          const data = await response.json()
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          // Update marker using current state
          setMarker((currentMarker: any) => {
            if (currentMarker) {
              currentMarker.setLatLng([lat, lng])
              return currentMarker
            } else {
              const newMarker = L.default.marker([lat, lng]).addTo(mapInstance)
              return newMarker
            }
          })

          // Update circle using current state
          setCircle((currentCircle: any) => {
            const radiusInMeters = (locationRadius || 500) * 0.3048
            if (currentCircle) {
              currentCircle.setLatLng([lat, lng])
              currentCircle.setRadius(radiusInMeters)
              return currentCircle
            } else {
              const newCircle = L.default.circle([lat, lng], {
                radius: radiusInMeters,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.2,
              }).addTo(mapInstance)
              return newCircle
            }
          })

          // Update address input
          setAddressInput(address)

          // Call onLocationChange
          onLocationChange({
            latitude: lat,
            longitude: lng,
            locationRadius: locationRadius || 500,
            actualAddress: address,
          })

          setIsLoading(false)
        } catch (err) {
          console.error('Error reverse geocoding:', err)
          setError('Failed to get address for this location')
          setIsLoading(false)
        }
      })
    }).catch((err) => {
      console.error('Error loading Leaflet:', err)
      setError('Failed to load map. Please refresh the page.')
    })

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (e) {
          console.error('Error removing map:', e)
        }
        mapInstanceRef.current = null
        setMap(null)
      }
    }
  }, []) // Empty deps - only initialize once

  // Update map when location changes externally
  useEffect(() => {
    if (!map || !latitude || !longitude) return

    const radiusInMeters = (locationRadius || 500) * 0.3048

    if (marker) {
      marker.setLatLng([latitude, longitude])
    } else {
      import('leaflet').then((L) => {
        const newMarker = L.default.marker([latitude, longitude]).addTo(map)
        setMarker(newMarker)
      })
    }

    if (circle) {
      circle.setLatLng([latitude, longitude])
      circle.setRadius(radiusInMeters)
    } else {
      import('leaflet').then((L) => {
        const newCircle = L.default.circle([latitude, longitude], {
          radius: radiusInMeters,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
        }).addTo(map)
        setCircle(newCircle)
      })
    }

    map.setView([latitude, longitude], 13)
  }, [latitude, longitude, locationRadius])

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser. Please enter an address manually.')
      return
    }

    // Check if we're on HTTPS or localhost (required for geolocation)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (!isSecure) {
      setError('Geolocation requires HTTPS. Please use https:// or enter an address manually.')
      return
    }

    setIsLoading(true)
    setError(null)

    // Try to get location - like Google Maps, just attempt it directly
    // Browser will show permission prompt if needed
    const tryGetLocation = (options: PositionOptions, attempt: number = 1) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords
          // Wait for map to be available if needed (with timeout)
          const updateMapWithLocation = (retries = 10) => {
            if (!map) {
              if (retries > 0) {
                // Map might still be initializing, wait a bit
                setTimeout(() => updateMapWithLocation(retries - 1), 200)
                return
              } else {
                // Map never became available, but still save the location
                console.warn('Map not available, but saving location data')
                setAddressInput(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                onLocationChange({
                  latitude: lat,
                  longitude: lng,
                  locationRadius: locationRadius || 500,
                  actualAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                })
                setIsLoading(false)
                setError('Location saved, but map is still loading. Please refresh the page.')
                return
              }
            }

            // Map is available, update it
            try {
              // Update map view first
              map.setView([lat, lng], 13)

              // Update or create marker
              if (marker) {
                marker.setLatLng([lat, lng])
              } else {
                import('leaflet').then((L) => {
                  if (map) {
                    const newMarker = L.default.marker([lat, lng]).addTo(map)
                    setMarker(newMarker)
                  }
                })
              }

              // Update or create circle
              const radiusInMeters = (locationRadius || 500) * 0.3048
              if (circle) {
                circle.setLatLng([lat, lng])
                circle.setRadius(radiusInMeters)
              } else {
                import('leaflet').then((L) => {
                  if (map) {
                    const newCircle = L.default.circle([lat, lng], {
                      radius: radiusInMeters,
                      color: '#3b82f6',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.2,
                    }).addTo(map)
                    setCircle(newCircle)
                  }
                })
              }
            } catch (mapError) {
              console.error('Error updating map:', mapError)
              // Still save the location even if map update fails
            }
          }

          updateMapWithLocation()

          // Try to reverse geocode for address, but don't block on failure
          let address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  'User-Agent': 'TATU-App/1.0'
                }
              }
            )
            if (response.ok) {
              const data = await response.json()
              if (data.display_name) {
                address = data.display_name
              }
            }
          } catch (err) {
            console.error('Error reverse geocoding (non-blocking):', err)
            // Continue with coordinates as address
          }

          setAddressInput(address)

          // Always call onLocationChange with coordinates, even if reverse geocoding failed
          onLocationChange({
            latitude: lat,
            longitude: lng,
            locationRadius: locationRadius || 500,
            actualAddress: address,
          })

          setIsLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Geolocation error:', err)
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              // If first attempt failed and we used high accuracy, try without it
              if (attempt === 1 && options.enableHighAccuracy) {
                tryGetLocation({
                  enableHighAccuracy: false,
                  timeout: 15000,
                  maximumAge: 60000 // Allow 1 minute old cache
                }, 2)
                return
              }
              
              // Only show minimal error - user can enter address manually
              setError('Location access denied. Please enter your address manually.')
              setIsLoading(false)
              break
            case err.POSITION_UNAVAILABLE:
              // Retry once with cached location
              if (attempt === 1) {
                tryGetLocation({
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 300000 // Allow 5 minute old cache
                }, 2)
                return
              }
              setError('Location unavailable. Please enter your address manually.')
              setIsLoading(false)
              break
            case err.TIMEOUT:
              // Retry with longer timeout if first attempt
              if (attempt === 1) {
                tryGetLocation({
                  enableHighAccuracy: false,
                  timeout: 20000,
                  maximumAge: 300000 // Allow 5 minute old cache
                }, 2)
                return
              }
              setError('Location request timed out. Please enter your address manually.')
              setIsLoading(false)
              break
            default:
              setError('Unable to get location. Please enter your address manually.')
              setIsLoading(false)
              break
          }
        },
        options
      )
    }

    // Start with high accuracy, will fallback if needed
    // Use more lenient options for better compatibility
    tryGetLocation({
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better reliability
      maximumAge: 300000 // Allow 5 minute old cache as fallback
    })
  }

  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Use the geocoding API endpoint which has better error handling and fallbacks
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(addressInput.trim())}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (!data.success || !data.lat || !data.lon) {
        setError('Address not found. Please try a more specific address (e.g., "New York, NY" or "123 Main St, City, State").')
        setIsLoading(false)
        return
      }

      const latNum = parseFloat(data.lat)
      const lonNum = parseFloat(data.lon)
      const address = data.display_name || addressInput.trim()

      // Validate coordinates
      if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
        throw new Error('Invalid coordinates received')
      }

      // Update marker
      if (marker && map) {
        marker.setLatLng([latNum, lonNum])
      } else if (map) {
        import('leaflet').then((L) => {
          const newMarker = L.default.marker([latNum, lonNum]).addTo(map)
          setMarker(newMarker)
        })
      }

      // Update circle
      const radiusInMeters = (locationRadius || 500) * 0.3048
      if (circle && map) {
        circle.setLatLng([latNum, lonNum])
        circle.setRadius(radiusInMeters)
      } else if (map) {
        import('leaflet').then((L) => {
          const newCircle = L.default.circle([latNum, lonNum], {
            radius: radiusInMeters,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.2,
          }).addTo(map)
          setCircle(newCircle)
        })
      }

      if (map) {
        map.setView([latNum, lonNum], 13)
      }

      // Update address input with the resolved address
      setAddressInput(address)

      onLocationChange({
        latitude: latNum,
        longitude: lonNum,
        locationRadius: locationRadius || 500,
        actualAddress: address,
      })

      setIsLoading(false)
    } catch (err: any) {
      console.error('Error geocoding:', err)
      const errorMessage = err.message || 'Failed to find address'
      
      // Provide helpful error messages
      if (errorMessage.includes('not found') || errorMessage.includes('No results')) {
        setError('Address not found. Try: "City, State" (e.g., "New York, NY"), "Street Address, City" (e.g., "123 Main St, Los Angeles"), or just a city name.')
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.')
      } else {
        setError(`Failed to find address: ${errorMessage}. Please try a different address or format.`)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddressSearch()
              }
            }}
            placeholder="Enter your address or click on the map"
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
          />
        </div>
        <button
          onClick={handleAddressSearch}
          disabled={isLoading || !addressInput.trim()}
          className="px-4 py-2 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Search
        </button>
        <button
          onClick={handleUseCurrentLocation}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPinIcon className="w-5 h-5" />
          Use My Location
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-900/20 border border-red-700 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="relative w-full h-96 bg-black rounded-xl border border-gray-700 overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-full relative z-0"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-400 space-y-1">
        <p>• Click on the map to set your location</p>
        <p>• The blue circle shows your privacy radius (~{locationRadius || 500} ft)</p>
        <p>• Clients will only see your approximate location until booking is confirmed</p>
      </div>
    </div>
  )
}

