'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I create an account?",
    answer: "Click the 'Join' button in the top right corner and follow the registration process. You'll need to provide your email address, create a password, and verify your email.",
    category: "Account"
  },
  {
    question: "How do I book an appointment?",
    answer: "Browse artists on our platform, view their portfolios, and click 'Book Now' on their profile. You'll be able to select a service, date, and time that works for you.",
    category: "Booking"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets. All payments are processed securely through our payment partners.",
    category: "Payment"
  },
  {
    question: "How do I become a verified artist?",
    answer: "Apply through our artist registration process. We'll review your portfolio, credentials, and experience. Once approved, you'll be able to create your artist profile and start accepting bookings.",
    category: "Artist"
  },
  {
    question: "Can I cancel or reschedule an appointment?",
    answer: "Yes, you can cancel or reschedule appointments up to 24 hours before the scheduled time. Check the artist's cancellation policy for specific details.",
    category: "Booking"
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach our support team through the contact form on our Contact Us page, or email us directly at support@tatu.com. We typically respond within 24 hours.",
    category: "Support"
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent.",
    category: "Security"
  },
  {
    question: "What if I'm not satisfied with my tattoo?",
    answer: "We encourage open communication between clients and artists. If you have concerns, please contact the artist directly first. For platform-related issues, our support team is here to help.",
    category: "Support"
  }
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['all', 'Account', 'Booking', 'Payment', 'Artist', 'Support', 'Security'];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              Help Center
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Find answers to common questions and get the support you need.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-12 bg-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full"
                  style={{paddingLeft: '3.5rem'}}
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-surface-2 text-gray-300 hover:text-white'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="display text-4xl text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            {filteredFAQs.length > 0 ? (
              <div className="space-y-6">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="bg-surface rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-lg mb-3">{faq.question}</h3>
                        <p className="text-gray-300">{faq.answer}</p>
                      </div>
                      <span className="ml-4 px-3 py-1 bg-surface-2 text-gray-400 text-xs rounded-full">
                        {faq.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No questions found matching your search.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 text-white hover:text-gray-300 underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="display text-4xl text-white text-center mb-12">
              Still need help?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Email Support</h3>
                <p className="text-gray-300 text-sm mb-4">Get a response within 24 hours</p>
                <Link href="/contact" className="btn btn-secondary">
                  Send Email
                </Link>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Help Articles</h3>
                <p className="text-gray-300 text-sm mb-4">Browse detailed guides and tutorials</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">Live Chat</h3>
                <p className="text-gray-300 text-sm mb-4">Coming soon - real-time support</p>
                <button className="btn btn-secondary opacity-50 cursor-not-allowed">
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl text-white mb-6">
              Can't find what you're looking for?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Our support team is here to help with any specific questions or issues.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 