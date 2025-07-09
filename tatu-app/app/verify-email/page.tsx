'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) {
          setStatus('error')
          setError('Missing verification token')
          return
        }

        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setError(data.error || 'Failed to verify email')
          return
        }

        setStatus('success')
        setTimeout(() => {
          router.push('/login?verified=true')
        }, 3000)
      } catch (error) {
        setStatus('error')
        setError('An error occurred while verifying your email')
      }
    }

    verifyEmail()
  }, [router, searchParams])

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