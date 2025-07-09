'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Signin':
        return 'Try signing in with a different account.'
      case 'OAuthSignin':
        return 'Try signing in with a different account.'
      case 'OAuthCallback':
        return 'Try signing in with a different account.'
      case 'OAuthCreateAccount':
        return 'Try signing in with a different account.'
      case 'EmailCreateAccount':
        return 'Try signing in with a different account.'
      case 'Callback':
        return 'Try signing in with a different account.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'EmailSignin':
        return 'Check your email address.'
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      default:
        return 'Unable to sign in.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            {getErrorMessage(error)}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 