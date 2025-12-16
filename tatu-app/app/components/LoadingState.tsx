'use client'

interface LoadingStateProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse'
}

export default function LoadingState({ 
  size = 'md', 
  message, 
  fullScreen = false,
  variant = 'spinner'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const renderSpinner = () => (
    <svg 
      className={`animate-spin ${sizeClasses[size]} text-white`}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const renderDots = () => (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  )

  const renderBars = () => (
    <div className="flex space-x-1 items-end h-8">
      <div className="w-2 bg-white animate-pulse" style={{ height: '30%', animationDelay: '0ms' }}></div>
      <div className="w-2 bg-white animate-pulse" style={{ height: '60%', animationDelay: '150ms' }}></div>
      <div className="w-2 bg-white animate-pulse" style={{ height: '100%', animationDelay: '300ms' }}></div>
      <div className="w-2 bg-white animate-pulse" style={{ height: '50%', animationDelay: '450ms' }}></div>
    </div>
  )

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} bg-white rounded-full animate-pulse`}></div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'bars':
        return renderBars()
      case 'pulse':
        return renderPulse()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {message && (
        <p className="text-gray-400 text-sm text-center">{message}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

// Skeleton Loader Component
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string
  height?: string
  className?: string
  count?: number
}

export function Skeleton({ 
  variant = 'rectangular', 
  width, 
  height, 
  className = '',
  count = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-800'
  
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
    card: 'rounded-lg'
  }

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  )

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{skeletonElement}</div>
        ))}
      </div>
    )
  }

  return skeletonElement
}

// Card Skeleton
export function CardSkeleton({ count = 1 }: { count?: number }) {
  const card = (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="text" count={3} />
    </div>
  )

  if (count > 1) {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>{card}</div>
        ))}
      </div>
    )
  }

  return card
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <Skeleton variant="text" width="200px" />
      </div>
      <div className="divide-y divide-gray-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-6 flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <Skeleton variant="text" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// Gallery Skeleton
export function GallerySkeleton({ items = 8 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <Skeleton variant="rectangular" height="200px" />
          <div className="p-4 space-y-2">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  )
}

