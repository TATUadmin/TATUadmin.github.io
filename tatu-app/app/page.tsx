'use client';

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen text-white relative">
      {/* Global Gradient Background */}
      <div className="absolute inset-0 z-[-10] pointer-events-none bg-gradient-to-br from-black via-black via-blue-950 via-purple-900 to-yellow-900" />
      {/* Hero Section - Minimal */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        {/* Animated Flowy Gradient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none animate-flowy-bg" />
        {/* Texture Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none bg-flag-wave"
          style={{
            backgroundImage: "url('/bg.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.13,
            mixBlendMode: 'screen',
          }}
        />
        {/* Background Image with new overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop&crop=center" 
            alt="Tattoo Art Background"
            className="w-full h-full object-cover opacity-10"
          />
          {/* Black overlay to darken the background image */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 1, pointerEvents: 'none' }} />
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="relative mx-auto mb-8 animate-fade-in" style={{ maxWidth: '420px', width: '80%', filter: 'drop-shadow(3.6px 3.6px 9.6px rgba(0,0,0,0.66)) drop-shadow(0 0 38.4px rgba(0,0,0,0.456)) drop-shadow(0 0 76.8px rgba(0,0,0,0.336)) brightness(1.3)' }}>
              {/* Silver base using mask */}
              <div
                className="w-full"
                style={{
                  background: 'linear-gradient(120deg, #888888 0%, #bcbcbc 100%)',
                  WebkitMaskImage: "url('/tatu-logo.png')",
                  maskImage: "url('/tatu-logo.png')",
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  aspectRatio: '1/1',
                  height: 'auto',
                  minHeight: '120px',
                  maxHeight: '220px',
                  margin: '0 auto',
                  display: 'block',
                  filter: 'contrast(2) saturate(2)',
                }}
              />
              {/* Animated hero background overlay, reflected across the diagonal and masked to logo shape */}
              <div
                className="absolute inset-0 pointer-events-none animate-flowy-bg"
                style={{
                  WebkitMaskImage: "url('/tatu-logo.png')",
                  maskImage: "url('/tatu-logo.png')",
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  transform: 'scaleX(-1) scaleY(-1) rotate(180deg)', // diagonal reflection
                  zIndex: 2,
                  opacity: 0.85,
                }}
              />
              {/* Metallic shine overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  WebkitMaskImage: "url('/tatu-logo.png')",
                  maskImage: "url('/tatu-logo.png')",
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0.5) 80%, transparent 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'metallicShine 6s ease-in-out infinite',
                  zIndex: 3,
                  mixBlendMode: 'overlay',
                }}
              />
            </div>
            
            {/* Tagline */}
            <p className="headline text-2xl md:text-3xl text-white mb-4 animate-fade-in delay-100 font-bold" style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.35), 0 0 20px rgba(0,0,0,0.27), 0 0 40px rgba(0,0,0,0.18)'
            }}>
              Professional tattoo artist marketplace
            </p>
            
            {/* Description */}
            <p className="body text-lg text-gray-100 mb-12 max-w-2xl mx-auto animate-fade-in delay-200 font-medium" style={{
              textShadow: '1px 1px 3px rgba(0,0,0,0.4), 0 0 15px rgba(0,0,0,0.31)'
            }}>
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
                  className="w-full pr-12 px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                  style={{ 
                    opacity: 1,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.4)',
                    borderRadius: '0.375rem',
                    filter: 'brightness(1.2) contrast(1.3) drop-shadow(2px 2px 4px rgba(0,0,0,0.35))',
                    mixBlendMode: 'screen'
                  }}
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
              <Link href="/explore" className="btn btn-primary" style={{
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.35)) drop-shadow(0 0 20px rgba(0,0,0,0.27)) drop-shadow(0 0 40px rgba(0,0,0,0.18))'
              }}>
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-secondary" style={{
                filter: 'drop-shadow(2px 2px 6px rgba(0,0,0,0.55)) drop-shadow(0 0 24px rgba(0,0,0,0.38)) drop-shadow(0 0 48px rgba(0,0,0,0.28)) contrast(1.35) saturate(1.15)',
                background: 'linear-gradient(120deg, #23272b 0%, #3a4250 25%, #6b7280 50%, #23272b 75%, #181a1b 100%)',
                borderColor: '#6b7280',
                color: '#e5e7eb',
                boxShadow: 'inset 0 2.5px 12px 0 rgba(30,30,40,0.28)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Metallic shimmer overlays (3 lines) */}
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.13) 80%)',
                    backgroundSize: '200% 100%',
                    animation: 'metallicShine 5s linear infinite',
                    animationDelay: '0s',
                    mixBlendMode: 'screen',
                    zIndex: 1,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.13) 80%)',
                    backgroundSize: '200% 100%',
                    animation: 'metallicShine 5s linear infinite',
                    animationDelay: '1.2s',
                    mixBlendMode: 'screen',
                    zIndex: 1,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    borderRadius: 'inherit',
                    background: 'linear-gradient(120deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.32) 40%, rgba(255,255,255,0.13) 80%)',
                    backgroundSize: '200% 100%',
                    animation: 'metallicShine 5s linear infinite',
                    animationDelay: '2.4s',
                    mixBlendMode: 'screen',
                    zIndex: 1,
                  }}
                />
                <span style={{ position: 'relative', zIndex: 2, color: '#000' }}>
                  Join as Artist
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom fade overlay for seamless transition to stats */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: '15K+', label: 'Artists', color: 'text-amber-500' },
              { number: '2.5M+', label: 'Artworks', color: 'text-purple-500' },
              { number: '180', label: 'Countries', color: 'text-emerald-500' },
              { number: '4.9', label: 'Rating', color: 'text-rose-500' }
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className={`display text-2xl md:text-3xl ${stat.color} mb-1`}>{stat.number}</div>
                <div className="label text-gray-300 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Below the fold sections with single background */}
      <div className="relative">
        {/* Single gradient background for all below-the-fold sections */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-black via-black via-blue-950 via-purple-900 to-yellow-900" />
        {/* 30% dark overlay */}
        <div className="tatu-dark-gradient-bg" aria-hidden="true" />
        <div className="grainy-bg absolute inset-0 w-full h-full z-1" aria-hidden="true" />

        {/* Features Section */}
        <section className="py-24 relative">
          <div className="container relative z-10">
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
                <div key={index} className="card card-hover card-z p-8 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
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
        <section className="py-24 relative">
          <div className="container relative z-10">
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
                <div key={index} className="card card-hover card-z p-6 text-center animate-fade-in group" style={{animationDelay: `${index * 100}ms`}}>
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
        <section className="py-24 relative">
          <div className="container relative z-10">
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


    </div>
  )
}

