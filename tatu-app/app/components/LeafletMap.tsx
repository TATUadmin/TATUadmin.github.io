'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Top 20 US cities by population with coordinates and common variations
const cityData = {
  'New York': { lat: 40.7128, lng: -74.0060, state: 'NY' },
  'NYC': { lat: 40.7128, lng: -74.0060, state: 'NY' },
  'NY': { lat: 40.7128, lng: -74.0060, state: 'NY' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, state: 'CA' },
  'LA': { lat: 34.0522, lng: -118.2437, state: 'CA' },
  'Chicago': { lat: 41.8781, lng: -87.6298, state: 'IL' },
  'Houston': { lat: 29.7604, lng: -95.3698, state: 'TX' },
  'Phoenix': { lat: 33.4484, lng: -112.0740, state: 'AZ' },
  'Philadelphia': { lat: 39.9526, lng: -75.1652, state: 'PA' },
  'San Antonio': { lat: 29.4241, lng: -98.4936, state: 'TX' },
  'San Diego': { lat: 32.7157, lng: -117.1611, state: 'CA' },
  'Dallas': { lat: 32.7767, lng: -96.7970, state: 'TX' },
  'San Jose': { lat: 37.3382, lng: -121.8863, state: 'CA' },
  'Austin': { lat: 30.2672, lng: -97.7431, state: 'TX' },
  'Jacksonville': { lat: 30.3322, lng: -81.6557, state: 'FL' },
  'Fort Worth': { lat: 32.7555, lng: -97.3308, state: 'TX' },
  'Columbus': { lat: 39.9612, lng: -82.9988, state: 'OH' },
  'Charlotte': { lat: 35.2271, lng: -80.8431, state: 'NC' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, state: 'CA' },
  'SF': { lat: 37.7749, lng: -122.4194, state: 'CA' },
  'Indianapolis': { lat: 39.7684, lng: -86.1581, state: 'IN' },
  'Seattle': { lat: 47.6062, lng: -122.3321, state: 'WA' },
  'Denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
  'Memphis': { lat: 35.1495, lng: -90.0490, state: 'TN' },
  'Sacramento': { lat: 38.5816, lng: -121.4944, state: 'CA' },
  'Atlanta': { lat: 33.7490, lng: -84.3880, state: 'GA' },
  'Miami': { lat: 25.7617, lng: -80.1918, state: 'FL' },
  'Boston': { lat: 42.3601, lng: -71.0589, state: 'MA' },
  'Detroit': { lat: 42.3314, lng: -83.0458, state: 'MI' },
  'Portland': { lat: 45.5152, lng: -122.6784, state: 'OR' },
  'Las Vegas': { lat: 36.1699, lng: -115.1398, state: 'NV' },
  'Nashville': { lat: 36.1627, lng: -86.7816, state: 'TN' },
  'Milwaukee': { lat: 43.0389, lng: -87.9065, state: 'WI' },
  'Albuquerque': { lat: 35.0844, lng: -106.6504, state: 'NM' },
  'Tucson': { lat: 32.2226, lng: -110.9747, state: 'AZ' },
  'Fresno': { lat: 36.7378, lng: -119.7871, state: 'CA' },
  'Sacramento': { lat: 38.5816, lng: -121.4944, state: 'CA' },
  'Long Beach': { lat: 33.7701, lng: -118.1937, state: 'CA' },
  'Oakland': { lat: 37.8044, lng: -122.2712, state: 'CA' },
  'Bakersfield': { lat: 35.3733, lng: -119.0187, state: 'CA' },
  'Anaheim': { lat: 33.8366, lng: -117.9143, state: 'CA' },
  'Santa Ana': { lat: 33.7455, lng: -117.8677, state: 'CA' },
  'Riverside': { lat: 33.9533, lng: -117.3962, state: 'CA' },
  'Stockton': { lat: 37.9577, lng: -121.2908, state: 'CA' },
  'Irvine': { lat: 33.6846, lng: -117.8265, state: 'CA' },
  'Chula Vista': { lat: 32.6401, lng: -117.0842, state: 'CA' },
  'Fremont': { lat: 37.5483, lng: -121.9886, state: 'CA' },
  'San Bernardino': { lat: 34.1083, lng: -117.2898, state: 'CA' },
  'Modesto': { lat: 37.6391, lng: -120.9969, state: 'CA' },
  'Fontana': { lat: 34.0922, lng: -117.4350, state: 'CA' },
  'Oxnard': { lat: 34.1975, lng: -119.1771, state: 'CA' },
  'Moreno Valley': { lat: 33.9425, lng: -117.2297, state: 'CA' },
  'Huntington Beach': { lat: 33.6595, lng: -117.9988, state: 'CA' },
  'Glendale': { lat: 34.1425, lng: -118.2551, state: 'CA' },
  'Santa Clarita': { lat: 34.3917, lng: -118.5426, state: 'CA' },
  'Garden Grove': { lat: 33.7743, lng: -117.9414, state: 'CA' },
  'Oceanside': { lat: 33.1959, lng: -117.3795, state: 'CA' },
  'Rancho Cucamonga': { lat: 34.1064, lng: -117.5931, state: 'CA' },
  'Santa Rosa': { lat: 38.4404, lng: -122.7141, state: 'CA' },
  'Ontario': { lat: 34.0633, lng: -117.6509, state: 'CA' },
  'Lancaster': { lat: 34.6868, lng: -118.1542, state: 'CA' },
  'Elk Grove': { lat: 38.4088, lng: -121.3716, state: 'CA' },
  'Corona': { lat: 33.8753, lng: -117.5664, state: 'CA' },
  'Palmdale': { lat: 34.5794, lng: -118.1165, state: 'CA' },
  'Salinas': { lat: 36.6777, lng: -121.6555, state: 'CA' },
  'Pomona': { lat: 34.0551, lng: -117.7500, state: 'CA' },
  'Hayward': { lat: 37.6688, lng: -122.0808, state: 'CA' },
  'Escondido': { lat: 33.1192, lng: -117.0864, state: 'CA' },
  'Torrance': { lat: 33.8358, lng: -118.3406, state: 'CA' },
  'Sunnyvale': { lat: 37.3688, lng: -122.0363, state: 'CA' },
  'Orange': { lat: 33.7879, lng: -117.8531, state: 'CA' },
  'Fullerton': { lat: 33.8704, lng: -117.9242, state: 'CA' },
  'Pasadena': { lat: 34.1478, lng: -118.1445, state: 'CA' },
  'Thousand Oaks': { lat: 34.1706, lng: -118.8376, state: 'CA' },
  'Visalia': { lat: 36.3302, lng: -119.2921, state: 'CA' },
  'Simi Valley': { lat: 34.2694, lng: -118.7815, state: 'CA' },
  'Concord': { lat: 37.9780, lng: -122.0311, state: 'CA' },
  'Roseville': { lat: 38.7521, lng: -121.2880, state: 'CA' },
  'Vallejo': { lat: 38.1041, lng: -122.2566, state: 'CA' },
  'Victorville': { lat: 34.5361, lng: -117.2912, state: 'CA' },
  'El Monte': { lat: 34.0686, lng: -118.0276, state: 'CA' },
  'Berkeley': { lat: 37.8719, lng: -122.2585, state: 'CA' },
  'Downey': { lat: 33.9401, lng: -118.1332, state: 'CA' },
  'Costa Mesa': { lat: 33.6411, lng: -117.9187, state: 'CA' },
  'Inglewood': { lat: 33.9617, lng: -118.3531, state: 'CA' },
  'Ventura': { lat: 34.2746, lng: -119.2290, state: 'CA' },
  'West Covina': { lat: 34.0686, lng: -117.9389, state: 'CA' },
  'Norwalk': { lat: 33.9022, lng: -118.0817, state: 'CA' },
  'Carlsbad': { lat: 33.1581, lng: -117.3506, state: 'CA' },
  'Fairfield': { lat: 38.2494, lng: -122.0400, state: 'CA' },
  'Richmond': { lat: 37.9358, lng: -122.3477, state: 'CA' },
  'Murrieta': { lat: 33.5539, lng: -117.2136, state: 'CA' },
  'Antioch': { lat: 37.9789, lng: -121.7958, state: 'CA' },
  'Temecula': { lat: 33.4936, lng: -117.1484, state: 'CA' },
  'Burbank': { lat: 34.1808, lng: -118.3090, state: 'CA' },
  'Santa Monica': { lat: 34.0195, lng: -118.4912, state: 'CA' },
  'Daly City': { lat: 37.6879, lng: -122.4702, state: 'CA' },
  'Santa Clara': { lat: 37.3541, lng: -121.9552, state: 'CA' },
  'San Mateo': { lat: 37.5629, lng: -122.3255, state: 'CA' },
  'El Cajon': { lat: 32.7948, lng: -116.9625, state: 'CA' },
  'San Leandro': { lat: 37.7249, lng: -122.1561, state: 'CA' },
  'Livermore': { lat: 37.6819, lng: -121.7680, state: 'CA' },
  'Hemet': { lat: 33.7475, lng: -116.9719, state: 'CA' },
  'Chico': { lat: 39.7285, lng: -121.8375, state: 'CA' },
  'Napa': { lat: 38.2975, lng: -122.2869, state: 'CA' },
  'Redwood City': { lat: 37.4852, lng: -122.2364, state: 'CA' },
  'Turlock': { lat: 37.4947, lng: -120.8466, state: 'CA' },
  'Madera': { lat: 36.9613, lng: -120.0607, state: 'CA' },
  'Mountain View': { lat: 37.3861, lng: -122.0838, state: 'CA' },
  'Woodland': { lat: 38.6785, lng: -121.7733, state: 'CA' },
  'Boulder': { lat: 40.0150, lng: -105.2705, state: 'CO' },
  'Fort Collins': { lat: 40.5853, lng: -105.0844, state: 'CO' },
  'Lakewood': { lat: 39.7047, lng: -105.0814, state: 'CO' },
  'Thornton': { lat: 39.8680, lng: -104.9719, state: 'CO' },
  'Westminster': { lat: 39.8367, lng: -105.0372, state: 'CO' },
  'Arvada': { lat: 39.8028, lng: -105.0875, state: 'CO' },
  'Pueblo': { lat: 38.2544, lng: -104.6091, state: 'CO' },
  'Centennial': { lat: 39.5807, lng: -104.8772, state: 'CO' },
  'Broomfield': { lat: 39.9205, lng: -105.0867, state: 'CO' },
  'Northglenn': { lat: 39.8964, lng: -104.9812, state: 'CO' },
  'Commerce City': { lat: 39.8083, lng: -104.9339, state: 'CO' },
  'Loveland': { lat: 40.3978, lng: -105.0749, state: 'CO' },
  'Greeley': { lat: 40.4233, lng: -104.7091, state: 'CO' },
  'Longmont': { lat: 40.1672, lng: -105.1019, state: 'CO' },
  'Grand Junction': { lat: 39.0639, lng: -108.5506, state: 'CO' }
}

