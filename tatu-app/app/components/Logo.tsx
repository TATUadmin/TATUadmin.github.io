'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'white' | 'black'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  className?: string
  withUnderline?: boolean
}

export default function Logo({ 
  variant = 'default', 
  size = 'md', 
  href = '/',
  className,
  withUnderline = false
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  const variantClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    black: 'text-black'
  }

  const logoClasses = cn(
    'font-bold transition-all duration-300 hover:scale-105 cursor-pointer',
    'relative inline-block tracking-tight',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const LogoText = () => (
    <div className="group relative">
      <span className={logoClasses}>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TATU
        </span>
      </span>
      <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoText />
      </Link>
    )
  }

  return <LogoText />
}

// Signature logo for special occasions
export function LogatureLogo({ 
  variant = 'default', 
  size = 'md', 
  href = '/',
  className 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  }

  const variantClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    black: 'text-black'
  }

  const logoClasses = cn(
    'font-bold transition-all duration-500 hover:scale-105',
    'font-serif italic tracking-wider',
    'relative inline-block',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const LogoContent = () => (
    <div className="group">
      <span className={logoClasses}>
        Tatu
        <span className="absolute -inset-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

// Minimalist version with icon
export function LogoWithIcon({ 
  variant = 'default', 
  size = 'md', 
  href = '/',
  className 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const variantClasses = {
    default: 'text-gray-900',
    white: 'text-white',
    black: 'text-black'
  }

  const logoClasses = cn(
    'font-bold transition-all duration-300',
    'font-sans tracking-wider',
    sizeClasses[size],
    variantClasses[variant],
    className
  )

  const LogoContent = () => (
    <div className="flex items-center space-x-3 group">
      {/* Elegant needle icon */}
      <div className={cn(
        'flex items-center justify-center transition-all duration-500',
        'group-hover:rotate-12 group-hover:scale-110',
        iconSizeClasses[size]
      )}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M3 21l18-18" />
          <path d="M15 3l6 6" />
          <circle cx="4" cy="20" r="1" />
        </svg>
      </div>
      <span className={logoClasses}>
        TATU
      </span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
} 