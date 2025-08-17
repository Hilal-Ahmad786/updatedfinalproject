// 5. apps/admin/app/api/comments/route.ts
// Replace your existing comments API

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const postId = searchParams.get('postId')
    const stats = searchParams.get('stats')

    let responseData: any

    if (stats === 'true') {
      responseData = {
        ...await CommentsDB.getStats(),
        success: true
      }
    } else if (postId) {
      const comments = await CommentsDB.getByPostId(postId, status || undefined)
      responseData = {
        comments,
        total: comments.length,
        success: true
      }
    } else if (status && status !== 'all') {
      const comments = await CommentsDB.getByStatus(status)
      responseData = {
        comments,
        total: comments.length,
        success: true
      }
    } else {
      const comments = await CommentsDB.getAll()
      responseData = {
        comments,
        total: comments.length,
        success: true
      }
    }

    const response = NextResponse.json(responseData)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Comments API error:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch comments',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const commentData = await request.json()
    
    // Get IP address for moderation
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || '127.0.0.1'
    
    commentData.ipAddress = ip
    commentData.userAgent = request.headers.get('user-agent') || 'Unknown'

    const newComment = await CommentsDB.create(commentData)

    if (!newComment) {
      const response = NextResponse.json({
        error: 'Failed to create comment',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      comment: newComment,
      success: true,
      message: 'Comment created successfully'
    }, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to create comment:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create comment',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}