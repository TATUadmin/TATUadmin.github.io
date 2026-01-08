'use client'

import { useState } from 'react'
import { SUBSCRIPTION_TIERS, formatPrice, calculateSavingsPercentage } from '@/lib/subscription-config'
import { Check, Zap, Crown } from 'lucide-react'

interface SubscriptionPricingProps {
  currentTier?: 'FREE' | 'PRO' | 'STUDIO'
  onSelectPlan?: (tier: 'FREE' | 'PRO' | 'STUDIO', interval: 'MONTHLY' | 'YEARLY') => void
  showFreeTier?: boolean
}

export default function SubscriptionPricing({ 
  currentTier = 'FREE',
  onSelectPlan,
  showFreeTier = true 
}: SubscriptionPricingProps) {
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

  const tiers = Object.values(SUBSCRIPTION_TIERS).filter(tier => 
    showFreeTier || tier.id !== 'FREE'
  )

  const handleSelectPlan = (tierId: 'FREE' | 'PRO' | 'STUDIO') => {
    if (onSelectPlan) {
      onSelectPlan(tierId, billingInterval)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          No transaction fees. No payment processing. Just powerful tools to grow your tattoo business.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={`text-lg font-medium ${billingInterval === 'MONTHLY' ? 'text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingInterval(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
          className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{
            backgroundColor: billingInterval === 'YEARLY' ? '#3b82f6' : '#e5e7eb'
          }}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              billingInterval === 'YEARLY' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-lg font-medium ${billingInterval === 'YEARLY' ? 'text-gray-900' : 'text-gray-500'}`}>
          Yearly
        </span>
        {billingInterval === 'YEARLY' && (
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Save up to 17%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => {
          const isCurrentTier = tier.id === currentTier
          const price = billingInterval === 'MONTHLY' ? tier.price.monthly : tier.price.yearly
          const displayPrice = billingInterval === 'YEARLY' ? price / 12 : price
          const savings = tier.savings?.[billingInterval.toLowerCase() as 'monthly' | 'yearly'] || 0

          return (
            <div
              key={tier.id}
              className={`relative rounded-2xl border-2 p-8 shadow-lg transition-all hover:shadow-xl ${
                tier.popular
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              } ${
                isCurrentTier ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                    <Zap size={16} />
                    {tier.badge}
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentTier && (
                <div className="absolute -top-4 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                    <Check size={14} />
                    Current Plan
                  </span>
                </div>
              )}

              {/* Tier Icon */}
              <div className="mb-4">
                {tier.id === 'STUDIO' && <Crown className="text-yellow-500" size={32} />}
                {tier.id === 'PRO' && <Zap className="text-blue-500" size={32} />}
              </div>

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {tier.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {tier.description}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {formatPrice(displayPrice)}
                  </span>
                  {price > 0 && (
                    <span className="text-gray-600">
                      /month
                    </span>
                  )}
                </div>
                {billingInterval === 'YEARLY' && price > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {formatPrice(price)} billed annually
                  </p>
                )}
                {savings > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Save {formatPrice(savings)} per year
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier.id as 'FREE' | 'PRO' | 'STUDIO')}
                disabled={isCurrentTier}
                className={`w-full rounded-lg px-6 py-3 text-center font-semibold transition-colors ${
                  tier.popular
                    ? 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300'
                    : 'bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-300'
                } disabled:cursor-not-allowed`}
              >
                {isCurrentTier ? 'Current Plan' : tier.cta}
              </button>

              {/* Features List */}
              <ul className="mt-8 space-y-4">
                {/* Portfolio */}
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">
                    {tier.features.portfolioImages === -1 
                      ? '✨ Unlimited portfolio images' 
                      : `${tier.features.portfolioImages} portfolio images`}
                  </span>
                </li>

                {/* Video Consultations */}
                {tier.features.videoConsultations && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      {tier.features.videoConsultationsLimit === -1
                        ? '📹 Unlimited video consultations'
                        : `📹 ${tier.features.videoConsultationsLimit} video consultations/month`}
                      {' '}
                      <span className="text-sm text-gray-500">(unlimited duration, {tier.features.videoQuality})</span>
                    </span>
                  </li>
                )}

                {/* Video Recording */}
                {tier.features.videoRecording && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      🎬 Consultation recording & transcripts
                    </span>
                  </li>
                )}

                {/* Unified Calendar */}
                {tier.features.unifiedCalendar && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      📅 Unified Calendar
                      {tier.features.externalCalendarSyncs === -1 && (
                        <span className="text-sm text-gray-500 block ml-0">
                          Connect unlimited calendars (Google, Apple, Outlook, Square, Calendly, etc.)
                        </span>
                      )}
                      {tier.features.externalCalendarSyncs === 1 && (
                        <span className="text-sm text-gray-500 block ml-0">
                          View TATU bookings + connect 1 external calendar
                        </span>
                      )}
                    </span>
                  </li>
                )}

                {/* Two-Way Calendar Sync */}
                {tier.features.calendarTwoWaySync && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      🔄 Two-way calendar sync (edit from TATU → updates everywhere)
                    </span>
                  </li>
                )}

                {/* Calendar Email Parsing */}
                {tier.features.calendarEmailParsing && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      🤖 AI email confirmation parsing (auto-add appointments)
                    </span>
                  </li>
                )}

                {/* Multi-Artist Calendar */}
                {tier.features.calendarMultiArtistView && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      👥 Multi-artist calendar view (studio-wide scheduling)
                    </span>
                  </li>
                )}

                {/* Unified Inbox */}
                {tier.features.unifiedInbox && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      📨 Unified Inbox
                      {tier.features.inboxPlatformConnections === -1 && (
                        <span className="text-sm text-gray-500 block ml-0">
                          Connect unlimited platforms (Instagram, Email, Facebook, SMS, WhatsApp, etc.)
                        </span>
                      )}
                      {tier.features.inboxPlatformConnections === 3 && (
                        <span className="text-sm text-gray-500 block ml-0">
                          Connect Instagram, Email, + 1 more platform
                        </span>
                      )}
                    </span>
                  </li>
                )}

                {/* AI Message Features */}
                {tier.features.inboxAiCategorization && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      🧠 AI message categorization & smart replies
                    </span>
                  </li>
                )}

                {/* Team Inbox */}
                {tier.features.inboxTeamInbox && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">
                      👥 Team inbox with message routing & assignment
                    </span>
                  </li>
                )}

                {/* Search Ranking */}
                <li className="flex items-start gap-3">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">
                    {tier.features.searchRanking === 'premium' && '🔥 Premium search ranking'}
                    {tier.features.searchRanking === 'boosted' && '⚡ Boosted search ranking'}
                    {tier.features.searchRanking === 'standard' && 'Standard search listing'}
                  </span>
                </li>

                {/* Analytics */}
                {tier.features.analytics && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Advanced analytics & insights</span>
                  </li>
                )}


                {/* Social Media */}
                {tier.features.socialMediaIntegration && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Instagram auto-posting</span>
                  </li>
                )}

                {/* Client Management */}
                {tier.features.clientManagementTools && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Client management tools</span>
                  </li>
                )}

                {/* Custom Branding */}
                {tier.features.customBranding && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Custom branding & URL</span>
                  </li>
                )}

                {/* Multiple Artists */}
                {tier.features.multipleArtists && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Up to 10 artist accounts</span>
                  </li>
                )}

                {/* Priority Support */}
                {tier.features.prioritySupport && (
                  <li className="flex items-start gap-3">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Bottom Note */}
      <div className="mt-12 text-center space-y-4">
        <p className="text-gray-600 max-w-3xl mx-auto">
          <strong>No transaction fees.</strong> We don't process payments between you and your clients. 
          Handle payments however you want (cash, Venmo, Zelle, etc.). We only charge for the tools 
          that help you grow your business.
        </p>
        <p className="text-gray-600 max-w-3xl mx-auto">
          <strong>Unified Calendar + Inbox = Your Business Command Center.</strong> Manage all your bookings 
          and messages from every platform in one place. No more double bookings, missed messages, or juggling 
          5+ apps. Save 12+ hours per week and prevent $500+ double booking losses.
        </p>
        <p className="text-gray-600 max-w-3xl mx-auto">
          <strong>Unlimited duration video consultations.</strong> All tiers include video consultations with no time limits. 
          Talk as long as you need - we trust you to use them professionally.
        </p>
      </div>
    </div>
  )
}

