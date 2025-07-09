'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { prisma } from '@/lib/prisma'

interface Profile {
  bio: string | null
  avatar: string | null
  phone: string | null
  instagram: string | null
  website: string | null
  location: string | null
  specialties: string[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Profile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile')
        const data = await response.json()
        setProfile(data)
        setFormData(data)
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="text"
              value={formData.instagram || ''}
              onChange={(e) =>
                setFormData({ ...formData, instagram: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {session.user.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{session.user.email}</p>
          </div>

          {profile && (
            <>
              {profile.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Bio</h4>
                  <p className="mt-1 text-sm text-gray-500">{profile.bio}</p>
                </div>
              )}

              {profile.phone && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                  <p className="mt-1 text-sm text-gray-500">{profile.phone}</p>
                </div>
              )}

              {profile.instagram && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Instagram</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.instagram}
                  </p>
                </div>
              )}

              {profile.website && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Website</h4>
                  <p className="mt-1 text-sm text-gray-500">{profile.website}</p>
                </div>
              )}

              {profile.location && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Location</h4>
                  <p className="mt-1 text-sm text-gray-500">{profile.location}</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
} 