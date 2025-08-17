// Replace your entire apps/web/lib/supabase.ts with this:

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Hardcode the values for now to avoid environment variable issues
const supabaseUrl = 'https://vyyvgrnzygmusosflnht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eXZncm56eWdtdXNvc2Zsbmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzODkxNzcsImV4cCI6MjA3MDk2NTE3N30.jXj0-3CDkaroTWuShUYzV-nTJH3WyePw1czeqmNzXPc'

console.log('🔍 Website Supabase Environment Check:', {
  url: `${supabaseUrl.substring(0, 20)}...`,
  anonKey: `${supabaseAnonKey.substring(0, 20)}...`,
  source: 'HARDCODED'
})

// Create Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Website Supabase client created successfully')