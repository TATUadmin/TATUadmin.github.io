'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomepageGothic() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Dark Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.05) 20px,
            rgba(255,255,255,0.05) 40px
          )`
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="font-creepster text-4xl text-purple-400" style={{
                textShadow: '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)'
              }}>
                TATU
              </h1>
              <nav className="hidden md:flex space-x-8">
                <Link href="/explore" className="font-nosifer text-sm text-gray-300 hover:text-purple-400 transition-colors tracking-wider">
                  DARK ARTISTS
                </Link>
                <Link href="/about" className="font-nosifer text-sm text-gray-300 hover:text-purple-400 transition-colors tracking-wider">
                  THE COVEN
                </Link>
                <Link href="/contact" className="font-nosifer text-sm text-gray-300 hover:text-purple-400 transition-colors tracking-wider">
                  SUMMON US
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/login" className="font-nosifer text-sm text-gray-300 hover:text-purple-400 transition-colors tracking-wider">
                ENTER
              </Link>
              <Link 
                href="/register" 
                className="bg-purple-600 text-white px-6 py-3 font-nosifer font-bold border border-purple-500 hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                style={{
                  textShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                }}
              >
                JOIN THE DARKNESS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 text-center">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-creepster text-6xl md:text-8xl text-purple-400 mb-8 leading-none" style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)'
            }}>
              EMBRACE
              <br />
              <span className="text-5xl md:text-7xl text-red-400" style={{
                textShadow: '0 0 30px rgba(248, 113, 113, 0.6), 0 0 60px rgba(248, 113, 113, 0.4)'
              }}>
                THE SHADOWS
              </span>
            </h2>
            <p className="font-nosifer text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto tracking-wide">
              Descend into the realm of dark artistry. Connect with masters of blackwork, 
              gothic designs, and occult-inspired tattoos.
            </p>
            
            {/* Dark Search */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Seek artists, styles, forbidden locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 font-nosifer text-lg bg-gray-900 border-2 border-gray-700 text-purple-300 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  style={{
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                  }}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Gothic Buttons */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
              <Link 
                href="/explore"
                className="bg-purple-600 text-white px-8 py-4 font-nosifer font-bold text-lg border border-purple-500 hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300"
                style={{
                  textShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                }}
              >
                ENTER THE VOID
              </Link>
              <Link 
                href="/register-artist"
                className="border-2 border-red-500 text-red-400 px-8 py-4 font-nosifer font-bold text-lg hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/50 transition-all duration-300"
                style={{
                  textShadow: '0 0 10px rgba(248, 113, 113, 0.8)'
                }}
              >
                BECOME THE DARKNESS
              </Link>
            </div>
          </div>
        </div>

        {/* Mystical Elements */}
        <div className="absolute top-10 left-10 text-purple-400 opacity-20">
          <div className="font-creepster text-6xl">☾</div>
        </div>
        <div className="absolute bottom-10 right-10 text-red-400 opacity-20">
          <div className="font-creepster text-6xl">☽</div>
        </div>
        <div className="absolute top-1/3 right-20 text-purple-300 opacity-15">
          <div className="font-creepster text-4xl">✧</div>
        </div>
        <div className="absolute bottom-1/3 left-20 text-red-300 opacity-15">
          <div className="font-creepster text-4xl">✦</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 bg-gray-900/50">
        <div className="container">
          <h3 className="font-creepster text-4xl text-center text-purple-400 mb-16" style={{
            textShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
          }}>
            REALMS OF SHADOW
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 border-2 border-purple-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                <span className="text-purple-400 font-creepster text-3xl">🗡</span>
              </div>
              <h4 className="font-nosifer text-xl text-purple-400 mb-4 tracking-wider">BLACKWORK MASTERS</h4>
              <p className="font-nosifer text-gray-300 leading-relaxed text-sm">
                Artists who specialize in dark blackwork, occult symbols, and gothic imagery that speaks to the soul.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 border-2 border-red-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-red-500/50 transition-all duration-300">
                <span className="text-red-400 font-creepster text-3xl">🔮</span>
              </div>
              <h4 className="font-nosifer text-xl text-red-400 mb-4 tracking-wider">MYSTICAL DESIGNS</h4>
              <p className="font-nosifer text-gray-300 leading-relaxed text-sm">
                From ancient runes to modern dark art, find artists who channel otherworldly inspiration into skin.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 border-2 border-purple-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                <span className="text-purple-400 font-creepster text-3xl">⚰</span>
              </div>
              <h4 className="font-nosifer text-xl text-purple-400 mb-4 tracking-wider">HAUNTED PARLORS</h4>
              <p className="font-nosifer text-gray-300 leading-relaxed text-sm">
                Sacred spaces where darkness meets artistry, each studio carefully curated for the gothic experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Back */}
      <div className="relative z-10 py-8 text-center border-t border-gray-800">
      </div>
    </div>
  )
} 