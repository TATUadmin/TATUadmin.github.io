import { NextRequest } from 'next/server'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import { logger } from './monitoring'
import { ApiResponse, ErrorCodes, HttpStatus } from './api-response'
import { ValidationSchemas } from './validation'

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// File upload configuration
export interface FileUploadConfig {
  maxFileSize: number // in bytes
  allowedMimeTypes: string[]
  allowedExtensions: string[]
  bucketName: string
  folder: string
  generateThumbnails?: boolean
  compressImages?: boolean
  quality?: number
}

// File upload result
export interface FileUploadResult {
  id: string
  url: string
  thumbnailUrl?: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  uploadedAt: string
  metadata?: Record<string, any>
}

// File validation result
export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// File types configuration
export const FileTypes = {
  IMAGE: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    bucketName: process.env.AWS_S3_BUCKET_IMAGES!,
    folder: 'images'
  },
  DOCUMENT: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx'],
    bucketName: process.env.AWS_S3_BUCKET_DOCUMENTS!,
    folder: 'documents'
  },
  PORTFOLIO: {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'],
    bucketName: process.env.AWS_S3_BUCKET_PORTFOLIO!,
    folder: 'portfolio'
  }
} as const

// File upload service class
export class FileUploadService {
  private static instance: FileUploadService

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService()
    }
    return FileUploadService.instance
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: File,
    config: FileUploadConfig,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<FileUploadResult> {
    try {
      // Validate file
      const validation = await this.validateFile(file, config)
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`)
      }

      // Generate unique file ID
      const fileId = uuidv4()
      const fileExtension = this.getFileExtension(file.name)
      const fileName = `${fileId}${fileExtension}`
      const key = `${config.folder}/${userId}/${fileName}`

      // Convert File to Buffer
      const buffer = Buffer.from(await file.arrayBuffer())

      // Upload to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          userId,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      })

      await s3Client.send(uploadCommand)

      // Generate public URL
      const url = `https://${config.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

      // Generate thumbnail if it's an image
      let thumbnailUrl: string | undefined
      if (config.generateThumbnails && this.isImage(file.type)) {
        thumbnailUrl = await this.generateThumbnail(key, config)
      }

      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      if (this.isImage(file.type)) {
        const dimensions = await this.getImageDimensions(buffer)
        width = dimensions.width
        height = dimensions.height
      }

      const result: FileUploadResult = {
        id: fileId,
        url,
        thumbnailUrl,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        uploadedAt: new Date().toISOString(),
        metadata
      }

      // Log successful upload
      logger.info('File uploaded successfully', {
        fileId,
        userId,
        originalName: file.name,
        size: file.size,
        mimeType: file.type
      })

      return result

    } catch (error) {
      logger.error('File upload failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        originalName: file.name,
        mimeType: file.type
      })
      throw error
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    config: FileUploadConfig,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, config, userId, metadata)
    )

    try {
      return await Promise.all(uploadPromises)
    } catch (error) {
      logger.error('Multiple file upload failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        fileCount: files.length
      })
      throw error
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileId: string, config: FileUploadConfig, userId: string): Promise<void> {
    try {
      const key = `${config.folder}/${userId}/${fileId}`
      
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.bucketName,
        Key: key
      })

      await s3Client.send(deleteCommand)

      logger.info('File deleted successfully', {
        fileId,
        userId,
        key
      })

    } catch (error) {
      logger.error('File deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fileId,
        userId
      })
      throw error
    }
  }

  /**
   * Generate a signed URL for private file access
   */
  async generateSignedUrl(
    fileId: string,
    config: FileUploadConfig,
    userId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const key = `${config.folder}/${userId}/${fileId}`
      
      const getCommand = new GetObjectCommand({
        Bucket: config.bucketName,
        Key: key
      })

      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn })

      logger.info('Signed URL generated', {
        fileId,
        userId,
        expiresIn
      })

      return signedUrl

    } catch (error) {
      logger.error('Signed URL generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fileId,
        userId
      })
      throw error
    }
  }

  /**
   * Validate file before upload
   */
  async validateFile(file: File, config: FileUploadConfig): Promise<FileValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check file size
    if (file.size > config.maxFileSize) {
      errors.push(`File size exceeds maximum allowed size of ${this.formatFileSize(config.maxFileSize)}`)
    }

    // Check MIME type
    if (!config.allowedMimeTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }

    // Check file extension
    const extension = this.getFileExtension(file.name)
    if (!config.allowedExtensions.includes(extension.toLowerCase())) {
      errors.push(`File extension ${extension} is not allowed`)
    }

    // Check for suspicious file names
    if (this.isSuspiciousFileName(file.name)) {
      warnings.push('File name contains potentially suspicious characters')
    }

    // Additional validation for images
    if (this.isImage(file.type)) {
      const imageValidation = await this.validateImage(file)
      errors.push(...imageValidation.errors)
      warnings.push(...imageValidation.warnings)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate image file
   */
  private async validateImage(file: File): Promise<FileValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Create image element to check dimensions
      const buffer = Buffer.from(await file.arrayBuffer())
      const dimensions = await this.getImageDimensions(buffer)

      // Check minimum dimensions
      if (dimensions.width < 100 || dimensions.height < 100) {
        warnings.push('Image dimensions are very small')
      }

      // Check maximum dimensions
      if (dimensions.width > 4000 || dimensions.height > 4000) {
        warnings.push('Image dimensions are very large')
      }

      // Check aspect ratio
      const aspectRatio = dimensions.width / dimensions.height
      if (aspectRatio < 0.1 || aspectRatio > 10) {
        warnings.push('Image has unusual aspect ratio')
      }

    } catch (error) {
      errors.push('Invalid image file')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get image dimensions
   */
  private async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    // This is a simplified implementation
    // In production, you'd use a proper image processing library like sharp
    return new Promise((resolve, reject) => {
      // For now, return default dimensions
      // In production, implement proper image dimension detection
      resolve({ width: 1920, height: 1080 })
    })
  }

  /**
   * Generate thumbnail for image
   */
  private async generateThumbnail(key: string, config: FileUploadConfig): Promise<string> {
    // This is a simplified implementation
    // In production, you'd use a proper image processing library like sharp
    // to generate thumbnails of different sizes
    
    // For now, return the original URL
    return `https://${config.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  }

  /**
   * Get file extension
   */
  private getFileExtension(fileName: string): string {
    return fileName.substring(fileName.lastIndexOf('.'))
  }

  /**
   * Check if file is an image
   */
  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/')
  }

  /**
   * Check if file name is suspicious
   */
  private isSuspiciousFileName(fileName: string): boolean {
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /[<>:"|?*]/, // Invalid characters
      /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i, // Reserved names
      /\.(exe|bat|cmd|scr|pif|com)$/i // Executable files
    ]

    return suspiciousPatterns.some(pattern => pattern.test(fileName))
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

// File upload API handler
export async function handleFileUpload(
  request: NextRequest,
  fileType: keyof typeof FileTypes,
  userId: string
): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const metadata = JSON.parse(formData.get('metadata') as string || '{}')

    if (files.length === 0) {
      return ApiResponse.error({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'No files provided',
        statusCode: HttpStatus.BAD_REQUEST
      })
    }

    const config = FileTypes[fileType]
    const uploadService = FileUploadService.getInstance()

    let results: FileUploadResult[]

    if (files.length === 1) {
      const result = await uploadService.uploadFile(files[0], config, userId, metadata)
      results = [result]
    } else {
      results = await uploadService.uploadMultipleFiles(files, config, userId, metadata)
    }

    return ApiResponse.success(results, HttpStatus.CREATED)

  } catch (error) {
    logger.error('File upload API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileType,
      userId
    })

    return ApiResponse.error({
      code: ErrorCodes.FILE_UPLOAD_ERROR,
      message: 'File upload failed',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// File deletion API handler
export async function handleFileDeletion(
  fileId: string,
  fileType: keyof typeof FileTypes,
  userId: string
): Promise<NextResponse> {
  try {
    const config = FileTypes[fileType]
    const uploadService = FileUploadService.getInstance()

    await uploadService.deleteFile(fileId, config, userId)

    return ApiResponse.success({ message: 'File deleted successfully' })

  } catch (error) {
    logger.error('File deletion API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fileId,
      fileType,
      userId
    })

    return ApiResponse.error({
      code: ErrorCodes.FILE_UPLOAD_ERROR,
      message: 'File deletion failed',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Create singleton instance
export const fileUploadService = FileUploadService.getInstance()

export default fileUploadService
