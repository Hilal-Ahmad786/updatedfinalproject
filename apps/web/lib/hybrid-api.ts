// apps/web/lib/hybrid-api.ts
// Enhanced version with proper category post counts

import { BlogPost as Post, Category } from '@/types/blog';
import { getAllPosts as getFallbackPosts } from './api';

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';

async function fetchFromAdmin(endpoint: string): Promise<any> {
  try {
    console.log(`🔄 Fetching from admin: ${ADMIN_API_URL}/api${endpoint}`);
    
    const response = await fetch(`${ADMIN_API_URL}/api${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ Admin API response for ${endpoint}:`, data);
    
    if (!data.success) {
      throw new Error(`API returned error: ${data.error || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.warn(`❌ Admin API request to ${endpoint} failed:`, error);
    return null;
  }
}

export async function getAllPosts(): Promise<Post[]> {
  try {
    console.log('🔄 Fetching all posts from database...');
    const adminData = await fetchFromAdmin('/posts?status=published');
    
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      console.log(`✅ Found ${adminData.posts.length} database posts`);
      return adminData.posts.map(formatAdminPost);
    } else {
      console.log('⚠️ No posts found in database response:', adminData);
    }
  } catch (error) {
    console.warn('❌ Failed to fetch from admin API, falling back to MDX:', error);
  }

  console.log('📝 Using fallback MDX posts');
  return getFallbackPosts();
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    console.log('🔄 Fetching categories from database...');
    
    // Fetch both categories and posts to calculate post counts
    const [categoriesData, postsData] = await Promise.all([
      fetchFromAdmin('/categories'),
      fetchFromAdmin('/posts?status=published')
    ]);
    
    if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
      console.log(`✅ Found ${categoriesData.categories.length} database categories`);
      
      const posts = postsData?.posts || [];
      console.log(`📊 Calculating post counts from ${posts.length} posts`);
      
interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

return categoriesData.categories.map((adminCategory: AdminCategory) =>
  formatAdminCategory(adminCategory, posts)
);
    } else {
      console.log('⚠️ No categories found in database response:', categoriesData);
    }
  } catch (error) {
    console.warn('❌ Failed to fetch categories from admin API:', error);
  }

  console.log('📝 Using fallback categories');
  return [
    { slug: 'general', name: 'General', description: 'General posts', postCount: 0 },
    { slug: 'technology', name: 'Technology', description: 'Technology posts', postCount: 0 },
    { slug: 'lifestyle', name: 'Lifestyle', description: 'Lifestyle posts', postCount: 0 }
  ];
}

export async function getPostsByCategory(categorySlug: string): Promise<Post[]> {
  try {
    console.log(`🔄 Fetching posts for category: ${categorySlug}`);
    const adminData = await fetchFromAdmin(`/posts?status=published&category=${categorySlug}`);
    
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      console.log(`✅ Found ${adminData.posts.length} posts for category ${categorySlug}`);
      return adminData.posts.map(formatAdminPost);
    }
  } catch (error) {
    console.warn(`❌ Failed to fetch posts for category ${categorySlug}:`, error);
  }

  // Fallback: filter all posts by category
  const allPosts = await getAllPosts();
  return allPosts.filter(post => {
    if (!post.category) return false;
    return post.category === categorySlug;
  });
}


function formatAdminPost(adminPost: any): Post {
  // Handle featured image properly
  let coverImage = '/images/blog/default.jpg'; // Default fallback
  
  if (adminPost.featuredImage && adminPost.featuredImage.url) {
    coverImage = adminPost.featuredImage.url;
  }
  
  return {
    slug: adminPost.slug || 'untitled',
    title: adminPost.title || 'Untitled',
    description: adminPost.excerpt || adminPost.content?.substring(0, 200) + '...' || '',
    content: adminPost.content || '',
    date: adminPost.createdAt || adminPost.publishedAt || new Date().toISOString(),
    published: adminPost.status === 'published',
    featured: adminPost.featured || false,
    author: {
      name: adminPost.author || 'Admin',
      bio: 'Blog author',
      avatar: '/images/authors/admin.svg',
      social: {},
    },
    category: Array.isArray(adminPost.categories) ? adminPost.categories[0] || 'general' : 'general',
    tags: Array.isArray(adminPost.tags) ? adminPost.tags : [],
    coverImage: coverImage, // ✅ Now uses the correct featured image
    readingTime: calculateReadTime(adminPost.content || ''),
    excerpt: adminPost.excerpt || adminPost.content?.substring(0, 200) + '...' || '',
    seo: adminPost.seo || {
      title: adminPost.title || 'Untitled',
      description: adminPost.excerpt || adminPost.content?.substring(0, 160) + '...' || '',
      keywords: []
    }
  };
}

function formatAdminCategory(adminCategory: any, posts: any[] = []): Category {
  // Calculate post count for this category
  const postCount = posts.filter(post => {
    if (!post.categories || !Array.isArray(post.categories)) return false;
    return post.categories.includes(adminCategory.slug);
  }).length;

  console.log(`📊 Category "${adminCategory.name}" has ${postCount} posts`);

  return {
    slug: adminCategory.slug || "unknown",
    name: adminCategory.name || 'Unknown',
    description: adminCategory.description || "",
    postCount: postCount // ✅ Real post count!
  };
}

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}

// Get single post by slug
// Replace the getPostBySlug function in apps/web/lib/hybrid-api.ts with this:

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    console.log(`🔄 Fetching post by slug: ${slug}`);
    
    // Get all published posts and find by slug
    console.log(`⚠️ Searching all posts for slug: ${slug}...`);
    const allPosts = await getAllPosts();
    const foundPost = allPosts.find(post => post.slug === slug);
    
    if (foundPost) {
      console.log(`✅ Found post ${slug}: ${foundPost.title}`);
      return foundPost;
    }
    
    console.log(`❌ Post ${slug} not found in published posts`);
    return null;
  } catch (error) {
    console.warn(`❌ Failed to fetch post with slug ${slug}:`, error);
    return null;
  }
}

// Get featured posts
export async function getFeaturedPosts(): Promise<Post[]> {
  try {
    console.log('🔄 Fetching featured posts from database...');
    const adminData = await fetchFromAdmin('/posts?status=published&featured=true');
    
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      console.log(`✅ Found ${adminData.posts.length} featured posts`);
      return adminData.posts.map(formatAdminPost);
    }
  } catch (error) {
    console.warn('❌ Failed to fetch featured posts from admin API:', error);
  }

  // Fallback to all posts and filter
  console.log('📝 Filtering all posts for featured ones');
  const allPosts = await getAllPosts();
  return allPosts.filter(post => post.featured);
}

// Get posts by tag
export async function getPostsByTag(tag: string): Promise<Post[]> {
  try {
    console.log(`🔄 Fetching posts for tag: ${tag}`);
    const adminData = await fetchFromAdmin(`/posts?status=published&tag=${tag}`);
    
    if (adminData?.posts && Array.isArray(adminData.posts)) {
      console.log(`✅ Found ${adminData.posts.length} posts for tag ${tag}`);
      return adminData.posts.map(formatAdminPost);
    }
  } catch (error) {
    console.warn(`❌ Failed to fetch posts for tag ${tag}:`, error);
  }

  // Fallback: filter all posts by tag
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
    console.log(`🔄 Testing connection to: ${ADMIN_API_URL}`);
    const response = await fetch(`${ADMIN_API_URL}/api/posts`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const isConnected = response.ok;
    console.log(`${isConnected ? '✅' : '❌'} Admin API connection: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    
    return isConnected;
  } catch (error) {
    console.log('❌ Admin API connection failed:', error);
    return false;
  }
}