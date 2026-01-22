'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';

export default function ContactPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              {t('contact.title')}
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              {t('contact.description')}
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
                <h2 className="display text-3xl text-white mb-6">{t('contact.sendMessage')}</h2>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="input w-full"
                      placeholder={t('contact.yourFullName')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.email')}
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
                      {t('contact.subject')}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="input w-full"
                    >
                      <option value="">{t('contact.selectSubject')}</option>
                      <option value="general">{t('contact.generalInquiry')}</option>
                      <option value="support">{t('contact.technicalSupport')}</option>
                      <option value="billing">{t('contact.billingQuestion')}</option>
                      <option value="partnership">{t('contact.partnership')}</option>
                      <option value="other">{t('contact.other')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      {t('contact.message')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="input w-full resize-none"
                      placeholder={t('contact.tellUsHow')}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                  >
                    {t('contact.sendMessageButton')}
                  </button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="display text-3xl text-white mb-6">{t('contact.getInTouch')}</h2>
                  <p className="body text-gray-300 mb-6">
                    {t('contact.responseTimeDesc')}
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
                      <h3 className="text-white font-medium">{t('contact.emailLabel')}</h3>
                      <p className="text-gray-300">{t('contact.emailValue')}</p>
                      <p className="text-gray-400 text-sm">{t('contact.emailDesc')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.responseTime')}</h3>
                      <p className="text-gray-300">{t('contact.within24Hours')}</p>
                      <p className="text-gray-400 text-sm">{t('contact.businessHours')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-surface rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{t('contact.helpCenter')}</h3>
                      <p className="text-gray-300">{t('contact.selfService')}</p>
                      <Link href="/help" className="text-gray-400 text-sm hover:text-white transition-colors">
                        {t('contact.visitHelpCenter')}
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
            <h2 className="display text-4xl text-white text-center mb-12">{t('contact.faqTitle')}</h2>
            
            <div className="space-y-6">
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">{t('contact.reportIssue')}</h3>
                <p className="text-gray-300">{t('contact.reportIssueAnswer')}</p>
              </div>
              
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">{t('contact.requestFeature')}</h3>
                <p className="text-gray-300">{t('contact.requestFeatureAnswer')}</p>
              </div>
              
              <div className="bg-surface-2 p-6 rounded-lg">
                <h3 className="text-white font-medium mb-2">{t('contact.becomeArtist')}</h3>
                <p className="text-gray-300">{t('contact.becomeArtistAnswer')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 