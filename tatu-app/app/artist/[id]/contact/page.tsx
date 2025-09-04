'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface ContactForm {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactArtistPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string
  
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show success message and redirect
    alert('Message sent successfully! The artist will get back to you soon.')
    router.push(`/artist/${artistId}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <section className="bg-surface py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href={`/artist/${artistId}`}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="display text-2xl text-white">Contact Artist</h1>
              <p className="body text-gray-400">Get in touch with the artist</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card p-8">
            <h2 className="headline text-xl text-white mb-6">Send Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-white text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-white text-sm font-medium mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-white text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="input w-full resize-none"
                  placeholder="Tell the artist what you'd like to discuss..."
                />
              </div>

              {/* Contact Information */}
              <div className="bg-surface-2 p-4 rounded-lg border border-gray-600">
                <h3 className="text-white font-medium mb-3">Other Ways to Connect</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>Email: artist@example.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>Phone: (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>Studio: Ink & Soul Tattoo, Los Angeles, CA</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Link
                  href={`/artist/${artistId}`}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
} 