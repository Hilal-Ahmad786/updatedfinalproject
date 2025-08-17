// Create this file: apps/admin/app/api/debug/route.ts

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 Starting debug check...')
    
    // Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
    
    console.log('🔍 Environment variables:', envCheck)
    
    // Test Supabase connection
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('count(*)')
      .limit(1)
    
    console.log('🔍 Supabase test result:', { data, error })
    
    if (error) {
      console.error('❌ Supabase connection error:', error)
      return NextResponse.json({
        status: 'error',
        message: 'Supabase connection failed',
        envCheck,
        supabaseError: error.message,
        details: error
      }, { status: 500 })
    }
    
    console.log('✅ Debug check successful!')
    
    return NextResponse.json({
      status: 'success',
      message: 'Everything is working!',
      envCheck,
      supabaseConnection: 'OK',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Debug check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Debug check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}