// 1. apps/admin/app/api/posts/route.ts
// Replace your existing posts API with this database version

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    let posts

    if (status === 'published') {
      posts = await PostsDB.getPublished()
    } else if (status === 'featured') {
      posts = await PostsDB.getFeatured()
    } else {
      posts = await PostsDB.getAll()
      
      // Filter by status if specified
      if (status && status !== 'all') {
        posts = posts.filter(post => post.status === status)
      }
      
      // Filter by category if specified
      if (category) {
        posts = posts.filter(post => post.categories.includes(category))
      }
    }

    // Apply limit if specified
    if (limit) {
      posts = posts.slice(0, parseInt(limit))
    }

    const response = NextResponse.json({
      posts,
      total: posts.length,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Posts API error:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch posts',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const postData = await request.json()
    
    const newPost = await PostsDB.create(postData)

    if (!newPost) {
      const response = NextResponse.json({
        error: 'Failed to create post',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      post: newPost,
      success: true,
      message: 'Post created successfully'
    }, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to create post:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create post',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}