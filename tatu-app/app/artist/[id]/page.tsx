'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPinIcon, 
  StarIcon, 
  HeartIcon as HeartOutline,
  HeartIcon as HeartSolid,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CameraIcon
} from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'

interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  style: string
  tags: string[]
  createdAt: string
}

interface Artist {
  id: string
  name: string
  bio: string
  avatar: string
  location: string
  specialties: string[]
  instagram: string
  website: string
  phone: string
  portfolioCount: number
  rating: number
  reviewCount: number
  portfolioItems: PortfolioItem[]
  reviews: Review[]
  featured?: boolean
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: {
    name: string
  }
}

export default function ArtistProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    if (params.id) {
      fetchArtist(params.id as string)
    }
  }, [params.id])

  const fetchArtist = async (artistId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/artists/${artistId}`)
      if (!response.ok) throw new Error('Failed to fetch artist')
      
      const data = await response.json()
      setArtist(data)
      
      // Check if favorited
      if (session?.user) {
        const favResponse = await fetch('/api/favorites')
        if (favResponse.ok) {
          const favorites = await favResponse.json()
          setIsFavorited(favorites.includes(artistId))
        }
      }
    } catch (error) {
      console.error('Error fetching artist:', error)
      toast.error('Failed to load artist profile')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error('Please log in to save favorites')
      return
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId: params.id }),
      })

      if (response.ok) {
        setIsFavorited(!isFavorited)
        toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const filteredPortfolio = artist?.portfolioItems.filter(item => 
    selectedCategory === 'all' || item.style === selectedCategory
  ) || []

  const uniqueStyles = [...new Set(artist?.portfolioItems.map(item => item.style) || [])]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Artist Not Found</h2>
          <p className="text-gray-600 mb-4">The artist you're looking for doesn't exist.</p>
          <Link
            href="/explore"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Back to Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Artist Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-gray-300">
                  {artist.avatar ? (
                    <Image
                      src={artist.avatar}
                      alt={artist.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-600">
                      <CameraIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                {artist.featured && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    FEATURED
                  </div>
                )}
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2">{artist.name}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      {renderStars(artist.rating)}
                      <span className="ml-2 text-sm">
                        {artist.rating.toFixed(1)} ({artist.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {artist.location}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={toggleFavorite}
                  className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
                >
                  {isFavorited ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutline className="h-6 w-6" />
                  )}
                </button>
              </div>

              <p className="text-lg mb-6 text-gray-200 leading-relaxed">{artist.bio}</p>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">SPECIALTIES</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/artist/${artist.id}/book`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Book Consultation
                </Link>
                {artist.phone && (
                  <a
                    href={`tel:${artist.phone}`}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-3 rounded-md font-medium transition-colors inline-flex items-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call
                  </a>
                )}
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-3 rounded-md font-medium transition-colors"
                  >
                    @{artist.instagram}
                  </a>
                )}
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-3 rounded-md font-medium transition-colors inline-flex items-center"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Portfolio ({artist.portfolioCount})
                </h2>
                
                {/* Style Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Styles</option>
                  {uniqueStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPortfolio.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setSelectedImageIndex(index)
                      setLightboxOpen(true)
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                      <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-200">{item.style}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPortfolio.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No portfolio items found for this style.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Portfolio Items</span>
                  <span className="font-medium">{artist.portfolioCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium">{artist.reviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium">{artist.rating.toFixed(1)}/5</span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
              <div className="space-y-4">
                {artist.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{review.user.name}</span>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.content}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              {artist.reviews.length > 3 && (
                <button className="w-full mt-4 text-indigo-600 hover:text-indigo-500 text-sm font-medium">
                  View All Reviews
                </button>
              )}
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get In Touch</h3>
              <div className="space-y-3">
                {artist.phone && (
                  <a
                    href={`tel:${artist.phone}`}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <PhoneIcon className="h-4 w-4 mr-3" />
                    {artist.phone}
                  </a>
                )}
                <a
                  href={`mailto:artist@example.com`}
                  className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-3" />
                  Send Message
                </a>
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-3" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 