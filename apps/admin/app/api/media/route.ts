// apps/admin/app/api/media/route.ts
// Server-compatible version

import { NextRequest, NextResponse } from 'next/server'

// Mock data for server-side (since we can't use localStorage on server)
const mockFiles = [
  {
    id: '1',
    filename: 'hero-workspace.jpg',
    originalName: 'Modern Workspace Hero.jpg',
    mimeType: 'image/jpeg',
    size: 1024000,
    width: 1920,
    height: 1080,
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop',
    altText: 'Modern workspace with laptop and coffee',
    caption: 'Beautiful modern workspace setup perfect for productivity',
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uploadedBy: 'admin',
    tags: ['workspace', 'modern', 'productivity'],
    folder: 'blog-images'
  },
  {
    id: '2',
    filename: 'blog-writing-cover.jpg',
    originalName: 'Blog Writing Cover.jpg',
    mimeType: 'image/jpeg',
    size: 512000,
    width: 1200,
    height: 630,
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop',
    altText: 'Person writing on laptop',
    caption: 'The art of blog writing and content creation',
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    uploadedBy: 'admin',
    tags: ['writing', 'blog', 'content'],
    folder: 'blog-images'
  }
]

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const folder = searchParams.get('folder')
    const search = searchParams.get('search')
    const stats = searchParams.get('stats')
    
    let files = mockFiles
    let responseData: any = {}
    
    if (stats === 'true') {
      responseData = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        byType: {
          images: files.filter(f => f.mimeType.startsWith('image/')).length,
          videos: files.filter(f => f.mimeType.startsWith('video/')).length,
          documents: files.filter(f => f.mimeType.indexOf('pdf') !== -1).length,
          audio: files.filter(f => f.mimeType.startsWith('audio/')).length,
          other: 0
        },
        success: true
      }
    } else if (search) {
      files = files.filter(file => 
        file.originalName.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
        file.filename.toLowerCase().indexOf(search.toLowerCase()) !== -1
      )
      responseData = {
        files,
        total: files.length,
        success: true
      }
    } else if (type && type !== 'all') {
      if (type === 'image') {
        files = files.filter(f => f.mimeType.startsWith('image/'))
      } else if (type === 'video') {
        files = files.filter(f => f.mimeType.startsWith('video/'))
      } else if (type === 'document') {
        files = files.filter(f => f.mimeType.indexOf('pdf') !== -1)
      }
      responseData = {
        files,
        total: files.length,
        success: true,
        filter: { type }
      }
    } else if (folder) {
      files = files.filter(f => f.folder === folder)
      responseData = {
        files,
        total: files.length,
        success: true,
        filter: { folder }
      }
    } else {
      responseData = {
        files,
        total: files.length,
        success: true
      }
    }
    
    const response = NextResponse.json(responseData)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch files:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch files', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}