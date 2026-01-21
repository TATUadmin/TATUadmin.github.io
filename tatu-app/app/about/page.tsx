'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState('mission');
  const [activeTab, setActiveTab] = useState<'clients' | 'artists'>('clients');

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
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Clients', description: 'Satisfied customers worldwide' },
    { number: '15K+', label: 'Verified Artists', description: 'Professional tattoo artists' },
    { number: '2.5M+', label: 'Artworks', description: 'Portfolio pieces shared' },
    { number: '180+', label: 'Countries', description: 'Global artist network' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-4xl md:text-5xl text-white mb-6">
              TATU is a professional tattoo artist marketplace. We're building the future of tattoo art discovery and artist-client connections.
            </h1>
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

      {/* How It Works Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="display text-4xl md:text-5xl text-white mb-4">
              How It Works
            </h2>
            <p className="body text-xl text-gray-300">
              Whether you're looking for the perfect tattoo or building your career as an artist, 
              we've made the process simple and secure.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="flex bg-surface-2 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
                  activeTab === 'clients'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                I'm a client
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
                  activeTab === 'artists'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                I'm an artist
              </button>
            </div>
          </div>

          {/* Clients Process */}
          {activeTab === 'clients' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h3 className="display text-3xl md:text-4xl text-white mb-4">
                  Find Your Perfect Artist
                </h3>
                <p className="body text-xl text-gray-300">
                  From discovery to completion, here's how to get your dream tattoo
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: '1',
                    title: 'Discover Artists',
                    description: 'Browse verified artists by style, location, and availability. View portfolios and read reviews.',
                    icon: '🔍'
                  },
                  {
                    step: '2',
                    title: 'Book Consultation',
                    description: 'Schedule a free consultation to discuss your design, placement, and budget with your chosen artist.',
                    icon: '📅'
                  },
                  {
                    step: '3',
                    title: 'Design & Plan',
                    description: 'Work with your artist to create the perfect design. Get digital mockups and make revisions.',
                    icon: '✏️'
                  },
                  {
                    step: '4',
                    title: 'Get Inked',
                    description: 'Show up for your appointment with confidence. Your artist is ready to create your masterpiece.',
                    icon: '🎨'
                  }
                ].map((item, index) => (
                  <div key={index} className="card card-hover p-6 text-center animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="mb-6">
                      <div className="bg-white text-black text-lg font-bold px-3 py-1 rounded-full inline-block mb-4">
                        {item.step}
                      </div>
                    </div>
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h4 className="headline text-xl text-white mb-3">{item.title}</h4>
                    <p className="body text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artists Process */}
          {activeTab === 'artists' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h3 className="display text-3xl md:text-4xl text-white mb-4">
                  Grow Your Business
                </h3>
                <p className="body text-xl text-gray-300">
                  Join thousands of artists building successful careers on TATU
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: '1',
                    title: 'Apply & Verify',
                    description: 'Submit your application with portfolio samples. We verify all artists for quality and safety.',
                    icon: '✅'
                  },
                  {
                    step: '2',
                    title: 'Build Profile',
                    description: 'Create your artist profile with portfolio, services, pricing, and availability.',
                    icon: '👤'
                  },
                  {
                    step: '3',
                    title: 'Get Bookings',
                    description: 'Receive booking requests from clients. Manage your schedule and consultations.',
                    icon: '📱'
                  },
                  {
                    step: '4',
                    title: 'Earn & Grow',
                    description: 'Complete appointments, get paid securely, and build your client base.',
                    icon: '💰'
                  }
                ].map((item, index) => (
                  <div key={index} className="card card-hover p-6 text-center animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                    <div className="mb-6">
                      <div className="bg-white text-black text-lg font-bold px-3 py-1 rounded-full inline-block mb-4">
                        {item.step}
                      </div>
                    </div>
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h4 className="headline text-xl text-white mb-3">{item.title}</h4>
                    <p className="body text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="display text-4xl md:text-5xl text-white mb-4">
                Why Choose TATU
              </h2>
              <p className="body text-xl text-gray-300">
                Built for artists and clients who demand the best
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: 'Verified Artists',
                  description: 'Every artist is thoroughly vetted with portfolio reviews and background checks.',
                  icon: '🛡️'
                },
                {
                  title: 'Secure Payments',
                  description: 'Protected transactions with escrow services and secure payment processing.',
                  icon: '🔒'
                },
                {
                  title: 'Quality Guarantee',
                  description: 'We stand behind every appointment with our satisfaction guarantee.',
                  icon: '⭐'
                },
                {
                  title: '24/7 Support',
                  description: 'Round-the-clock customer support for both artists and clients.',
                  icon: '📞'
                },
                {
                  title: 'Portfolio Showcase',
                  description: 'Beautiful portfolio galleries to showcase your best work.',
                  icon: '🖼️'
                },
                {
                  title: 'Analytics & Insights',
                  description: 'Detailed analytics to help artists grow their business.',
                  icon: '📊'
                }
              ].map((feature, index) => (
                <div key={index} className="card card-hover p-6 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="headline text-xl text-white mb-3">{feature.title}</h3>
                  <p className="body text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="display text-4xl md:text-5xl text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="body text-xl text-gray-300">
                Everything you need to know about TATU
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: 'How do I find the right artist for my tattoo?',
                  answer: 'Use our search filters to browse by style, location, and availability. Read reviews, view portfolios, and schedule consultations to find your perfect match.'
                },
                {
                  question: 'What happens if I need to cancel my appointment?',
                  answer: 'Cancellation policies vary by artist, but most offer free cancellation up to 24-48 hours before your appointment. Check your artist\'s specific policy.'
                },
                {
                  question: 'How do artists get paid?',
                  answer: 'Artists receive payment securely through our platform after appointment completion. We handle all payment processing and provide detailed earnings reports.'
                },
                {
                  question: 'Is my personal information secure?',
                  answer: 'Yes, we use industry-standard encryption and security measures to protect all personal and payment information. We never share your data with third parties.'
                },
                {
                  question: 'Can I bring my own design?',
                  answer: 'Absolutely! Most artists welcome custom designs. You can upload your design during the booking process and discuss modifications during your consultation.'
                }
              ].map((faq, index) => (
                <div key={index} className="card p-6 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                  <h3 className="headline text-lg text-white mb-3">{faq.question}</h3>
                  <p className="body text-gray-400">{faq.answer}</p>
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
