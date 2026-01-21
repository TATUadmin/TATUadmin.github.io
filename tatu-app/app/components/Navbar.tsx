'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const pathname = usePathname()

  // Fetch user avatar
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data?.avatar) {
            setAvatar(data.avatar)
          }
        })
        .catch(err => console.error('Failed to fetch avatar:', err))
    }
  }, [session?.user?.id])

  // Hide navbar on dashboard pages (they have their own navigation)
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-sm border-b bg-black/80" style={{borderColor: '#171717'}}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              style={{ 
                height: '28px', 
                width: 'auto', 
                marginRight: '0.5rem'
              }}
              className="inline-block align-middle"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/about" 
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/explore" 
              className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
            >
              Browse
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={session.user?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-medium">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link 
                  href="/login" 
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-black" style={{borderColor: '#171717'}}>
          <div className="container py-4 space-y-4">
            <Link 
              href="/about" 
              className="block text-gray-400 hover:text-white transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/explore" 
              className="block text-gray-400 hover:text-white transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse
            </Link>
            
            <div className="border-t pt-4" style={{borderColor: '#171717'}}>
              {session ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-4">
                    <div className="w-10 h-10 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={session.user?.name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {session.user?.name || session.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-400 hover:text-white transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="block text-gray-400 hover:text-white transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link 
                    href="/login" 
                    className="block text-gray-400 hover:text-white transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block text-white font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 