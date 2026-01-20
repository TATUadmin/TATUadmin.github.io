'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { classifySearch } from '@/lib/smart-search'
import TattooBackgroundCycler from './components/TattooBackgroundCycler'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-screen flex items-center justify-center relative pb-16 lg:pb-0">
        {/* Cycling Tattoo Background - Desktop only */}
        <div className="hidden lg:block absolute right-0 top-0 w-1/2 h-full">
          <TattooBackgroundCycler />
        </div>
        
        {/* Mobile Background Images - Positioned under text */}
        <div className="lg:hidden absolute inset-0 w-full h-full">
          <TattooBackgroundCycler />
        </div>
        
        
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzEyOV8xKSI+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9IndoaXRlIi8+CjwvZz4KPGRGZWZZPGO8Y2xpcFBhdGggaWQ9ImNsaXAwXzEyOV8xIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=')",
            backgroundRepeat: 'repeat',
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="container relative z-10">
          {/* Main Content - Full width on mobile, half width on desktop */}
          <div className="w-full lg:w-1/2 pt-8 lg:pt-16 text-left px-4 lg:px-0">
            {/* Main Headline */}
            <h1 className="display text-2xl md:text-3xl lg:text-5xl text-white mb-4 lg:mb-6 animate-fade-in delay-100 leading-tight" style={{textShadow: '0 2px 4px rgba(0,0,0,0.8)'}}>
              At last, every tattoo artist in one place. Browse portfolios & reviews. Book appointments with confidence.
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-lg mb-6 lg:mb-12 animate-fade-in delay-300 mx-auto lg:mx-0 mt-16 lg:mt-24">
              <div className="relative">
                {!searchTerm && (
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{zIndex: 1}}>
                    <span className="text-gray-400 text-base" style={{textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>
                      Search by{' '}
                      <span style={{color: '#20B2AA'}}>artist</span>
                      ,{' '}
                      <span style={{color: '#FFD700'}}>style</span>
                      , or{' '}
                      <span style={{color: '#FF8C00'}}>location</span>
                      ...
                    </span>
                  </div>
                )}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      const q = searchTerm.trim()
                      const cls = classifySearch(q)
                      const params = new URLSearchParams()
                      params.set('search', q)
                      if (cls.location) params.set('location', cls.location)
                      if (cls.style) params.set('style', cls.style)
                      router.push(`/explore?${params.toString()}`)
                    }
                  }}
                  className="w-full px-4 py-3 bg-transparent border-2 border-gray-400 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:border-gray-400 transition-all duration-200"
                  style={{
                    fontSize: '0.875rem',
                    color: '#ffffff',
                    paddingLeft: '16px',
                    paddingRight: '60px'
                  }}
                />
                <button 
                  onClick={() => {
                    if (searchTerm.trim()) {
                      const q = searchTerm.trim()
                      const cls = classifySearch(q)
                      const params = new URLSearchParams()
                      params.set('search', q)
                      if (cls.location) params.set('location', cls.location)
                      if (cls.style) params.set('style', cls.style)
                      router.push(`/explore?${params.toString()}`)
                    }
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 animate-fade-in delay-300 justify-center lg:justify-start items-center mb-4 lg:mb-0">
              <button
                onClick={() => {
                  if (searchTerm.trim()) {
                    const q = searchTerm.trim()
                    const cls = classifySearch(q)
                    const params = new URLSearchParams()
                    params.set('search', q)
                    if (cls.location) params.set('location', cls.location)
                    if (cls.style) params.set('style', cls.style)
                    router.push(`/explore?${params.toString()}`)
                  } else {
                    router.push('/explore')
                  }
                }}
                className="px-6 lg:px-8 py-2.5 lg:py-3 bg-white border-2 border-gray-400 text-black rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 text-center min-w-[140px] lg:min-w-[160px] text-sm lg:text-base cursor-pointer"
              >
                Browse Artists
              </button>
              <Link 
                href="/register-artist" 
                className="px-6 lg:px-8 py-2.5 lg:py-3 bg-transparent border-2 border-gray-400 text-white rounded-full font-semibold hover:bg-gray-400 hover:text-black transition-all duration-200 text-center min-w-[140px] lg:min-w-[160px] text-sm lg:text-base"
                style={{textShadow: '0 1px 2px rgba(0,0,0,0.5)'}}
              >
                Join as Artist
              </Link>
            </div>

          </div>
        </div>

        {/* Logo - Bottom Center */}
        <div className="absolute bottom-20 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative mx-auto animate-fade-in text-center" style={{ maxWidth: '200px', width: '60%' }}>
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-16 bg-transparent">
        <div className="container">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="display text-2xl md:text-3xl text-white mb-2">10K+</div>
              <div className="body text-sm text-gray-400 uppercase tracking-wider">Artists</div>
            </div>
            <div className="animate-fade-in delay-100">
              <div className="display text-2xl md:text-3xl text-white mb-2">50K+</div>
              <div className="body text-sm text-gray-400 uppercase tracking-wider">Bookings</div>
            </div>
            <div className="animate-fade-in delay-200">
              <div className="display text-2xl md:text-3xl text-white mb-2">200+</div>
              <div className="body text-sm text-gray-400 uppercase tracking-wider">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* For Artists - New Features */}
      <section className="py-20 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="display text-3xl md:text-4xl text-white mb-6">
              Built for Modern Tattoo Artists
            </h2>
            <p className="body text-lg text-gray-400">
              Powerful business tools to save time, prevent double bookings, and grow your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            <div className="card p-8 card-hover bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
              <div className="flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#20B2AA'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="headline text-2xl text-white mb-4">Unified Inbox</h3>
              <p className="body text-gray-300 mb-4">
                Manage all your client messages in one place. Connect Instagram, Email, Facebook, SMS, WhatsApp, and more.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>✓ AI-powered message categorization</li>
                <li>✓ Smart reply suggestions</li>
                <li>✓ Never miss a booking request</li>
                <li>✓ Save 2+ hours per day</li>
              </ul>
            </div>

            <div className="card p-8 card-hover bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
              <div className="flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#FFD700'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="headline text-2xl text-white mb-4">Unified Calendar</h3>
              <p className="body text-gray-300 mb-4">
                Sync all your bookings from Google, Apple, Square, Calendly, and more. Never double-book again.
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>✓ Automatic conflict detection</li>
                <li>✓ AI email appointment parsing</li>
                <li>✓ Multi-artist studio view</li>
                <li>✓ Prevent $500+ in lost bookings</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link href="/register-artist" className="inline-block px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all duration-200">
              Start Free Trial → PRO Features for 30 Days
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="display text-3xl md:text-4xl text-white mb-6">
              Why Choose TATU
            </h2>
            <p className="body text-lg text-gray-400">
              The professional platform connecting clients with verified tattoo artists worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center card-hover">
              <div className="flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#FF8C00'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Verified Artists</h3>
              <p className="body text-gray-400">
                All artists go through our rigorous verification process to ensure quality and professionalism.
              </p>
            </div>

            <div className="card p-8 text-center card-hover">
              <div className="flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#FFD700'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Video Consultations</h3>
              <p className="body text-gray-400">
                Free HD video calls with unlimited duration. Discuss your design before committing.
              </p>
            </div>

            <div className="card p-8 text-center card-hover">
              <div className="flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: '#20B2AA'}}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Quality Guarantee</h3>
              <p className="body text-gray-400">
                Satisfaction guaranteed with our comprehensive review system and quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-transparent">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-3xl md:text-4xl text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="body text-lg text-gray-400 mb-8">
              Join thousands of satisfied clients and professional artists on TATU.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                Find Your Artist
              </Link>
              <Link href="/register-artist" className="btn btn-secondary">
                Apply as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

