//apps/admin/app/api/posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/shared-data';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    const posts = dataStore.posts.getAll();
    return NextResponse.json({ 
      posts, 
      success: true, 
      total: posts.length 
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch posts',
      success: false 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const postData = await request.json();
    
    const post = dataStore.posts.create({
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt || postData.content.substring(0, 200) + '...',
      slug: postData.slug,
      status: postData.status || 'draft',
      featured: postData.featured || false,
      categories: postData.categories || [],
      tags: postData.tags || [],
      author: postData.author || 'Admin',
      seo: postData.seo || {}
    });
    
    return NextResponse.json({ 
      post, 
      success: true 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Failed to create post:', error);
    return NextResponse.json({ 
      error: 'Failed to create post',
      success: false 
    }, { status: 500, headers: corsHeaders });
  }
}