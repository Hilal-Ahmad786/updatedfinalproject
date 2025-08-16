

  // 3. apps/admin/app/api/comments/[id]/route.ts
  // Individual comment operations
  
  import { NextRequest, NextResponse } from 'next/server'
  import { commentsStore } from '@/lib/comments-store'
  
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
      const comment = commentsStore.getById(params.id)
      if (!comment) {
        const response = NextResponse.json(
          { error: 'Comment not found', success: false }, 
          { status: 404 }
        )
        return addCorsHeaders(response)
      }
      
      const response = NextResponse.json({
        comment,
        success: true
      })
      return addCorsHeaders(response)
    } catch (error) {
      console.error('Failed to fetch comment:', error)
      const response = NextResponse.json(
        { error: 'Failed to fetch comment', success: false }, 
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
      
      const updatedComment = commentsStore.update(params.id, updates)
      if (!updatedComment) {
        const response = NextResponse.json(
          { error: 'Comment not found', success: false }, 
          { status: 404 }
        )
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
      const response = NextResponse.json(
        { error: 'Failed to update comment', success: false }, 
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
      const deleted = commentsStore.delete(params.id)
      if (!deleted) {
        const response = NextResponse.json(
          { error: 'Comment not found', success: false }, 
          { status: 404 }
        )
        return addCorsHeaders(response)
      }
      
      const response = NextResponse.json({
        success: true,
        message: 'Comment deleted successfully'
      })
      return addCorsHeaders(response)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      const response = NextResponse.json(
        { error: 'Failed to delete comment', success: false }, 
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
  }