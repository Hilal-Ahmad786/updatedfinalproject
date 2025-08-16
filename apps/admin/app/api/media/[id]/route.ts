// apps/admin/app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getFileById, deleteFile, updateFile } from '@/lib/media-store'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = getFileById(params.id)
    if (!file) {
      const response = NextResponse.json(
        { error: 'File not found', success: false }, 
        { status: 404 }
      )
      return addCorsHeaders(response)
    }
    
    const response = NextResponse.json({
      file,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch file:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch file', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    
    // Validate updates
    const allowedUpdates = ['altText', 'caption', 'tags', 'folder']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    const updatedFile = updateFile(params.id, filteredUpdates)
    if (!updatedFile) {
      const response = NextResponse.json(
        { error: 'File not found', success: false }, 
        { status: 404 }
      )
      return addCorsHeaders(response)
    }
    
    const response = NextResponse.json({
      file: updatedFile,
      success: true,
      message: 'File updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to update file:', error)
    const response = NextResponse.json(
      { error: 'Failed to update file', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteFile(params.id)
    if (!deleted) {
      const response = NextResponse.json(
        { error: 'File not found', success: false }, 
        { status: 404 }
      )
      return addCorsHeaders(response)
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to delete file:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete file', success: false }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

