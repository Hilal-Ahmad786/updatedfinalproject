// apps/admin/lib/database/posts.ts
// Complete updated version with featured image support

import { supabaseAdmin } from '@/lib/supabase'

export interface PostWithCategories {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  author: string
  categories: string[]
  tags: string[]
  featuredImage?: { // ✅ NEW: Add featured image support
    url: string
    altText?: string
    caption?: string
  } | null
  seo?: {
    title?: string
    description?: string
    keywords?: string[]
  }
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

export class PostsDB {
  // Get all posts with categories and author info
  static async getAll(): Promise<PostWithCategories[]> {
    try {
      const { data: posts, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(name),
          post_categories(
            categories(slug, name)
          ),
          post_tags(tag)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return posts?.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured: post.featured,
        author: post.users?.name || 'Admin',
        categories: post.post_categories?.map((pc: any) => pc.categories.slug) || [],
        tags: post.post_tags?.map((pt: any) => pt.tag) || [],
        featuredImage: post.featured_image_url ? { // ✅ NEW: Include featured image
          url: post.featured_image_url,
          altText: post.featured_image_alt,
          caption: post.featured_image_caption
        } : null,
        seo: {
          title: post.seo_title,
          description: post.seo_description,
          keywords: post.seo_keywords
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at
      })) || []
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  }

