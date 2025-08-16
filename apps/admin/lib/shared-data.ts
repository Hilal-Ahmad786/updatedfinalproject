// apps/admin/lib/shared-data.ts

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published';
  featured: boolean;
  categories: string[];
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

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
  status: 'approved' | 'pending' | 'spam' | 'trash'
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

// In-memory storage arrays
let posts: Post[] = [];
let categories: Category[] = [];
let comments: Comment[] = []; // ADD: Comments array

// Initialize with default content
const initializeDefaultData = () => {
  if (posts.length === 0) {
    posts.push({
      id: '1',
      title: 'Welcome to Your Blog Admin',
      content: 'This is your first blog post created through the admin panel. You can edit, delete, or create new posts from here.',
      excerpt: 'Welcome to your new blog administration system.',
      slug: 'welcome-to-blog-admin',
      status: 'published',
      featured: true,
      categories: ['general'],
      tags: ['welcome', 'admin'],
      author: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seo: {
        title: 'Welcome to Your Blog Admin',
        description: 'Get started with your new blog administration system',
        keywords: ['blog', 'admin', 'welcome']
      }
    });
  }

  if (categories.length === 0) {
    categories.push({
      id: '1',
      name: 'General',
      slug: 'general',
      description: 'General blog posts',
      createdAt: new Date().toISOString()
    });
  }

  // ADD: Initialize default comments
  if (comments.length === 0) {
    comments.push({
      id: '1',
      postId: '1',
      postTitle: 'Welcome to Your Blog Admin',
      author: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        isRegistered: true
      },
      content: 'Great article! Really helped me understand how to use the admin panel.',
      status: 'approved',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 5,
      dislikes: 0,
      isEdited: false,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      flagged: false,
      flagReasons: []
    });
  }
};

// Load data from localStorage (browser only)
const loadFromStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedPosts = localStorage.getItem('blog_posts');
    const savedCategories = localStorage.getItem('blog_categories');
    const savedComments = localStorage.getItem('blog_comments'); // ADD: Load comments
    
    if (savedPosts) {
      posts = JSON.parse(savedPosts);
    }
    
    if (savedCategories) {
      categories = JSON.parse(savedCategories);
    }

    // ADD: Load comments from localStorage
    if (savedComments) {
      comments = JSON.parse(savedComments);
    }
    
    // Always ensure default data exists
    initializeDefaultData();
    
    // Save back to localStorage to ensure defaults are persisted
    saveToStorage();
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    initializeDefaultData();
    saveToStorage();
  }
};

// Save data to localStorage
const saveToStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('blog_posts', JSON.stringify(posts));
    localStorage.setItem('blog_categories', JSON.stringify(categories));
    localStorage.setItem('blog_comments', JSON.stringify(comments)); // ADD: Save comments
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Initialize data on module load
if (typeof window !== 'undefined') {
  loadFromStorage();
} else {
  initializeDefaultData();
}

