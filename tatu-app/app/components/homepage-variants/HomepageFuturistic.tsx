'use client';

import Link from 'next/link'
import Logo from '../Logo'

export default function HomepageFuturistic() {
  return (
    <div className="bg-gray-950 text-white overflow-hidden">
      {/* Hero Section - Futuristic */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gray-950" />
          {/* Animated Grid */}
          <div className="absolute inset-0 opacity-30" 
               style={{
                 backgroundImage: `
                   linear-gradient(cyan 1px, transparent 1px),
                   linear-gradient(90deg, cyan 1px, transparent 1px)
                 `,
                 backgroundSize: '100px 100px',
                 animation: 'pulse 4s ease-in-out infinite'
               }} />
          {/* Glow Effects */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}} />
        </div>

        <div className="container relative z-10 text-center">
          {/* Main Logo */}
          <div className="mb-8">
            <h1 className="font-orbitron text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-[0.2em] mb-6"
                style={{
                  textShadow: '0 0 20px cyan, 0 0 40px cyan, 0 0 60px cyan',
                  filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))'
                }}>
              TATU
            </h1>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-6 shadow-lg shadow-cyan-500/50" />
            <p className="font-orbitron text-lg md:text-xl tracking-[0.3em] text-cyan-300 uppercase font-medium">
              Next-Gen Tattoo Platform
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/explore" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black px-8 py-4 font-orbitron font-bold text-sm tracking-wider uppercase hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
                  style={{
                    boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)'
                  }}>
              Initialize Search
            </Link>
            <Link href="/signup" 
                  className="border-2 border-cyan-400 text-cyan-400 px-8 py-4 font-orbitron font-bold text-sm tracking-wider uppercase hover:bg-cyan-400 hover:text-black transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
              <span className="relative z-10">Join Network</span>
              <div className="absolute inset-0 bg-cyan-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          </div>

          {/* Stats - Digital Display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center border border-cyan-500/30 bg-cyan-500/5 p-4 backdrop-blur-sm">
              <div className="font-orbitron text-3xl md:text-4xl font-black text-cyan-400 mb-2 tracking-wider">
                0500+
              </div>
              <div className="font-orbitron text-xs tracking-widest text-gray-400 uppercase">
                Active Artists
              </div>
            </div>
            <div className="text-center border border-purple-500/30 bg-purple-500/5 p-4 backdrop-blur-sm">
              <div className="font-orbitron text-3xl md:text-4xl font-black text-purple-400 mb-2 tracking-wider">
                10.0K+
              </div>
              <div className="font-orbitron text-xs tracking-widest text-gray-400 uppercase">
                Completed Works
              </div>
            </div>
            <div className="text-center border border-green-500/30 bg-green-500/5 p-4 backdrop-blur-sm">
              <div className="font-orbitron text-3xl md:text-4xl font-black text-green-400 mb-2 tracking-wider">
                050+
              </div>
              <div className="font-orbitron text-xs tracking-widest text-gray-400 uppercase">
                Global Cities
              </div>
            </div>
            <div className="text-center border border-yellow-500/30 bg-yellow-500/5 p-4 backdrop-blur-sm">
              <div className="font-orbitron text-3xl md:text-4xl font-black text-yellow-400 mb-2 tracking-wider">
                24/7
              </div>
              <div className="font-orbitron text-xs tracking-widest text-gray-400 uppercase">
                System Online
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* Features Section - Tech Grid */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-5xl md:text-6xl font-black tracking-wider text-white mb-6 uppercase">
              System Features
            </h2>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto shadow-lg shadow-cyan-500/50" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-cyan-400 mx-auto mb-6 flex items-center justify-center bg-cyan-500/10">
                  <div className="w-8 h-8 bg-cyan-400" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}} />
                </div>
                <h3 className="font-orbitron text-xl font-bold tracking-wider text-cyan-400 mb-4 uppercase text-center">
                  Neural Search
                </h3>
                <p className="font-inter text-gray-300 leading-relaxed text-center">
                  Advanced AI-powered artist matching based on style preferences and location data.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-purple-400 mx-auto mb-6 flex items-center justify-center bg-purple-500/10">
                  <div className="w-8 h-8 bg-purple-400 rounded-full" />
                </div>
                <h3 className="font-orbitron text-xl font-bold tracking-wider text-purple-400 mb-4 uppercase text-center">
                  Quantum Connect
                </h3>
                <p className="font-inter text-gray-300 leading-relaxed text-center">
                  Instant messaging and consultation booking with encrypted communication protocols.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-16 h-16 border-2 border-green-400 mx-auto mb-6 flex items-center justify-center bg-green-500/10">
                  <div className="w-8 h-8 bg-green-400" style={{clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'}} />
                </div>
                <h3 className="font-orbitron text-xl font-bold tracking-wider text-green-400 mb-4 uppercase text-center">
                  Digital Canvas
                </h3>
                <p className="font-inter text-gray-300 leading-relaxed text-center">
                  Virtual reality preview system and blockchain-verified portfolio management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Neon */}
      <section className="py-24 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-green-500/10 animate-pulse-slow" />
        </div>
        
        <div className="container relative z-10 text-center">
          <h2 className="font-orbitron text-6xl md:text-7xl font-black tracking-wider text-white mb-8 uppercase"
              style={{
                textShadow: '0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(0, 255, 255, 0.3)'
              }}>
            Access Granted
          </h2>
          <p className="font-orbitron text-lg tracking-widest text-cyan-300 mb-12 uppercase font-medium">
            Initialize Your Journey
          </p>
          <Link href="/signup" 
                className="inline-block bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500 text-black px-12 py-6 font-orbitron font-bold text-lg tracking-widest uppercase hover:shadow-2xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                style={{
                  boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(128, 0, 255, 0.2)'
                }}>
            <span className="relative z-10">ENTER SYSTEM</span>
          </Link>
        </div>
      </section>
    </div>
  )
} 