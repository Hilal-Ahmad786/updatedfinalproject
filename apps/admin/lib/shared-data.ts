// apps/admin/lib/shared-data.ts
// CRITICAL: localStorage-backed data persistence (no database)

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
  
  // In-memory storage arrays
  let posts: Post[] = [];
  let categories: Category[] = [];
  
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
  };
  
  // Load data from localStorage (browser only)
  const loadFromStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedPosts = localStorage.getItem('blog_posts');
      const savedCategories = localStorage.getItem('blog_categories');
      
      if (savedPosts) {
        posts = JSON.parse(savedPosts);
      }
      
      if (savedCategories) {
        categories = JSON.parse(savedCategories);
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