'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const router = useRouter()
  const role = searchParams.get('role') || 'CUSTOMER' // Default to CUSTOMER if no role specified

  // Password validation checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  }

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length
  const showPasswordIndicator = passwordFocused || formData.password.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    // Validate password requirements
    const passwordRegex = {
      uppercase: /[A-Z]/,
      lowercase: /[a-z]/,
      number: /[0-9]/,
      special: /[^A-Za-z0-9]/
    }

    if (!passwordRegex.uppercase.test(formData.password)) {
      toast.error('Password must contain at least one uppercase letter')
      setIsLoading(false)
      return
    }

    if (!passwordRegex.lowercase.test(formData.password)) {
      toast.error('Password must contain at least one lowercase letter')
      setIsLoading(false)
      return
    }

    if (!passwordRegex.number.test(formData.password)) {
      toast.error('Password must contain at least one number')
      setIsLoading(false)
      return
    }

    if (!passwordRegex.special.test(formData.password)) {
      toast.error('Password must contain at least one special character')
      setIsLoading(false)
      return
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: role === 'client' ? 'CUSTOMER' : 'CUSTOMER', // Ensure it's CUSTOMER for client signup
          terms: true,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError)
        const text = await response.text()
        console.error('Response text:', text)
        throw new Error('Invalid response from server')
      }

      if (response.ok) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/login')
      } else {
        // Show more specific error messages
        if (data.errors && Array.isArray(data.errors)) {
          // Zod validation errors
          const errorMessages = data.errors.map((err: any) => err.message).join(', ')
          toast.error(errorMessages || 'Validation failed')
        } else if (data.message) {
          toast.error(data.message)
        } else {
          toast.error(data.error || 'Failed to create account')
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.')
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <h2 className="display text-3xl text-white mb-2">
            Join TATU
          </h2>
          <p className="body text-gray-400">
            Create your account to get started
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="input"
                placeholder="Create a password"
              />
              {showPasswordIndicator && (
                <div className="mt-3 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${passwordChecks.length ? 'text-green-400' : 'text-gray-500'}`}>
                        {passwordChecks.length ? '✓' : '○'}
                      </span>
                      <span className={passwordChecks.length ? 'text-gray-300' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                        {passwordChecks.uppercase ? '✓' : '○'}
                      </span>
                      <span className={passwordChecks.uppercase ? 'text-gray-300' : 'text-gray-500'}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                        {passwordChecks.lowercase ? '✓' : '○'}
                      </span>
                      <span className={passwordChecks.lowercase ? 'text-gray-300' : 'text-gray-500'}>
                        One lowercase letter
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${passwordChecks.number ? 'text-green-400' : 'text-gray-500'}`}>
                        {passwordChecks.number ? '✓' : '○'}
                      </span>
                      <span className={passwordChecks.number ? 'text-gray-300' : 'text-gray-500'}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${passwordChecks.special ? 'text-green-400' : 'text-gray-500'}`}>
                        {passwordChecks.special ? '✓' : '○'}
                      </span>
                      <span className={passwordChecks.special ? 'text-gray-300' : 'text-gray-500'}>
                        One special character
                      </span>
                    </div>
                  </div>
                  {formData.password.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Password strength</span>
                        <span className="text-xs text-gray-400">{passwordStrength}/5</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength <= 2 ? 'bg-red-500' :
                            passwordStrength <= 3 ? 'bg-yellow-500' :
                            passwordStrength <= 4 ? 'bg-blue-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="input"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{borderColor: '#171717'}} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert('Google sign up coming soon!')}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center">
            <span className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-white hover:text-gray-300 transition-colors font-medium">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
} 