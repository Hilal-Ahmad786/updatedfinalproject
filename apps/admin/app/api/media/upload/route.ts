// apps/admin/app/api/media/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createFile } from '@/lib/media-store'

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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const altText = formData.get('altText') as string
    const caption = formData.get('caption') as string
    const tags = formData.get('tags') as string
    const folder = formData.get('folder') as string
    
    if (!file) {
      const response = NextResponse.json(
        { error: 'No file provided', success: false }, 
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
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

    if (!allowedTypes.includes(file.type)) {
      const response = NextResponse.json(
        { error: 'File type not supported', success: false }, 
        { status: 415 }
      )
      return addCorsHeaders(response)
    }

    const metadata = {
      altText: altText || '',
      caption: caption || '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      folder: folder || 'uploads'
    }

    const newFile = await createFile(file, metadata)
    
    const response = NextResponse.json({
      file: newFile,
      success: true,
      message: 'File uploaded successfully'
    }, { status: 201 })
    
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to upload file:', error)
    const response = NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload file', 
        success: false 
      }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

