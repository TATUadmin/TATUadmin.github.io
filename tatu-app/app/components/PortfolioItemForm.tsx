'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { PortfolioCollection } from '@prisma/client'
import ImageDropzone from './ImageDropzone'
import { FileUploadService, FileTypes } from '@/lib/file-upload'

interface PortfolioItemFormData {
  title: string
  description: string
  imageUrl: string
  tags: string[]
  style: string
  featured: boolean
  collectionId: string | null
}

interface PortfolioItemFormProps {
  collections: PortfolioCollection[]
  initialData?: Partial<PortfolioItemFormData>
  onSubmit: (data: PortfolioItemFormData) => Promise<void>
  isSubmitting: boolean
}

const TATTOO_STYLES = [
  'Traditional',
  'Neo-Traditional',
  'Realistic',
  'Watercolor',
  'Tribal',
  'Japanese',
  'Blackwork',
  'New School',
  'Minimalist',
]

export default function PortfolioItemForm({
  collections,
  initialData,
  onSubmit,
  isSubmitting,
}: PortfolioItemFormProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<PortfolioItemFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    tags: initialData?.tags || [],
    style: initialData?.style || '',
    featured: initialData?.featured || false,
    collectionId: initialData?.collectionId || null,
  })
  const [tagInput, setTagInput] = useState('')

  const handleImageUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    try {
      // Use the enterprise file upload service
      const uploadService = FileUploadService.getInstance()
      const result = await uploadService.uploadFile(
        file,
        FileTypes.PORTFOLIO,
        'current-user-id', // TODO: Get from session
        {
          portfolioItem: true,
          uploadedAt: new Date().toISOString()
        }
      )
      
      setFormData((prev) => ({ ...prev, imageUrl: result.url }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced validation
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.imageUrl) {
      toast.error('Image is required')
      return
    }
    if (!formData.style) {
      toast.error('Style is required')
      return
    }
    if (formData.title.length < 3) {
      toast.error('Title must be at least 3 characters long')
      return
    }
    if (formData.title.length > 100) {
      toast.error('Title must be less than 100 characters')
      return
    }
    if (formData.description && formData.description.length > 500) {
      toast.error('Description must be less than 500 characters')
      return
    }
    
    try {
      await onSubmit(formData)
      toast.success('Portfolio item saved successfully')
      router.push('/dashboard/portfolio')
    } catch (error) {
      console.error('Error saving portfolio item:', error)
      toast.error('Failed to save portfolio item')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Edit Portfolio Item' : 'Add New Portfolio Item'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Showcase your work with detailed information and high-quality images
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              placeholder="Enter a descriptive title for your work"
              maxLength={100}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.title.length}/100 characters
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
              placeholder="Describe your work, techniques used, inspiration, etc."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image *
            </label>
            <div className="space-y-2">
              <ImageDropzone
                onImageUpload={handleImageUpload}
                imageUrl={formData.imageUrl}
                isUploading={isUploading}
              />
              <p className="text-xs text-gray-500">
                Upload high-quality images (JPEG, PNG, WebP). Max 20MB. Recommended: 1920x1080 or higher.
              </p>
            </div>
          </div>

      <div>
        <label
          htmlFor="style"
          className="block text-sm font-medium text-gray-700"
        >
          Style *
        </label>
        <select
          id="style"
          value={formData.style}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, style: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a style</option>
          {TATTOO_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="collection"
          className="block text-sm font-medium text-gray-700"
        >
          Collection
        </label>
        <select
          id="collection"
          value={formData.collectionId || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              collectionId: e.target.value || null,
            }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">No Collection</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Add a tag..."
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 hover:bg-gray-100"
          >
            Add
          </button>
        </div>
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-600 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                >
                  <span className="sr-only">Remove {tag}</span>×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="featured"
          type="checkbox"
          checked={formData.featured}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, featured: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label
          htmlFor="featured"
          className="ml-2 block text-sm text-gray-900"
        >
          Feature this work
        </label>
      </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Portfolio Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 