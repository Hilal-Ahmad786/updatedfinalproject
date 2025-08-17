// Replace your entire apps/admin/lib/supabase.ts with this:

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import getConfig from 'next/config'

// Try multiple ways to get environment variables
const getEnvVar = (name: string): string | undefined => {
  // Method 1: Direct process.env
  let value = process.env[name]
  
  // Method 2: Next.js config (if available)
  if (!value && typeof window === 'undefined') {
    try {
      const { publicRuntimeConfig } = getConfig() || {}
      value = publicRuntimeConfig?.[name]
    } catch (error) {
      // getConfig might not be available during build
    }
  }
  
  return value
}

// Get environment variables using multiple methods
const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const supabaseServiceKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY')

// Log environment status for debugging
console.log('🔍 Supabase Environment Check:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  anonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
  serviceKey: supabaseServiceKey ? 'PRESENT' : 'MISSING',
  nodeEnv: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
  availableSupabaseEnvs: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
})

// Validate environment variables with better error messages
if (!supabaseUrl) {
  const availableEnvs = Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ')
  throw new Error(`Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Available Supabase env vars: ${availableEnvs || 'none'}`)
}

if (!supabaseAnonKey) {
  const availableEnvs = Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', ')
  throw new Error(`Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Available Supabase env vars: ${availableEnvs || 'none'}`)
}

// Create real Supabase clients
console.log('✅ Creating real Supabase clients...')

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