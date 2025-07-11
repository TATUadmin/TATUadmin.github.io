'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur border-b border-gray-900">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              style={{ height: '32px', width: 'auto', marginRight: '0.5rem' }}
              className="inline-block align-middle"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/explore" 
              className="label text-gray-400 hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link 
              href="/how-it-works" 
              className="label text-gray-400 hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link 
              href="/about" 
              className="label text-gray-400 hover:text-white transition-colors"
            >
              About
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="body text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
                    </span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="btn btn-ghost text-sm px-4 py-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="btn btn-ghost">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn btn-primary">
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-900 backdrop-blur">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/explore" 
                className="label text-gray-400 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/how-it-works" 
                className="label text-gray-400 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link 
                href="/about" 
                className="label text-gray-400 hover:text-white transition-colors px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="border-t border-gray-900 pt-4 px-4">
                {session ? (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href="/dashboard" 
                      className="body text-gray-400 hover:text-white transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsMenuOpen(false)
                      }}
                      className="btn btn-ghost text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link 
                      href="/auth/signin" 
                      className="btn btn-ghost"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup" 
                      className="btn btn-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Join
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
} 