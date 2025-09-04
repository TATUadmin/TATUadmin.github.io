'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const TattooBackgroundCycler = () => {
  // Array of tattoo background images
  const tattooImages = [
    '/tattoo-bg-1.png',
    '/tattoo-bg-2.png', 
    '/tattoo-bg-3.png',
    '/tattoo-bg-4.png',
    '/tattoo-bg-5.png',
    '/tattoo-bg-6.png',
    '/tattoo-bg-7.png',
    '/tattoo-bg-8.png'
  ]

  // Start with a random image
  const [currentImageIndex, setCurrentImageIndex] = useState(() => 
    Math.floor(Math.random() * tattooImages.length)
  )
  const [isLoaded, setIsLoaded] = useState(false)
  const [debugMode, setDebugMode] = useState(false)

  useEffect(() => {
    // Start the component
    setIsLoaded(true)
    
    // Check for debug mode (add ?debug=true to URL to see without filters)
    setDebugMode(window.location.search.includes('debug=true'))
    
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) {
      return
    }

    // Start the cycling after component mounts
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % tattooImages.length
      )
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [tattooImages.length])

  if (!isLoaded) return null

  // Function to determine filter based on image
  const getImageFilter = (imageSrc: string) => {
    if (debugMode) return 'none'
    
    // Don't apply white filter to tattoo-bg-3.png and tattoo-bg-6.png
    if (imageSrc === '/tattoo-bg-3.png' || imageSrc === '/tattoo-bg-6.png') {
      return 'opacity(0.7)' // Just reduce opacity for visibility
    }
    
    // Apply brighter white filter to other images to match website text
    return 'brightness(0) invert(1) opacity(0.8)'
  }

  return (
    <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden tattoo-background-cycler flex items-center">
      {tattooImages.map((imageSrc, index) => (
        <div
          key={imageSrc}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            zIndex: 1
          }}
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            style={{
              transform: 'scale(0.67)', // Back to previous smaller size
              transformOrigin: 'center center'
            }}
          >
            <Image
              src={imageSrc}
              alt={`Tattoo design ${index + 1}`}
              fill
              priority={index === currentImageIndex} // Prioritize loading the current image
              className="object-contain object-center tattoo-background-image"
              style={{
                filter: getImageFilter(imageSrc),
                mixBlendMode: 'normal',
                objectPosition: 'center center'
              }}
              sizes="50vw"
              quality={85}
              onLoad={() => console.log(`Loaded: ${imageSrc}`)}
              onError={() => console.error(`Failed to load: ${imageSrc}`)}
            />
          </div>
        </div>
      ))}
      
      {/* Debug indicator */}
      {debugMode && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs z-50">
          Debug Mode - Current: {currentImageIndex + 1}
        </div>
      )}
    </div>
  )
}

export default TattooBackgroundCycler 