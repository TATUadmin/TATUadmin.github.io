'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const hasVerified = useRef(false) // Track if verification has been attempted

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified.current) {
      return
    }

    const verifyEmail = async () => {
      // Mark as attempted immediately to prevent re-runs
      hasVerified.current = true

      try {
        // Get token from URL params, handling both encoded and unencoded
        const tokenParam = searchParams.get('token')
        const token = tokenParam ? decodeURIComponent(tokenParam) : null
        
        if (!token) {
          setStatus('error')
          setError('Missing verification token. Please check your email for the complete verification link.')
          return
        }


        const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setError(data.error || 'Failed to verify email')
          return
        }

        setStatus('success')
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 2000)
      } catch (error) {
        console.error('Email verification error:', error)
        setStatus('error')
        setError('An error occurred while verifying your email. Please try again or contact support.')
      }
    }

    verifyEmail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'loading' && (
              <div className="text-gray-600">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-green-600">
                <svg
                  className="h-12 w-12 mx-auto text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="mt-2">Your email has been verified successfully!</p>
                <p className="mt-1 text-sm">
                  Redirecting you to login...
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-red-600">
                <svg
                  className="h-12 w-12 mx-auto text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="mt-2">{error}</p>
                <Link
                  href="/login"
                  className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Return to login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
} 