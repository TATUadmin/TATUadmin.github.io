'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TattooBackgroundCycler from './components/TattooBackgroundCycler'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-screen flex items-center justify-center relative">
        {/* Cycling Tattoo Background */}
        <TattooBackgroundCycler />
        
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
          {/* Main Content - Left Side */}
          <div className="w-1/2 pt-16 text-left">
            {/* Main Headline */}
            <h1 className="display text-2xl md:text-4xl lg:text-5xl text-white mb-6 animate-fade-in delay-100">
              At last, every tattoo artist in one place. Browse portfolios & reviews. Book appointments with confidence.
            </h1>
            
            {/* Search */}
            <div className="max-w-lg mb-12 animate-fade-in delay-300">
              <div className="relative">
                {!searchTerm && (
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" style={{zIndex: 1}}>
                    <span className="text-gray-400 text-lg">
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
                      router.push(`/explore?search=${encodeURIComponent(searchTerm.trim())}`)
                    }
                  }}
                  className="input text-lg"
                  style={{
                    fontSize: '1.125rem',
                    color: '#ffffff',
                    paddingLeft: '16px'
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
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-300">
              <Link href="/explore" className="btn btn-primary btn-glimmer">
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-secondary">
                Join as Artist
              </Link>
            </div>

            {/* Quick Navigation */}
            <div className="flex flex-wrap gap-4 mt-12 animate-fade-in delay-400">
              <Link href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                How It Works
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                About TATU
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/styles" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Tattoo Styles
              </Link>
            </div>
          </div>
        </div>

        {/* Logo - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Secure Payments</h3>
              <p className="body text-gray-400">
                Industry-leading payment protection with escrow services and dispute resolution.
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

