// apps/admin/app/api/posts/route.ts
// Enhanced version to handle long content proper  ly

import { NextRequest, NextResponse } from 'next/server'
import { PostsDB } from '@/lib/database/posts'

// Set longer timeout for this API route
export const maxDuration = 30; // 30 seconds instead of default 10

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
    console.error('❌ Posts GET API error:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch posts',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting post creation...')
    
    const postData = await request.json()
    
    // Log basic info (not full content to avoid log spam)
    console.log('📊 Post data received:', {
      title: postData.title,
      contentLength: postData.content?.length || 0,
      status: postData.status,
      hasCategories: !!postData.categories?.length,
      hasTags: !!postData.tags?.length,
      hasFeaturedImage: !!postData.featuredImage
    })

    // Validate required fields
    if (!postData.title || !postData.content) {
      console.error('❌ Missing required fields')
      const response = NextResponse.json({
        error: 'Title and content are required',
        success: false
      }, { status: 400 })
      return addCorsHeaders(response)
    }

    // Check content length (warn if very long)
    if (postData.content.length > 100000) { // 100KB
      console.warn('⚠️ Very long content detected:', postData.content.length, 'characters')
    }

    console.log('🗄️ Creating post in database...')
    const newPost = await PostsDB.create(postData)

    if (!newPost) {
      console.error('❌ PostsDB.create returned null')
      const response = NextResponse.json({
        error: 'Failed to create post - database returned null',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    console.log('✅ Post created successfully:', newPost.id)

    const response = NextResponse.json({
      post: newPost,
      success: true,
      message: 'Post created successfully'
    }, { status: 201 })
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ Detailed POST error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint
    })
    
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create post',
      success: false,
      // Include more error details for debugging
      errorCode: (error as any)?.code,
      errorDetails: (error as any)?.details,
      errorHint: (error as any)?.hint
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}