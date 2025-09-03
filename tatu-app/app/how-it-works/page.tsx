'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'clients' | 'artists'>('clients');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              How It Works
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Whether you're looking for the perfect tattoo or building your artist career, 
              we've made the process simple and secure.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-12 bg-surface">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="flex bg-surface-2 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('clients')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
                  activeTab === 'clients'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                For Clients
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
                  activeTab === 'artists'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                For Artists
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Process */}
      {activeTab === 'clients' && (
        <section className="py-24">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="display text-4xl md:text-5xl text-white mb-4">
                  Find Your Perfect Artist
                </h2>
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
                    <h3 className="headline text-xl text-white mb-3">{item.title}</h3>
                    <p className="body text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Artists Process */}
      {activeTab === 'artists' && (
        <section className="py-24">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="display text-4xl md:text-5xl text-white mb-4">
                  Grow Your Business
                </h2>
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
                    <h3 className="headline text-xl text-white mb-3">{item.title}</h3>
                    <p className="body text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-surface">
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
      <section className="py-24">
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
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl md:text-5xl text-white mb-6">
              Ready to get started?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Join thousands of artists and clients on the world's leading tattoo platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                Browse Artists
              </Link>
              <Link href="/register-artist" className="btn btn-secondary">
                Apply as Artist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 