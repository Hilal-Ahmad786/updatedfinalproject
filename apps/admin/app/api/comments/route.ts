
  // 2. apps/admin/app/api/comments/route.ts
  // Main comments API route with CORS support
  
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
  
  export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')
      const postId = searchParams.get('postId')
      const search = searchParams.get('search')
      const stats = searchParams.get('stats')
      const flagged = searchParams.get('flagged')
      
      let responseData: any = {}
      
      if (stats === 'true') {
        responseData = {
          ...commentsStore.getStats(),
          success: true
        }
      } else if (search) {
        const searchResults = commentsStore.search(search)
        responseData = {
          comments: searchResults,
          total: searchResults.length,
          success: true
        }
      } else if (flagged === 'true') {
        const flaggedComments = commentsStore.getFlagged()
        responseData = {
          comments: flaggedComments,
          total: flaggedComments.length,
          success: true
        }
      } else if (status && status !== 'all') {
        const statusComments = commentsStore.getByStatus(status as any)
        responseData = {
          comments: statusComments,
          total: statusComments.length,
          success: true,
          filter: { status }
        }
      } else if (postId) {
        const postComments = commentsStore.getByPostId(postId)
        responseData = {
          comments: postComments,
          total: postComments.length,
          success: true,
          filter: { postId }
        }
      } else {
        const allComments = commentsStore.getAll()
        responseData = {
          comments: allComments,
          total: allComments.length,
          success: true
        }
      }
      
      const response = NextResponse.json(responseData)
      return addCorsHeaders(response)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      const response = NextResponse.json(
        { error: 'Failed to fetch comments', success: false }, 
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
  }
  
  export async function POST(request: NextRequest) {
    try {
      const commentData = await request.json()
      
      // Validate required fields
      const requiredFields = ['postId', 'author', 'content']
      for (const field of requiredFields) {
        if (!commentData[field]) {
          const response = NextResponse.json(
            { error: `${field} is required`, success: false }, 
            { status: 400 }
          )
          return addCorsHeaders(response)
        }
      }
      
      // Default values
      const newCommentData = {
        ...commentData,
        status: commentData.status || 'pending',
        likes: 0,
        dislikes: 0,
        isEdited: false,
        flagged: false,
        flagReasons: [],
        ipAddress: commentData.ipAddress || '127.0.0.1',
        userAgent: commentData.userAgent || 'Unknown'
      }
      
      const newComment = commentsStore.create(newCommentData)
      
      const response = NextResponse.json({
        comment: newComment,
        success: true,
        message: 'Comment created successfully'
      }, { status: 201 })
      
      return addCorsHeaders(response)
    } catch (error) {
      console.error('Failed to create comment:', error)
      const response = NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to create comment', 
          success: false 
        }, 
        { status: 500 }
      )
      return addCorsHeaders(response)
    }
  }
  