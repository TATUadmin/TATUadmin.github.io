'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function StylesPage() {
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null)

  const styles = [
    {
      id: 'industrial',
      name: 'Industrial',
      description: 'Bold, powerful fonts like Bebas Neue and Oswald with strong geometric layouts',
      fonts: ['Bebas Neue', 'Oswald'],
      colors: ['Black', 'White', 'Gray'],
      vibe: 'Strong • Bold • Modern • Powerful',
      href: '/styles/industrial'
    },
    {
      id: 'futuristic',
      name: 'Futuristic',
      description: 'Sci-fi aesthetic with Orbitron font, neon effects, and digital styling',
      fonts: ['Orbitron'],
      colors: ['Cyan', 'Purple', 'Green', 'Dark Gray'],
      vibe: 'Tech • Neon • Digital • Advanced',
      href: '/styles/futuristic'
    },
    {
      id: 'grunge',
      name: 'Grunge / Street',
      description: 'Raw street art style with Bangers and Permanent Marker fonts',
      fonts: ['Bangers', 'Permanent Marker'],
      colors: ['Red', 'Yellow', 'Black', 'White'],
      vibe: 'Raw • Street • Rebellious • Artistic',
      href: '/styles/grunge'
    },
    {
      id: 'classic',
      name: 'Classic / Traditional',
      description: 'Vintage tattoo parlor aesthetic with Playfair Display and Crimson Text fonts',
      fonts: ['Playfair Display', 'Crimson Text'],
      colors: ['Amber', 'Cream', 'Brown', 'Gold'],
      vibe: 'Timeless • Elegant • Vintage • Traditional',
      href: '/styles/classic'
    },
    {
      id: 'minimalist',
      name: 'Minimalist / Modern',
      description: 'Clean, sophisticated design with Inter font and modern layouts',
      fonts: ['Inter'],
      colors: ['White', 'Black', 'Gray'],
      vibe: 'Clean • Refined • Contemporary • Minimal',
      href: '/styles/minimalist'
    },
    {
      id: 'gothic',
      name: 'Gothic / Dark',
      description: 'Dark, mystical aesthetic with Creepster and Nosifer fonts',
      fonts: ['Creepster', 'Nosifer'],
      colors: ['Purple', 'Red', 'Black', 'Dark Gray'],
      vibe: 'Dark • Mystical • Gothic • Dramatic',
      href: '/styles/gothic'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <Link href="/" className="text-gray-600 hover:text-black mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-black mb-4">
            TATU Style Variants
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl">
            Explore different aesthetic approaches for the TATU tattoo marketplace. Each style uses different fonts and design elements to appeal to various tattoo culture segments.
          </p>
        </div>
      </div>

      {/* Style Grid */}
      <div className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {styles.map((style) => (
            <Link
              key={style.id}
              href={style.href}
              className="group block"
              onMouseEnter={() => setHoveredStyle(style.id)}
              onMouseLeave={() => setHoveredStyle(null)}
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-gray-300">
                {/* Preview Header */}
                <div className={`h-32 flex items-center justify-center text-white font-bold text-2xl transition-all duration-300 ${
                  style.id === 'industrial' ? 'bg-black font-bebas tracking-[0.3em]' :
                  style.id === 'futuristic' ? 'bg-gray-950 font-orbitron tracking-[0.2em]' :
                  style.id === 'grunge' ? 'bg-gray-900 font-bangers tracking-wider transform -rotate-1' :
                  style.id === 'classic' ? 'bg-amber-800 font-playfair tracking-[0.2em]' :
                  style.id === 'minimalist' ? 'bg-white text-black font-inter tracking-[0.3em] font-light' :
                  style.id === 'gothic' ? 'bg-gray-950 font-creepster tracking-[0.1em]' :
                  'bg-gray-900 font-bangers tracking-wider transform -rotate-1'
                } ${hoveredStyle === style.id ? 'scale-105' : ''}`}>
                  {style.id === 'futuristic' ? (
                    <span style={{
                      textShadow: '0 0 20px cyan, 0 0 40px cyan',
                      filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
                    }}>
                      TATU
                    </span>
                  ) : style.id === 'grunge' ? (
                    <span style={{
                      textShadow: '4px 4px 0px #dc2626, 8px 8px 0px #991b1b',
                      filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.5))'
                    }}>
                      TATU
                    </span>
                  ) : style.id === 'classic' ? (
                    <span style={{
                      textShadow: '2px 2px 4px rgba(120, 53, 15, 0.8)',
                      color: '#fefdf7'
                    }}>
                      TATU
                    </span>
                  ) : style.id === 'minimalist' ? (
                    <span className="text-black">
                      TATU
                    </span>
                  ) : style.id === 'gothic' ? (
                    <span style={{
                      textShadow: '0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(168, 85, 247, 0.4)',
                      color: '#a855f7'
                    }}>
                      TATU
                    </span>
                  ) : (
                    <span className="text-shadow-lg">TATU</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-playfair text-2xl font-bold text-black mb-2">
                    {style.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {style.description}
                  </p>

                  {/* Fonts */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">FONTS:</h4>
                    <div className="flex flex-wrap gap-2">
                      {style.fonts.map((font) => (
                        <span key={font} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {font}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">COLORS:</h4>
                    <div className="flex flex-wrap gap-2">
                      {style.colors.map((color) => (
                        <span key={color} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Vibe */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">VIBE:</h4>
                    <p className="text-gray-600 text-sm font-medium">{style.vibe}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="btn-primary group-hover:bg-gray-800 transition-colors duration-300">
                      View Style →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-xl p-8 border border-gray-200">
          <h2 className="font-playfair text-3xl font-bold text-black mb-4">
            Font Psychology in Tattoo Culture
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-600">
            <div>
              <h3 className="font-semibold text-black mb-2">Industrial Style</h3>
              <p className="text-sm leading-relaxed">
                Appeals to those seeking bold, statement pieces. Strong geometric fonts convey reliability and power, perfect for traditional and blackwork styles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Futuristic Style</h3>
              <p className="text-sm leading-relaxed">
                Attracts tech-savvy clients and those interested in cyberpunk, geometric, and avant-garde tattoo styles. The digital aesthetic suggests innovation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Grunge Style</h3>
              <p className="text-sm leading-relaxed">
                Resonates with traditional tattoo culture, street art enthusiasts, and those seeking authentic, raw artistic expression with rebellious energy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Classic Style</h3>
              <p className="text-sm leading-relaxed">
                Appeals to clients who appreciate timeless elegance and traditional tattoo parlor atmosphere. Perfect for vintage americana and old-school designs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Minimalist Style</h3>
              <p className="text-sm leading-relaxed">
                Attracts modern professionals and those interested in fine line work, geometric designs, and contemporary minimalist tattoo styles.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">Gothic Style</h3>
              <p className="text-sm leading-relaxed">
                Resonates with those drawn to dark art, occult symbolism, and mystical designs. Appeals to gothic and alternative culture enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 