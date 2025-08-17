// Replace your apps/admin/lib/supabase.ts with this:

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we're in build time and handle missing env vars gracefully
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.VERCEL && !process.env.VERCEL_ENV

// Create mock client for build time
const mockClient = {
  from: () => ({
    select: () => ({
      order: () => Promise.resolve({ data: [], error: null }),
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  }
}

// Handle missing environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (isBuildTime) {
    console.warn('Supabase environment variables not found during build. Using mock clients.')
  } else {
    throw new Error('Missing Supabase environment variables')
  }
}

// Export clients
export const supabase: SupabaseClient = (!supabaseUrl || !supabaseAnonKey) 
  ? (mockClient as any)
  : createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin: SupabaseClient = (!supabaseUrl || !supabaseAnonKey)
  ? (mockClient as any) 
  : createClient(
      supabaseUrl, 
      supabaseServiceKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

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