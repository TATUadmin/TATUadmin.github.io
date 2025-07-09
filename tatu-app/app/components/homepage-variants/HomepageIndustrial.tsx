'use client';

import Link from 'next/link'
import Logo from '../Logo'

export default function HomepageIndustrial() {
  return (
    <div className="bg-black text-white overflow-hidden">
      {/* Hero Section - Industrial & Bold */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Grid */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                 `,
                 backgroundSize: '50px 50px'
               }} />
        </div>

        <div className="container relative z-10 text-center">
          {/* Main Logo */}
          <div className="mb-8">
            <h1 className="font-bebas text-8xl md:text-9xl lg:text-[12rem] text-white tracking-[0.3em] mb-4 text-shadow-lg">
              TATU
            </h1>
            <div className="w-32 h-1 bg-white mx-auto mb-6" />
            <p className="font-oswald text-xl md:text-2xl tracking-widest text-gray-300 uppercase">
              Ink • Art • Culture
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/explore" 
                  className="bg-white text-black px-8 py-4 font-oswald font-bold text-lg tracking-widest uppercase hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
              Find Artists
            </Link>
            <Link href="/signup" 
                  className="border-2 border-white text-white px-8 py-4 font-oswald font-bold text-lg tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105">
              Join Platform
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-white mb-2">500+</div>
              <div className="font-oswald text-sm tracking-widest text-gray-400 uppercase">Artists</div>
            </div>
            <div className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-white mb-2">10K+</div>
              <div className="font-oswald text-sm tracking-widest text-gray-400 uppercase">Tattoos</div>
            </div>
            <div className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-white mb-2">50+</div>
              <div className="font-oswald text-sm tracking-widest text-gray-400 uppercase">Cities</div>
            </div>
            <div className="text-center">
              <div className="font-bebas text-4xl md:text-5xl text-white mb-2">24/7</div>
              <div className="font-oswald text-sm tracking-widest text-gray-400 uppercase">Support</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-16 bg-white opacity-50 animate-pulse" />
        </div>
      </section>

      {/* Features Section - Bold Grid */}
      <section className="py-24 bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-bebas text-6xl md:text-7xl tracking-wider text-white mb-6">
              THE PLATFORM
            </h2>
            <div className="w-24 h-1 bg-white mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-black p-8 text-center group hover:bg-gray-800 transition-all duration-300">
              <div className="w-16 h-16 bg-white mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-black" />
              </div>
              <h3 className="font-oswald text-2xl tracking-wider text-white mb-4 uppercase">
                Discover
              </h3>
              <p className="font-inter text-gray-400 leading-relaxed">
                Find the perfect tattoo artist in your area. Browse portfolios, styles, and reviews.
              </p>
            </div>

            <div className="bg-black p-8 text-center group hover:bg-gray-800 transition-all duration-300">
              <div className="w-16 h-16 bg-white mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-black" />
              </div>
              <h3 className="font-oswald text-2xl tracking-wider text-white mb-4 uppercase">
                Connect
              </h3>
              <p className="font-inter text-gray-400 leading-relaxed">
                Message artists directly. Schedule consultations. Discuss your vision.
              </p>
            </div>

            <div className="bg-black p-8 text-center group hover:bg-gray-800 transition-all duration-300">
              <div className="w-16 h-16 bg-white mx-auto mb-6 flex items-center justify-center">
                <div className="w-8 h-8 bg-black" />
              </div>
              <h3 className="font-oswald text-2xl tracking-wider text-white mb-4 uppercase">
                Create
              </h3>
              <p className="font-inter text-gray-400 leading-relaxed">
                Turn your ideas into reality. Professional artists, quality work, fair pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Aggressive */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-900/20 to-transparent" />
        
        <div className="container relative z-10 text-center">
          <h2 className="font-bebas text-7xl md:text-8xl tracking-wider text-white mb-8">
            READY TO INK?
          </h2>
          <p className="font-oswald text-xl tracking-widest text-gray-300 mb-12 uppercase">
            Join the revolution
          </p>
          <Link href="/signup" 
                className="inline-block bg-white text-black px-12 py-6 font-oswald font-bold text-xl tracking-widest uppercase hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
} 