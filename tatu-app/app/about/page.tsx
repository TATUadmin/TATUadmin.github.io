'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('mission');

  const sections = [
    {
      id: 'mission',
      title: 'Our Mission',
      content: 'To create the world\'s most trusted platform connecting tattoo artists with clients, fostering creativity, and building lasting relationships in the tattoo community.',
      icon: '🎯'
    },
    {
      id: 'story',
      title: 'Our Story',
      content: 'Founded by tattoo enthusiasts who experienced the challenges of finding quality artists, TATU was born from a simple idea: make great tattoo art accessible to everyone while supporting talented artists.',
      icon: '📖'
    },
    {
      id: 'values',
      title: 'Our Values',
      content: 'Quality, authenticity, community, and innovation. We believe every tattoo tells a story, and every artist deserves a platform to showcase their unique vision.',
      icon: '💎'
    },
    {
      id: 'team',
      title: 'Our Team',
      content: 'A diverse group of designers, developers, and tattoo industry professionals passionate about revolutionizing how people discover and connect with tattoo artists worldwide.',
      icon: '👥'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Clients', description: 'Satisfied customers worldwide' },
    { number: '15K+', label: 'Verified Artists', description: 'Professional tattoo artists' },
    { number: '2.5M+', label: 'Artworks', description: 'Portfolio pieces shared' },
    { number: '180+', label: 'Countries', description: 'Global artist network' }
  ];

  const team = [
    {
      name: 'Kelso Norden',
      role: 'CEO & Co-Founder',
      bio: 'Former tattoo artist with 15+ years in the industry. Passionate about supporting artists and connecting them with clients.',
      image: '/Kelso Headshot.jpg'
    },
    {
      name: 'Pedro Perin',
      role: 'CTO & Co-Founder',
      bio: 'Tech entrepreneur with expertise in marketplace platforms. Believes technology can enhance human connections.',
      image: '/Profile Pic BW.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              About TATU
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              We're building the future of tattoo art discovery and artist-client connections.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-surface">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="display text-3xl md:text-4xl text-white mb-2">{stat.number}</div>
                <div className="headline text-lg text-white mb-1">{stat.label}</div>
                <div className="body text-sm text-gray-300">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Section Navigation */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-white text-black'
                      : 'bg-surface-2 text-gray-300 hover:text-white hover:bg-surface-3'
                  }`}
                >
                  {section.icon} {section.title}
                </button>
              ))}
            </div>

            {/* Active Section Content */}
            <div className="text-center max-w-4xl mx-auto">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`transition-all duration-500 ${
                    activeSection === section.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 hidden'
                  }`}
                >
                  <div className="text-6xl mb-6">{section.icon}</div>
                  <h2 className="display text-3xl md:text-4xl text-white mb-6">{section.title}</h2>
                  <p className="body text-lg text-gray-300 leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="display text-4xl md:text-5xl text-white mb-4">
                Meet Our Team
              </h2>
              <p className="body text-xl text-gray-300">
                The passionate people behind TATU
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-600"
                    />
                  </div>
                  <h3 className="headline text-xl text-white mb-2">{member.name}</h3>
                  <p className="label text-gray-300 mb-3">{member.role}</p>
                  <p className="body text-gray-300 text-sm leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl md:text-5xl text-white mb-6">
              Join the TATU Community
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Whether you're an artist looking to showcase your work or a client seeking the perfect tattoo, 
              we're here to help you connect and create.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-ghost">
                Apply as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 