  // Get single post by ID
  static async getById(id: string): Promise<PostWithCategories | null> {
    try {
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(name),
          post_categories(
            categories(slug, name)
          ),
          post_tags(tag)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      if (!post) return null

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured: post.featured,
        author: post.users?.name || 'Admin',
        categories: post.post_categories?.map((pc: any) => pc.categories.slug) || [],
        tags: post.post_tags?.map((pt: any) => pt.tag) || [],
        featuredImage: post.featured_image_url ? { // ✅ NEW: Include featured image
          url: post.featured_image_url,
          altText: post.featured_image_alt,
          caption: post.featured_image_caption
        } : null,
        seo: {
          title: post.seo_title,
          description: post.seo_description,
          keywords: post.seo_keywords
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      return null
    }
  }

  // Get post by slug
  static async getBySlug(slug: string): Promise<PostWithCategories | null> {
    try {
      const { data: post, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(name),
          post_categories(
            categories(slug, name)
          ),
          post_tags(tag)
        `)
        .eq('slug', slug)
        .single()

      if (error) throw error

      if (!post) return null

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured: post.featured,
        author: post.users?.name || 'Admin',
        categories: post.post_categories?.map((pc: any) => pc.categories.slug) || [],
        tags: post.post_tags?.map((pt: any) => pt.tag) || [],
        featuredImage: post.featured_image_url ? { // ✅ NEW: Include featured image
          url: post.featured_image_url,
          altText: post.featured_image_alt,
          caption: post.featured_image_caption
        } : null,
        seo: {
          title: post.seo_title,
          description: post.seo_description,
          keywords: post.seo_keywords
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at
      }
    } catch (error) {
      console.error('Error fetching post by slug:', error)
      return null
    }
  }

  // Create new post with featured image support
  static async create(postData: {
    title: string
    content: string
    excerpt?: string
    status?: 'draft' | 'published'
    featured?: boolean
    categories?: string[]
    tags?: string[]
    featuredImage?: { // ✅ NEW: Add featured image parameter
      id?: string
      url: string
      altText?: string
      caption?: string
    } | null
    seo?: {
      title?: string
      description?: string
      keywords?: string[]
    }
  }): Promise<PostWithCategories | null> {
    try {
      // Generate slug from title
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Insert post with featured image support
      const { data: newPost, error: postError } = await supabaseAdmin
        .from('posts')
        .insert({
          title: postData.title,
          slug,
          content: postData.content,
          excerpt: postData.excerpt || null,
          status: postData.status || 'draft',
          featured: postData.featured || false,
          author_id: '00000000-0000-0000-0000-000000000001', // Default admin ID
          featured_image_url: postData.featuredImage?.url || null, // ✅ NEW
          featured_image_alt: postData.featuredImage?.altText || null, // ✅ NEW
          featured_image_caption: postData.featuredImage?.caption || null, // ✅ NEW
          seo_title: postData.seo?.title || null,
          seo_description: postData.seo?.description || null,
          seo_keywords: postData.seo?.keywords || null,
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (postError) throw postError

      // Add categories if provided
      if (postData.categories?.length) {
        await PostsDB.updateCategories(newPost.id, postData.categories)
      }

      // Add tags if provided
      if (postData.tags?.length) {
        await PostsDB.updateTags(newPost.id, postData.tags)
      }

      // Return the created post
      return await PostsDB.getById(newPost.id)
    } catch (error) {
      console.error('Error creating post:', error)
      return null
    }
  }

  // Update post with featured image support
  static async update(id: string, updates: {
    title?: string
    content?: string
    excerpt?: string
    status?: 'draft' | 'published'
    featured?: boolean
    categories?: string[]
    tags?: string[]
    featuredImage?: { // ✅ NEW: Add featured image parameter
      id?: string
      url: string
      altText?: string
      caption?: string
    } | null
    seo?: {
      title?: string
      description?: string
      keywords?: string[]
    }
  }): Promise<PostWithCategories | null> {
    try {
      const updateData: any = {}

      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.excerpt !== undefined) updateData.excerpt = updates.excerpt
      if (updates.status !== undefined) {
        updateData.status = updates.status
        if (updates.status === 'published') {
          updateData.published_at = new Date().toISOString()
        }
      }
      if (updates.featured !== undefined) updateData.featured = updates.featured
      
      // ✅ NEW: Handle featured image updates
      if (updates.featuredImage !== undefined) {
        if (updates.featuredImage) {
          updateData.featured_image_url = updates.featuredImage.url
          updateData.featured_image_alt = updates.featuredImage.altText
          updateData.featured_image_caption = updates.featuredImage.caption
        } else {
          // Remove featured image
          updateData.featured_image_url = null
          updateData.featured_image_alt = null
          updateData.featured_image_caption = null
        }
      }

      if (updates.seo?.title !== undefined) updateData.seo_title = updates.seo.title
      if (updates.seo?.description !== undefined) updateData.seo_description = updates.seo.description
      if (updates.seo?.keywords !== undefined) updateData.seo_keywords = updates.seo.keywords

      // Generate new slug if title changed
      if (updates.title) {
        updateData.slug = updates.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      const { error: updateError } = await supabaseAdmin
        .from('posts')
        .update(updateData)
        .eq('id', id)

      if (updateError) throw updateError

      // Update categories if provided
      if (updates.categories !== undefined) {
        await PostsDB.updateCategories(id, updates.categories)
      }

      // Update tags if provided
      if (updates.tags !== undefined) {
        await PostsDB.updateTags(id, updates.tags)
      }

      return await PostsDB.getById(id)
    } catch (error) {
      console.error('Error updating post:', error)
      return null
    }
  }

  // Delete post
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  // Update post categories
  static async updateCategories(postId: string, categoryIds: string[]): Promise<void> {
    try {
      // Remove existing categories
      await supabaseAdmin
        .from('post_categories')
        .delete()
        .eq('post_id', postId)

      // Get category IDs from slugs
      if (categoryIds.length > 0) {
        const { data: categories, error: catError } = await supabaseAdmin
          .from('categories')
          .select('id, slug')
          .in('slug', categoryIds)

        if (catError) throw catError

        if (categories?.length) {
          const categoryInserts = categories.map(cat => ({
            post_id: postId,
            category_id: cat.id
          }))

          const { error: insertError } = await supabaseAdmin
            .from('post_categories')
            .insert(categoryInserts)

          if (insertError) throw insertError
        }
      }
    } catch (error) {
      console.error('Error updating categories:', error)
    }
  }

  // Update post tags
  static async updateTags(postId: string, tags: string[]): Promise<void> {
    try {
      // Remove existing tags
      await supabaseAdmin
        .from('post_tags')
        .delete()
        .eq('post_id', postId)

      // Add new tags
      if (tags.length > 0) {
        const tagInserts = tags.map(tag => ({
          post_id: postId,
          tag: tag.toLowerCase().trim()
        }))

        const { error } = await supabaseAdmin
          .from('post_tags')
          .insert(tagInserts)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error updating tags:', error)
    }
  }

  // Get published posts (for website) with featured images
  static async getPublished(): Promise<PostWithCategories[]> {
    try {
      const { data: posts, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(name),
          post_categories(
            categories(slug, name)
          ),
          post_tags(tag)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (error) throw error

      return posts?.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured: post.featured,
        author: post.users?.name || 'Admin',
        categories: post.post_categories?.map((pc: any) => pc.categories.slug) || [],
        tags: post.post_tags?.map((pt: any) => pt.tag) || [],
        featuredImage: post.featured_image_url ? { // ✅ NEW: Include featured image
          url: post.featured_image_url,
          altText: post.featured_image_alt,
          caption: post.featured_image_caption
        } : null,
        seo: {
          title: post.seo_title,
          description: post.seo_description,
          keywords: post.seo_keywords
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at
      })) || []
    } catch (error) {
      console.error('Error fetching published posts:', error)
      return []
    }
  }

  // Get featured posts with featured images
  static async getFeatured(): Promise<PostWithCategories[]> {
    try {
      const { data: posts, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(name),
          post_categories(
            categories(slug, name)
          ),
          post_tags(tag)
        `)
        .eq('status', 'published')
        .eq('featured', true)
        .order('published_at', { ascending: false })

      if (error) throw error

      return posts?.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        featured: post.featured,
        author: post.users?.name || 'Admin',
        categories: post.post_categories?.map((pc: any) => pc.categories.slug) || [],
        tags: post.post_tags?.map((pt: any) => pt.tag) || [],
        featuredImage: post.featured_image_url ? { // ✅ NEW: Include featured image
          url: post.featured_image_url,
          altText: post.featured_image_alt,
          caption: post.featured_image_caption
        } : null,
        seo: {
          title: post.seo_title,
          description: post.seo_description,
          keywords: post.seo_keywords
        },
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at
      })) || []
    } catch (error) {
      console.error('Error fetching featured posts:', error)
      return []
    }
  }
}