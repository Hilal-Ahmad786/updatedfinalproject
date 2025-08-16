// apps/admin/app/api/media/upload/route.ts
// Server-compatible version that doesn't use browser APIs

import { NextRequest, NextResponse } from 'next/server'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  width?: number
  height?: number
  url: string
  altText?: string
  caption?: string
  uploadedAt: string
  updatedAt: string
  uploadedBy: string
  tags: string[]
  folder?: string
}

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Server-side file processing functions
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
  return `${timestamp}-${randomSuffix}-${safeName}.${extension}`
}

// Convert File to base64 (server-side)
async function fileToBase64Server(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    return `data:${file.type};base64,${base64}`
  } catch (error) {
    console.error('Error converting file to base64:', error)
    // Fallback: return a placeholder image URL
    return getPlaceholderUrl(file.type)
  }
}

// Get placeholder URL based on file type
function getPlaceholderUrl(mimeType: string): string {
  if (mimeType.startsWith('image/')) {
    return `https://via.placeholder.com/400x300/e2e8f0/64748b?text=${encodeURIComponent('Image')}`
  }
  if (mimeType.startsWith('video/')) {
    return `https://via.placeholder.com/400x300/ddd6fe/7c3aed?text=${encodeURIComponent('Video')}`
  }
  if (mimeType.indexOf('pdf') !== -1) {
    return `https://via.placeholder.com/400x300/fef3c7/d97706?text=${encodeURIComponent('PDF')}`
  }
  return `https://via.placeholder.com/400x300/f3f4f6/6b7280?text=${encodeURIComponent('File')}`
}

// Get basic image dimensions (simplified for server)
function getImageDimensions(file: File): { width: number; height: number } {
  // For server-side, we'll use default dimensions
  // In a real app, you'd use a library like 'sharp' or 'jimp' to get real dimensions
  if (file.type.startsWith('image/')) {
    return { width: 800, height: 600 } // Default dimensions
  }
  return { width: 0, height: 0 }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called') // Debug log
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const caption = formData.get('caption') as string
    const tags = formData.get('tags') as string
    const folder = formData.get('folder') as string
    
    console.log('File received:', file ? file.name : 'No file') // Debug log
    
    if (!file) {
      console.log('No file provided') // Debug log
      const response = NextResponse.json(
        { error: 'No file provided', success: false }, 
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size) // Debug log
      const response = NextResponse.json(
        { error: 'File size must be less than 10MB', success: false }, 
        { status: 413 }
      )
      return addCorsHeaders(response)
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/mpeg', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed'
    ]

    if (allowedTypes.indexOf(file.type) === -1) {
      console.log('File type not allowed:', file.type) // Debug log
      const response = NextResponse.json(
        { error: 'File type not supported', success: false }, 
        { status: 415 }
      )
      return addCorsHeaders(response)
    }

    console.log('Processing file...') // Debug log

    // Process the file
    const filename = generateUniqueFilename(file.name)
    const url = await fileToBase64Server(file)
    const dimensions = getImageDimensions(file)
    
    console.log('File processed, creating media object...') // Debug log

    // Create the media file object
    const newFile: MediaFile = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      altText: altText || '',
      caption: caption || '',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: 'admin',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      folder: folder || 'uploads',
      ...(dimensions.width > 0 && {
        width: dimensions.width,
        height: dimensions.height
      })
    }

    console.log('Media file created:', newFile.id) // Debug log
    
    const response = NextResponse.json({
      file: newFile,
      success: true,
      message: 'File uploaded successfully'
    }, { status: 201 })
    
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Upload API Error:', error) // Debug log
    const response = NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload file', 
        success: false,
        details: error instanceof Error ? error.stack : 'Unknown error'
      }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}