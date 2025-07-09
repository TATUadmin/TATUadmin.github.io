'use client';

import Link from 'next/link'
import Logo from '../Logo'

export default function HomepageGrunge() {
  return (
    <div className="bg-gray-900 text-white overflow-hidden">
      {/* Hero Section - Raw & Gritty */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Textured Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-900" />
          {/* Paper Texture Effect */}
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `
                   radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0),
                   repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)
                 `,
                 backgroundSize: '20px 20px, 40px 40px'
               }} />
          {/* Grunge Splashes */}
          <div className="absolute top-10 right-10 w-64 h-64 bg-red-600/20 rounded-full blur-xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-600/10 rounded-full blur-2xl" />
        </div>

        <div className="container relative z-10 text-center">
          {/* Main Logo */}
          <div className="mb-8">
            <h1 className="font-bangers text-8xl md:text-9xl lg:text-[12rem] text-white tracking-wider mb-4 transform -rotate-2"
                style={{
                  textShadow: '4px 4px 0px #dc2626, 8px 8px 0px #991b1b, 12px 12px 20px rgba(0,0,0,0.5)',
                  filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))'
                }}>
              TATU
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-1 bg-red-600 transform -rotate-12" />
              <div className="w-8 h-8 border-4 border-white bg-red-600 transform rotate-45" />
              <div className="w-16 h-1 bg-red-600 transform rotate-12" />
            </div>
            <p className="font-permanent-marker text-xl md:text-2xl text-yellow-400 transform rotate-1">
              Where Ink Meets Soul
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/explore" 
                  className="bg-red-600 text-white px-8 py-4 font-bangers text-2xl tracking-wider uppercase hover:bg-red-700 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 shadow-lg"
                  style={{
                    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 100%, 20px 100%)',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
              Find Artists
            </Link>
            <Link href="/signup" 
                  className="border-4 border-yellow-400 text-yellow-400 px-8 py-4 font-bangers text-2xl tracking-wider uppercase hover:bg-yellow-400 hover:text-black transition-all duration-300 transform hover:scale-105 hover:rotate-1 relative"
                  style={{
                    clipPath: 'polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%)',
                    textShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
              Join Crew
            </Link>
          </div>

          {/* Stats - Grunge Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-black/50 p-4 border-l-4 border-red-600 transform -rotate-1">
              <div className="font-bangers text-4xl md:text-5xl text-red-400 mb-2 tracking-wider">
                500+
              </div>
              <div className="font-permanent-marker text-sm text-gray-300 transform rotate-1">
                Tattoo Artists
              </div>
            </div>
            <div className="text-center bg-black/50 p-4 border-l-4 border-yellow-600 transform rotate-1">
              <div className="font-bangers text-4xl md:text-5xl text-yellow-400 mb-2 tracking-wider">
                10K+
              </div>
              <div className="font-permanent-marker text-sm text-gray-300 transform -rotate-1">
                Fresh Ink
              </div>
            </div>
            <div className="text-center bg-black/50 p-4 border-l-4 border-green-600 transform -rotate-1">
              <div className="font-bangers text-4xl md:text-5xl text-green-400 mb-2 tracking-wider">
                50+
              </div>
              <div className="font-permanent-marker text-sm text-gray-300 transform rotate-1">
                Cities
              </div>
            </div>
            <div className="text-center bg-black/50 p-4 border-l-4 border-blue-600 transform rotate-1">
              <div className="font-bangers text-4xl md:text-5xl text-blue-400 mb-2 tracking-wider">
                24/7
              </div>
              <div className="font-permanent-marker text-sm text-gray-300 transform -rotate-1">
                Always Open
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-2 h-16 bg-red-600 animate-bounce transform rotate-12" />
        </div>
      </section>

      {/* Features Section - Street Art Style */}
      <section className="py-24 bg-black relative">
        <div className="absolute inset-0 opacity-10" 
             style={{
               backgroundImage: `
                 repeating-linear-gradient(
                   45deg,
                   transparent,
                   transparent 10px,
                   rgba(255,255,255,0.1) 10px,
                   rgba(255,255,255,0.1) 11px
                 )
               `
             }} />
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-bangers text-6xl md:text-7xl tracking-wider text-white mb-6 transform -rotate-1"
                style={{
                  textShadow: '3px 3px 0px #dc2626, 6px 6px 0px #991b1b'
                }}>
              THE STREETS
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="w-24 h-2 bg-red-600 transform -rotate-12" />
              <div className="w-6 h-6 bg-yellow-400 transform rotate-45" />
              <div className="w-24 h-2 bg-red-600 transform rotate-12" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 border-4 border-red-600 group hover:bg-gray-700 transition-all duration-300 transform hover:-rotate-1">
              <div className="w-16 h-16 bg-red-600 mx-auto mb-6 flex items-center justify-center transform rotate-45">
                <div className="w-8 h-8 bg-white transform -rotate-45" />
              </div>
              <h3 className="font-bangers text-3xl tracking-wider text-red-400 mb-4 text-center transform rotate-1">
                SEARCH
              </h3>
              <p className="font-inter text-gray-300 leading-relaxed text-center">
                Hunt down the sickest artists in your hood. Check their books, styles, and street cred.
              </p>
            </div>

            <div className="bg-gray-800 p-8 border-4 border-yellow-600 group hover:bg-gray-700 transition-all duration-300 transform hover:rotate-1">
              <div className="w-16 h-16 bg-yellow-600 mx-auto mb-6 flex items-center justify-center transform -rotate-45">
                <div className="w-8 h-8 bg-black transform rotate-45" />
              </div>
              <h3 className="font-bangers text-3xl tracking-wider text-yellow-400 mb-4 text-center transform -rotate-1">
                CONNECT
              </h3>
              <p className="font-inter text-gray-300 leading-relaxed text-center">
                Hit up artists direct. Book sessions. Talk shop about your next piece.
              </p>
            </div>

            <div className="bg-gray-800 p-8 border-4 border-green-600 group hover:bg-gray-700 transition-all duration-300 transform hover:-rotate-1">
              <div className="w-16 h-16 bg-green-600 mx-auto mb-6 flex items-center justify-center transform rotate-45">
                <div className="w-8 h-8 bg-white transform -rotate-45" />
              </div>
              <h3 className="font-bangers text-3xl tracking-wider text-green-400 mb-4 text-center transform rotate-1">
                CREATE
              </h3>
              <p className="font-inter text-gray-300 leading-relaxed text-center">
                Turn your vision into reality. Real artists, solid work, fair prices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Raw Power */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-red-600/10 transform -skew-y-1" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-yellow-600/10 transform skew-y-1" />
        </div>
        
        <div className="container relative z-10 text-center">
          <h2 className="font-bangers text-7xl md:text-8xl tracking-wider text-white mb-8 transform -rotate-1"
              style={{
                textShadow: '4px 4px 0px #dc2626, 8px 8px 0px #991b1b, 12px 12px 20px rgba(0,0,0,0.5)'
              }}>
            READY TO ROLL?
          </h2>
          <p className="font-permanent-marker text-2xl text-yellow-400 mb-12 transform rotate-1">
            Join the Ink Revolution
          </p>
          <Link href="/signup" 
                className="inline-block bg-gradient-to-r from-red-600 to-yellow-600 text-white px-12 py-6 font-bangers text-3xl tracking-wider uppercase hover:from-red-700 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 shadow-xl"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 100%, 30px 100%)',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.5)'
                }}>
            GET INKED
          </Link>
        </div>
      </section>
    </div>
  )
} 