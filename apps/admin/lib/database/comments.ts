// 2. apps/admin/lib/database/comments.ts
// Comments database operations

import { supabaseAdmin } from '@/lib/supabase'

export interface Comment {
  id: string
  postId: string
  postTitle: string
  author: {
    name: string
    email: string
    website?: string
    avatar?: string
    isRegistered: boolean
  }
  content: string
  status: 'pending' | 'approved' | 'spam' | 'trash'
  createdAt: string
  updatedAt: string
  parentId?: string
  likes: number
  dislikes: number
  isEdited: boolean
  ipAddress: string
  userAgent: string
  flagged: boolean
  flagReasons: string[]
}

export class CommentsDB {
  // Get all comments with post info
  static async getAll(): Promise<Comment[]> {
    try {
      const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          posts!comments_post_id_fkey(title, slug)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return comments?.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        postTitle: comment.posts?.title || 'Unknown Post',
        author: {
          name: comment.author_name,
          email: comment.author_email,
          website: comment.author_website,
          avatar: comment.author_avatar,
          isRegistered: !!comment.user_id
        },
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        parentId: comment.parent_id,
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        isEdited: false, // Could track this with updated_at vs created_at
        ipAddress: comment.ip_address || '',
        userAgent: comment.user_agent || '',
        flagged: comment.is_flagged || false,
        flagReasons: comment.flag_reasons || []
      })) || []
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  }

  // Get comments by post ID
  static async getByPostId(postId: string, status?: string): Promise<Comment[]> {
    try {
      let query = supabaseAdmin
        .from('comments')
        .select(`
          *,
          posts!comments_post_id_fkey(title, slug)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (status) {
        query = query.eq('status', status)
      }

      const { data: comments, error } = await query

      if (error) throw error

      return comments?.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        postTitle: comment.posts?.title || 'Unknown Post',
        author: {
          name: comment.author_name,
          email: comment.author_email,
          website: comment.author_website,
          avatar: comment.author_avatar,
          isRegistered: !!comment.user_id
        },
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        parentId: comment.parent_id,
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        isEdited: false,
        ipAddress: comment.ip_address || '',
        userAgent: comment.user_agent || '',
        flagged: comment.is_flagged || false,
        flagReasons: comment.flag_reasons || []
      })) || []
    } catch (error) {
      console.error('Error fetching comments by post:', error)
      return []
    }
  }

  // Get comments by status
  static async getByStatus(status: string): Promise<Comment[]> {
    try {
      const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          posts!comments_post_id_fkey(title, slug)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error

      return comments?.map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        postTitle: comment.posts?.title || 'Unknown Post',
        author: {
          name: comment.author_name,
          email: comment.author_email,
          website: comment.author_website,
          avatar: comment.author_avatar,
          isRegistered: !!comment.user_id
        },
        content: comment.content,
        status: comment.status,
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        parentId: comment.parent_id,
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        isEdited: false,
        ipAddress: comment.ip_address || '',
        userAgent: comment.user_agent || '',
        flagged: comment.is_flagged || false,
        flagReasons: comment.flag_reasons || []
      })) || []
    } catch (error) {
      console.error('Error fetching comments by status:', error)
      return []
    }
  }

  // Create new comment
  static async create(commentData: {
    postId: string
    author: {
      name: string
      email: string
      website?: string
      avatar?: string
    }
    content: string
    status?: 'pending' | 'approved' | 'spam' | 'trash'
    parentId?: string
    ipAddress?: string
    userAgent?: string
  }): Promise<Comment | null> {
    try {
      const { data: newComment, error } = await supabaseAdmin
        .from('comments')
        .insert({
          post_id: commentData.postId,
          author_name: commentData.author.name,
          author_email: commentData.author.email,
          author_website: commentData.author.website || null,
          author_avatar: commentData.author.avatar || null,
          content: commentData.content,
          status: commentData.status || 'pending',
          parent_id: commentData.parentId || null,
          ip_address: commentData.ipAddress || null,
          user_agent: commentData.userAgent || null
        })
        .select()
        .single()

      if (error) throw error

      // Get post title for the response
      const { data: post } = await supabaseAdmin
        .from('posts')
        .select('title')
        .eq('id', commentData.postId)
        .single()

      return {
        id: newComment.id,
        postId: newComment.post_id,
        postTitle: post?.title || 'Unknown Post',
        author: {
          name: newComment.author_name,
          email: newComment.author_email,
          website: newComment.author_website,
          avatar: newComment.author_avatar,
          isRegistered: !!newComment.user_id
        },
        content: newComment.content,
        status: newComment.status,
        createdAt: newComment.created_at,
        updatedAt: newComment.updated_at,
        parentId: newComment.parent_id,
        likes: newComment.likes || 0,
        dislikes: newComment.dislikes || 0,
        isEdited: false,
        ipAddress: newComment.ip_address || '',
        userAgent: newComment.user_agent || '',
        flagged: newComment.is_flagged || false,
        flagReasons: newComment.flag_reasons || []
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      return null
    }
  }

  // Update comment
  static async update(id: string, updates: {
    status?: 'pending' | 'approved' | 'spam' | 'trash'
    flagged?: boolean
    flagReasons?: string[]
    likes?: number
    dislikes?: number
  }): Promise<Comment | null> {
    try {
      const updateData: any = {}

      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.flagged !== undefined) updateData.is_flagged = updates.flagged
      if (updates.flagReasons !== undefined) updateData.flag_reasons = updates.flagReasons
      if (updates.likes !== undefined) updateData.likes = updates.likes
      if (updates.dislikes !== undefined) updateData.dislikes = updates.dislikes

      const { data: updatedComment, error } = await supabaseAdmin
        .from('comments')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          posts!comments_post_id_fkey(title)
        `)
        .single()

      if (error) throw error

      return {
        id: updatedComment.id,
        postId: updatedComment.post_id,
        postTitle: updatedComment.posts?.title || 'Unknown Post',
        author: {
          name: updatedComment.author_name,
          email: updatedComment.author_email,
          website: updatedComment.author_website,
          avatar: updatedComment.author_avatar,
          isRegistered: !!updatedComment.user_id
        },
        content: updatedComment.content,
        status: updatedComment.status,
        createdAt: updatedComment.created_at,
        updatedAt: updatedComment.updated_at,
        parentId: updatedComment.parent_id,
        likes: updatedComment.likes || 0,
        dislikes: updatedComment.dislikes || 0,
        isEdited: false,
        ipAddress: updatedComment.ip_address || '',
        userAgent: updatedComment.user_agent || '',
        flagged: updatedComment.is_flagged || false,
        flagReasons: updatedComment.flag_reasons || []
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      return null
    }
  }

  // Delete comment
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('comments')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  }

  // Bulk update status
  static async bulkUpdateStatus(ids: string[], status: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('comments')
        .update({ status })
        .in('id', ids)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error bulk updating comments:', error)
      return false
    }
  }

  // Get comment statistics
  static async getStats() {
    try {
      const { data: comments, error } = await supabaseAdmin
        .from('comments')
        .select('status, created_at')

      if (error) throw error

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const stats = {
        total: comments?.length || 0,
        approved: comments?.filter(c => c.status === 'approved').length || 0,
        pending: comments?.filter(c => c.status === 'pending').length || 0,
        spam: comments?.filter(c => c.status === 'spam').length || 0,
        trash: comments?.filter(c => c.status === 'trash').length || 0,
        todayCount: comments?.filter(c => new Date(c.created_at) >= today).length || 0,
        averagePerPost: 0 // Will calculate separately if needed
      }

      return stats
    } catch (error) {
      console.error('Error fetching comment stats:', error)
      return {
        total: 0,
        approved: 0,
        pending: 0,
        spam: 0,
        trash: 0,
        todayCount: 0,
        averagePerPost: 0
      }
    }
  }
}