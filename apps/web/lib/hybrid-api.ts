// apps/web/lib/hybrid-api.ts - UPDATED with Better Category Handling
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import { BlogPost, Author, Category, Tag, PostFrontmatter } from '@/types/blog'
import { getReadingTime } from '@/lib/utils'

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://blog-admin-final.vercel.app'
const postsDirectory = path.join(process.cwd(), 'content/blog')

// Configure remark processor
const processor = remark()
  .use(remarkGfm)
  .use(remarkHtml, { sanitize: false })

// Authors database
const authors: Record<string, Author> = {
  'seda-tokmak': {
    name: 'Seda Tokmak',
    bio: '100leşme yolculuğunun yazarı, Saica Pack Türkiye Genel Müdürü.',
    avatar: '/images/authors/seda-tokmak.svg',
    social: {
      linkedin: 'https://linkedin.com/in/seda-tokmak',
      website: 'https://100lesme.com',
    },
  },
}

// Fetch from admin API with better error handling
async function fetchFromAdmin(endpoint: string) {
  try {
    console.log(`Fetching from admin API: ${ADMIN_API_URL}/api/${endpoint}`)
    
    const response = await fetch(`${ADMIN_API_URL}/api/${endpoint}`, {
      next: { revalidate: 30 },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`Admin API response status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`Admin API data for ${endpoint}:`, data)
      return data
    } else {
      console.warn(`Admin API returned ${response.status} for ${endpoint}`)
    }
  } catch (error) {
    console.warn(`Admin API unavailable for ${endpoint}:`, error)
  }
  return null
}

export async function getAllPosts(): Promise<BlogPost[]> {
  // Try admin API first
  const adminData = await fetchFromAdmin('posts')
  
  if (adminData?.posts?.length > 0) {
    console.log(`Found ${adminData.posts.length} posts from admin API`)
    
    return adminData.posts
      .filter((post: any) => post.status === 'published')
      .map((post: any) => ({
        slug: post.slug,
        title: post.title,
        description: post.excerpt || '',
        content: post.content,
        date: post.publishedAt || post.createdAt,
        published: true,
        featured: post.featured || false,
        author: authors['seda-tokmak'],
        category: post.categoryName || 'General',
        tags: post.tags || [],
        coverImage: undefined,
        readingTime: Math.ceil((post.content || '').split(' ').length / 200) || 1,
        excerpt: post.excerpt || '',
        seo: {
          title: post.seoTitle || post.title,
          description: post.seoDescription || post.excerpt,
        },
      }))
  }

  console.log('Admin API unavailable, falling back to file system')

  // Fallback to file system
  try {
    if (!fs.existsSync(postsDirectory)) {
      console.log('Posts directory does not exist')
      return []
    }
    
    const files = fs.readdirSync(postsDirectory)
    const slugs = files
      .filter(file => file.endsWith('.mdx') || file.endsWith('.md'))
      .map(file => file.replace(/\.(mdx|md)$/, ''))

    const posts = await Promise.all(
      slugs.map(async slug => {
        try {
          const fullPath = path.join(postsDirectory, `${slug}.mdx`)
          if (!fs.existsSync(fullPath)) return null

          const fileContents = fs.readFileSync(fullPath, 'utf8')
          const { data, content } = matter(fileContents)
          const frontmatter = data as PostFrontmatter

          const processedContent = await processor.process(content)
          const htmlContent = processedContent.toString()

          return {
            slug,
            title: frontmatter.title,
            description: frontmatter.description,
            content: htmlContent,
            date: frontmatter.date,
            published: frontmatter.published ?? true,
            featured: frontmatter.featured ?? false,
            author: authors[frontmatter.author] || authors['seda-tokmak'],
            category: frontmatter.category,
            tags: frontmatter.tags || [],
            coverImage: frontmatter.coverImage,
            readingTime: getReadingTime(content),
            excerpt: frontmatter.description || content.slice(0, 160) + '...',
            seo: frontmatter.seo,
          } as BlogPost
        } catch (error) {
          console.error(`Error processing ${slug}:`, error)
          return null
        }
      })
    )

    return posts
      .filter((post): post is BlogPost => post !== null)
      .filter(post => post.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error getting posts:', error)
    return []
  }
}

export async function getAllCategories(): Promise<Category[]> {
  // Try admin API first
  const adminData = await fetchFromAdmin('categories')
  
  if (adminData?.categories?.length > 0) {
    console.log(`Found ${adminData.categories.length} categories from admin API`)
    
    // Get all posts to calculate accurate post counts
    const allPosts = await getAllPosts()
    
    return adminData.categories.map((cat: any) => {
      // Calculate actual post count for this category
      const postCount = allPosts.filter(post => 
        post.category.toLowerCase().replace(/\s+/g, '-') === cat.slug ||
        post.category.toLowerCase() === cat.name.toLowerCase()
      ).length
      
      return {
        slug: cat.slug,
        name: cat.name,
        description: cat.description || '',
        postCount: postCount, // Use calculated post count
      }
    })
  }

  console.log('Admin API categories unavailable, using fallback')

  // Fallback to default categories
  return [
    { slug: 'general', name: 'General', description: 'General posts', postCount: 0 },
    { slug: 'business', name: 'Business', description: 'Business posts', postCount: 0 },
    { slug: 'technology', name: 'Technology', description: 'Technology posts', postCount: 0 },
    { slug: 'lifestyle', name: 'Lifestyle', description: 'Lifestyle posts', postCount: 0 },
  ]
}

// IMPROVED: Better category matching
export async function getPostsByCategory(categorySlug: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  const allCategories = await getAllCategories()
  
  // Find the category by slug
  const category = allCategories.find(cat => cat.slug === categorySlug)
  
  if (!category) {
    return []
  }
  
  // Filter posts by category name or slug
  return allPosts.filter(post => {
    const postCategorySlug = post.category.toLowerCase().replace(/\s+/g, '-')
    const postCategoryName = post.category.toLowerCase()
    const categoryName = category.name.toLowerCase()
    
    return postCategorySlug === categorySlug || 
           postCategoryName === categoryName ||
           post.category === category.name
  })
}

// Re-export other functions
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const allPosts = await getAllPosts()
  return allPosts.find(post => post.slug === slug) || null
}

export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => post.featured)
}

export async function getPostsByTag(tagSlug: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => 
    post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === tagSlug)
  )
}

export async function getRelatedPosts(currentSlug: string, limit: number = 3): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter(post => post.slug !== currentSlug).slice(0, limit)
}

export async function getAllTags(): Promise<Tag[]> {
  const allPosts = await getAllPosts()
  const tagMap = new Map<string, number>()

  allPosts.forEach(post => {
    post.tags.forEach(tag => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    })
  })

  return Array.from(tagMap.entries()).map(([name, postCount]) => ({
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    postCount,
  }))
}