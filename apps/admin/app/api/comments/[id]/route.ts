// 6. apps/admin/app/api/comments/[id]/route.ts
// Individual comment operations

import { NextRequest, NextResponse } from 'next/server'
import { CommentsDB } from '@/lib/database/comments'

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    
    const updatedComment = await CommentsDB.update(params.id, updates)

    if (!updatedComment) {
      const response = NextResponse.json({
        error: 'Comment not found',
        success: false
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      comment: updatedComment,
      success: true,
      message: 'Comment updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to update comment:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update comment',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await CommentsDB.delete(params.id)

    if (!success) {
      const response = NextResponse.json({
        error: 'Comment not found',
        success: false
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to delete comment:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete comment',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}