// Replace your entire apps/admin/lib/supabase.ts with this:

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Try multiple environment variable names and methods
const getSupabaseUrl = (): string => {
  return process.env.SUPABASE_PROJECT_URL || 
         process.env.NEXT_PUBLIC_SUPABASE_URL || 
         'https://vyyvgrnzygmusosflnht.supabase.co'
}

const getSupabaseKey = (): string => {
  return process.env.SUPABASE_ANON_KEY || 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
         'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5eXZncm56eWdtdXNvc2Zsbmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzODkxNzcsImV4cCI6MjA3MDk2NTE3N30.jXj0-3CDkaroTWuShUYzV-nTJH3WyePw1czeqmNzXPc'
}

// Get environment variables
const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log environment status for debugging
console.log('🔍 Supabase Environment Check (New Method):', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  serviceKey: supabaseServiceKey ? 'PRESENT' : 'MISSING',
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  sources: {
    urlFrom: process.env.SUPABASE_PROJECT_URL ? 'SUPABASE_PROJECT_URL' : 
             process.env.NEXT_PUBLIC_SUPABASE_URL ? 'NEXT_PUBLIC_SUPABASE_URL' : 'HARDCODED',
    keyFrom: process.env.SUPABASE_ANON_KEY ? 'SUPABASE_ANON_KEY' : 
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : 'HARDCODED'
  },
  availableSupabaseEnvs: Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase'))
})

// Validate that we have the values (even if hardcoded)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Supabase configuration failed. URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}`)
}

// Create real Supabase clients
console.log('✅ Creating Supabase clients...')

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

console.log('✅ Supabase clients created successfully')

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          status: 'draft' | 'published' | 'archived'
          featured: boolean
          featured_image_id: string | null
          author_id: string
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          title: string
          slug: string
          content: string
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          featured?: boolean
          featured_image_id?: string | null
          author_id: string
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
        }
        Update: {
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          status?: 'draft' | 'published' | 'archived'
          featured?: boolean
          featured_image_id?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          color: string
          post_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          description?: string | null
          color?: string
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          color?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          parent_id: string | null
          author_name: string
          author_email: string
          author_website: string | null
          author_avatar: string | null
          user_id: string | null
          content: string
          status: 'pending' | 'approved' | 'spam' | 'trash'
          likes: number
          dislikes: number
          is_flagged: boolean
          flag_reasons: string[] | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          post_id: string
          parent_id?: string | null
          author_name: string
          author_email: string
          author_website?: string | null
          author_avatar?: string | null
          user_id?: string | null
          content: string
          status?: 'pending' | 'approved' | 'spam' | 'trash'
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'spam' | 'trash'
          likes?: number
          dislikes?: number
          is_flagged?: boolean
          flag_reasons?: string[] | null
        }
      }
      media: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size: number
          width: number | null
          height: number | null
          url: string
          thumbnail_url: string | null
          alt_text: string | null
          caption: string | null
          folder: string
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          filename: string
          original_name: string
          mime_type: string
          size: number
          width?: number | null
          height?: number | null
          url: string
          thumbnail_url?: string | null
          alt_text?: string | null
          caption?: string | null
          folder?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          folder?: string
        }
      }
      settings: {
        Row: {
          id: string
          section: string
          key: string
          value: any
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          section: string
          key: string
          value: any
          description?: string | null
        }
        Update: {
          value?: any
          description?: string | null
        }
      }
    }
  }
}