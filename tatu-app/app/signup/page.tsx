'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })
  const router = useRouter()

  const validatePasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Enterprise-grade validation
    if (!formData.terms) {
      toast.error('You must accept the terms and conditions')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Check all password requirements
    if (!passwordStrength.hasMinLength || !passwordStrength.hasUppercase || 
        !passwordStrength.hasLowercase || !passwordStrength.hasNumber || 
        !passwordStrength.hasSpecial) {
      toast.error('Password does not meet security requirements')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          terms: formData.terms,
          role: 'CUSTOMER'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account created successfully! Please check your email to verify your account.')
        router.push('/login')
      } else {
        toast.error(data.message || data.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Update password strength indicator in real-time
    if (field === 'password' && typeof value === 'string') {
      validatePasswordStrength(value)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      await signIn('google', {
        callbackUrl: '/profile-setup',
        redirect: true
      })
    } catch (error) {
      console.error('Google sign up error:', error)
      toast.error('Failed to sign up with Google')
      setIsLoading(false)
    }
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

        {/* Authentication Status */}
        <div className="bg-surface border border-gray-600 rounded-lg p-4 text-center">
          <p className="text-white text-sm font-medium">🔐 Secure Registration</p>
          <p className="text-gray-400 text-xs mt-1">Create your TATU account</p>
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
                className="input"
                placeholder="Create a password"
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400 font-medium">Password must contain:</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordStrength.hasMinLength ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.hasMinLength ? '✓' : '○'}
                      </span>
                      <span className={passwordStrength.hasMinLength ? 'text-green-500' : 'text-gray-400'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.hasUppercase ? '✓' : '○'}
                      </span>
                      <span className={passwordStrength.hasUppercase ? 'text-green-500' : 'text-gray-400'}>
                        One uppercase letter (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.hasLowercase ? '✓' : '○'}
                      </span>
                      <span className={passwordStrength.hasLowercase ? 'text-green-500' : 'text-gray-400'}>
                        One lowercase letter (a-z)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.hasNumber ? '✓' : '○'}
                      </span>
                      <span className={passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-400'}>
                        One number (0-9)
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-2 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-500'}`}>
                        {passwordStrength.hasSpecial ? '✓' : '○'}
                      </span>
                      <span className={passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'}>
                        One special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
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

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-white cursor-pointer"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
                I agree to the{' '}
                <Link href="/terms" className="text-white hover:text-gray-300 underline" target="_blank">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-white hover:text-gray-300 underline" target="_blank">
                  Privacy Policy
                </Link>
              </label>
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
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="btn btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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