const specialtyColors: { [key: string]: string } = {
  'Traditional American': '#FF8C00',
  'Neo-Traditional': '#FFD700',
  'Blackwork': '#20B2AA',
  'Realism': '#8A2BE2',
  'Watercolor': '#DC143C',
};

interface LeafletMapProps {
  searchLocation?: string
  onLocationChange?: (location: string) => void
  styleFilter?: string
  minReviews?: number
}

export default function LeafletMap({ searchLocation, onLocationChange, styleFilter, minReviews = 0 }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [initialLocationSet, setInitialLocationSet] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasShownInitialDefault, setHasShownInitialDefault] = useState(false)
  const [artists, setArtists] = useState<any[]>([])
  const [isLoadingArtists, setIsLoadingArtists] = useState(true)
  const lastProcessedSearchLocationRef = useRef<string>('')
  const userHasPannedRef = useRef<boolean>(false)

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

  // Show NYC as placeholder when first loading the page without a search
  useEffect(() => {
    if (hasShownInitialDefault) return
    
    // Removed artificial delay - show map immediately
      if (!searchLocation || searchLocation.trim() === '') {
        const showDefaultNYC = () => {
          if (!mapInstanceRef.current) {
          // Use requestAnimationFrame for smoother initialization
          requestAnimationFrame(showDefaultNYC)
            return
          }
          mapInstanceRef.current.setView([40.7128, -74.0060], 12)
          setMapReady(true)
          setHasShownInitialDefault(true)
        }
        showDefaultNYC()
      } else {
        setHasShownInitialDefault(true)
      }
  }, [searchLocation, hasShownInitialDefault])

  // Handle search location changes with geocoding
  useEffect(() => {
    // Only process if searchLocation actually changed (not just a re-render)
    if (searchLocation === lastProcessedSearchLocationRef.current) {
      return
    }
    
    // If user has manually panned the map, don't auto-pan to search location
    if (userHasPannedRef.current && searchLocation && searchLocation.trim() !== '') {
      lastProcessedSearchLocationRef.current = searchLocation
      return
    }
    
    if (!searchLocation || searchLocation.trim() === '') {
      if (hasShownInitialDefault && initialLocationSet && !isTransitioning) {
        const showDefaultNYC = () => {
          if (!mapInstanceRef.current) {
            setTimeout(showDefaultNYC, 300)
            return
          }
          mapInstanceRef.current.setView([40.7128, -74.0060], 12)
          setMapReady(true)
        }
        showDefaultNYC()
      }
      lastProcessedSearchLocationRef.current = searchLocation || ''
      return
    }
    
    // Mark this search location as processed
    lastProcessedSearchLocationRef.current = searchLocation
    
    setIsTransitioning(true)
    const isInitialLoad = !initialLocationSet
    if (!initialLocationSet) setInitialLocationSet(true)
        
        // Fallback coordinates for major cities
        const getFallbackCoordinates = (location: string) => {
          const fallbackCities: { [key: string]: { lat: number; lng: number } } = {
            'chicago': { lat: 41.8781, lng: -87.6298 },
            'los angeles': { lat: 34.0522, lng: -118.2437 },
            'la': { lat: 34.0522, lng: -118.2437 },
            'new york': { lat: 40.7128, lng: -74.0060 },
            'nyc': { lat: 40.7128, lng: -74.0060 },
            'miami': { lat: 25.7617, lng: -80.1918 },
            'seattle': { lat: 47.6062, lng: -122.3321 },
            'denver': { lat: 39.7392, lng: -104.9903 },
            'boston': { lat: 42.3601, lng: -71.0589 },
            'atlanta': { lat: 33.7490, lng: -84.3880 },
            'houston': { lat: 29.7604, lng: -95.3698 },
            'phoenix': { lat: 33.4484, lng: -112.0740 },
            'philadelphia': { lat: 39.9526, lng: -75.1652 },
            'san antonio': { lat: 29.4241, lng: -98.4936 },
            'san diego': { lat: 32.7157, lng: -117.1611 },
            'dallas': { lat: 32.7767, lng: -96.7970 },
            'san jose': { lat: 37.3382, lng: -121.8863 },
            'austin': { lat: 30.2672, lng: -97.7431 },
            'jacksonville': { lat: 30.3322, lng: -81.6557 },
            'fort worth': { lat: 32.7555, lng: -97.3308 },
            'columbus': { lat: 39.9612, lng: -82.9988 },
            'charlotte': { lat: 35.2271, lng: -80.8431 },
            'san francisco': { lat: 37.7749, lng: -122.4194 },
            'sf': { lat: 37.7749, lng: -122.4194 },
            'indianapolis': { lat: 39.7684, lng: -86.1581 },
            'seattle': { lat: 47.6062, lng: -122.3321 },
            'denver': { lat: 39.7392, lng: -104.9903 },
            'memphis': { lat: 35.1495, lng: -90.0490 },
            'sacramento': { lat: 38.5816, lng: -121.4944 },
            'detroit': { lat: 42.3314, lng: -83.0458 },
            'portland': { lat: 45.5152, lng: -122.6784 },
            'las vegas': { lat: 36.1699, lng: -115.1398 },
            'nashville': { lat: 36.1627, lng: -86.7816 },
            'milwaukee': { lat: 43.0389, lng: -87.9065 },
            'oklahoma city': { lat: 35.4676, lng: -97.5164 },
            'louisville': { lat: 38.2527, lng: -85.7585 },
            'baltimore': { lat: 39.2904, lng: -76.6122 },
            'albuquerque': { lat: 35.0844, lng: -106.6504 },
            'tucson': { lat: 32.2226, lng: -110.9747 },
            'fresno': { lat: 36.7378, lng: -119.7871 },
            'mesa': { lat: 33.4152, lng: -111.8315 },
            'sacramento': { lat: 38.5816, lng: -121.4944 },
            'kansas city': { lat: 39.0997, lng: -94.5786 },
            'atlanta': { lat: 33.7490, lng: -84.3880 },
            'long beach': { lat: 33.7701, lng: -118.1937 },
            'colorado springs': { lat: 38.8339, lng: -104.8214 },
            'raleigh': { lat: 35.7796, lng: -78.6382 },
            'virginia beach': { lat: 36.8529, lng: -75.9780 },
            'miami': { lat: 25.7617, lng: -80.1918 },
            'omaha': { lat: 41.2565, lng: -95.9345 },
            'oakland': { lat: 37.8044, lng: -122.2712 },
            'minneapolis': { lat: 44.9778, lng: -93.2650 },
            'tulsa': { lat: 36.1540, lng: -95.9928 },
            'cleveland': { lat: 41.4993, lng: -81.6944 },
            'wichita': { lat: 37.6872, lng: -97.3301 },
            'arlington': { lat: 32.7357, lng: -97.1081 },
            'new orleans': { lat: 29.9511, lng: -90.0715 },
            'bakersfield': { lat: 35.3733, lng: -119.0187 },
            'tampa': { lat: 27.9506, lng: -82.4572 },
            'honolulu': { lat: 21.3099, lng: -157.8581 },
            'anaheim': { lat: 33.8353, lng: -117.9145 },
            'santa ana': { lat: 33.7455, lng: -117.8677 },
            'st. louis': { lat: 38.6270, lng: -90.1994 },
            'corpus christi': { lat: 27.8006, lng: -97.3964 },
            'riverside': { lat: 33.9533, lng: -117.3962 },
            'lexington': { lat: 38.0406, lng: -84.5037 },
            'pittsburgh': { lat: 40.4406, lng: -79.9959 },
            'anchorage': { lat: 61.2181, lng: -149.9003 },
            'stockton': { lat: 37.9577, lng: -121.2908 },
            'cincinnati': { lat: 39.1031, lng: -84.5120 },
            'st. paul': { lat: 44.9537, lng: -93.0900 },
            'toledo': { lat: 41.6528, lng: -83.5379 },
            'greensboro': { lat: 36.0726, lng: -79.7920 },
            'newark': { lat: 40.7357, lng: -74.1724 },
            'plano': { lat: 33.0198, lng: -96.6989 },
            'henderson': { lat: 36.0395, lng: -114.9817 },
            'lincoln': { lat: 40.8136, lng: -96.7026 },
            'buffalo': { lat: 42.8864, lng: -78.8784 },
            'jersey city': { lat: 40.7178, lng: -74.0431 },
            'chula vista': { lat: 32.6401, lng: -117.0842 },
            'fort wayne': { lat: 41.0793, lng: -85.1394 },
            'orlando': { lat: 28.5383, lng: -81.3792 },
            'st. petersburg': { lat: 27.7676, lng: -82.6403 },
            'chandler': { lat: 33.3062, lng: -111.8413 },
            'laredo': { lat: 27.5306, lng: -99.4803 },
            'norfolk': { lat: 36.8468, lng: -76.2852 },
            'durham': { lat: 35.9940, lng: -78.8986 },
            'madison': { lat: 43.0731, lng: -89.4012 },
            'lubbock': { lat: 33.5779, lng: -101.8552 },
            'irvine': { lat: 33.6846, lng: -117.8265 },
            'winston-salem': { lat: 36.0999, lng: -80.2442 },
            'glendale': { lat: 33.5387, lng: -112.1860 },
            'garland': { lat: 32.9126, lng: -96.6389 },
            'hialeah': { lat: 25.8576, lng: -80.2781 },
            'reno': { lat: 39.5296, lng: -119.8138 },
            'chesapeake': { lat: 36.7682, lng: -76.2875 },
            'gilbert': { lat: 33.3528, lng: -111.7890 },
            'baton rouge': { lat: 30.4515, lng: -91.1871 },
            'irving': { lat: 32.8140, lng: -96.9489 },
            'scottsdale': { lat: 33.4942, lng: -111.9261 },
            'north las vegas': { lat: 36.1989, lng: -115.1175 },
            'fremont': { lat: 37.5483, lng: -121.9886 },
            'boise': { lat: 43.6150, lng: -116.2023 },
            'richmond': { lat: 37.5407, lng: -77.4360 },
            'san bernardino': { lat: 34.1083, lng: -117.2898 },
            'birmingham': { lat: 33.5207, lng: -86.8025 },
            'spokane': { lat: 47.6588, lng: -117.4260 },
            'rochester': { lat: 43.1566, lng: -77.6088 },
            'des moines': { lat: 41.5868, lng: -93.6250 },
            'modesto': { lat: 37.6391, lng: -120.9969 },
            'fayetteville': { lat: 35.0527, lng: -78.8784 },
            'tacoma': { lat: 47.2529, lng: -122.4443 },
            'oxnard': { lat: 34.1975, lng: -119.1771 },
            'fontana': { lat: 34.0922, lng: -117.4350 },
            'columbus': { lat: 32.4610, lng: -84.9877 },
            'moreno valley': { lat: 33.9425, lng: -117.2297 },
            'shreveport': { lat: 32.5252, lng: -93.7502 },
            'aurora': { lat: 39.7294, lng: -104.8319 },
            'yonkers': { lat: 40.9312, lng: -73.8988 },
            'akron': { lat: 41.0814, lng: -81.5190 },
            'huntington beach': { lat: 33.6595, lng: -117.9988 },
            'little rock': { lat: 34.7465, lng: -92.2896 },
            'augusta': { lat: 33.4735, lng: -82.0105 },
            'amarillo': { lat: 35.2220, lng: -101.8313 },
            'glendale': { lat: 34.1425, lng: -118.2551 },
            'mobile': { lat: 30.6954, lng: -88.0399 },
            'grand rapids': { lat: 42.9634, lng: -85.6681 },
            'salt lake city': { lat: 40.7608, lng: -111.8910 },
            'tallahassee': { lat: 30.4383, lng: -84.2807 },
            'huntsville': { lat: 34.7304, lng: -86.5861 },
            'grand prairie': { lat: 32.7459, lng: -96.9978 },
            'knoxville': { lat: 35.9606, lng: -83.9207 },
            'worcester': { lat: 42.2626, lng: -71.8023 },
            'newport news': { lat: 37.0871, lng: -76.4730 },
            'brownsville': { lat: 25.9017, lng: -97.4975 },
            'overland park': { lat: 38.9822, lng: -94.6708 },
            'santa clarita': { lat: 34.3917, lng: -118.5426 },
            'providence': { lat: 41.8240, lng: -71.4128 },
            'garden grove': { lat: 33.7739, lng: -117.9414 },
            'vancouver': { lat: 45.6387, lng: -122.6615 },
            'sioux falls': { lat: 43.5446, lng: -96.7311 },
            'ontario': { lat: 34.0633, lng: -117.6509 },
            'mckinney': { lat: 33.1972, lng: -96.6397 },
            'elgin': { lat: 42.0373, lng: -88.2812 },
            'hampton': { lat: 37.0299, lng: -76.3452 },
            'warren': { lat: 42.5145, lng: -83.0147 },
            'west valley city': { lat: 40.6916, lng: -112.0011 },
            'burlington': { lat: 44.4759, lng: -73.2121 },
            'er': { lat: 40.7608, lng: -111.8910 }
          }
          
          const normalizedLocation = location.toLowerCase().trim()
          return fallbackCities[normalizedLocation] || null
    }
    
    // Reduced debounce delay for faster response
    const debounceDelay = isInitialLoad ? 0 : 200
    const debounceTimer = setTimeout(() => {
      const panToLocation = () => {
        if (!mapInstanceRef.current) {
          // Use requestAnimationFrame for smoother updates
          requestAnimationFrame(panToLocation)
          return
        }
        
        const geocodeLocation = async () => {
          try {
            const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchLocation)}`)
            if (!response.ok) throw new Error(`API error ${response.status}`)
            
            const data = await response.json()
            
            if (data.success && data.lat && data.lon) {
              mapInstanceRef.current.setView([data.lat, data.lon], 12)
              setMapReady(true)
              setIsTransitioning(false)
            } else {
              const fallbackCoords = getFallbackCoordinates(searchLocation)
              if (fallbackCoords) {
                mapInstanceRef.current.setView([fallbackCoords.lat, fallbackCoords.lng], 12)
                setMapReady(true)
              }
              setIsTransitioning(false)
            }
          } catch (error) {
            const fallbackCoords = getFallbackCoordinates(searchLocation)
            if (fallbackCoords) {
              mapInstanceRef.current.setView([fallbackCoords.lat, fallbackCoords.lng], 12)
              setMapReady(true)
            } else {
              setMapReady(true)
            }
            setIsTransitioning(false)
          }
        }

        geocodeLocation()
      }
      
      panToLocation()
    }, debounceDelay)
    
    return () => clearTimeout(debounceTimer)
    }, [searchLocation, initialLocationSet, hasShownInitialDefault, isTransitioning])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize the map
    const map = L.map(mapRef.current, {
      center: [40.7128, -74.0060], // NYC coordinates
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true
    })

    // Add CartoDB Dark Matter tiles (dark theme to match website)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map)

    mapInstanceRef.current = map
    
    // Track user panning/zooming to prevent auto-panning after manual interaction
    const handleMoveStart = () => {
      userHasPannedRef.current = true
    }
    
    const handleZoom = () => {
      userHasPannedRef.current = true
    }
    
    map.on('movestart', handleMoveStart)
    map.on('zoomstart', handleZoom)

    // Cleanup function
    return () => {
      map.off('movestart', handleMoveStart)
      map.off('zoomstart', handleZoom)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // Empty deps - only run once on mount

  // Fetch artists from API
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoadingArtists(true)
      try {
        const params = new URLSearchParams()
        if (styleFilter) {
          params.set('style', styleFilter)
        }
        params.set('limit', '1000') // Get all artists with location
        
        const response = await fetch(`/api/artists?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch artists')
        }
        
        const responseData = await response.json()
        
        // API returns ApiResponse.paginated format: { success: true, data: [...], meta: {...} }
        // Handle both ApiResponse format and direct array format
        let artistsArray = []
        if (Array.isArray(responseData)) {
          artistsArray = responseData
        } else if (responseData.data && Array.isArray(responseData.data)) {
          artistsArray = responseData.data
        } else if (responseData.artists && Array.isArray(responseData.artists)) {
          artistsArray = responseData.artists
        } else if (responseData.success && responseData.data) {
          artistsArray = Array.isArray(responseData.data) ? responseData.data : []
        }
        
        console.log('Fetched artists from API:', artistsArray.length, 'total artists')
        
        // Transform API data to match component's Artist interface
        const transformedArtists = artistsArray
          .filter((artist: any) => {
            const hasLocation = artist.latitude && artist.longitude
            if (!hasLocation) {
              console.log('Filtered out artist (no location):', artist.name, artist.id)
            }
            return hasLocation
          })
          .map((artist: any) => ({
            id: artist.id,
            name: artist.name || 'Unknown Artist',
            specialty: artist.specialties?.[0] || artist.specialty || 'Other',
            specialties: artist.specialties || [],
            rating: artist.rating || 0,
            reviewCount: artist.reviewCount || 0,
            bio: artist.bio || '',
            latitude: artist.latitude,
            longitude: artist.longitude,
            location: artist.location || '',
            age: artist.age || 0,
            yearsExperience: artist.yearsExperience || 0,
            avatar: artist.avatar || '/api/placeholder/80/80',
            city: artist.city || ''
          }))
        
        console.log('Transformed artists with location:', transformedArtists.length)
        
        // Filter by minimum reviews
        const filteredArtists = transformedArtists.filter((artist: any) => {
          const meetsMinReviews = artist.reviewCount >= minReviews
          if (!meetsMinReviews) {
            console.log('Filtered out artist (min reviews):', artist.name, 'has', artist.reviewCount, 'reviews, need', minReviews)
          }
          return meetsMinReviews
        })
        
        console.log('Final filtered artists:', filteredArtists.length)
        setArtists(filteredArtists)
      } catch (error) {
        console.error('Error fetching artists:', error)
        setArtists([])
      } finally {
        setIsLoadingArtists(false)
      }
    }

    fetchArtists()
  }, [styleFilter, minReviews])

  // Memoize filtered artists to avoid recalculating on every render
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      // Check if artist matches the style filter
      const matchesStyle = !styleFilter || (artist.specialties && artist.specialties.some((s: string) => 
        s.toLowerCase().includes(styleFilter.toLowerCase()) ||
        s.toLowerCase().replace(/\s+/g, '').includes(styleFilter.toLowerCase().replace(/\s+/g, ''))
      )) || (artist.specialty && (
        artist.specialty.toLowerCase().includes(styleFilter.toLowerCase()) ||
        artist.specialty.toLowerCase().replace(/\s+/g, '').includes(styleFilter.toLowerCase().replace(/\s+/g, ''))
      ))
      
      // Check if artist meets minimum review count
      const meetsMinReviews = artist.reviewCount >= minReviews
      
      return matchesStyle && meetsMinReviews
    })
  }, [artists, styleFilter, minReviews])

  // Separate effect to manage markers based on styleFilter and minReviews
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove all existing markers
    markersRef.current.forEach(marker => {
      marker.remove()
    })
    markersRef.current = []

    // Add markers for filtered artists
    filteredArtists.forEach(artist => {
      if (artist.latitude && artist.longitude) {
        const color = specialtyColors[artist.specialty] || specialtyColors['Other']
        const marker = L.circleMarker([artist.latitude, artist.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        })

        // Create popup content with proper styling and clickable link
        const popupContent = `
          <div style="min-width: 220px; padding: 12px; background-color: #111827; color: #fff; border-radius: 8px;">
            <h3 style="font-weight: 600; font-size: 16px; margin: 0 0 6px 0; color: #fff;">${artist.name}</h3>
            <p style="font-size: 13px; color: #9ca3af; margin: 0 0 6px 0;">${artist.specialty}</p>
            <p style="font-size: 13px; color: #fff; margin: 0 0 10px 0;">⭐ ${artist.rating.toFixed(1)} (${artist.reviewCount} ${artist.reviewCount === 1 ? 'review' : 'reviews'})</p>
            <a href="/artist/${artist.id}" style="display: inline-block; padding: 8px 16px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; transition: background-color 0.2s; cursor: pointer;" onmouseover="this.style.backgroundColor='#2563eb'" onmouseout="this.style.backgroundColor='#3b82f6'">View Profile</a>
          </div>
        `
        
        marker.bindPopup(popupContent, {
          className: 'custom-popup',
          maxWidth: 280,
          closeButton: true
        })
        
        // Add click handler to marker to open profile page when marker is clicked
        marker.on('click', () => {
          // Popup opens automatically, link in popup handles navigation
        })

        marker.addTo(mapInstanceRef.current!)
      markersRef.current.push(marker)
      }
    })
  }, [filteredArtists, specialtyColors])

  return (
    <div className="relative w-full h-full min-h-[600px] bg-gray-900 overflow-visible z-0" style={{ borderRadius: '0.5rem' }}>
      <div ref={mapRef} className="w-full h-full relative z-0" style={{ borderRadius: '0.5rem', overflow: 'hidden' }} />
      {/* Bottom fade overlay - matches top fade style but inverted */}
      {/* Higher z-index to ensure it appears above the filter section (z-10) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-[500]" style={{ zIndex: 500 }} />
      {isLoadingArtists && (
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm z-[500]" style={{ zIndex: 500 }}>
          Loading artists...
        </div>
      )}
    </div>
  )
}
