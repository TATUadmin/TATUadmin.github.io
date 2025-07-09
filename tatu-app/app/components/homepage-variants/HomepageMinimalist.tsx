'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomepageMinimalist() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Clean Header */}
      <header className="border-b border-gray-100">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-12">
              <h1 className="font-inter text-3xl font-light tracking-wider text-black">
                TATU
              </h1>
              <nav className="hidden md:flex space-x-8">
                <Link href="/explore" className="font-inter text-sm font-medium text-gray-600 hover:text-black transition-colors tracking-wide">
                  ARTISTS
                </Link>
                <Link href="/about" className="font-inter text-sm font-medium text-gray-600 hover:text-black transition-colors tracking-wide">
                  ABOUT
                </Link>
                <Link href="/contact" className="font-inter text-sm font-medium text-gray-600 hover:text-black transition-colors tracking-wide">
                  CONTACT
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/login" className="font-inter text-sm font-medium text-gray-600 hover:text-black transition-colors tracking-wide">
                SIGN IN
              </Link>
              <Link 
                href="/register" 
                className="bg-black text-white px-6 py-2 font-inter text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
              >
                JOIN
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-inter text-6xl md:text-7xl font-extralight text-black mb-8 leading-tight tracking-tight">
              Refined
              <br />
              <span className="font-light">Artistry</span>
            </h2>
            <p className="font-inter text-xl font-light text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Connect with contemporary artists who specialize in fine line work, 
              geometric designs, and modern minimalist tattoos.
            </p>
            
            {/* Clean Search */}
            <div className="max-w-lg mx-auto mb-16">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artists, styles, locations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-0 py-4 font-inter text-lg border-0 border-b border-gray-200 bg-transparent text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
                <button className="absolute right-0 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Minimal Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <Link 
                href="/explore"
                className="bg-black text-white px-8 py-3 font-inter text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
              >
                EXPLORE ARTISTS
              </Link>
              <Link 
                href="/register-artist"
                className="border border-gray-300 text-black px-8 py-3 font-inter text-sm font-medium tracking-wide hover:border-black transition-colors"
              >
                BECOME AN ARTIST
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="font-inter text-4xl font-light text-black mb-2">500+</div>
              <div className="font-inter text-sm font-medium text-gray-600 tracking-wide uppercase">Verified Artists</div>
            </div>
            <div>
              <div className="font-inter text-4xl font-light text-black mb-2">10K+</div>
              <div className="font-inter text-sm font-medium text-gray-600 tracking-wide uppercase">Completed Sessions</div>
            </div>
            <div>
              <div className="font-inter text-4xl font-light text-black mb-2">50+</div>
              <div className="font-inter text-sm font-medium text-gray-600 tracking-wide uppercase">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-inter text-3xl font-light text-center text-black mb-20 tracking-tight">
              Modern Approach to Traditional Art
            </h3>
            <div className="space-y-16">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="font-inter text-xl font-medium text-black mb-4 tracking-wide">CURATED ARTISTS</h4>
                  <p className="font-inter text-gray-600 leading-relaxed">
                    Hand-selected artists who excel in contemporary styles including fine line, 
                    geometric, botanical, and minimalist designs.
                  </p>
                </div>
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <div className="w-24 h-24 border border-gray-300 flex items-center justify-center">
                    <div className="w-8 h-8 bg-black"></div>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="h-48 bg-gray-100 flex items-center justify-center md:order-first order-last">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="w-8 h-8 border border-gray-300"></div>
                    <div className="w-8 h-8 bg-black"></div>
                    <div className="w-8 h-8 border border-gray-300"></div>
                    <div className="w-8 h-8 bg-black"></div>
                    <div className="w-8 h-8 border border-gray-300"></div>
                    <div className="w-8 h-8 bg-black"></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-inter text-xl font-medium text-black mb-4 tracking-wide">SEAMLESS BOOKING</h4>
                  <p className="font-inter text-gray-600 leading-relaxed">
                    Clean, intuitive interface for browsing portfolios, checking availability, 
                    and booking consultations with your ideal artist.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Back */}
      <div className="py-12 text-center border-t border-gray-100">
        <Link 
          href="/styles" 
          className="font-inter text-sm font-medium text-gray-600 hover:text-black tracking-wide transition-colors"
        >
          ← BACK TO STYLES
        </Link>
      </div>
    </div>
  )
} 