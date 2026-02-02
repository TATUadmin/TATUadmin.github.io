'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterArtist() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    experience: '',
    styles: [] as string[],
    instagram: '',
    portfolio: '',
    shopName: '',
    aboutMe: ''
  });

  const [currentStep, setCurrentStep] = useState(1);

  const experienceLevels = [
    '1-2 years',
    '3-5 years', 
    '6-10 years',
    '10+ years'
  ];

  const tattooStyles = [
    'Traditional', 'Realism', 'Watercolor', 'Geometric', 
    'Blackwork', 'Neo-Traditional', 'Tribal', 'Japanese',
    'Portrait', 'Abstract', 'Dotwork', 'Minimalist'
  ];

  const handleStyleToggle = (style: string) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // First, create the user account with ARTIST role
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'ARTIST',
          terms: true,
          artistSpecialties: formData.styles,
        }),
      });

      // Read response body once
      let signupData
      try {
        signupData = await signupResponse.json()
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError)
        throw new Error('Invalid response from server')
      }

      if (!signupResponse.ok) {
        throw new Error(signupData.message || signupData.error || 'Failed to create account')
      }
      
      // Then update the artist profile with additional information
      if (signupData.userId) {
        const profileResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            location: formData.city,
            instagram: formData.instagram,
            website: formData.portfolio,
            bio: formData.aboutMe,
            specialties: formData.styles,
          }),
        });

        if (!profileResponse.ok) {
          console.warn('Account created but profile update failed');
        }
      }

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login?message=Account created successfully. Please check your email to verify your account.';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black">
        <div className="container py-6">
          <Link href="/" className="inline-block">
            <img 
              src="/tatu-logo.png" 
              alt="TATU Logo" 
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-surface border border-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Early Artist Program - Limited Spots</span>
            </div>

            <h1 className="display text-4xl md:text-5xl text-white mb-6">
              Join the Future of
              <br />
              <span className="text-white">
                Tattoo Artistry
              </span>
            </h1>
            
            <p className="body text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Connect with premium clients, showcase your portfolio globally, and grow your business with the world's most sophisticated tattoo platform.
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="card p-6">
                <div className="w-12 h-12 bg-surface-2 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="headline text-white mb-2">Premium Clients</h3>
                <p className="body text-gray-400 text-sm">Access high-value clients actively seeking quality work</p>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 bg-surface-2 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="headline text-white mb-2">Business Growth</h3>
                <p className="body text-gray-400 text-sm">Analytics, booking management, and growth tools</p>
              </div>

              <div className="card p-6">
                <div className="w-12 h-12 bg-surface-2 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="headline text-white mb-2">Zero Fees</h3>
                <p className="body text-gray-400 text-sm">Early artists get free access for the first 6 months</p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="card p-8">
            <div className="mb-8">
              <h2 className="display text-2xl text-white mb-2">Artist Application</h2>
              <p className="body text-gray-400">Tell us about yourself and your artistry</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="Your professional name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                  placeholder="At least 8 characters with uppercase, lowercase, number, and special character"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Must contain uppercase, lowercase, number, and special character
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    City/Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Experience Level *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, experience: level})}
                      className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                        formData.experience === level
                          ? 'bg-surface-2 border-white text-white'
                          : 'border-gray-600 text-gray-400 hover:bg-surface-2 hover:text-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tattoo Styles */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Your Specialty Styles * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {tattooStyles.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleToggle(style)}
                      className={`p-3 border rounded-xl text-sm font-medium transition-all ${
                        formData.styles.includes(style)
                          ? 'bg-surface-2 border-white text-white'
                          : 'border-gray-600 text-gray-400 hover:bg-surface-2 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social & Portfolio */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="@yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Shop/Studio Name
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200"
                  placeholder="Studio/Shop name (if applicable)"
                />
              </div>

              {/* About Me */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tell Us About Your Art
                </label>
                <textarea
                  value={formData.aboutMe}
                  onChange={(e) => setFormData({...formData, aboutMe: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600/50 focus:border-gray-600 transition-all duration-200 resize-none"
                  placeholder="Describe your artistic style, approach, and what makes your work unique..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-300 text-sm">
                  Account created successfully! Redirecting to login...
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || success}
                  className="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : success ? 'Account Created!' : 'Create Artist Account'}
                </button>
                
                <p className="text-gray-400 text-sm text-center mt-4">
                  {success 
                    ? 'Please check your email to verify your account.'
                    : 'You\'ll receive a verification email after signup.'}
                </p>
              </div>
            </form>
          </div>

          {/* Social Proof */}
          <div className="text-center mt-12">
            <p className="body text-gray-400 mb-6">Join hundreds of artists already building their future with TATU</p>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="display text-2xl text-white mb-1">500+</div>
                <div className="body text-gray-400 text-sm">Artists Applied</div>
              </div>
              <div>
                <div className="display text-2xl text-white mb-1">$2.5M+</div>
                <div className="body text-gray-400 text-sm">Artist Earnings</div>
              </div>
              <div>
                <div className="display text-2xl text-white mb-1">4.9★</div>
                <div className="body text-gray-400 text-sm">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 