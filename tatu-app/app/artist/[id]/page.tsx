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
  CameraIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon
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
  likes?: number
  views?: number
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
  yearsExperience?: number
  totalTattoos?: number
  responseTime?: string
  availability?: string
}

interface Review {
  id: string
  rating: number
  content: string
  createdAt: string
  user: {
    name: string
    avatar?: string
  }
  verified?: boolean
  helpful?: number
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
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null)

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

  const openLightbox = (item: PortfolioItem, index: number) => {
    setSelectedPortfolioItem(item)
    setSelectedImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedPortfolioItem(null)
  }

  const nextImage = () => {
    if (filteredPortfolio.length > 1) {
      const nextIndex = (selectedImageIndex + 1) % filteredPortfolio.length
      setSelectedImageIndex(nextIndex)
      setSelectedPortfolioItem(filteredPortfolio[nextIndex])
    }
  }

  const prevImage = () => {
    if (filteredPortfolio.length > 1) {
      const prevIndex = selectedImageIndex === 0 ? filteredPortfolio.length - 1 : selectedImageIndex - 1
      setSelectedImageIndex(prevIndex)
      setSelectedPortfolioItem(filteredPortfolio[prevIndex])
    }
  }

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
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Artist Avatar */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-gray-300 ring-4 ring-white/20 shadow-2xl">
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
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    <SparklesIcon className="h-3 w-3 inline mr-1" />
                    FEATURED
                  </div>
                )}
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    {artist.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                      {renderStars(artist.rating)}
                      <span className="ml-2 text-sm font-medium">
                        {artist.rating.toFixed(1)} ({artist.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center text-sm bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {artist.location}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={toggleFavorite}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all hover:scale-110"
                >
                  {isFavorited ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartOutline className="h-6 w-6" />
                  )}
                </button>
              </div>

              <p className="text-lg mb-6 text-gray-200 leading-relaxed max-w-3xl">{artist.bio}</p>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {artist.yearsExperience && (
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{artist.yearsExperience}+</div>
                    <div className="text-xs text-gray-300">Years Experience</div>
                  </div>
                )}
                {artist.totalTattoos && (
                  <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{artist.totalTattoos}+</div>
                    <div className="text-xs text-gray-300">Tattoos Done</div>
                  </div>
                )}
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{artist.portfolioCount}</div>
                  <div className="text-xs text-gray-300">Portfolio Items</div>
                </div>
                <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{artist.responseTime || '24h'}</div>
                  <div className="text-xs text-gray-300">Response Time</div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30"
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
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <CalendarIcon className="h-5 w-5" />
                  Book Consultation
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                {artist.phone && (
                  <a
                    href={`tel:${artist.phone}`}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-4 rounded-lg font-medium transition-all hover:scale-105 border border-white/30 inline-flex items-center"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Call Now
                  </a>
                )}
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
                  >
                    @{artist.instagram}
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
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Gallery */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Portfolio Gallery
                  </h2>
                  <p className="text-gray-600 mt-1">{artist.portfolioCount} amazing pieces</p>
                </div>
                
                {/* Style Filter */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Filter by:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    <option value="all">All Styles</option>
                    {uniqueStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Portfolio Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPortfolio.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
                    onClick={() => openLightbox(item, index)}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white w-full">
                        <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-200 mb-2">{item.style}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="bg-white/20 px-2 py-1 rounded-full">
                            {item.tags[0]}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.views && (
                              <span className="flex items-center gap-1">
                                <EyeIcon className="h-3 w-3" />
                                {item.views}
                              </span>
                            )}
                            {item.likes && (
                              <span className="flex items-center gap-1">
                                <HeartOutline className="h-3 w-3" />
                                {item.likes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPortfolio.length === 0 && (
                <div className="text-center py-12">
                  <CameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No portfolio items found for this style.</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Client Reviews
                  </h2>
                  <p className="text-gray-600 mt-1">{artist.reviewCount} verified reviews</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(artist.rating)}
                  <span className="text-lg font-semibold text-gray-900">
                    {artist.rating.toFixed(1)}/5
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {(showAllReviews ? artist.reviews : artist.reviews.slice(0, 3)).map((review) => (
                  <div key={review.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{review.user.name}</span>
                            {review.verified && (
                              <CheckBadgeIcon className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.content}</p>
                    {review.helpful && (
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                          <span>👍</span>
                          <span>Helpful ({review.helpful})</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {artist.reviews.length > 3 && (
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="w-full mt-6 text-indigo-600 hover:text-indigo-500 text-sm font-medium py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showAllReviews ? 'Show Less' : `View All ${artist.reviews.length} Reviews`}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-indigo-600" />
                Artist Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Portfolio Items</span>
                  <span className="font-semibold text-gray-900">{artist.portfolioCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">{artist.reviewCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold text-gray-900">{artist.rating.toFixed(1)}/5</span>
                </div>
                {artist.yearsExperience && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold text-gray-900">{artist.yearsExperience}+ years</span>
                  </div>
                )}
                {artist.totalTattoos && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tattoos Done</span>
                    <span className="font-semibold text-gray-900">{artist.totalTattoos}+</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600" />
                Get In Touch
              </h3>
              <div className="space-y-4">
                <Link
                  href={`/artist/${artist.id}/book`}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all text-center flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  Book Consultation
                </Link>
                
                {artist.phone && (
                  <a
                    href={`tel:${artist.phone}`}
                    className="flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors py-3 px-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <PhoneIcon className="h-4 w-4 mr-3" />
                    Call {artist.phone}
                  </a>
                )}
                
                <a
                  href={`mailto:artist@example.com`}
                  className="flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors py-3 px-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-3" />
                  Send Message
                </a>
                
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-gray-700 hover:text-indigo-600 transition-colors py-3 px-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-3" />
                    Visit Website
                  </a>
                )}
              </div>
            </div>

            {/* Availability */}
            {artist.availability && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-green-600" />
                  Availability
                </h3>
                <div className="text-sm text-gray-600">
                  <p className="mb-2">{artist.availability}</p>
                  <p className="text-green-600 font-medium">✅ Currently accepting bookings</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedPortfolioItem && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {filteredPortfolio.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image */}
            <div className="relative">
              <Image
                src={selectedPortfolioItem.imageUrl}
                alt={selectedPortfolioItem.title}
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <h3 className="text-white text-xl font-semibold mb-2">{selectedPortfolioItem.title}</h3>
                <p className="text-gray-200 mb-2">{selectedPortfolioItem.description}</p>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm">
                    {selectedPortfolioItem.style}
                  </span>
                  {selectedPortfolioItem.tags.map((tag, index) => (
                    <span key={index} className="bg-white/10 px-2 py-1 rounded-full text-white text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Counter */}
            {filteredPortfolio.length > 1 && (
              <div className="text-center mt-4 text-white text-sm">
                {selectedImageIndex + 1} of {filteredPortfolio.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 