'use client'

import { useEffect, useState } from 'react'

interface TattooLineProps {
  style?: 'minimalist' | 'traditional' | 'geometric' | 'floral' | 'abstract'
  duration?: number
  delay?: number
  position?: { x: number; y: number }
  scale?: number
}

const TattooLineAnimation = ({ 
  style = 'minimalist', 
  duration = 8000, 
  delay = 0,
  position = { x: 50, y: 50 },
  scale = 1
}: TattooLineProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (prefersReducedMotion.matches) {
      setIsVisible(false)
      return
    }

    setIsVisible(true)
  }, [])

  // Don't render if user prefers reduced motion
  if (!isVisible) return null

  const getTattooPath = (style: string) => {
    switch (style) {
      case 'minimalist':
        return "M50,20 Q80,40 100,80 Q120,120 90,160 Q60,180 30,150 Q10,110 40,80 Q70,50 50,20"
      
      case 'traditional':
        return "M40,30 Q60,10 80,30 Q100,50 90,80 L85,85 Q90,90 95,100 Q100,120 80,140 Q60,160 40,140 Q20,120 25,100 Q30,90 35,85 L30,80 Q20,50 40,30 M50,60 Q60,70 50,80 Q40,70 50,60"
      
      case 'geometric':
        return "M50,20 L80,50 L80,80 L50,110 L20,80 L20,50 Z M40,40 L60,40 L70,60 L60,80 L40,80 L30,60 Z"
      
      case 'floral':
        return "M60,40 Q80,20 100,40 Q120,60 100,80 Q80,100 60,80 Q40,100 20,80 Q0,60 20,40 Q40,20 60,40 M60,50 Q65,45 70,50 Q65,55 60,50 M50,60 Q55,55 60,60 Q55,65 50,60"
      
      case 'abstract':
        return "M30,30 Q60,10 90,30 Q120,60 90,90 Q110,120 80,150 Q50,130 20,150 Q-10,120 20,90 Q-10,60 30,30 M50,50 C70,30 90,70 70,90 C50,110 30,70 50,50"
      
      default:
        return "M50,20 Q80,40 100,80 Q120,120 90,160 Q60,180 30,150 Q10,110 40,80 Q70,50 50,20"
    }
  }

  const pathData = getTattooPath(style)
  const animationDuration = `${duration}ms`
  const animationDelay = `${delay}ms`

  return (
    <div 
      className="absolute pointer-events-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        animationDelay,
      }}
    >
      <svg
        width="200"
        height="240"
        viewBox="0 0 140 180"
        className="tattoo-line-animation"
        style={{
          animationDuration,
          animationDelay,
        }}
      >
        <defs>
          {/* Brighter gradient for better visibility */}
          <linearGradient id={`fade-${style}-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.4" />
            <stop offset="50%" stopColor="white" stopOpacity="0.8" />
            <stop offset="70%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          
          {/* Glow effect for enhanced visibility */}
          <filter id={`glow-${style}-${delay}`}>
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path
          d={pathData}
          fill="none"
          stroke={`url(#fade-${style}-${delay})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="tattoo-path"
          filter={`url(#glow-${style}-${delay})`}
          style={{
            animationDuration,
            animationDelay,
          }}
        />
      </svg>
    </div>
  )
}

// Main container component with full viewport coverage
export default function TattooBackgroundAnimation() {
  const tattooStyles: Array<TattooLineProps['style']> = [
    'minimalist', 'traditional', 'geometric', 'floral', 'abstract'
  ]

  // Generate positions across the full viewport
  const generatePositions = () => {
    return Array.from({ length: 12 }, (_, i) => {
      // Distribute across full width and height with some randomization
      const baseX = (i % 4) * 25 + 12.5 // 4 columns: 12.5%, 37.5%, 62.5%, 87.5%
      const baseY = Math.floor(i / 4) * 30 + 20 // 3 rows: 20%, 50%, 80%
      
      return {
        x: baseX + (Math.random() - 0.5) * 15, // Add some variance
        y: baseY + (Math.random() - 0.5) * 20,
        scale: 0.7 + Math.random() * 0.6, // Random scale between 0.7-1.3
        duration: 6000 + (i * 800), // Vary duration: 6-15 seconds
        delay: i * 1200 // Stagger start times
      }
    })
  }

  const [positions] = useState(generatePositions)

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Ensure full viewport coverage */}
      <div className="absolute inset-0 w-full h-full">
        {positions.map((pos, i) => (
          <TattooLineAnimation
            key={i}
            style={tattooStyles[i % tattooStyles.length]}
            duration={pos.duration}
            delay={pos.delay}
            position={{ x: pos.x, y: pos.y }}
            scale={pos.scale}
          />
        ))}
      </div>
    </div>
  )
} 