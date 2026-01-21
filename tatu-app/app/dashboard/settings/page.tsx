'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import DashboardLayout from '../../components/DashboardLayout'
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  PaintBrushIcon,
  ClockIcon,
  CreditCardIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface UserSettings {
  name: string
  email: string
  phone: string
  bio: string
  location: string
  instagram: string
  website: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    bookingReminders: boolean
    messages: boolean
    promotions: boolean
  }
  privacy: {
    profilePublic: boolean
    showEmail: boolean
    showPhone: boolean
    showLocation: boolean
  }
  business: {
    autoAcceptBookings: boolean
    bufferTime: number
    workingHours: {
      monday: { enabled: boolean; start: string; end: string }
      tuesday: { enabled: boolean; start: string; end: string }
      wednesday: { enabled: boolean; start: string; end: string }
      thursday: { enabled: boolean; start: string; end: string }
      friday: { enabled: boolean; start: string; end: string }
      saturday: { enabled: boolean; start: string; end: string }
      sunday: { enabled: boolean; start: string; end: string }
    }
  }
}

const defaultSettings: UserSettings = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  location: '',
  instagram: '',
  website: '',
  notifications: {
    email: true,
    push: true,
    sms: false,
    bookingReminders: true,
    messages: true,
    promotions: false
  },
  privacy: {
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    showLocation: true
  },
  business: {
    autoAcceptBookings: false,
    bufferTime: 30,
    workingHours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '10:00', end: '16:00' },
      sunday: { enabled: false, start: '10:00', end: '16:00' }
    }
  }
}

