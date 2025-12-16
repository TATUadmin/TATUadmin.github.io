'use client'

import { 
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export type ErrorType = 'error' | 'warning' | 'info' | 'not-found'

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  fullScreen?: boolean
  icon?: React.ReactNode
}

export default function ErrorState({ 
  type = 'error',
  title,
  message,
  action,
  fullScreen = false,
  icon
}: ErrorStateProps) {
  const getDefaultIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="w-16 h-16 text-blue-500" />
      case 'not-found':
        return (
          <div className="text-6xl font-bold text-gray-700">404</div>
        )
      default:
        return <XCircleIcon className="w-16 h-16 text-red-500" />
    }
  }

  const getDefaultTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warning'
      case 'info':
        return 'Information'
      case 'not-found':
        return 'Page Not Found'
      default:
        return 'Something went wrong'
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case 'not-found':
        return "The page you're looking for doesn't exist or has been moved."
      default:
        return 'An unexpected error occurred. Please try again later.'
    }
  }

  const content = (
    <div className="flex flex-col items-center justify-center text-center space-y-6 p-8">
      <div className="flex items-center justify-center">
        {icon || getDefaultIcon()}
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {title || getDefaultTitle()}
        </h2>
        <p className="text-gray-400 max-w-md">
          {message || getDefaultMessage()}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          {action.label}
        </button>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="max-w-2xl mx-auto px-4">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg">
      {content}
    </div>
  )
}

// Inline Error Message Component
interface ErrorMessageProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  className?: string
}

export function ErrorMessage({ message, type = 'error', className = '' }: ErrorMessageProps) {
  const typeStyles = {
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }

  const typeIcons = {
    error: <XCircleIcon className="w-5 h-5 flex-shrink-0" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />,
    info: <InformationCircleIcon className="w-5 h-5 flex-shrink-0" />
  }

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]} ${className}`}>
      <div className="flex items-start space-x-3">
        {typeIcons[type]}
        <p className="text-sm flex-1">{message}</p>
      </div>
    </div>
  )
}

// Form Field Error Component
interface FieldErrorProps {
  message?: string
  className?: string
}

export function FieldError({ message, className = '' }: FieldErrorProps) {
  if (!message) return null

  return (
    <p className={`mt-2 text-sm text-red-500 flex items-center ${className}`}>
      <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
      {message}
    </p>
  )
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-lg p-12 text-center ${className}`}>
      {icon && (
        <div className="flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-gray-400 text-sm mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

