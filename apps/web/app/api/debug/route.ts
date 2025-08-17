// Replace your apps/web/app/api/debug/route.ts with this:

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Website Debug Check Starting...')
    
    // Test admin API connection
    let adminApiTest = 'NOT_TESTED'
    const adminUrl = 'https://blog-admin-final.vercel.app'
    
    try {
      const response = await fetch(`${adminUrl}/api/categories`)
      adminApiTest = response.ok ? 'SUCCESS' : `ERROR_${response.status}`
      console.log(`Admin API test: ${adminApiTest}`)
    } catch (error) {
      adminApiTest = `FETCH_ERROR: ${error instanceof Error ? error.message : 'Unknown'}`
      console.error('Admin API test failed:', error)
    }
    
    // Test Supabase connection
    let supabaseTest = 'NOT_TESTED'
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.from('categories').select('*').limit(1)
      
      if (error) {
        supabaseTest = `SUPABASE_ERROR: ${error.message}`
      } else {
        supabaseTest = 'SUCCESS'
      }
      console.log(`Supabase test: ${supabaseTest}`)
    } catch (error) {
      supabaseTest = `IMPORT_ERROR: ${error instanceof Error ? error.message : 'Unknown'}`
      console.error('Supabase test failed:', error)
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Website debug check complete',
      tests: {
        adminApiTest,
        supabaseTest
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Website debug check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Website debug check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}