type TabType = 'profile' | 'notifications' | 'privacy' | 'business' | 'security'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const isArtist = session?.user?.role === 'ARTIST'

  useEffect(() => {
    if (session?.user) {
      // Load user settings
      setSettings(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
      setIsLoading(false)
    }
  }, [session])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
      setHasChanges(false)
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (updates: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: UserCircleIcon },
    { id: 'notifications' as TabType, label: 'Notifications', icon: BellIcon },
    { id: 'privacy' as TabType, label: 'Privacy', icon: ShieldCheckIcon },
    ...(isArtist ? [{ id: 'business' as TabType, label: 'Business', icon: ClockIcon }] : []),
    { id: 'security' as TabType, label: 'Security', icon: KeyIcon }
  ]

  if (!session?.user) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Please sign in to access settings.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="artist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={isArtist ? 'artist' : 'client'}>
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-gray-950 border-b border-gray-900">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account preferences</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Tabs */}
            <div className="lg:w-64 flex-shrink-0">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-black'
                        : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-gray-950 border border-gray-900 rounded-lg p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={settings.name}
                          onChange={e => updateSettings({ name: e.target.value })}
                          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={e => updateSettings({ email: e.target.value })}
                          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={settings.phone}
                          onChange={e => updateSettings({ phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                        <input
                          type="text"
                          value={settings.location}
                          onChange={e => updateSettings({ location: e.target.value })}
                          placeholder="City, State"
                          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                      <textarea
                        value={settings.bio}
                        onChange={e => updateSettings({ bio: e.target.value })}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Instagram</label>
                        <div className="flex">
                          <span className="px-3 py-2 bg-gray-900 border border-gray-800 border-r-0 rounded-l-lg text-gray-500">@</span>
                          <input
                            type="text"
                            value={settings.instagram}
                            onChange={e => updateSettings({ instagram: e.target.value })}
                            placeholder="username"
                            className="flex-1 px-4 py-2 bg-black border border-gray-800 rounded-r-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                        <input
                          type="url"
                          value={settings.website}
                          onChange={e => updateSettings({ website: e.target.value })}
                          placeholder="https://yourwebsite.com"
                          className="w-full px-4 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                        { key: 'push', label: 'Push Notifications', description: 'Receive push notifications on your devices' },
                        { key: 'sms', label: 'SMS Notifications', description: 'Receive text message notifications' },
                        { key: 'bookingReminders', label: 'Booking Reminders', description: 'Get reminded about upcoming appointments' },
                        { key: 'messages', label: 'New Messages', description: 'Be notified when you receive new messages' },
                        { key: 'promotions', label: 'Promotional Emails', description: 'Receive updates about new features and offers' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => updateSettings({
                              notifications: {
                                ...settings.notifications,
                                [item.key]: !settings.notifications[item.key as keyof typeof settings.notifications]
                              }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.notifications[item.key as keyof typeof settings.notifications]
                                ? 'bg-white'
                                : 'bg-gray-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                                settings.notifications[item.key as keyof typeof settings.notifications]
                                  ? 'translate-x-7 bg-black'
                                  : 'translate-x-1 bg-gray-400'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Privacy Settings</h2>
                    
                    <div className="space-y-4">
                      {[
                        { key: 'profilePublic', label: 'Public Profile', description: 'Allow others to view your profile' },
                        { key: 'showEmail', label: 'Show Email', description: 'Display your email on your profile' },
                        { key: 'showPhone', label: 'Show Phone Number', description: 'Display your phone number on your profile' },
                        { key: 'showLocation', label: 'Show Location', description: 'Display your location on your profile' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <button
                            onClick={() => updateSettings({
                              privacy: {
                                ...settings.privacy,
                                [item.key]: !settings.privacy[item.key as keyof typeof settings.privacy]
                              }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              settings.privacy[item.key as keyof typeof settings.privacy]
                                ? 'bg-white'
                                : 'bg-gray-700'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                                settings.privacy[item.key as keyof typeof settings.privacy]
                                  ? 'translate-x-7 bg-black'
                                  : 'translate-x-1 bg-gray-400'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Tab (Artists Only) */}
                {activeTab === 'business' && isArtist && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Business Settings</h2>
                    
                    <div className="flex items-center justify-between p-4 bg-black border border-gray-800 rounded-lg">
                      <div>
                        <p className="text-white font-medium">Auto-Accept Bookings</p>
                        <p className="text-sm text-gray-500">Automatically accept booking requests</p>
                      </div>
                      <button
                        onClick={() => updateSettings({
                          business: {
                            ...settings.business,
                            autoAcceptBookings: !settings.business.autoAcceptBookings
                          }
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.business.autoAcceptBookings ? 'bg-white' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full transition-transform ${
                            settings.business.autoAcceptBookings
                              ? 'translate-x-7 bg-black'
                              : 'translate-x-1 bg-gray-400'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-black border border-gray-800 rounded-lg">
                      <label className="block text-white font-medium mb-2">Buffer Time Between Appointments</label>
                      <p className="text-sm text-gray-500 mb-3">Minimum time between bookings</p>
                      <select
                        value={settings.business.bufferTime}
                        onChange={e => updateSettings({
                          business: { ...settings.business, bufferTime: parseInt(e.target.value) }
                        })}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                      </select>
                    </div>

                    <div className="p-4 bg-black border border-gray-800 rounded-lg">
                      <h3 className="text-white font-medium mb-4">Working Hours</h3>
                      <div className="space-y-3">
                        {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map(day => (
                          <div key={day} className="flex items-center gap-4">
                            <button
                              onClick={() => updateSettings({
                                business: {
                                  ...settings.business,
                                  workingHours: {
                                    ...settings.business.workingHours,
                                    [day]: {
                                      ...settings.business.workingHours[day],
                                      enabled: !settings.business.workingHours[day].enabled
                                    }
                                  }
                                }
                              })}
                              className={`w-24 py-1 rounded text-sm font-medium transition-colors ${
                                settings.business.workingHours[day].enabled
                                  ? 'bg-white text-black'
                                  : 'bg-gray-800 text-gray-500'
                              }`}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                            </button>
                            {settings.business.workingHours[day].enabled && (
                              <>
                                <input
                                  type="time"
                                  value={settings.business.workingHours[day].start}
                                  onChange={e => updateSettings({
                                    business: {
                                      ...settings.business,
                                      workingHours: {
                                        ...settings.business.workingHours,
                                        [day]: { ...settings.business.workingHours[day], start: e.target.value }
                                      }
                                    }
                                  })}
                                  className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-white text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={settings.business.workingHours[day].end}
                                  onChange={e => updateSettings({
                                    business: {
                                      ...settings.business,
                                      workingHours: {
                                        ...settings.business.workingHours,
                                        [day]: { ...settings.business.workingHours[day], end: e.target.value }
                                      }
                                    }
                                  })}
                                  className="px-2 py-1 bg-gray-900 border border-gray-800 rounded text-white text-sm"
                                />
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                    
                    <div className="p-4 bg-black border border-gray-800 rounded-lg">
                      <h3 className="text-white font-medium mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-white focus:ring-1 focus:ring-white transition-colors"
                          />
                        </div>
                        <button className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-black border border-red-900/50 rounded-lg">
                      <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                        <TrashIcon className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                {hasChanges && (
                  <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setSettings(defaultSettings)
                        setHasChanges(false)
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