// Data store API
export const dataStore = {
  posts: {
    getAll: () => {
      loadFromStorage(); // Ensure fresh data
      return posts.filter(p => p !== null && p !== undefined);
    },
    
    getById: (id: string) => {
      loadFromStorage();
      return posts.find(p => p.id === id) || null;
    },
    
    getBySlug: (slug: string) => {
      loadFromStorage();
      return posts.find(p => p.slug === slug) || null;
    },
    
    create: (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newPost: Post = {
        ...postData,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
        slug: postData.slug || generateSlug(postData.title)
      };
      
      posts.push(newPost);
      saveToStorage();
      return newPost;
    },
    
    update: (id: string, updates: Partial<Post>) => {
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      posts[index] = {
        ...posts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      saveToStorage();
      return posts[index];
    },
    
    delete: (id: string) => {
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) return false;
      
      posts.splice(index, 1);
      saveToStorage();
      return true;
    },
    
    getPublished: () => {
      loadFromStorage();
      return posts.filter(p => p.status === 'published');
    },
    
    getFeatured: () => {
      loadFromStorage();
      return posts.filter(p => p.featured && p.status === 'published');
    }
  },
  
  categories: {
    getAll: () => {
      loadFromStorage();
      return categories.filter(c => c !== null && c !== undefined);
    },
    
    getById: (id: string) => {
      loadFromStorage();
      return categories.find(c => c.id === id) || null;
    },
    
    create: (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        slug: categoryData.slug || generateSlug(categoryData.name)
      };
      
      categories.push(newCategory);
      saveToStorage();
      return newCategory;
    },
    
    update: (id: string, updates: Partial<Category>) => {
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      categories[index] = { ...categories[index], ...updates };
      saveToStorage();
      return categories[index];
    },
    
    delete: (id: string) => {
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      categories.splice(index, 1);
      saveToStorage();
      return true;
    }
  },

  // ADD: Complete comments functionality
  comments: {
    getAll: () => {
      loadFromStorage();
      return comments.filter(c => c !== null && c !== undefined);
    },
    
    getById: (id: string) => {
      loadFromStorage();
      return comments.find(c => c.id === id) || null;
    },
    
    getByPostId: (postId: string) => {
      loadFromStorage();
      return comments.filter(c => c.postId === postId);
    },
    
    getByStatus: (status: Comment['status']) => {
      loadFromStorage();
      return comments.filter(c => c.status === status);
    },
    
    getApproved: () => {
      loadFromStorage();
      return comments.filter(c => c.status === 'approved');
    },

    getPending: () => {
      loadFromStorage();
      return comments.filter(c => c.status === 'pending');
    },

    getFlagged: () => {
      loadFromStorage();
      return comments.filter(c => c.flagged);
    },
    
    create: (commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newComment: Comment = {
        ...commentData,
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        createdAt: now,
        updatedAt: now
      };
      
      comments.push(newComment);
      saveToStorage();
      return newComment;
    },
    
    update: (id: string, updates: Partial<Comment>) => {
      const index = comments.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      comments[index] = {
        ...comments[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      saveToStorage();
      return comments[index];
    },

    updateStatus: (id: string, status: Comment['status']) => {
      return dataStore.comments.update(id, { status });
    },
    
    delete: (id: string) => {
      const index = comments.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      comments.splice(index, 1);
      saveToStorage();
      return true;
    },

    // Bulk operations
    bulkUpdateStatus: (ids: string[], status: Comment['status']) => {
      let updated = 0;
      ids.forEach(id => {
        if (dataStore.comments.updateStatus(id, status)) {
          updated++;
        }
      });
      return updated;
    },

    bulkDelete: (ids: string[]) => {
      let deleted = 0;
      ids.forEach(id => {
        if (dataStore.comments.delete(id)) {
          deleted++;
        }
      });
      return deleted;
    },

    // Flag/unflag
    flag: (id: string, reasons: string[] = []) => {
      return dataStore.comments.update(id, { flagged: true, flagReasons: reasons });
    },

    unflag: (id: string) => {
      return dataStore.comments.update(id, { flagged: false, flagReasons: [] });
    },

    // Search
    search: (query: string) => {
      loadFromStorage();
      const lowercaseQuery = query.toLowerCase();
      return comments.filter(comment => 
        comment.content.toLowerCase().indexOf(lowercaseQuery) !== -1 ||
        comment.author.name.toLowerCase().indexOf(lowercaseQuery) !== -1 ||
        comment.author.email.toLowerCase().indexOf(lowercaseQuery) !== -1 ||
        comment.postTitle.toLowerCase().indexOf(lowercaseQuery) !== -1
      );
    },

    // Statistics
    getStats: () => {
      loadFromStorage();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const todayComments = comments.filter(c => 
        new Date(c.createdAt) >= today
      );
      
      return {
        total: comments.length,
        approved: comments.filter(c => c.status === 'approved').length,
        pending: comments.filter(c => c.status === 'pending').length,
        spam: comments.filter(c => c.status === 'spam').length,
        trash: comments.filter(c => c.status === 'trash').length,
        todayCount: todayComments.length,
        averagePerPost: comments.length > 0 ? Number((comments.length / Math.max(posts.length, 1)).toFixed(1)) : 0
      };
    }
  }
};

// Utility function to generate slugs
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}