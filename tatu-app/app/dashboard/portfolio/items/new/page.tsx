'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { PortfolioCollection } from '@prisma/client'
import PortfolioItemForm from '@/app/components/PortfolioItemForm'

interface PortfolioItemFormData {
  title: string
  description: string
  imageUrl: string
  tags: string[]
  style: string
  featured: boolean
  collectionId: string | null
}

export default function NewPortfolioItemPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [collections, setCollections] = useState<PortfolioCollection[]>([])

  // Fetch collections when the component mounts
  useState(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/portfolio/collections')
        if (!response.ok) throw new Error('Failed to fetch collections')
        const data = await response.json()
        setCollections(data)
      } catch (error) {
        console.error('Error fetching collections:', error)
        toast.error('Failed to load collections')
      }
    }
    fetchCollections()
  })

  const handleSubmit = async (data: PortfolioItemFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/portfolio/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create portfolio item')
      }

      toast.success('Portfolio item created successfully')
      router.push('/dashboard/portfolio')
      router.refresh()
    } catch (error) {
      console.error('Error creating portfolio item:', error)
      toast.error('Failed to create portfolio item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">
          Add New Portfolio Item
        </h1>
        <PortfolioItemForm
          collections={collections}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
} 