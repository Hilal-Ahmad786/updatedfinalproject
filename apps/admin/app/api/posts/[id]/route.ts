// 2. apps/admin/app/api/posts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PostsDB } from '@/lib/database/posts'

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
    // Try to get by ID first, then by slug
    let post = await PostsDB.getById(params.id)
    if (!post) {
      post = await PostsDB.getBySlug(params.id)
    }

    if (!post) {
      const response = NextResponse.json({
        error: 'Post not found',
        success: false
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      post,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch post:', error)
    const response = NextResponse.json({
      error: 'Post not found',
      success: false
    }, { status: 404 })
    return addCorsHeaders(response)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    
    const updatedPost = await PostsDB.update(params.id, updates)

    if (!updatedPost) {
      const response = NextResponse.json({
        error: 'Failed to update post',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      post: updatedPost,
      success: true,
      message: 'Post updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to update post:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update post',
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
    const success = await PostsDB.delete(params.id)

    if (!success) {
      const response = NextResponse.json({
        error: 'Failed to delete post',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to delete post:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete post',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}