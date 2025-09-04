'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              Contact Us
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Get in touch with our team. We're here to help with any questions about TATU.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="space-y-6">
                <h2 className="display text-3xl text-white mb-6">Send us a message</h2>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input w-full"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="input w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="input w-full"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="input w-full resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="display text-3xl text-white mb-6">Get in touch</h2>
                  <p className="body text-gray-300 mb-6">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Email</h3>
                      <p className="text-gray-300">support@tatu.com</p>
                      <p className="text-gray-400 text-sm">For general inquiries and support</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Response Time</h3>
                      <p className="text-gray-300">Within 24 hours</p>
                      <p className="text-gray-400 text-sm">Monday - Friday, 9 AM - 6 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Help Center</h3>
                      <p className="text-gray-300">Self-service support</p>
                      <Link href="/help" className="text-gray-400 text-sm hover:text-white transition-colors">
                        Visit our help center →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="display text-4xl text-white text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">How do I report an issue with the platform?</h3>
                <p className="text-gray-300">Use the contact form above or email us directly at support@tatu.com. Please include as much detail as possible about the issue you're experiencing.</p>
              </div>
              
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">Can I request a new feature?</h3>
                <p className="text-gray-300">Absolutely! We welcome feature requests. Send us a message with your idea and we'll review it with our development team.</p>
              </div>
              
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">How do I become a verified artist?</h3>
                <p className="text-gray-300">Visit our artist registration page and follow the verification process. Our team will review your portfolio and credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 