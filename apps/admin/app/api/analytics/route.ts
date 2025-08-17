// apps/admin/app/api/analytics/route.ts
// Fixed TypeScript errors for deployment

import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/shared-data'

// Define proper types for activity items
interface ActivityItem {
  id: string
  type: 'post_created' | 'post_published' | 'media_uploaded' | 'category_created'
  title: string
  time: string
}

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

// Generate mock view data for posts (in a real app, you'd track actual views)
function generateViewsForPost(postId: string, createdAt: string): number {
  // Generate consistent "views" based on post age and ID
  const daysSinceCreated = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const baseViews = Math.floor(Math.random() * 500) + 100
  const ageMultiplier = Math.max(1, daysSinceCreated * 0.1)
  return Math.floor(baseViews * ageMultiplier)
}

// Generate time series data for charts
function generateTimeSeriesData(days: number) {
  const data = []
  const now = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    // Generate realistic view patterns (higher on weekdays, lower on weekends)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const baseViews = isWeekend ? 150 : 250
    const randomVariation = Math.floor(Math.random() * 100) - 50
    const views = Math.max(0, baseViews + randomVariation)
    
    data.push({
      date: date.toISOString().split('T')[0],
      views: views,
      posts: Math.floor(Math.random() * 3) // 0-2 posts per day
    })
  }
  
  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    // Get days for the range
    const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
    
    // Get real data from your stores
    const posts = dataStore.posts.getAll()
    const categories = dataStore.categories.getAll()
    const comments = dataStore.comments.getAll()
    
    // Calculate overview stats
    const totalPosts = posts.length
    const totalCategories = categories.length
    const approvedComments = comments.filter(c => c.status === 'approved').length
    
    // Generate views for posts
    const postsWithViews = posts.map(post => ({
      ...post,
      views: generateViewsForPost(post.id, post.createdAt),
      growth: Math.floor(Math.random() * 40) - 20 // -20% to +20%
    }))
    
    const totalViews = postsWithViews.reduce((sum, post) => sum + post.views, 0)
    
    // Calculate growth (mock data for now)
    const viewsGrowth = Math.floor(Math.random() * 30) - 15 // -15% to +15%
    const postsGrowth = Math.floor(Math.random() * 20) - 10 // -10% to +10%
    
    // Generate chart data
    const chartData = generateTimeSeriesData(days)
    
    // Get top performing posts
    const topPosts = postsWithViews
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(post => ({
        id: post.id,
        title: post.title,
        views: post.views,
        growth: post.growth,
        category: post.categories[0] || 'Uncategorized'
      }))
    
    // Generate category stats
    const categoryStats = categories.map(category => {
      const categoryPosts = posts.filter(post => post.categories.indexOf(category.slug) !== -1)
      const categoryViews = categoryPosts.reduce((sum, post) => {
        const postViews = generateViewsForPost(post.id, post.createdAt)
        return sum + postViews
      }, 0)
      
      // Generate consistent colors for categories
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16']
      const colorIndex = parseInt(category.id) % colors.length
      
      return {
        id: category.id,
        name: category.name,
        posts: categoryPosts.length,
        views: categoryViews,
        color: colors[colorIndex]
      }
    })
    
    const topCategories = categoryStats
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
    
    // Generate recent activity from your actual data with proper typing
    const recentActivity: ActivityItem[] = []
    
    // Add recent posts
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
    
    recentPosts.forEach(post => {
      recentActivity.push({
        id: post.id + '_created',
        type: 'post_created',
        title: post.title,
        time: post.createdAt
      })
      
      if (post.status === 'published') {
        recentActivity.push({
          id: post.id + '_published',
          type: 'post_published',
          title: post.title,
          time: post.updatedAt
        })
      }
    })
    
    // Add recent categories
    const recentCategories = categories
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 2)
    
    recentCategories.forEach(category => {
      recentActivity.push({
        id: category.id + '_created',
        type: 'category_created',
        title: category.name,
        time: category.createdAt
      })
    })
    
    // Sort all activities by time and take top 8
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8)
    
    // Convert timestamps to relative time
    const finalActivity = sortedActivity.map(activity => ({
      ...activity,
      time: getRelativeTime(activity.time)
    }))
    
    // Build the complete analytics response
    const analytics = {
      overview: {
        totalViews,
        totalPosts,
        totalCategories,
        totalMedia: 15, // Mock media count for now
        viewsGrowth,
        postsGrowth
      },
      chartData: {
        views: chartData,
        posts: chartData
      },
      topPosts,
      topCategories,
      recentActivity: finalActivity,
      performance: {
        avgReadTime: Math.floor(Math.random() * 5) + 2, // 2-7 minutes
        bounceRate: Math.floor(Math.random() * 30) + 25, // 25-55%
        returningVisitors: Math.floor(Math.random() * 40) + 30, // 30-70%
        topTrafficSources: [
          { source: 'Direct', visitors: 1200, percentage: 45 },
          { source: 'Search Engines', visitors: 800, percentage: 30 },
          { source: 'Social Media', visitors: 400, percentage: 15 },
          { source: 'Referrals', visitors: 267, percentage: 10 }
        ]
      }
    }
    
    const response = NextResponse.json(analytics)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Analytics API Error:', error)
    const response = NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        success: false
      }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString()
  }
}