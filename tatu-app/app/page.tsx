'use client';

import Link from 'next/link'
import { useState } from 'react'
import TattooBackgroundAnimation from './components/TattooLineAnimation'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="min-h-screen flex items-center justify-center relative">
        {/* Tattoo Line Animation Background */}
        <TattooBackgroundAnimation />
        
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
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <div className="relative mx-auto mb-12 animate-fade-in" style={{ maxWidth: '200px', width: '60%' }}>
              <img 
                src="/tatu-logo.png" 
                alt="TATU Logo" 
                className="w-full h-auto filter brightness-0 invert"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            
            {/* Main Headline */}
            <h1 className="display text-4xl md:text-6xl lg:text-7xl text-white mb-6 animate-fade-in delay-100">
              Professional Tattoo
              <br />
              Artist Marketplace
            </h1>
            
            {/* Description */}
            <p className="body text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-fade-in delay-200">
              Connect with verified tattoo artists. Browse portfolios. Book appointments with confidence.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto mb-12 animate-fade-in delay-300">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by artist, style, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input"
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

            {/* Quick Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mt-12 animate-fade-in delay-400">
              <Link href="/how-it-works" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                How It Works
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                About TATU
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/styles" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                Tattoo Styles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-t border-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
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
            <div className="animate-fade-in delay-300">
              <div className="display text-2xl md:text-3xl text-white mb-2">99%</div>
              <div className="body text-sm text-gray-400 uppercase tracking-wider">Satisfaction</div>
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
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Verified Artists</h3>
              <p className="body text-gray-400">
                All artists go through our rigorous verification process to ensure quality and professionalism.
              </p>
            </div>

            <div className="card p-8 text-center card-hover">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="headline text-xl text-white mb-4">Secure Payments</h3>
              <p className="body text-gray-400">
                Industry-leading payment protection with escrow services and dispute resolution.
              </p>
            </div>

            <div className="card p-8 text-center card-hover">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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
      <section className="py-20 border-t border-gray-800">
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

