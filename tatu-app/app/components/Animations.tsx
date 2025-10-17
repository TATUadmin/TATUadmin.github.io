'use client'

import { ReactNode, useEffect, useState } from 'react'

// Fade In Animation
interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ children, delay = 0, duration = 300, className = '' }: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Slide In Animation
interface SlideInProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up', 
  delay = 0, 
  duration = 300,
  className = '' 
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)'
    
    switch (direction) {
      case 'up':
        return 'translate(0, 20px)'
      case 'down':
        return 'translate(0, -20px)'
      case 'left':
        return 'translate(20px, 0)'
      case 'right':
        return 'translate(-20px, 0)'
    }
  }

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Scale In Animation
interface ScaleInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({ children, delay = 0, duration = 300, className = '' }: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        transitionDuration: `${duration}ms`
      }}
    >
      {children}
    </div>
  )
}

// Stagger Children Animation
interface StaggerProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

export function Stagger({ children, staggerDelay = 50, className = '' }: StaggerProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// Intersection Observer based animation
interface AnimateOnScrollProps {
  children: ReactNode
  animationType?: 'fade' | 'slide-up' | 'slide-left' | 'scale'
  threshold?: number
  rootMargin?: string
  className?: string
}

export function AnimateOnScroll({
  children,
  animationType = 'fade',
  threshold = 0.1,
  rootMargin = '0px',
  className = ''
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(ref)

    return () => observer.disconnect()
  }, [ref, threshold, rootMargin])

  const getStyles = () => {
    const baseStyles = {
      transition: 'all 600ms cubic-bezier(0.4, 0, 0.2, 1)',
    }

    if (!isVisible) {
      switch (animationType) {
        case 'slide-up':
          return { ...baseStyles, opacity: 0, transform: 'translateY(30px)' }
        case 'slide-left':
          return { ...baseStyles, opacity: 0, transform: 'translateX(30px)' }
        case 'scale':
          return { ...baseStyles, opacity: 0, transform: 'scale(0.9)' }
        default:
          return { ...baseStyles, opacity: 0 }
      }
    }

    return { ...baseStyles, opacity: 1, transform: 'translate(0, 0) scale(1)' }
  }

  return (
    <div ref={setRef} style={getStyles()} className={className}>
      {children}
    </div>
  )
}

// Ripple effect for buttons
interface RippleProps {
  duration?: number
  color?: string
}

export function useRipple({ duration = 600, color = 'rgba(255, 255, 255, 0.5)' }: RippleProps = {}) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; size: number; id: number }>>([])

  const addRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    const id = Date.now()

    setRipples(prev => [...prev, { x, y, size, id }])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id))
    }, duration)
  }

  const RippleContainer = () => (
    <span style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            borderRadius: '50%',
            backgroundColor: color,
            transform: 'scale(0)',
            animation: `ripple ${duration}ms ease-out`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  )

  return { addRipple, RippleContainer }
}

// Shimmer loading effect
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-800 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

// Pulse Animation
export function Pulse({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  )
}

// Bounce Animation
export function Bounce({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-bounce ${className}`}>
      {children}
    </div>
  )
}

// Spin Animation
export function Spin({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-spin ${className}`}>
      {children}
    </div>
  )
}

// Hover Scale Effect
export function HoverScale({ 
  children, 
  scale = 1.05,
  className = '' 
}: { 
  children: ReactNode
  scale?: number
  className?: string 
}) {
  return (
    <div 
      className={`transition-transform duration-200 hover:scale-${Math.round(scale * 100)} ${className}`}
      style={{ '--tw-scale-x': scale, '--tw-scale-y': scale } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// Progress Bar Animation
interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '',
  showLabel = false,
  animated = true
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={`relative ${className}`}>
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-white ${animated ? 'transition-all duration-500 ease-out' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-400 mt-1 block text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  )
}

