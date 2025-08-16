// apps/web/lib/hybrid-api.ts
import { BlogPost as Post, Category } from '@/types/blog';
import { getAllPosts as getFallbackPosts } from './api';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://blog-admin-final.vercel.app';

async function fetchFromAdmin(endpoint: string): Promise<any> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.warn(`Admin API request to ${endpoint} failed:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    const adminData = await fetchFromAdmin('/posts?status=published');
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      return adminData.posts.map(formatAdminPost);
    }
  } catch (error) {
    console.warn('Failed to fetch from admin API, falling back to MDX:', error);
  }

  return getFallbackPosts();
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const adminData = await fetchFromAdmin('/categories');
    if (adminData?.categories && Array.isArray(adminData.categories)) {
      return adminData.categories.map(formatAdminCategory);
    }
  } catch (error) {
    console.warn('Failed to fetch categories from admin API:', error);
  }

  // Return safe fallback categories
  return [
    { slug: 'general', name: 'General', description: 'General posts', postCount: 0 },
    { slug: 'technology', name: 'Technology', description: 'Technology posts', postCount: 0 },
    { slug: 'lifestyle', name: 'Lifestyle', description: 'Lifestyle posts', postCount: 0 }
  ];
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => {
    if (!post.category) return false;
    return post.category === categorySlug;
  });
}

function formatAdminPost(adminPost: any): Post {
  return {
    slug: adminPost.slug || 'untitled',
    title: adminPost.title || 'Untitled',
    description: adminPost.excerpt || adminPost.content?.substring(0, 200) + '...' || '',
    content: adminPost.content || '',
    date: adminPost.createdAt || new Date().toISOString(),
    published: adminPost.status === 'published',
    featured: adminPost.featured || false,
    author: {
      name: adminPost.author || 'Admin',
      bio: 'Blog author',
    },
    category: Array.isArray(adminPost.categories) ? adminPost.categories[0] || 'general' : 'general',
    tags: Array.isArray(adminPost.tags) ? adminPost.tags : [],
    coverImage: adminPost.image || '/images/blog/default.jpg',
    readingTime: calculateReadTime(adminPost.content || ''),
    excerpt: adminPost.excerpt || adminPost.content?.substring(0, 200) + '...' || '',
    seo: adminPost.seo || {}
  };
}

function formatAdminCategory(adminCategory: any): Category {
  return {
    slug: adminCategory.slug || "unknown",
    name: adminCategory.name || 'Unknown',
    description: adminCategory.description || "",
    postCount: 0
  };
}

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    // Get all posts and find by slug
    const allPosts = await getAllPosts();
    return allPosts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.warn(`Failed to fetch post with slug ${slug}:`, error);
    return null;
  }
}

// Get featured posts
export async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const adminData = await fetchFromAdmin('/posts?status=published&featured=true');
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      return adminData.posts.map(formatAdminPost);
    }
  } catch (error) {
    console.warn('Failed to fetch featured posts from admin API:', error);
  }

  // Fallback to MDX featured posts
  const allPosts = await getFallbackPosts();
  return allPosts.filter(post => post.featured);
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const allPosts = await getAllPosts();
  return allPosts.filter(post => {
    const tags = post.tags;
    if (!tags || !Array.isArray(tags)) return false;
    return tags.includes(tag);
  });
}

// Test admin API connection
export async function testAdminConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${ADMIN_API_URL}/api/posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch {
    return false;
  }
}