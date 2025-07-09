'use client';

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section - Minimal */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/95 to-gray-900/90"></div>
          <img 
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&crop=center" 
            alt="Tattoo Art Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <h1 className="tatu-minimal text-8xl md:text-9xl lg:text-[10rem] mb-8 animate-fade-in text-amber-500">
              TATU
            </h1>
            
            {/* Tagline */}
            <p className="headline text-2xl md:text-3xl text-gray-300 mb-4 animate-fade-in delay-100">
              Professional tattoo artist marketplace
            </p>
            
            {/* Description */}
            <p className="body text-lg text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in delay-200">
              Connect with verified tattoo artists. Browse portfolios. Book appointments.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto mb-12 animate-fade-in delay-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by artist, style and location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full pr-12"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in delay-300">
              <Link href="/explore" className="btn btn-primary">
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-secondary">
                Join as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '15K+', label: 'Artists', color: 'text-amber-500' },
              { number: '2.5M+', label: 'Artworks', color: 'text-purple-500' },
              { number: '180', label: 'Countries', color: 'text-emerald-500' },
              { number: '4.9', label: 'Rating', color: 'text-rose-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className={`display text-3xl md:text-4xl ${stat.color} mb-2`}>{stat.number}</div>
                <div className="label text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="display text-4xl md:text-5xl text-white mb-4">
              Why Choose TATU
            </h2>
            <p className="body text-gray-300 max-w-2xl mx-auto">
              The most trusted platform for tattoo artists and clients worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: 'Verified Artists',
                description: 'All artists are professionally verified with portfolio reviews and background checks.',
                icon: '✓'
              },
              {
                title: 'Secure Booking',
                description: 'Protected payments and verified appointments with transparent communication.',
                icon: '🔒'
              },
              {
                title: 'Global Network',
                description: 'Connect with artists worldwide from local studios to international destinations.',
                icon: '🌍'
              }
            ].map((feature, index) => (
              <div key={index} className="card card-hover p-8 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="headline text-xl text-white mb-4">{feature.title}</h3>
                <p className="body text-gray-300 mb-6">{feature.description}</p>
                <Link href="/how-it-works" className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="display text-4xl md:text-5xl text-white mb-4">
              Featured Artists
            </h2>
            <p className="body text-gray-300 max-w-2xl mx-auto">
              Discover work from our most talented verified artists.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Alex Rivera',
                location: 'Brooklyn, NY',
                specialty: 'Neo-Traditional',
                experience: '12 Years',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                rating: '4.9'
              },
              {
                name: 'Maya Chen',
                location: 'Tokyo, Japan',
                specialty: 'Minimalist',
                experience: '8 Years',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                rating: '4.8'
              },
              {
                name: 'Marcus Steel',
                location: 'London, UK',
                specialty: 'Abstract',
                experience: '15 Years',
                image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
                rating: '5.0'
              }
            ].map((artist, index) => (
              <div key={index} className="card card-hover p-6 text-center animate-fade-in group" style={{animationDelay: `${index * 100}ms`}}>
                <div className="relative mb-6">
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-gray-700 group-hover:border-amber-500 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                    {artist.rating}
                  </div>
                </div>
                <h3 className="headline text-lg text-white mb-2">{artist.name}</h3>
                <p className="label text-gray-300 mb-1">{artist.location}</p>
                <p className="body text-gray-300 text-sm mb-1">{artist.specialty}</p>
                <p className="caption text-gray-400 text-xs">{artist.experience}</p>
                <button className="mt-4 text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
                  View Portfolio →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-gray-800">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl md:text-5xl text-white mb-6">
              Ready to get started?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Join thousands of artists and clients on the world's leading tattoo platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-ghost">
                Apply as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

