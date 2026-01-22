'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';

export default function AboutPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('mission');
  const [activeTab, setActiveTab] = useState<'clients' | 'artists'>('clients');

  const sections = [
    {
      id: 'mission',
      title: t('about.mission.title'),
      content: t('about.mission.content'),
      icon: '🎯'
    },
    {
      id: 'story',
      title: t('about.story.title'),
      content: t('about.story.content'),
      icon: '📖'
    },
    {
      id: 'values',
      title: t('about.values.title'),
      content: t('about.values.content'),
      icon: '💎'
    }
  ];

  const stats = [
    { number: '50K+', label: t('about.stats.happyClients'), description: t('about.stats.happyClientsDesc') },
    { number: '15K+', label: t('about.stats.verifiedArtists'), description: t('about.stats.verifiedArtistsDesc') },
    { number: '2.5M+', label: t('about.stats.artworks'), description: t('about.stats.artworksDesc') },
    { number: '180+', label: t('about.stats.countries'), description: t('about.stats.countriesDesc') }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-4xl md:text-5xl text-white mb-6">
              {t('about.hero')}
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
              {t('about.howItWorks.title')}
            </h2>
            <p className="body text-xl text-gray-300">
              {t('about.howItWorks.description')}
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
                {t('about.tabs.client')}
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${
                  activeTab === 'artists'
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {t('about.tabs.artist')}
              </button>
            </div>
          </div>

          {/* Clients Process */}
          {activeTab === 'clients' && (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h3 className="display text-3xl md:text-4xl text-white mb-4">
                  {t('about.clients.title')}
                </h3>
                <p className="body text-xl text-gray-300">
                  {t('about.clients.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: '1',
                    title: t('about.clients.step1.title'),
                    description: t('about.clients.step1.description'),
                    icon: '🔍'
                  },
                  {
                    step: '2',
                    title: t('about.clients.step2.title'),
                    description: t('about.clients.step2.description'),
                    icon: '📅'
                  },
                  {
                    step: '3',
                    title: t('about.clients.step3.title'),
                    description: t('about.clients.step3.description'),
                    icon: '✏️'
                  },
                  {
                    step: '4',
                    title: t('about.clients.step4.title'),
                    description: t('about.clients.step4.description'),
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
                  {t('about.artists.title')}
                </h3>
                <p className="body text-xl text-gray-300">
                  {t('about.artists.description')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: '1',
                    title: t('about.artists.step1.title'),
                    description: t('about.artists.step1.description'),
                    icon: '✅'
                  },
                  {
                    step: '2',
                    title: t('about.artists.step2.title'),
                    description: t('about.artists.step2.description'),
                    icon: '👤'
                  },
                  {
                    step: '3',
                    title: t('about.artists.step3.title'),
                    description: t('about.artists.step3.description'),
                    icon: '📱'
                  },
                  {
                    step: '4',
                    title: t('about.artists.step4.title'),
                    description: t('about.artists.step4.description'),
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
                {t('about.features.title')}
              </h2>
              <p className="body text-xl text-gray-300">
                {t('about.features.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: t('about.features.verifiedArtists.title'),
                  description: t('about.features.verifiedArtists.description'),
                  icon: '🛡️'
                },
                {
                  title: t('about.features.securePayments.title'),
                  description: t('about.features.securePayments.description'),
                  icon: '🔒'
                },
                {
                  title: t('about.features.qualityGuarantee.title'),
                  description: t('about.features.qualityGuarantee.description'),
                  icon: '⭐'
                },
                {
                  title: t('about.features.support.title'),
                  description: t('about.features.support.description'),
                  icon: '📞'
                },
                {
                  title: t('about.features.portfolio.title'),
                  description: t('about.features.portfolio.description'),
                  icon: '🖼️'
                },
                {
                  title: t('about.features.analytics.title'),
                  description: t('about.features.analytics.description'),
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
                {t('about.faq.title')}
              </h2>
              <p className="body text-xl text-gray-300">
                {t('about.faq.description')}
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: t('about.faq.q1.question'),
                  answer: t('about.faq.q1.answer')
                },
                {
                  question: t('about.faq.q2.question'),
                  answer: t('about.faq.q2.answer')
                },
                {
                  question: t('about.faq.q3.question'),
                  answer: t('about.faq.q3.answer')
                },
                {
                  question: t('about.faq.q4.question'),
                  answer: t('about.faq.q4.answer')
                },
                {
                  question: t('about.faq.q5.question'),
                  answer: t('about.faq.q5.answer')
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
              {t('about.cta.title')}
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              {t('about.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore" className="btn btn-primary">
                {t('about.cta.browseArtists')}
              </Link>
              <Link href="/register-artist" className="btn btn-ghost">
                {t('about.cta.applyArtist')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
