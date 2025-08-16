
// apps/admin/app/api/media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllFiles, getFilesByType, getFilesByFolder, searchFiles, getMediaStats } from '@/lib/media-store'

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
    
    let files
    let responseData: any = {}
    
    if (stats === 'true') {
      responseData = {
        ...getMediaStats(),
        success: true
      }
    } else if (search) {
      files = searchFiles(search)
      responseData = {
        files,
        total: files.length,
        success: true
      }
    } else if (type && type !== 'all') {
      files = getFilesByType(type)
      responseData = {
        files,
        total: files.length,
        success: true,
        filter: { type }
      }
    } else if (folder) {
      files = getFilesByFolder(folder)
      responseData = {
        files,
        total: files.length,
        success: true,
        filter: { folder }
      }
    } else {
      files = getAllFiles()
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

