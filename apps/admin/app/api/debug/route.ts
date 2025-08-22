

// apps/admin/app/api/debug/route.ts
// Create this file to test database connection

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Debug API - Testing database connection...')
    
    // Test 1: Check Supabase client
    console.log('✅ Supabase client exists:', !!supabaseAdmin)
    
    // Test 2: Simple query
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(1)
    
    console.log('👥 Users query:', { users, usersError })
    
    // Test 3: Categories query
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .limit(1)
    
    console.log('📂 Categories query:', { categories, categoriesError })
    
    // Test 4: Posts table structure
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .limit(1)
    
    console.log('📝 Posts query:', { posts, postsError })
    
    return NextResponse.json({
      success: true,
      tests: {
        supabaseClient: !!supabaseAdmin,
        usersTable: { 
          success: !usersError, 
          error: usersError?.message,
          count: users?.length || 0 
        },
        categoriesTable: { 
          success: !categoriesError, 
          error: categoriesError?.message,
          count: categories?.length || 0 
        },
        postsTable: { 
          success: !postsError, 
          error: postsError?.message,
          count: posts?.length || 0 
        }
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseUrl: !!process.env.SUPABASE_PROJECT_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    })
  } catch (error) {
    console.error('❌ Debug API Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}