// apps/web/lib/admin-api.ts
import { BlogPost } from '@/types/blog'

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001'

interface AdminPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  viewCount: number
  authorId: string
  authorName: string
  categoryId: string
  categoryName: string
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  seoTitle: string
  seoDescription: string
  tags: string[]
}

export async function fetchPostsFromAdmin(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/posts`, {
      next: { revalidate: 30 },
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    const adminPosts: AdminPost[] = data.posts || []
    
    return adminPosts
      .filter(post => post.status === 'published')
      .map(post => ({
        slug: post.slug,
        title: post.title,
        description: post.excerpt || '',
        content: post.content,
        date: post.publishedAt || post.createdAt,
        published: true,
        featured: post.featured,
        author: {
          name: post.authorName || 'Admin User',
          bio: 'Blog Administrator',
          avatar: '/images/authors/admin.svg',
          social: {},
        },
        category: post.categoryName || 'General',
        tags: post.tags || [],
        coverImage: undefined,
        readingTime: Math.ceil(post.content.split(' ').length / 200),
        excerpt: post.excerpt || '',
        seo: {
          title: post.seoTitle,
          description: post.seoDescription,
        },
      }))
  } catch (error) {
    console.error('Error fetching posts from admin:', error)
    return []
  }
}