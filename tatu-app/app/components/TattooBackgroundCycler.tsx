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
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Filter out failed images (must be before hooks)
  const availableImages = tattooImages.filter(img => !failedImages.has(img))
  const availableImagesLength = availableImages.length

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
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % availableImagesLength
        return nextIndex
      })
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [availableImagesLength])

  // Adjust current index if needed
  useEffect(() => {
    if (currentImageIndex >= availableImagesLength && availableImagesLength > 0) {
      setCurrentImageIndex(0)
    }
  }, [availableImagesLength, currentImageIndex])

  // Function to determine filter based on image and screen size
  const getImageFilter = (imageSrc: string, isMobile: boolean) => {
    if (debugMode) return 'none'
    
    if (isMobile) {
      // Mobile: Invert colors for all images except bg-3 and bg-6, then apply individual adjustments with reduced brightness
      const filterMap: { [key: string]: string } = {
        '/tattoo-bg-1.png': 'invert(1) brightness(0.9) contrast(1.2) opacity(0.6)', // Invert + reduced brightness
        '/tattoo-bg-2.png': 'invert(1) brightness(0.75) contrast(1.1) opacity(0.6)', // Invert + reduced brightness
        '/tattoo-bg-3.png': 'brightness(0.6) contrast(1.0) opacity(0.6)', // No invert - reduced brightness
        '/tattoo-bg-4.png': 'invert(1) brightness(0.8) contrast(1.2) opacity(0.6)', // Invert + reduced brightness
        '/tattoo-bg-5.png': 'invert(1) brightness(0.7) contrast(1.1) opacity(0.6)', // Invert + reduced brightness
        '/tattoo-bg-6.png': 'brightness(0.65) contrast(1.0) opacity(0.6)', // No invert - reduced brightness
        '/tattoo-bg-7.png': 'invert(1) brightness(0.85) contrast(1.3) opacity(0.6)', // Invert + reduced brightness
        '/tattoo-bg-8.png': 'invert(1) brightness(0.75) contrast(1.1) opacity(0.6)', // Invert + reduced brightness
      }
      return filterMap[imageSrc] || 'invert(1) brightness(1.5) contrast(1.1) opacity(0.6)'
    } else {
      // Desktop: Original images with color inversion for most
      const filterMap: { [key: string]: string } = {
        '/tattoo-bg-1.png': 'invert(1)', // Original with color inversion
        '/tattoo-bg-2.png': 'invert(1)', // Original with color inversion
        '/tattoo-bg-3.png': 'none', // Original images from public folder
        '/tattoo-bg-4.png': 'invert(1)', // Original with color inversion
        '/tattoo-bg-5.png': 'invert(1)', // Original with color inversion
        '/tattoo-bg-6.png': 'none', // Original images from public folder
        '/tattoo-bg-7.png': 'invert(1)', // Original with color inversion
        '/tattoo-bg-8.png': 'invert(1)', // Original with color inversion
      }
      return filterMap[imageSrc] || 'invert(1) brightness(1.9) contrast(1.1) opacity(0.6)'
    }
  }

  if (!isLoaded) return null

  const handleImageError = (imageSrc: string) => {
    console.error(`Failed to load image: ${imageSrc}`)
    setFailedImages(prev => new Set([...prev, imageSrc]))
  }

  if (availableImages.length === 0) {
    return null // Don't render if all images failed
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden tattoo-background-cycler flex items-center">
      {availableImages.map((imageSrc, index) => {
        const originalIndex = tattooImages.indexOf(imageSrc)
        const isCurrent = index === currentImageIndex
        
        return (
          <div
            key={imageSrc}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isCurrent ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              zIndex: 1
            }}
          >
            <div 
              className="relative w-full h-full flex items-center justify-center"
              style={{
                transform: 'scale(0.85) translateY(-10%)', // Mobile positioning
                transformOrigin: 'center center'
              }}
            >
              {/* Mobile version */}
              <Image
                src={imageSrc}
                alt={`Tattoo design ${originalIndex + 1}`}
                fill
                priority={isCurrent} // Prioritize loading the current image
                className="object-contain object-center tattoo-background-image lg:hidden"
                style={{
                  filter: getImageFilter(imageSrc, true), // Mobile styling
                  mixBlendMode: 'normal',
                  objectPosition: 'center center'
                }}
                sizes="50vw"
                quality={85}
                unoptimized={true} // Disable optimization to prevent errors
                onError={() => handleImageError(imageSrc)}
              />
              
              {/* Desktop version */}
              <Image
                src={imageSrc}
                alt={`Tattoo design ${originalIndex + 1}`}
                fill
                priority={isCurrent} // Prioritize loading the current image
                className="object-contain object-center tattoo-background-image hidden lg:block"
                style={{
                  filter: getImageFilter(imageSrc, false), // Desktop styling
                  mixBlendMode: 'normal',
                  objectPosition: 'center center',
                  transform: 'scale(0.85) translateY(10%)' // Desktop: moved down
                }}
                sizes="50vw"
                quality={85}
                unoptimized={true} // Disable optimization to prevent errors
                onError={() => handleImageError(imageSrc)}
              />
            </div>
          </div>
        )
      })}
      
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