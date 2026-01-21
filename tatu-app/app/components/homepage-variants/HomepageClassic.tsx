'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomepageClassic() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-cream text-black relative overflow-hidden">
      {/* Vintage Border Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full border-8 border-double border-amber-800 m-4"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b-4 border-double border-amber-800 bg-cream/90 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="font-playfair text-5xl font-bold text-amber-900">
                TATU
              </h1>
              <nav className="hidden md:flex space-x-8">
                <Link href="/explore" className="font-crimson text-lg text-amber-800 hover:text-amber-900 transition-colors">
                  Browse Artists
                </Link>
                <Link href="/about" className="font-crimson text-lg text-amber-800 hover:text-amber-900 transition-colors">
                  About
                </Link>
                <Link href="/contact" className="font-crimson text-lg text-amber-800 hover:text-amber-900 transition-colors">
                  Contact
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="font-crimson text-lg text-amber-800 hover:text-amber-900 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-amber-800 text-cream px-6 py-3 font-crimson font-semibold border-2 border-amber-800 hover:bg-cream hover:text-amber-800 transition-all duration-300"
              >
                Join the Parlor
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-playfair text-7xl md:text-8xl font-bold text-amber-900 mb-6 leading-none">
              TRADITIONAL
              <br />
              <span className="text-6xl md:text-7xl text-amber-700">ARTISTRY</span>
            </h2>
            <p className="font-crimson text-2xl text-amber-800 mb-8 leading-relaxed max-w-2xl mx-auto">
              Connecting you with master tattoo artists who honor the timeless traditions of ink and skin.
            </p>
            
            {/* Vintage Search */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search artists, styles, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 font-crimson text-lg border-4 border-double border-amber-800 bg-cream text-amber-900 placeholder-amber-600 focus:outline-none focus:border-amber-900"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-6 h-6 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Vintage Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link 
                href="/explore"
                className="bg-amber-800 text-cream px-8 py-4 font-crimson font-bold text-xl border-4 border-double border-amber-800 hover:bg-cream hover:text-amber-800 transition-all duration-300 shadow-lg"
              >
                FIND YOUR ARTIST
              </Link>
              <Link 
                href="/register-artist"
                className="border-4 border-double border-amber-800 text-amber-800 px-8 py-4 font-crimson font-bold text-xl hover:bg-amber-800 hover:text-cream transition-all duration-300"
              >
                JOIN AS ARTIST
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-amber-300 opacity-30">
          <div className="font-playfair text-9xl">✦</div>
        </div>
        <div className="absolute bottom-10 right-10 text-amber-300 opacity-30">
          <div className="font-playfair text-9xl">✦</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-amber-50/50">
        <div className="container">
          <h3 className="font-playfair text-4xl font-bold text-center text-amber-900 mb-16">
            Time-Honored Traditions
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-amber-800 border-4 border-double border-amber-900 flex items-center justify-center">
                <span className="text-cream font-playfair text-2xl font-bold">★</span>
              </div>
              <h4 className="font-playfair text-2xl font-bold text-amber-900 mb-4">Master Craftsmen</h4>
              <p className="font-crimson text-amber-800 leading-relaxed">
                Artists with decades of experience in traditional tattooing techniques and classic American designs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-amber-800 border-4 border-double border-amber-900 flex items-center justify-center">
                <span className="text-cream font-playfair text-2xl font-bold">◆</span>
              </div>
              <h4 className="font-playfair text-2xl font-bold text-amber-900 mb-4">Classic Styles</h4>
              <p className="font-crimson text-amber-800 leading-relaxed">
                From traditional roses to sailor jerry designs, find artists who specialize in timeless tattoo art.
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-amber-800 border-4 border-double border-amber-900 flex items-center justify-center">
                <span className="text-cream font-playfair text-2xl font-bold">♠</span>
              </div>
              <h4 className="font-playfair text-2xl font-bold text-amber-900 mb-4">Authentic Parlors</h4>
              <p className="font-crimson text-amber-800 leading-relaxed">
                Book sessions at established tattoo parlors with rich histories and authentic vintage atmosphere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Back */}
      <div className="relative z-10 py-8 text-center border-t-4 border-double border-amber-800">
      </div>
    </div>
  )
} 