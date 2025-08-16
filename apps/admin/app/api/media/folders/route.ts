// apps/admin/app/api/media/folders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAllFolders, createFolder } from '@/lib/media-store'

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

export async function GET() {
  try {
    const folders = getAllFolders()
    const response = NextResponse.json({
      folders,
      total: folders.length,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch folders:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch folders', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()
    
    if (!name || name.trim().length === 0) {
      const response = NextResponse.json(
        { error: 'Folder name is required', success: false }, 
        { status: 400 }
      )
      return addCorsHeaders(response)
    }
    
    const newFolder = createFolder({ name: name.trim(), description })
    
    const response = NextResponse.json({
      folder: newFolder,
      success: true,
      message: 'Folder created successfully'
    }, { status: 201 })
    
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to create folder:', error)
    const response = NextResponse.json(
      { error: 'Failed to create folder', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}