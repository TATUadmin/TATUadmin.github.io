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
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  style: string
  likes: number
  comments: number
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
  portfolioCount: number
  rating: number
  reviewCount: number
  experience: string
  studio: string
  phone: string
  website: string
  featured?: boolean
}

export default function ArtistPortfolioPage() {
  const params = useParams()
  const artistId = params.id as string
  
  const [artist, setArtist] = useState<Artist | null>(null)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStyle, setSelectedStyle] = useState<string>('all')
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    fetchArtistData()
    fetchPortfolioItems()
  }, [artistId])

  const fetchArtistData = async () => {
    try {
      // Fetch artist from API
      const response = await fetch(`/api/artists?id=${artistId}`)
      if (response.ok) {
        const data = await response.json()
        const artistData = data.artists?.[0] || data.artist
        
        if (artistData) {
          const fetchedArtist: Artist = {
            id: artistData.id,
            name: artistData.name || "Artist Profile",
            bio: artistData.bio || "Talented tattoo artist with a unique style and dedication to the craft.",
            avatar: artistData.avatar || "/api/placeholder/150/150",
            location: artistData.location || "United States",
            specialties: artistData.specialties || ["Custom", "Various Styles"],
            instagram: artistData.instagram || "@artist_tattoo",
            portfolioCount: artistData.portfolioCount || 0,
            rating: artistData.rating || 4.5,
            reviewCount: artistData.reviewCount || 0,
            experience: "5+ years", // Default value, could be enhanced later
            studio: "Local Tattoo Studio", // Default value
            phone: "+1 (555) 000-0000", // Default value
            website: artistData.instagram ? `https://${artistData.instagram.replace('@', '')}.com` : "https://artist.com",
            featured: artistData.featured || false
          }
          setArtist(fetchedArtist)
        } else {
          // Fallback if artist not found
          setArtist({
            id: artistId,
            name: "Artist Profile",
            bio: "Talented tattoo artist with a unique style and dedication to the craft.",
            avatar: "/api/placeholder/150/150",
            location: "United States",
            specialties: ["Custom", "Various Styles"],
            instagram: "@artist_tattoo",
            portfolioCount: 15,
            rating: 4.5,
            reviewCount: 50,
            experience: "5+ years",
            studio: "Local Tattoo Studio",
            phone: "+1 (555) 000-0000",
            website: "https://artist.com"
          })
        }
      } else {
        // Fallback if API fails
        setArtist({
          id: artistId,
          name: "Artist Profile",
          bio: "Talented tattoo artist with a unique style and dedication to the craft.",
          avatar: "/api/placeholder/150/150",
          location: "United States",
          specialties: ["Custom", "Various Styles"],
          instagram: "@artist_tattoo",
          portfolioCount: 15,
          rating: 4.5,
          reviewCount: 50,
          experience: "5+ years",
          studio: "Local Tattoo Studio",
          phone: "+1 (555) 000-0000",
          website: "https://artist.com"
        })
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching artist:', error)
      // Fallback on error
      setArtist({
        id: artistId,
        name: "Artist Profile",
        bio: "Talented tattoo artist with a unique style and dedication to the craft.",
        avatar: "/api/placeholder/150/150",
        location: "United States",
        specialties: ["Custom", "Various Styles"],
        instagram: "@artist_tattoo",
        portfolioCount: 15,
        rating: 4.5,
        reviewCount: 50,
        experience: "5+ years",
        studio: "Local Tattoo Studio",
        phone: "+1 (555) 000-0000",
        website: "https://artist.com"
      })
      setIsLoading(false)
    }
  }

  const fetchPortfolioItems = async () => {
    try {
      // Mock portfolio data - replace with actual API call
      const mockPortfolioItems: PortfolioItem[] = [
        {
          id: '1',
          title: 'Traditional Eagle',
          description: 'Classic American traditional eagle design with bold lines and vibrant colors.',
          imageUrl: '/api/placeholder/400/400',
          style: 'Traditional American',
          likes: 45,
          comments: 12,
          createdAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Neo-Traditional Rose',
          description: 'Modern twist on traditional rose with contemporary color palette.',
          imageUrl: '/api/placeholder/400/400',
          style: 'Neo-Traditional',
          likes: 38,
          comments: 8,
          createdAt: '2024-01-10'
        },
        {
          id: '3',
          title: 'Blackwork Mandala',
          description: 'Intricate blackwork mandala with geometric patterns.',
          imageUrl: '/api/placeholder/400/400',
          style: 'Blackwork',
          likes: 52,
          comments: 15,
          createdAt: '2024-01-05'
        }
      ]
      setPortfolioItems(mockPortfolioItems)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      // Fallback to empty array
      setPortfolioItems([])
    }
  }

  const filteredPortfolio = selectedStyle === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.style === selectedStyle)

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-800 rounded"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="display text-2xl mb-4">Artist Not Found</h1>
          <p className="body text-gray-400 mb-6">The artist you're looking for doesn't exist or has been removed.</p>
          <Link href="/explore" className="btn btn-primary">
            Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Cover */}
      <section className="relative">
        {/* Cover Image */}
        <div className="w-full h-64 bg-gradient-to-b from-gray-900 to-black"></div>
        
        {/* Profile Content */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-32 mb-12">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Artist Info */}
              <div className="flex-1">
                <div className="flex items-start gap-6 mb-6">
              <div className="relative">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-32 h-32 rounded-lg object-cover border-4 border-black shadow-xl"
                    />
                    {artist.featured && (
                      <div className="absolute -top-2 -right-2 bg-white text-black px-2 py-1 rounded text-xs font-bold">
                        VERIFIED
                    </div>
                  )}
                  </div>
                  <div className="flex-1 pt-16">
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-4xl font-bold text-white">{artist.name}</h1>
                      <button
                        onClick={toggleFavorite}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {isFavorite ? (
                          <HeartSolid className="w-8 h-8 text-white" />
                        ) : (
                          <HeartOutline className="w-8 h-8" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-400 flex items-center mb-4">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      {artist.location}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-6 text-sm mb-6">
                      <div className="flex items-center text-gray-400">
                        <StarIcon className="w-5 h-5 mr-2 text-white" />
                        <span className="text-white font-semibold">{artist.rating}</span>
                        <span className="text-gray-500 ml-1">({artist.reviewCount} reviews)</span>
                      </div>
                      <div className="text-gray-400">
                        <span className="text-white font-semibold">{artist.portfolioCount}</span> works
                      </div>
                      <div className="text-gray-400">
                        <span className="text-white font-semibold">{artist.experience}</span> experience
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {artist.bio}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm border border-gray-700"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact & Booking */}
              <div className="w-full md:w-96">
              <div className="bg-transparent border-2 border-gray-400 rounded-lg p-6 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-6">Contact & Booking</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                    <GlobeAltIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="text-sm">{artist.studio}</span>
                  </div>
                  <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                    <PhoneIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <a href={`tel:${artist.phone}`} className="text-sm hover:underline">{artist.phone}</a>
                  </div>
                  <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                    <GlobeAltIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <a href={`https://${artist.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      {artist.instagram}
                    </a>
                  </div>
                </div>

                <Link
                  href={`/artist/${artist.id}/availability`}
                  className="flex items-center justify-center w-full bg-white text-black px-6 py-3 rounded-lg font-semibold border-2 border-gray-400 hover:bg-gray-100 transition-colors mb-3"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Check Artist Availability
                </Link>
                
                <Link
                  href={`/artist/${artist.id}/contact`}
                  className="flex items-center justify-center w-full bg-transparent text-white px-6 py-3 rounded-lg font-semibold border-2 border-gray-400 hover:bg-gray-900 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Contact Artist
                </Link>
                
                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t-2 border-gray-400">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-400">Response Time</span>
                    <span className="text-white font-medium">~ 2 hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Booking Rate</span>
                    <span className="text-white font-medium">95%</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">Portfolio</h2>
                
                {/* Style Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStyle('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStyle === 'all'
                    ? 'bg-white text-black'
                    : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
                }`}
              >
                All Styles
              </button>
              {artist.specialties.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedStyle === style
                      ? 'bg-white text-black'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-800'
                  }`}
                >
                  {style}
                </button>
              ))}
                </div>
              </div>

          {filteredPortfolio.length === 0 ? (
                <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No portfolio items found for this style.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-900 border border-gray-800">
                    <div className="w-full h-80 bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">Portfolio Image</span>
                </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300"></div>
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-black/90 text-white text-xs font-medium rounded-full border border-gray-700">
                        {item.style}
                  </span>
                </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm line-clamp-2">{item.description}</p>
                </div>
              </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-300 transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span className="flex items-center hover:text-white transition-colors">
                        <HeartOutline className="w-4 h-4 mr-1" />
                        {item.likes}
                      </span>
                      <span className="hover:text-white transition-colors">{item.comments} comments</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                      </div>
                  </div>
                ))}
              </div>
              )}
            </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-950 py-16 border-t border-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Reviews ({artist.reviewCount})</h2>
            <Link 
              href={`/artist/${artist.id}/reviews`}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              View All →
            </Link>
          </div>

              <div className="space-y-4">
            {/* Mock Reviews */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SM</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Sarah M.</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-white fill-white" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-gray-500 text-sm">2 weeks ago</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "Amazing work! Alex really captured the vision I had for my traditional rose tattoo. 
                Clean lines, perfect shading, and the healing process was smooth. Highly recommend!"
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">MR</span>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Mike R.</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-white fill-white" />
                      ))}
              </div>
            </div>
                </div>
                <span className="text-gray-500 text-sm">1 month ago</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                "Professional artist with incredible attention to detail. My geometric wolf tattoo 
                turned out exactly as I imagined. The studio is clean and the atmosphere is great."
              </p>
        </div>
      </div>

          <div className="text-center mt-8">
            <Link
              href={`/artist/${artist.id}/reviews`}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold border border-gray-800 hover:bg-gray-800 hover:border-gray-700 transition-colors"
            >
              View All {artist.reviewCount} Reviews
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 