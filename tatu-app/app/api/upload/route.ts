import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import crypto from 'crypto'

// Get AWS configuration with defaults
const awsRegion = process.env.AWS_REGION || 'us-east-1'
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const awsBucketName = process.env.AWS_BUCKET_NAME

// Only create S3Client if credentials are available
const s3Client = awsAccessKeyId && awsSecretAccessKey
  ? new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    })
  : null

export async function POST(request: Request) {
  try {
    // Parse form data first (can only be read once)
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Check if S3 is configured
    if (!s3Client || !awsBucketName) {
      // Fallback: Use base64 encoding for development when S3 is not configured
      // Validate file size (5MB limit for base64)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File size exceeds 5MB limit' },
          { status: 400 }
        )
      }

      // Convert to base64 for local storage
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      // Return data URL (for development only)
      return NextResponse.json({ 
        url: dataUrl,
        warning: 'S3 not configured - using base64 encoding. This is for development only.'
      })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (10MB limit for S3)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const randomName = crypto.randomBytes(32).toString('hex')
    const key = `uploads/temp/${randomName}.${fileExtension}`

    // Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: awsBucketName!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3Client.send(command)

    // Return public URL (adjust based on your S3 configuration)
    const url = `https://${awsBucketName}.s3.${awsRegion}.amazonaws.com/${key}`

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Check if S3 is configured
    if (!s3Client || !awsBucketName) {
      return NextResponse.json(
        { 
          error: 'File upload is not configured. AWS S3 credentials are missing.',
          details: 'Please configure AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_BUCKET_NAME environment variables.'
        },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'No key provided' }, { status: 400 })
    }

    // Generate signed URL for downloading
    const command = new PutObjectCommand({
      Bucket: awsBucketName,
      Key: key,
    })
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 