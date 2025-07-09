'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface ImageDropzoneProps {
  onImageUpload: (file: File) => Promise<void>
  imageUrl?: string
  isUploading: boolean
}

export default function ImageDropzone({
  onImageUpload,
  imageUrl,
  isUploading,
}: ImageDropzoneProps) {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        await onImageUpload(acceptedFiles[0])
      }
    },
    [onImageUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`mt-1 flex justify-center rounded-lg border border-dashed px-6 py-10 ${
        isDragActive
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="text-center">
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
          </div>
        ) : imageUrl ? (
          <div className="relative h-48 w-full overflow-hidden rounded-lg">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-sm text-white">Click or drag to replace</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <p className="relative cursor-pointer font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                <span>Upload a file</span>
              </p>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 