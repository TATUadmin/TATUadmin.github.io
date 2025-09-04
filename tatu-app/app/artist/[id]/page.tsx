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
      // Mock data for now - replace with actual API call
      const mockArtist: Artist = {
        id: artistId,
        name: "Alex Rivera",
        bio: "Professional tattoo artist with over 8 years of experience specializing in traditional American, neo-traditional, and blackwork styles. Passionate about creating unique, meaningful pieces that tell your story.",
        avatar: "/api/placeholder/150/150",
        location: "Los Angeles, CA",
        specialties: ["Traditional American", "Neo-Traditional", "Blackwork", "Portraits"],
        instagram: "@alexrivera_tattoo",
        portfolioCount: 24,
        rating: 4.8,
        reviewCount: 127,
        experience: "8+ years",
        studio: "Ink & Soul Tattoo",
        phone: "(555) 123-4567",
        website: "www.alexrivera.com"
      }
      setArtist(mockArtist)
    } catch (error) {
      console.error('Error fetching artist:', error)
    }
  }

  const fetchPortfolioItems = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPortfolio: PortfolioItem[] = [
        {
          id: "1",
          title: "Traditional Rose",
          description: "Classic American traditional rose with bold colors and clean lines",
          imageUrl: "/api/placeholder/400/400",
          style: "Traditional American",
          likes: 45,
          comments: 12,
          createdAt: "2024-01-15"
        },
        {
          id: "2",
          title: "Geometric Wolf",
          description: "Modern geometric wolf design with sharp angles and minimal shading",
          imageUrl: "/api/placeholder/400/400",
          style: "Geometric",
          likes: 38,
          comments: 8,
          createdAt: "2024-01-10"
        },
        {
          id: "3",
          title: "Portrait Tattoo",
          description: "Realistic portrait tattoo with detailed shading and depth",
          imageUrl: "/api/placeholder/400/400",
          style: "Portraits",
          likes: 52,
          comments: 15,
          createdAt: "2024-01-05"
        },
        {
          id: "4",
          title: "Neo-Traditional Eagle",
          description: "Contemporary take on traditional eagle with modern color palette",
          imageUrl: "/api/placeholder/400/400",
          style: "Neo-Traditional",
          likes: 41,
          comments: 11,
          createdAt: "2024-01-01"
        }
      ]
      setPortfolioItems(mockPortfolio)
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setIsLoading(false)
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
      {/* Hero Section */}
      <section className="bg-surface py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-white"
                />
                <div>
                  <h1 className="display text-3xl text-white mb-2">{artist.name}</h1>
                  <p className="body text-gray-400 flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-2" />
                    {artist.location}
                  </p>
                </div>
                <button
                  onClick={toggleFavorite}
                  className="ml-auto text-gray-400 hover:text-white transition-colors"
                >
                  {isFavorite ? (
                    <HeartSolid className="w-8 h-8 text-white" />
                  ) : (
                    <HeartOutline className="w-8 h-8" />
                  )}
                </button>
              </div>

              <p className="body text-gray-300 mb-6 leading-relaxed">
                {artist.bio}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                {artist.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-2 bg-surface-2 text-white rounded-lg text-sm border border-gray-600"
                  >
                    {specialty}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center text-gray-400">
                  <StarIcon className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-white font-semibold">{artist.rating}</span>
                  <span className="text-gray-500 ml-1">({artist.reviewCount} reviews)</span>
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-semibold">{artist.portfolioCount}</span> portfolio works
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-semibold">{artist.experience}</span> experience
                </div>
              </div>
            </div>

            {/* Contact & Booking */}
            <div className="w-full md:w-80">
              <div className="card p-6">
                <h3 className="headline text-xl text-white mb-4">Contact & Booking</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-300">
                    <GlobeAltIcon className="w-5 h-5 mr-3" />
                    <span>{artist.studio}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <PhoneIcon className="w-5 h-5 mr-3" />
                    <span>{artist.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <GlobeAltIcon className="w-5 h-5 mr-3" />
                    <span>{artist.instagram}</span>
                  </div>
                </div>

                <Link
                  href={`/artist/${artist.id}/book`}
                  className="btn btn-primary w-full mb-3"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Appointment
                </Link>
                
                <Link
                  href={`/artist/${artist.id}/contact`}
                  className="btn btn-secondary w-full"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Contact Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h2 className="display text-2xl text-white mb-4 md:mb-0">Portfolio</h2>
            
            {/* Style Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStyle('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedStyle === 'all'
                    ? 'bg-white text-black'
                    : 'bg-surface-2 text-gray-300 hover:text-white border border-gray-600'
                }`}
              >
                All Styles
              </button>
              {artist.specialties.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedStyle === style
                      ? 'bg-white text-black'
                      : 'bg-surface-2 text-gray-300 hover:text-white border border-gray-600'
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
                <div key={item.id} className="card p-4 card-hover group">
                  <div className="relative mb-4">
                    <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Portfolio Image</span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-black/80 text-white text-xs rounded">
                        {item.style}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="headline text-lg text-white mb-2 group-hover:text-gray-100 transition-colors">
                    {item.title}
                  </h3>
                  <p className="body text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span className="flex items-center">
                        <HeartOutline className="w-4 h-4 mr-1" />
                        {item.likes}
                      </span>
                      <span>{item.comments} comments</span>
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
      <section className="bg-surface py-12">
        <div className="container mx-auto px-4">
          <h2 className="display text-2xl text-white mb-8">Reviews</h2>
          
          <div className="space-y-6">
            {/* Mock Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div>
                    <h4 className="text-white font-medium">Sarah M.</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">2 weeks ago</span>
              </div>
              <p className="text-gray-300">
                "Amazing work! Alex really captured the vision I had for my traditional rose tattoo. 
                Clean lines, perfect shading, and the healing process was smooth. Highly recommend!"
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div>
                    <h4 className="text-white font-medium">Mike R.</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className="w-4 h-4 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">1 month ago</span>
              </div>
              <p className="text-gray-300">
                "Professional artist with incredible attention to detail. My geometric wolf tattoo 
                turned out exactly as I imagined. The studio is clean and the atmosphere is great."
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="btn btn-secondary">
              View All Reviews
            </button>
          </div>
        </div>
      </section>
    </div>
  )
} 