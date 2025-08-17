// Replace your entire apps/admin/lib/supabase.ts with this:

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create mock client that matches Supabase API
const createMockClient = () => ({
  from: (table: string) => ({
    select: (columns?: string) => ({
      order: (column: string) => Promise.resolve({ data: [], error: null }),
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      single: () => Promise.resolve({ data: null, error: null })
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: () => Promise.resolve({ data: null, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: (columns?: string) => ({
          single: () => Promise.resolve({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ error: null })
    })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  }
})

// Function to create real Supabase client safely
const createSupabaseClient = (url: string, key: string, options?: any): SupabaseClient => {
  try {
    return createClient(url, key, options)
  } catch (error) {
    console.warn('Failed to create Supabase client, using mock:', error)
    return createMockClient() as any
  }
}

// Export clients with fallbacks
export const supabase: SupabaseClient = 
  supabaseUrl && supabaseAnonKey
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey)
    : createMockClient() as any

export const supabaseAdmin: SupabaseClient = 
  supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
    ? createSupabaseClient(
        supabaseUrl, 
        supabaseServiceKey || supabaseAnonKey!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
    : createMockClient() as any

// Log warning if using mock clients
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables missing. Using mock clients.')
}

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