'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid'
import { ALL_ARTISTS } from '@/lib/all-artists-data'

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

// Mock artist data across top 20 US cities (5+ artists per city)
const mockArtists = [
  // New York City
  { id: '1', name: 'Alex Rivera', specialty: 'Traditional American', rating: 4.8, reviewCount: 127, bio: 'Professional tattoo artist with over 8 years of experience.', latitude: 40.7128, longitude: -74.0060, location: 'Lower Manhattan, NY', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '2', name: 'Sarah Chen', specialty: 'Watercolor', rating: 4.9, reviewCount: 89, bio: 'Watercolor and minimalist tattoo specialist.', latitude: 40.7580, longitude: -73.9855, location: 'Times Square, NY', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '3', name: 'Marcus Johnson', specialty: 'Realism', rating: 4.7, reviewCount: 156, bio: 'Realism and portrait artist known for detailed work.', latitude: 40.7061, longitude: -74.0113, location: 'Financial District, NY', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '4', name: 'Elena Rodriguez', specialty: 'Japanese Traditional', rating: 4.6, reviewCount: 94, bio: 'Japanese traditional and geometric tattoo artist.', latitude: 40.7831, longitude: -73.9712, location: 'Upper West Side, NY', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '5', name: 'David Kim', specialty: 'Neo-Traditional', rating: 4.8, reviewCount: 112, bio: 'Neo-traditional and new school artist.', latitude: 40.7291, longitude: -73.9965, location: 'East Village, NY', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'New York' },
  
  // NYC Metro Area - Additional 30 Artists
  { id: '901', name: 'Brooklyn Carter', specialty: 'Blackwork', rating: 4.7, reviewCount: 98, bio: 'Bold blackwork and dotwork designs.', latitude: 40.6782, longitude: -73.9442, location: 'Brooklyn, NY', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '902', name: 'Queens Rivera', specialty: 'Geometric', rating: 4.5, reviewCount: 76, bio: 'Sacred geometry specialist.', latitude: 40.7282, longitude: -73.7949, location: 'Queens, NY', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '903', name: 'Bronx Martinez', specialty: 'Traditional American', rating: 4.8, reviewCount: 145, bio: 'Classic American traditional with bold colors.', latitude: 40.8448, longitude: -73.8648, location: 'Bronx, NY', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '904', name: 'Staten Thompson', specialty: 'Realism', rating: 4.6, reviewCount: 82, bio: 'Photorealistic portraits and wildlife.', latitude: 40.5795, longitude: -74.1502, location: 'Staten Island, NY', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '905', name: 'Harlem Williams', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 134, bio: 'Traditional Japanese irezumi artist.', latitude: 40.8116, longitude: -73.9465, location: 'Harlem, NY', age: 38, yearsExperience: 15, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '906', name: 'Chelsea Park', specialty: 'Watercolor', rating: 4.7, reviewCount: 91, bio: 'Vibrant watercolor tattoos.', latitude: 40.7465, longitude: -74.0014, location: 'Chelsea, NY', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '907', name: 'SoHo Lee', specialty: 'Minimalist', rating: 4.8, reviewCount: 107, bio: 'Clean minimalist designs.', latitude: 40.7233, longitude: -74.0030, location: 'SoHo, NY', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '908', name: 'TriBeCa Anderson', specialty: 'Neo-Traditional', rating: 4.6, reviewCount: 88, bio: 'Modern neo-traditional style.', latitude: 40.7163, longitude: -74.0086, location: 'TriBeCa, NY', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '909', name: 'Williamsburg Chen', specialty: 'Geometric', rating: 4.9, reviewCount: 156, bio: 'Intricate geometric patterns.', latitude: 40.7081, longitude: -73.9571, location: 'Williamsburg, Brooklyn', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '910', name: 'Astoria Davis', specialty: 'Blackwork', rating: 4.7, reviewCount: 119, bio: 'Bold blackwork tattoos.', latitude: 40.7644, longitude: -73.9235, location: 'Astoria, Queens', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '911', name: 'Flushing Wang', specialty: 'Traditional American', rating: 4.5, reviewCount: 73, bio: 'Classic American traditional.', latitude: 40.7673, longitude: -73.8330, location: 'Flushing, Queens', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '912', name: 'Park Slope Garcia', specialty: 'Realism', rating: 4.8, reviewCount: 142, bio: 'Hyper-realistic portrait work.', latitude: 40.6710, longitude: -73.9778, location: 'Park Slope, Brooklyn', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '913', name: 'Red Hook Miller', specialty: 'Watercolor', rating: 4.6, reviewCount: 85, bio: 'Watercolor and abstract designs.', latitude: 40.6753, longitude: -74.0121, location: 'Red Hook, Brooklyn', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '914', name: 'Bushwick Rodriguez', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 167, bio: 'Traditional Japanese art.', latitude: 40.6942, longitude: -73.9208, location: 'Bushwick, Brooklyn', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '915', name: 'Crown Heights Taylor', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 103, bio: 'Neo-traditional specialist.', latitude: 40.6682, longitude: -73.9442, location: 'Crown Heights, Brooklyn', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '916', name: 'LIC Johnson', specialty: 'Minimalist', rating: 4.8, reviewCount: 126, bio: 'Minimalist fine line work.', latitude: 40.7447, longitude: -73.9485, location: 'Long Island City, Queens', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '917', name: 'Battery Park White', specialty: 'Geometric', rating: 4.6, reviewCount: 94, bio: 'Geometric and sacred designs.', latitude: 40.7033, longitude: -74.0170, location: 'Battery Park, NY', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '918', name: 'Gramercy Brown', specialty: 'Blackwork', rating: 4.9, reviewCount: 138, bio: 'Bold and intricate blackwork.', latitude: 40.7374, longitude: -73.9851, location: 'Gramercy, NY', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '919', name: 'Murray Hill Kim', specialty: 'Traditional American', rating: 4.7, reviewCount: 111, bio: 'Classic traditional tattoos.', latitude: 40.7479, longitude: -73.9782, location: 'Murray Hill, NY', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '920', name: 'Kips Bay Lopez', specialty: 'Realism', rating: 4.8, reviewCount: 149, bio: 'Photorealistic tattoo art.', latitude: 40.7428, longitude: -73.9768, location: 'Kips Bay, NY', age: 37, yearsExperience: 14, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '921', name: 'Midtown Martinez', specialty: 'Watercolor', rating: 4.6, reviewCount: 87, bio: 'Vibrant watercolor specialist.', latitude: 40.7549, longitude: -73.9840, location: 'Midtown, NY', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '922', name: 'UWS Anderson', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 176, bio: 'Japanese traditional master.', latitude: 40.7870, longitude: -73.9754, location: 'Upper West Side, NY', age: 40, yearsExperience: 17, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '923', name: 'UES Thompson', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 105, bio: 'Modern neo-traditional work.', latitude: 40.7736, longitude: -73.9566, location: 'Upper East Side, NY', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '924', name: 'Hell\'s Kitchen Davis', specialty: 'Minimalist', rating: 4.8, reviewCount: 122, bio: 'Clean minimalist tattoos.', latitude: 40.7638, longitude: -73.9918, location: 'Hell\'s Kitchen, NY', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '925', name: 'Morningside Wilson', specialty: 'Geometric', rating: 4.6, reviewCount: 91, bio: 'Sacred geometry designs.', latitude: 40.8089, longitude: -73.9615, location: 'Morningside Heights, NY', age: 28, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '926', name: 'Washington Heights Cruz', specialty: 'Blackwork', rating: 4.9, reviewCount: 158, bio: 'Bold blackwork and tribal.', latitude: 40.8501, longitude: -73.9357, location: 'Washington Heights, NY', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '927', name: 'Inwood Ramirez', specialty: 'Traditional American', rating: 4.7, reviewCount: 96, bio: 'Classic American style.', latitude: 40.8677, longitude: -73.9212, location: 'Inwood, NY', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '928', name: 'Fort Greene Harris', specialty: 'Realism', rating: 4.8, reviewCount: 133, bio: 'Realistic portrait artist.', latitude: 40.6891, longitude: -73.9742, location: 'Fort Greene, Brooklyn', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '929', name: 'Sunset Park Chen', specialty: 'Watercolor', rating: 4.6, reviewCount: 78, bio: 'Watercolor and color realism.', latitude: 40.6463, longitude: -74.0109, location: 'Sunset Park, Brooklyn', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'New York' },
  { id: '930', name: 'Bay Ridge O\'Brien', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 164, bio: 'Japanese traditional expert.', latitude: 40.6259, longitude: -74.0304, location: 'Bay Ridge, Brooklyn', age: 38, yearsExperience: 15, avatar: '/api/placeholder/80/80', city: 'New York' },
  
  // Jersey City & Newark Area - 30 Artists
  { id: '931', name: 'Jersey City Jackson', specialty: 'Traditional American', rating: 4.8, reviewCount: 118, bio: 'Classic American traditional tattoos.', latitude: 40.7178, longitude: -74.0431, location: 'Downtown Jersey City, NJ', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '932', name: 'Grove Street Adams', specialty: 'Realism', rating: 4.7, reviewCount: 95, bio: 'Photorealistic portrait work.', latitude: 40.7195, longitude: -74.0387, location: 'Grove Street, Jersey City, NJ', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '933', name: 'Newport Miller', specialty: 'Watercolor', rating: 4.9, reviewCount: 142, bio: 'Vibrant watercolor specialist.', latitude: 40.7270, longitude: -74.0338, location: 'Newport, Jersey City, NJ', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '934', name: 'Paulus Hook Davis', specialty: 'Geometric', rating: 4.6, reviewCount: 87, bio: 'Sacred geometry and mandalas.', latitude: 40.7143, longitude: -74.0338, location: 'Paulus Hook, Jersey City, NJ', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '935', name: 'Journal Square Rodriguez', specialty: 'Blackwork', rating: 4.8, reviewCount: 131, bio: 'Bold blackwork designs.', latitude: 40.7334, longitude: -74.0631, location: 'Journal Square, Jersey City, NJ', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '936', name: 'Heights Martinez', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 159, bio: 'Traditional Japanese irezumi.', latitude: 40.7473, longitude: -74.0563, location: 'The Heights, Jersey City, NJ', age: 37, yearsExperience: 14, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '937', name: 'Bergen Lafayette Wilson', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 103, bio: 'Modern neo-traditional style.', latitude: 40.7000, longitude: -74.0690, location: 'Bergen-Lafayette, Jersey City, NJ', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '938', name: 'Hamilton Park Chen', specialty: 'Minimalist', rating: 4.8, reviewCount: 114, bio: 'Clean minimalist line work.', latitude: 40.7246, longitude: -74.0450, location: 'Hamilton Park, Jersey City, NJ', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '939', name: 'Newark Downtown Thomas', specialty: 'Traditional American', rating: 4.6, reviewCount: 92, bio: 'Classic American traditional.', latitude: 40.7357, longitude: -74.1724, location: 'Downtown Newark, NJ', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '940', name: 'Ironbound Silva', specialty: 'Realism', rating: 4.9, reviewCount: 167, bio: 'Hyper-realistic portraits.', latitude: 40.7428, longitude: -74.1568, location: 'Ironbound, Newark, NJ', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '941', name: 'Branch Brook Garcia', specialty: 'Watercolor', rating: 4.7, reviewCount: 98, bio: 'Watercolor and abstract art.', latitude: 40.7649, longitude: -74.1850, location: 'Branch Brook Park, Newark, NJ', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '942', name: 'University Heights Kim', specialty: 'Geometric', rating: 4.8, reviewCount: 125, bio: 'Geometric pattern specialist.', latitude: 40.7420, longitude: -74.1805, location: 'University Heights, Newark, NJ', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '943', name: 'Clinton Hill Anderson', specialty: 'Blackwork', rating: 4.6, reviewCount: 84, bio: 'Bold blackwork tattoos.', latitude: 40.7220, longitude: -74.1900, location: 'Clinton Hill, Newark, NJ', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '944', name: 'Weequahic Brown', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 148, bio: 'Japanese traditional master.', latitude: 40.7047, longitude: -74.2090, location: 'Weequahic, Newark, NJ', age: 39, yearsExperience: 16, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '945', name: 'Vailsburg Lopez', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 106, bio: 'Neo-traditional artwork.', latitude: 40.7330, longitude: -74.2230, location: 'Vailsburg, Newark, NJ', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '946', name: 'Forest Hill White', specialty: 'Minimalist', rating: 4.8, reviewCount: 119, bio: 'Minimalist fine line tattoos.', latitude: 40.7720, longitude: -74.2010, location: 'Forest Hill, Newark, NJ', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '947', name: 'McGinley Square Taylor', specialty: 'Traditional American', rating: 4.7, reviewCount: 101, bio: 'American traditional style.', latitude: 40.7250, longitude: -74.0800, location: 'McGinley Square, Jersey City, NJ', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '948', name: 'Greenville Johnson', specialty: 'Realism', rating: 4.8, reviewCount: 136, bio: 'Realistic tattoo artist.', latitude: 40.7050, longitude: -74.0810, location: 'Greenville, Jersey City, NJ', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '949', name: 'West Side Harris', specialty: 'Watercolor', rating: 4.6, reviewCount: 89, bio: 'Colorful watercolor designs.', latitude: 40.7200, longitude: -74.0600, location: 'West Side, Jersey City, NJ', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '950', name: 'Liberty Harbor Lee', specialty: 'Geometric', rating: 4.9, reviewCount: 153, bio: 'Sacred geometry expert.', latitude: 40.7080, longitude: -74.0520, location: 'Liberty Harbor, Jersey City, NJ', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '951', name: 'Newark Penn Moore', specialty: 'Blackwork', rating: 4.7, reviewCount: 97, bio: 'Intricate blackwork art.', latitude: 40.7347, longitude: -74.1643, location: 'Penn Station Area, Newark, NJ', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '952', name: 'Prudential Center Martin', specialty: 'Japanese Traditional', rating: 4.8, reviewCount: 128, bio: 'Japanese traditional tattoos.', latitude: 40.7335, longitude: -74.1710, location: 'Near Prudential Center, Newark, NJ', age: 38, yearsExperience: 15, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '953', name: 'Military Park Robinson', specialty: 'Neo-Traditional', rating: 4.6, reviewCount: 82, bio: 'Neo-traditional specialist.', latitude: 40.7380, longitude: -74.1720, location: 'Military Park, Newark, NJ', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '954', name: 'Lincoln Park Cruz', specialty: 'Minimalist', rating: 4.9, reviewCount: 144, bio: 'Clean minimalist tattoos.', latitude: 40.7550, longitude: -74.1980, location: 'Lincoln Park, Newark, NJ', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Newark' },
  { id: '955', name: 'Exchange Place Rivera', specialty: 'Traditional American', rating: 4.8, reviewCount: 122, bio: 'Bold American traditional.', latitude: 40.7165, longitude: -74.0330, location: 'Exchange Place, Jersey City, NJ', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '956', name: 'Hoboken Turner', specialty: 'Realism', rating: 4.7, reviewCount: 108, bio: 'Photo-realistic work.', latitude: 40.7439, longitude: -74.0324, location: 'Hoboken, NJ', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '957', name: 'North Bergen Sanchez', specialty: 'Watercolor', rating: 4.6, reviewCount: 76, bio: 'Watercolor tattoo artist.', latitude: 40.8042, longitude: -74.0121, location: 'North Bergen, NJ', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '958', name: 'Union City Ramirez', specialty: 'Geometric', rating: 4.9, reviewCount: 161, bio: 'Geometric design master.', latitude: 40.7662, longitude: -74.0260, location: 'Union City, NJ', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '959', name: 'West New York Patel', specialty: 'Blackwork', rating: 4.7, reviewCount: 93, bio: 'Bold blackwork specialist.', latitude: 40.7879, longitude: -74.0143, location: 'West New York, NJ', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Jersey City' },
  { id: '960', name: 'Kearny Murphy', specialty: 'Japanese Traditional', rating: 4.8, reviewCount: 135, bio: 'Japanese irezumi expert.', latitude: 40.7684, longitude: -74.1454, location: 'Kearny, NJ', age: 37, yearsExperience: 14, avatar: '/api/placeholder/80/80', city: 'Newark' },
  
  // Los Angeles
  { id: '6', name: 'Maria Garcia', specialty: 'Blackwork', rating: 4.7, reviewCount: 134, bio: 'Traditional American and neo-traditional styles.', latitude: 34.0522, longitude: -118.2437, location: 'Downtown LA, CA', age: 30, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Los Angeles' },
  { id: '7', name: 'James Wilson', specialty: 'Geometric', rating: 4.9, reviewCount: 67, bio: 'Fine line and minimalist specialist.', latitude: 34.0736, longitude: -118.4004, location: 'Hollywood, CA', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Los Angeles' },
  { id: '8', name: 'Lisa Thompson', specialty: 'Minimalist', rating: 4.6, reviewCount: 89, bio: 'Geometric designs and minimalist blackwork.', latitude: 34.0195, longitude: -118.4912, location: 'Santa Monica, CA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Los Angeles' },
  { id: '9', name: 'Michael Brown', specialty: 'Realism', rating: 4.8, reviewCount: 145, bio: 'Photorealistic portraits and nature scenes.', latitude: 34.0928, longitude: -118.3287, location: 'West Hollywood, CA', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Los Angeles' },
  { id: '10', name: 'Jessica Lee', specialty: 'Watercolor', rating: 4.9, reviewCount: 78, bio: 'Vibrant watercolor and abstract designs.', latitude: 34.0522, longitude: -118.2437, location: 'Venice, CA', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Los Angeles' },
  
  // Chicago
  { id: '11', name: 'Robert Davis', specialty: 'Traditional American', rating: 4.7, reviewCount: 98, bio: 'Classic American traditional tattoos.', latitude: 41.8781, longitude: -87.6298, location: 'Loop, IL', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'Chicago' },
  { id: '12', name: 'Amanda White', specialty: 'Japanese Traditional', rating: 4.8, reviewCount: 112, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 41.8998, longitude: -87.6244, location: 'River North, IL', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Chicago' },
  { id: '13', name: 'Carlos Martinez', specialty: 'Blackwork', rating: 4.6, reviewCount: 76, bio: 'Bold blackwork and dotwork designs.', latitude: 41.8500, longitude: -87.6500, location: 'Pilsen, IL', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Chicago' },
  { id: '14', name: 'Rachel Green', specialty: 'Neo-Traditional', rating: 4.9, reviewCount: 89, bio: 'Modern twist on traditional tattooing.', latitude: 41.8781, longitude: -87.6298, location: 'Wicker Park, IL', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Chicago' },
  { id: '15', name: 'Kevin Taylor', specialty: 'Geometric', rating: 4.7, reviewCount: 103, bio: 'Precision geometric patterns and sacred geometry.', latitude: 41.8781, longitude: -87.6298, location: 'Lincoln Park, IL', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Chicago' },
  
  // Houston
  { id: '16', name: 'Jennifer Lopez', specialty: 'Realism', rating: 4.8, reviewCount: 125, bio: 'Photorealistic portraits and wildlife.', latitude: 29.7604, longitude: -95.3698, location: 'Downtown Houston, TX', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Houston' },
  { id: '17', name: 'Daniel Rodriguez', specialty: 'Traditional American', rating: 4.6, reviewCount: 87, bio: 'Classic American traditional with bold lines.', latitude: 29.7604, longitude: -95.3698, location: 'Montrose, TX', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Houston' },
  { id: '18', name: 'Stephanie Kim', specialty: 'Watercolor', rating: 4.9, reviewCount: 94, bio: 'Vibrant watercolor and abstract art.', latitude: 29.7604, longitude: -95.3698, location: 'Heights, TX', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Houston' },
  { id: '19', name: 'Anthony Garcia', specialty: 'Blackwork', rating: 4.7, reviewCount: 78, bio: 'Bold blackwork and geometric patterns.', latitude: 29.7604, longitude: -95.3698, location: 'Midtown, TX', age: 30, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Houston' },
  { id: '20', name: 'Nicole Anderson', specialty: 'Minimalist', rating: 4.8, reviewCount: 65, bio: 'Clean lines and subtle, elegant designs.', latitude: 29.7604, longitude: -95.3698, location: 'Rice Village, TX', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Houston' },
  
  // Phoenix
  { id: '21', name: 'Brandon Scott', specialty: 'Geometric', rating: 4.7, reviewCount: 92, bio: 'Sacred geometry and mandala designs.', latitude: 33.4484, longitude: -112.0740, location: 'Downtown Phoenix, AZ', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Phoenix' },
  { id: '22', name: 'Ashley Miller', specialty: 'Traditional American', rating: 4.6, reviewCount: 73, bio: 'Classic American traditional tattoos.', latitude: 33.4484, longitude: -112.0740, location: 'Scottsdale, AZ', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Phoenix' },
  { id: '23', name: 'Ryan Johnson', specialty: 'Realism', rating: 4.8, reviewCount: 108, bio: 'Photorealistic portraits and nature scenes.', latitude: 33.4484, longitude: -112.0740, location: 'Tempe, AZ', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Phoenix' },
  { id: '24', name: 'Megan Davis', specialty: 'Watercolor', rating: 4.9, reviewCount: 81, bio: 'Vibrant watercolor and abstract designs.', latitude: 33.4484, longitude: -112.0740, location: 'Mesa, AZ', age: 25, yearsExperience: 3, avatar: '/api/placeholder/80/80', city: 'Phoenix' },
  { id: '25', name: 'Tyler Wilson', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 96, bio: 'Modern twist on traditional tattooing.', latitude: 33.4484, longitude: -112.0740, location: 'Chandler, AZ', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Phoenix' },
  
  // Philadelphia
  { id: '26', name: 'Samantha Brown', specialty: 'Japanese Traditional', rating: 4.8, reviewCount: 115, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 39.9526, longitude: -75.1652, location: 'Center City, PA', age: 30, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Philadelphia' },
  { id: '27', name: 'Christopher Lee', specialty: 'Blackwork', rating: 4.6, reviewCount: 84, bio: 'Bold blackwork and dotwork designs.', latitude: 39.9526, longitude: -75.1652, location: 'Fishtown, PA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Philadelphia' },
  { id: '28', name: 'Victoria Taylor', specialty: 'Realism', rating: 4.9, reviewCount: 127, bio: 'Photorealistic portraits and wildlife.', latitude: 39.9526, longitude: -75.1652, location: 'Rittenhouse, PA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Philadelphia' },
  { id: '29', name: 'Jonathan Martinez', specialty: 'Traditional American', rating: 4.7, reviewCount: 98, bio: 'Classic American traditional with bold lines.', latitude: 39.9526, longitude: -75.1652, location: 'Northern Liberties, PA', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Philadelphia' },
  { id: '30', name: 'Amanda Garcia', specialty: 'Minimalist', rating: 4.8, reviewCount: 72, bio: 'Clean lines and subtle, elegant designs.', latitude: 39.9526, longitude: -75.1652, location: 'Queen Village, PA', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Philadelphia' },
  
  // San Antonio
  { id: '31', name: 'Matthew Rodriguez', specialty: 'Geometric', rating: 4.7, reviewCount: 89, bio: 'Sacred geometry and mandala designs.', latitude: 29.4241, longitude: -98.4936, location: 'Downtown San Antonio, TX', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'San Antonio' },
  { id: '32', name: 'Isabella White', specialty: 'Watercolor', rating: 4.9, reviewCount: 76, bio: 'Vibrant watercolor and abstract art.', latitude: 29.4241, longitude: -98.4936, location: 'Alamo Heights, TX', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'San Antonio' },
  { id: '33', name: 'Andrew Kim', specialty: 'Realism', rating: 4.6, reviewCount: 102, bio: 'Photorealistic portraits and nature scenes.', latitude: 29.4241, longitude: -98.4936, location: 'Stone Oak, TX', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'San Antonio' },
  { id: '34', name: 'Olivia Davis', specialty: 'Neo-Traditional', rating: 4.8, reviewCount: 94, bio: 'Modern twist on traditional tattooing.', latitude: 29.4241, longitude: -98.4936, location: 'Southtown, TX', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'San Antonio' },
  { id: '35', name: 'Nathan Wilson', specialty: 'Blackwork', rating: 4.7, reviewCount: 87, bio: 'Bold blackwork and geometric patterns.', latitude: 29.4241, longitude: -98.4936, location: 'Pearl District, TX', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'San Antonio' },
  
  // San Diego
  { id: '36', name: 'Sophia Anderson', specialty: 'Minimalist', rating: 4.9, reviewCount: 68, bio: 'Clean lines and subtle, elegant designs.', latitude: 32.7157, longitude: -117.1611, location: 'Downtown San Diego, CA', age: 25, yearsExperience: 3, avatar: '/api/placeholder/80/80', city: 'San Diego' },
  { id: '37', name: 'Ethan Thompson', specialty: 'Traditional American', rating: 4.6, reviewCount: 91, bio: 'Classic American traditional tattoos.', latitude: 32.7157, longitude: -117.1611, location: 'Pacific Beach, CA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'San Diego' },
  { id: '38', name: 'Emma Garcia', specialty: 'Japanese Traditional', rating: 4.8, reviewCount: 113, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 32.7157, longitude: -117.1611, location: 'North Park, CA', age: 30, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'San Diego' },
  { id: '39', name: 'Liam Johnson', specialty: 'Realism', rating: 4.7, reviewCount: 105, bio: 'Photorealistic portraits and wildlife.', latitude: 32.7157, longitude: -117.1611, location: 'La Jolla, CA', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'San Diego' },
  { id: '40', name: 'Ava Martinez', specialty: 'Watercolor', rating: 4.9, reviewCount: 79, bio: 'Vibrant watercolor and abstract designs.', latitude: 32.7157, longitude: -117.1611, location: 'Hillcrest, CA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'San Diego' },
  
  // Dallas
  { id: '41', name: 'Noah Brown', specialty: 'Geometric', rating: 4.7, reviewCount: 96, bio: 'Sacred geometry and mandala designs.', latitude: 32.7767, longitude: -96.7970, location: 'Downtown Dallas, TX', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Dallas' },
  { id: '42', name: 'Mia Davis', specialty: 'Blackwork', rating: 4.6, reviewCount: 82, bio: 'Bold blackwork and dotwork designs.', latitude: 32.7767, longitude: -96.7970, location: 'Deep Ellum, TX', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Dallas' },
  { id: '43', name: 'William Taylor', specialty: 'Realism', rating: 4.8, reviewCount: 118, bio: 'Photorealistic portraits and nature scenes.', latitude: 32.7767, longitude: -96.7970, location: 'Uptown, TX', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Dallas' },
  { id: '44', name: 'Charlotte Wilson', specialty: 'Neo-Traditional', rating: 4.9, reviewCount: 87, bio: 'Modern twist on traditional tattooing.', latitude: 32.7767, longitude: -96.7970, location: 'Bishop Arts, TX', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Dallas' },
  { id: '45', name: 'James Rodriguez', specialty: 'Traditional American', rating: 4.7, reviewCount: 101, bio: 'Classic American traditional with bold lines.', latitude: 32.7767, longitude: -96.7970, location: 'Oak Cliff, TX', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Dallas' },
  
  // San Jose
  { id: '46', name: 'Amelia Garcia', specialty: 'Minimalist', rating: 4.8, reviewCount: 74, bio: 'Clean lines and subtle, elegant designs.', latitude: 37.3382, longitude: -121.8863, location: 'Downtown San Jose, CA', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'San Jose' },
  { id: '47', name: 'Benjamin Lee', specialty: 'Japanese Traditional', rating: 4.7, reviewCount: 109, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 37.3382, longitude: -121.8863, location: 'Willow Glen, CA', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'San Jose' },
  { id: '48', name: 'Harper Kim', specialty: 'Watercolor', rating: 4.9, reviewCount: 85, bio: 'Vibrant watercolor and abstract art.', latitude: 37.3382, longitude: -121.8863, location: 'Santana Row, CA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'San Jose' },
  { id: '49', name: 'Lucas Anderson', specialty: 'Geometric', rating: 4.6, reviewCount: 93, bio: 'Sacred geometry and mandala designs.', latitude: 37.3382, longitude: -121.8863, location: 'Campbell, CA', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'San Jose' },
  { id: '50', name: 'Evelyn Thompson', specialty: 'Realism', rating: 4.8, reviewCount: 126, bio: 'Photorealistic portraits and wildlife.', latitude: 37.3382, longitude: -121.8863, location: 'Los Gatos, CA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'San Jose' },
  
  // Austin
  { id: '51', name: 'Alexander Martinez', specialty: 'Traditional American', rating: 4.7, reviewCount: 97, bio: 'Classic American traditional tattoos.', latitude: 30.2672, longitude: -97.7431, location: 'Downtown Austin, TX', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Austin' },
  { id: '52', name: 'Abigail Wilson', specialty: 'Blackwork', rating: 4.8, reviewCount: 88, bio: 'Bold blackwork and geometric patterns.', latitude: 30.2672, longitude: -97.7431, location: 'South Austin, TX', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Austin' },
  { id: '53', name: 'Henry Davis', specialty: 'Neo-Traditional', rating: 4.9, reviewCount: 95, bio: 'Modern twist on traditional tattooing.', latitude: 30.2672, longitude: -97.7431, location: 'East Austin, TX', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Austin' },
  { id: '54', name: 'Emily Rodriguez', specialty: 'Minimalist', rating: 4.6, reviewCount: 71, bio: 'Clean lines and subtle, elegant designs.', latitude: 30.2672, longitude: -97.7431, location: 'West Austin, TX', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Austin' },
  { id: '55', name: 'Sebastian Garcia', specialty: 'Realism', rating: 4.8, reviewCount: 112, bio: 'Photorealistic portraits and nature scenes.', latitude: 30.2672, longitude: -97.7431, location: 'North Austin, TX', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'Austin' },
  
  // Jacksonville
  { id: '56', name: 'Madison Brown', specialty: 'Watercolor', rating: 4.7, reviewCount: 83, bio: 'Vibrant watercolor and abstract designs.', latitude: 30.3322, longitude: -81.6557, location: 'Downtown Jacksonville, FL', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Jacksonville' },
  { id: '57', name: 'Jackson Taylor', specialty: 'Japanese Traditional', rating: 4.6, reviewCount: 106, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 30.3322, longitude: -81.6557, location: 'Riverside, FL', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Jacksonville' },
  { id: '58', name: 'Sofia Anderson', specialty: 'Geometric', rating: 4.8, reviewCount: 91, bio: 'Sacred geometry and mandala designs.', latitude: 30.3322, longitude: -81.6557, location: 'San Marco, FL', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Jacksonville' },
  { id: '59', name: 'Aiden Wilson', specialty: 'Traditional American', rating: 4.7, reviewCount: 99, bio: 'Classic American traditional with bold lines.', latitude: 30.3322, longitude: -81.6557, location: 'Avondale, FL', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Jacksonville' },
  { id: '60', name: 'Chloe Martinez', specialty: 'Realism', rating: 4.9, reviewCount: 117, bio: 'Photorealistic portraits and wildlife.', latitude: 30.3322, longitude: -81.6557, location: 'Beaches, FL', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Jacksonville' },
  
  // Fort Worth
  { id: '61', name: 'Carter Johnson', specialty: 'Blackwork', rating: 4.6, reviewCount: 86, bio: 'Bold blackwork and dotwork designs.', latitude: 32.7555, longitude: -97.3308, location: 'Downtown Fort Worth, TX', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Fort Worth' },
  { id: '62', name: 'Grace Davis', specialty: 'Minimalist', rating: 4.8, reviewCount: 73, bio: 'Clean lines and subtle, elegant designs.', latitude: 32.7555, longitude: -97.3308, location: 'Cultural District, TX', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Fort Worth' },
  { id: '63', name: 'Owen Rodriguez', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 94, bio: 'Modern twist on traditional tattooing.', latitude: 32.7555, longitude: -97.3308, location: 'Stockyards, TX', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Fort Worth' },
  { id: '64', name: 'Victoria Garcia', specialty: 'Realism', rating: 4.9, reviewCount: 124, bio: 'Photorealistic portraits and nature scenes.', latitude: 32.7555, longitude: -97.3308, location: 'West 7th, TX', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Fort Worth' },
  { id: '65', name: 'Wyatt Wilson', specialty: 'Traditional American', rating: 4.6, reviewCount: 88, bio: 'Classic American traditional tattoos.', latitude: 32.7555, longitude: -97.3308, location: 'Magnolia, TX', age: 37, yearsExperience: 14, avatar: '/api/placeholder/80/80', city: 'Fort Worth' },
  
  // Columbus
  { id: '66', name: 'Scarlett Anderson', specialty: 'Watercolor', rating: 4.8, reviewCount: 81, bio: 'Vibrant watercolor and abstract art.', latitude: 39.9612, longitude: -82.9988, location: 'Downtown Columbus, OH', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Columbus' },
  { id: '67', name: 'Luke Brown', specialty: 'Japanese Traditional', rating: 4.7, reviewCount: 103, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 39.9612, longitude: -82.9988, location: 'Short North, OH', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Columbus' },
  { id: '68', name: 'Zoey Taylor', specialty: 'Geometric', rating: 4.6, reviewCount: 89, bio: 'Sacred geometry and mandala designs.', latitude: 39.9612, longitude: -82.9988, location: 'German Village, OH', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Columbus' },
  { id: '69', name: 'Gabriel Martinez', specialty: 'Realism', rating: 4.9, reviewCount: 115, bio: 'Photorealistic portraits and wildlife.', latitude: 39.9612, longitude: -82.9988, location: 'Clintonville, OH', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Columbus' },
  { id: '70', name: 'Lily Wilson', specialty: 'Minimalist', rating: 4.7, reviewCount: 76, bio: 'Clean lines and subtle, elegant designs.', latitude: 39.9612, longitude: -82.9988, location: 'Brewery District, OH', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Columbus' },
  
  // Charlotte
  { id: '71', name: 'Jack Davis', specialty: 'Traditional American', rating: 4.6, reviewCount: 92, bio: 'Classic American traditional with bold lines.', latitude: 35.2271, longitude: -80.8431, location: 'Downtown Charlotte, NC', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Charlotte' },
  { id: '72', name: 'Nora Rodriguez', specialty: 'Blackwork', rating: 4.8, reviewCount: 97, bio: 'Bold blackwork and geometric patterns.', latitude: 35.2271, longitude: -80.8431, location: 'NoDa, NC', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Charlotte' },
  { id: '73', name: 'Eli Garcia', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 85, bio: 'Modern twist on traditional tattooing.', latitude: 35.2271, longitude: -80.8431, location: 'South End, NC', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Charlotte' },
  { id: '74', name: 'Hannah Anderson', specialty: 'Watercolor', rating: 4.9, reviewCount: 78, bio: 'Vibrant watercolor and abstract designs.', latitude: 35.2271, longitude: -80.8431, location: 'Plaza Midwood, NC', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Charlotte' },
  { id: '75', name: 'Mason Wilson', specialty: 'Realism', rating: 4.8, reviewCount: 109, bio: 'Photorealistic portraits and nature scenes.', latitude: 35.2271, longitude: -80.8431, location: 'Dilworth, NC', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Charlotte' },
  
  // San Francisco
  { id: '76', name: 'Aria Brown', specialty: 'Minimalist', rating: 4.9, reviewCount: 69, bio: 'Clean lines and subtle, elegant designs.', latitude: 37.7749, longitude: -122.4194, location: 'Downtown San Francisco, CA', age: 25, yearsExperience: 3, avatar: '/api/placeholder/80/80', city: 'San Francisco' },
  { id: '77', name: 'Logan Taylor', specialty: 'Japanese Traditional', rating: 4.7, reviewCount: 111, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 37.7749, longitude: -122.4194, location: 'Mission District, CA', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'San Francisco' },
  { id: '78', name: 'Layla Martinez', specialty: 'Geometric', rating: 4.8, reviewCount: 95, bio: 'Sacred geometry and mandala designs.', latitude: 37.7749, longitude: -122.4194, location: 'Castro, CA', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'San Francisco' },
  { id: '79', name: 'Caleb Wilson', specialty: 'Realism', rating: 4.6, reviewCount: 102, bio: 'Photorealistic portraits and wildlife.', latitude: 37.7749, longitude: -122.4194, location: 'Haight-Ashbury, CA', age: 36, yearsExperience: 13, avatar: '/api/placeholder/80/80', city: 'San Francisco' },
  { id: '80', name: 'Zoe Davis', specialty: 'Traditional American', rating: 4.7, reviewCount: 88, bio: 'Classic American traditional tattoos.', latitude: 37.7749, longitude: -122.4194, location: 'North Beach, CA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'San Francisco' },
  
  // Indianapolis
  { id: '81', name: 'Hunter Rodriguez', specialty: 'Blackwork', rating: 4.6, reviewCount: 84, bio: 'Bold blackwork and dotwork designs.', latitude: 39.7684, longitude: -86.1581, location: 'Downtown Indianapolis, IN', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Indianapolis' },
  { id: '82', name: 'Natalie Garcia', specialty: 'Watercolor', rating: 4.8, reviewCount: 82, bio: 'Vibrant watercolor and abstract art.', latitude: 39.7684, longitude: -86.1581, location: 'Broad Ripple, IN', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Indianapolis' },
  { id: '83', name: 'Connor Anderson', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 91, bio: 'Modern twist on traditional tattooing.', latitude: 39.7684, longitude: -86.1581, location: 'Fountain Square, IN', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Indianapolis' },
  { id: '84', name: 'Brooklyn Wilson', specialty: 'Minimalist', rating: 4.9, reviewCount: 67, bio: 'Clean lines and subtle, elegant designs.', latitude: 39.7684, longitude: -86.1581, location: 'Mass Ave, IN', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Indianapolis' },
  { id: '85', name: 'Jordan Brown', specialty: 'Realism', rating: 4.8, reviewCount: 113, bio: 'Photorealistic portraits and nature scenes.', latitude: 39.7684, longitude: -86.1581, location: 'Irvington, IN', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Indianapolis' },
  
  // Seattle
  { id: '86', name: 'Samantha Taylor', specialty: 'Japanese Traditional', rating: 4.7, reviewCount: 107, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 47.6062, longitude: -122.3321, location: 'Downtown Seattle, WA', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Seattle' },
  { id: '87', name: 'Tyler Martinez', specialty: 'Geometric', rating: 4.6, reviewCount: 93, bio: 'Sacred geometry and mandala designs.', latitude: 47.6062, longitude: -122.3321, location: 'Capitol Hill, WA', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Seattle' },
  { id: '88', name: 'Avery Wilson', specialty: 'Watercolor', rating: 4.9, reviewCount: 79, bio: 'Vibrant watercolor and abstract designs.', latitude: 47.6062, longitude: -122.3321, location: 'Fremont, WA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Seattle' },
  { id: '89', name: 'Blake Davis', specialty: 'Traditional American', rating: 4.8, reviewCount: 96, bio: 'Classic American traditional with bold lines.', latitude: 47.6062, longitude: -122.3321, location: 'Ballard, WA', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Seattle' },
  { id: '90', name: 'Riley Anderson', specialty: 'Realism', rating: 4.7, reviewCount: 104, bio: 'Photorealistic portraits and wildlife.', latitude: 47.6062, longitude: -122.3321, location: 'Queen Anne, WA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Seattle' },
  
  // Tacoma, WA - 15 Artists
  { id: '961', name: 'Tacoma Downtown Pierce', specialty: 'Traditional American', rating: 4.8, reviewCount: 115, bio: 'Classic American traditional tattoos.', latitude: 47.2529, longitude: -122.4443, location: 'Downtown Tacoma, WA', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '962', name: 'Stadium District Shaw', specialty: 'Realism', rating: 4.7, reviewCount: 98, bio: 'Photorealistic portrait artist.', latitude: 47.2632, longitude: -122.4472, location: 'Stadium District, Tacoma, WA', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '963', name: 'Proctor Nelson', specialty: 'Watercolor', rating: 4.9, reviewCount: 143, bio: 'Vibrant watercolor specialist.', latitude: 47.2658, longitude: -122.4785, location: 'Proctor District, Tacoma, WA', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '964', name: '6th Avenue Wright', specialty: 'Geometric', rating: 4.6, reviewCount: 86, bio: 'Sacred geometry designs.', latitude: 47.2598, longitude: -122.4615, location: '6th Avenue, Tacoma, WA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '965', name: 'Hilltop Rodriguez', specialty: 'Blackwork', rating: 4.8, reviewCount: 127, bio: 'Bold blackwork tattoos.', latitude: 47.2420, longitude: -122.4598, location: 'Hilltop, Tacoma, WA', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '966', name: 'Old Town Harper', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 156, bio: 'Traditional Japanese irezumi.', latitude: 47.2461, longitude: -122.4360, location: 'Old Town, Tacoma, WA', age: 37, yearsExperience: 14, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '967', name: 'Point Defiance Mitchell', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 102, bio: 'Neo-traditional artwork.', latitude: 47.3065, longitude: -122.5210, location: 'Near Point Defiance, Tacoma, WA', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '968', name: 'Ruston Way Carter', specialty: 'Minimalist', rating: 4.8, reviewCount: 118, bio: 'Clean minimalist designs.', latitude: 47.2890, longitude: -122.4915, location: 'Ruston Way, Tacoma, WA', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '969', name: 'Lincoln District Brooks', specialty: 'Traditional American', rating: 4.6, reviewCount: 91, bio: 'Classic American style.', latitude: 47.2358, longitude: -122.4215, location: 'Lincoln District, Tacoma, WA', age: 32, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '970', name: 'South Tacoma Foster', specialty: 'Realism', rating: 4.9, reviewCount: 149, bio: 'Hyper-realistic tattoo art.', latitude: 47.1895, longitude: -122.4443, location: 'South Tacoma, WA', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '971', name: 'Fern Hill Powell', specialty: 'Watercolor', rating: 4.7, reviewCount: 97, bio: 'Watercolor and abstract designs.', latitude: 47.2142, longitude: -122.4015, location: 'Fern Hill, Tacoma, WA', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '972', name: 'North End Bailey', specialty: 'Geometric', rating: 4.8, reviewCount: 124, bio: 'Geometric pattern specialist.', latitude: 47.2838, longitude: -122.4632, location: 'North End, Tacoma, WA', age: 31, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '973', name: 'Salishan Reed', specialty: 'Blackwork', rating: 4.6, reviewCount: 83, bio: 'Bold blackwork specialist.', latitude: 47.1642, longitude: -122.4598, location: 'Salishan, Tacoma, WA', age: 29, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '974', name: 'McKinley Myers', specialty: 'Japanese Traditional', rating: 4.9, reviewCount: 161, bio: 'Japanese traditional master.', latitude: 47.2285, longitude: -122.4398, location: 'McKinley, Tacoma, WA', age: 38, yearsExperience: 15, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  { id: '975', name: 'Lakewood Collins', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 106, bio: 'Modern neo-traditional work.', latitude: 47.1717, longitude: -122.5185, location: 'Lakewood, WA', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Tacoma' },
  
  // Denver
  { id: '91', name: 'Parker Rodriguez', specialty: 'Minimalist', rating: 4.8, reviewCount: 75, bio: 'Clean lines and subtle, elegant designs.', latitude: 39.7392, longitude: -104.9903, location: 'Downtown Denver, CO', age: 27, yearsExperience: 5, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '92', name: 'Quinn Garcia', specialty: 'Blackwork', rating: 4.6, reviewCount: 87, bio: 'Bold blackwork and geometric patterns.', latitude: 39.7420, longitude: -104.9850, location: 'RiNo, CO', age: 29, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '93', name: 'Sage Wilson', specialty: 'Neo-Traditional', rating: 4.7, reviewCount: 89, bio: 'Modern twist on traditional tattooing.', latitude: 39.7500, longitude: -104.9975, location: 'LoDo, CO', age: 31, yearsExperience: 9, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '94', name: 'River Brown', specialty: 'Realism', rating: 4.9, reviewCount: 121, bio: 'Photorealistic portraits and nature scenes.', latitude: 39.7650, longitude: -105.0100, location: 'Highlands, CO', age: 34, yearsExperience: 11, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '95', name: 'Skyler Taylor', specialty: 'Watercolor', rating: 4.8, reviewCount: 83, bio: 'Vibrant watercolor and abstract art.', latitude: 39.7300, longitude: -104.9800, location: 'Capitol Hill, CO', age: 26, yearsExperience: 4, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '96', name: 'Dakota Martinez', specialty: 'Japanese Traditional', rating: 4.7, reviewCount: 94, bio: 'Traditional Japanese irezumi and Oni masks.', latitude: 39.7200, longitude: -105.0050, location: 'Baker, CO', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '97', name: 'Morgan Lee', specialty: 'Geometric', rating: 4.9, reviewCount: 102, bio: 'Sacred geometry and mandala designs.', latitude: 39.7580, longitude: -104.9680, location: 'City Park, CO', age: 30, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Denver' },
  { id: '98', name: 'Casey Thompson', specialty: 'Traditional American', rating: 4.6, reviewCount: 77, bio: 'Classic American traditional with bold colors.', latitude: 39.7100, longitude: -104.9950, location: 'Washington Park, CO', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Denver' },
  
  // Memphis
  { id: '96', name: 'Dakota Martinez', specialty: 'Traditional American', rating: 4.7, reviewCount: 98, bio: 'Classic American traditional tattoos.', latitude: 35.1495, longitude: -90.0490, location: 'Downtown Memphis, TN', age: 35, yearsExperience: 12, avatar: '/api/placeholder/80/80', city: 'Memphis' },
  { id: '97', name: 'Phoenix Anderson', specialty: 'Japanese Traditional', rating: 4.6, reviewCount: 105, bio: 'Authentic Japanese Irezumi and traditional designs.', latitude: 35.1495, longitude: -90.0490, location: 'Midtown, TN', age: 32, yearsExperience: 8, avatar: '/api/placeholder/80/80', city: 'Memphis' },
  { id: '98', name: 'Rowan Wilson', specialty: 'Geometric', rating: 4.8, reviewCount: 92, bio: 'Sacred geometry and mandala designs.', latitude: 35.1495, longitude: -90.0490, location: 'Cooper-Young, TN', age: 30, yearsExperience: 7, avatar: '/api/placeholder/80/80', city: 'Memphis' },
  { id: '99', name: 'Indigo Davis', specialty: 'Realism', rating: 4.9, reviewCount: 116, bio: 'Photorealistic portraits and wildlife.', latitude: 35.1495, longitude: -90.0490, location: 'East Memphis, TN', age: 33, yearsExperience: 10, avatar: '/api/placeholder/80/80', city: 'Memphis' },
  { id: '100', name: 'Ocean Garcia', specialty: 'Minimalist', rating: 4.7, reviewCount: 74, bio: 'Clean lines and subtle, elegant designs.', latitude: 35.1495, longitude: -90.0490, location: 'Germantown, TN', age: 28, yearsExperience: 6, avatar: '/api/placeholder/80/80', city: 'Memphis' }
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
      return
    }
    
    setIsTransitioning(true)
    const isInitialLoad = !initialLocationSet
    if (!initialLocationSet) setInitialLocationSet(true)
    
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
            'albuquerque': { lat: 35.0844, lng: -106.6504 },
            'tucson': { lat: 32.2226, lng: -110.9747 }
          }
          
          const normalizedLocation = location.toLowerCase().trim()
          return fallbackCities[normalizedLocation] || null
        }

        geocodeLocation()
      }
      
      // Start the panning process
      panToLocation()
    }, debounceDelay) // No delay on initial load, 200ms for subsequent searches (reduced from 800ms)
    
    // Cleanup function to cancel pending geocode requests
    return () => clearTimeout(debounceTimer)
  }, [searchLocation])

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

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // Empty deps - only run once on mount

  // Memoize filtered artists to avoid recalculating on every render
  const filteredArtists = useMemo(() => {
    return mockArtists.filter(artist => {
      // Check if artist matches the style filter
      const matchesStyle = !styleFilter || (artist.specialty && (
        artist.specialty.toLowerCase().includes(styleFilter.toLowerCase()) ||
        artist.specialty.toLowerCase().replace(/\s+/g, '').includes(styleFilter.toLowerCase().replace(/\s+/g, ''))
      ))
      
      // Check if artist meets minimum review count
      const meetsMinReviews = artist.reviewCount >= minReviews
      
      return matchesStyle && meetsMinReviews
    })
  }, [styleFilter, minReviews])

  // Separate effect to manage markers based on styleFilter and minReviews
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Remove all existing markers
    markersRef.current.forEach(marker => {
      marker.remove()
    })
    markersRef.current = []

    // Create custom markers for each artist (only filtered ones)
    filteredArtists.forEach(artist => {
      let color = specialtyColors[artist.specialty] || specialtyColors['Other']
      
      // Get artist initials (first letter of first and last name)
      const nameParts = artist.name.trim().split(' ')
      const initials = nameParts.length >= 2 
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase()
      
      const iconSize = 24
      const fontSize = 10
      const opacity = 1.0 // All filtered artists are visible
      
      // Create custom icon (grayed out for non-matching artists)
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            opacity: ${opacity};
          ">
            <div style="
              background-color: ${color};
              width: ${iconSize}px;
              height: ${iconSize}px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              box-shadow: 0 3px 6px rgba(0,0,0,0.4);
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: ${fontSize}px;
                line-height: 1;
              ">${initials}</div>
            </div>
          </div>
        `,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize]
      })

      // Create popup content with preview information
      const popupContent = `
        <div style="
          min-width: 300px; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          background: #000000; 
          color: white; 
          border-radius: 12px; 
          padding: 20px;
          border: 1px solid #374151;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        ">
          <div style="display: flex; align-items: center; margin-bottom: 16px;">
            <img src="${artist.avatar}" alt="${artist.name}" style="
              width: 60px; 
              height: 60px; 
              border-radius: 50%; 
              margin-right: 16px; 
              object-fit: cover;
              border: 2px solid #374151;
            " />
            <div>
              <h3 style="
                margin: 0 0 6px 0; 
                color: white; 
                font-size: 20px; 
                font-weight: 700;
                letter-spacing: -0.02em;
              ">
                ${artist.name}
              </h3>
              <p style="margin: 0; color: #9ca3af; font-size: 14px; font-weight: 500;">
                Age ${artist.age} • ${artist.yearsExperience} years experience
              </p>
            </div>
          </div>
          
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <svg width="18" height="18" fill="#fbbf24" style="margin-right: 8px;">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span style="color: white; font-weight: 700; font-size: 16px;">${artist.rating}/5</span>
              <span style="color: #9ca3af; font-size: 13px; margin-left: 8px;">(${artist.reviewCount} reviews)</span>
            </div>
            <div style="
              display: inline-block;
              padding: 4px 12px; 
              background-color: #1f2937; 
              color: #60a5fa; 
              border-radius: 20px; 
              font-size: 13px; 
              font-weight: 600;
              margin-bottom: 8px;
            ">
              ${artist.specialty}
            </div>
            <p style="margin: 0; color: #9ca3af; font-size: 13px; display: flex; align-items: center;">
              <svg width="14" height="14" fill="currentColor" style="margin-right: 6px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              ${artist.location}
            </p>
          </div>
          
          <div style="border-top: 1px solid #374151; padding-top: 16px;">
            <a href="/artist/${artist.id}" 
               style="
                 display: block;
                 width: 100%;
                 padding: 12px 20px; 
                 background-color: #ffffff; 
                 color: #000000; 
                 text-decoration: none; 
                 border-radius: 8px; 
                 font-size: 14px;
                 font-weight: 600;
                 text-align: center;
                 transition: all 0.2s;
                 border: 2px solid transparent;
               "
               onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.borderColor='#d1d5db'"
               onmouseout="this.style.backgroundColor='#ffffff'; this.style.borderColor='transparent'">
              View Full Profile
            </a>
          </div>
        </div>
      `

      // Add marker to map and store reference
      const marker = L.marker([artist.latitude, artist.longitude], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(popupContent)
      
      markersRef.current.push(marker)
    })
  }, [filteredArtists]) // Re-run when filtered artists change


  return (
    <div className="w-full h-[calc(100vh-420px)] min-h-[400px] bg-black relative overflow-hidden">
      {/* Loading overlay - covers map until ready */}
      {!mapReady && (
        <div className="absolute inset-0 bg-black z-50" />
      )}
      
      {/* Map Container - Hidden until location is loaded */}
      <div 
        ref={mapRef} 
        className="w-full h-full relative z-0 transition-opacity duration-500" 
        style={{ 
          opacity: mapReady ? 1 : 0
        }}
      />
      
      {/* Top Fade Overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #000000, transparent)',
          zIndex: 40
        }}
      ></div>
      
      {/* Bottom Fade Overlay */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #000000 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.7) 60%, transparent 100%)',
          zIndex: 40
        }}
      ></div>
    </div>
  )
}
