
// 1. apps/admin/lib/comments-store.ts

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
    replies?: Comment[]
    likes: number
    dislikes: number
    isEdited: boolean
    ipAddress: string
    userAgent: string
    flagged: boolean
    flagReasons: string[]
  }
  
  export interface CommentStats {
    total: number
    approved: number
    pending: number
    spam: number
    trash: number
    todayCount: number
    averagePerPost: number
  }
  
  // In-memory storage
  let comments: Comment[] = [];
  
  // Default sample comments
  const initializeDefaultComments = () => {
    if (comments.length === 0) {
      comments.push(
        {
          id: '1',
          postId: '1', // Links to "Welcome to Your Blog Admin" post
          postTitle: 'Welcome to Your Blog Admin',
          author: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            website: 'https://johndoe.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            isRegistered: true
          },
          content: 'Great article! Really helped me understand how to use the admin panel. The interface is very intuitive and user-friendly. Looking forward to more tutorials like this.',
          status: 'approved',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          dislikes: 0,
          isEdited: false,
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          flagged: false,
          flagReasons: []
        },
        {
          id: '2',
          postId: '1',
          postTitle: 'Welcome to Your Blog Admin',
          author: {
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332e234?w=40&h=40&fit=crop&crop=face',
            isRegistered: false
          },
          content: 'Thanks for sharing this! Could you also add a tutorial on how to customize the theme? That would be really helpful.',
          status: 'approved',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 3,
          dislikes: 0,
          isEdited: false,
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          flagged: false,
          flagReasons: []
        },
        {
          id: '3',
          postId: '1',
          postTitle: 'Welcome to Your Blog Admin',
          author: {
            name: 'Mike Chen',
            email: 'mike.chen@example.com',
            isRegistered: false
          },
          content: 'Quick question - is there a way to bulk import posts from another platform? Would save a lot of time during migration.',
          status: 'pending',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 1,
          dislikes: 0,
          isEdited: false,
          ipAddress: '192.168.1.103',
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          flagged: false,
          flagReasons: []
        },
        {
          id: '4',
          postId: '1',
          postTitle: 'Welcome to Your Blog Admin',
          author: {
            name: 'Emma Davis',
            email: 'emma.davis@example.com',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
            isRegistered: true
          },
          content: 'Love the clean design! One suggestion: it would be great to have a dark mode option for the admin panel. Keep up the excellent work!',
          status: 'approved',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          dislikes: 1,
          isEdited: false,
          ipAddress: '192.168.1.104',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          flagged: false,
          flagReasons: []
        },
        {
          id: '5',
          postId: '1',
          postTitle: 'Welcome to Your Blog Admin',
          author: {
            name: 'SpamBot2024',
            email: 'spam@fakeemail.net',
            isRegistered: false
          },
          content: 'CHECK OUT MY AMAZING DEALS!!! Best prices on fake products at scamsite.com!!! Limited time offer, buy now and get 90% OFF everything!!! Click here: bit.ly/totalscam',
          status: 'spam',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          likes: 0,
          dislikes: 15,
          isEdited: false,
          ipAddress: '192.168.1.666',
          userAgent: 'Bot/SpamBot 2.0',
          flagged: true,
          flagReasons: ['spam', 'inappropriate_content', 'suspicious_links']
        }
      );
    }
  };
  
  // Load from localStorage
  const loadFromStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedComments = localStorage.getItem('blog_comments');
      
      if (savedComments) {
        comments = JSON.parse(savedComments);
      }
      
      // Always ensure default data exists
      initializeDefaultComments();
      
      // Save back to localStorage to ensure defaults are persisted
      saveToStorage();
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
      initializeDefaultComments();
      saveToStorage();
    }
  };
  
  // Save to localStorage
  const saveToStorage = () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('blog_comments', JSON.stringify(comments));
    } catch (error) {
      console.error('Failed to save comments to localStorage:', error);
    }
  };
  
  // Initialize data on module load
  if (typeof window !== 'undefined') {
    loadFromStorage();
  } else {
    initializeDefaultComments();
  }
  
  // Comments data store API
  export const commentsStore = {
    // Get all comments
    getAll: () => {
      loadFromStorage();
      return comments.filter(c => c !== null && c !== undefined);
    },
    
    // Get comment by ID
    getById: (id: string) => {
      loadFromStorage();
      return comments.find(c => c.id === id) || null;
    },
    
    // Get comments by post ID
    getByPostId: (postId: string) => {
      loadFromStorage();
      return comments.filter(c => c.postId === postId);
    },
    
    // Get comments by status
    getByStatus: (status: Comment['status']) => {
      loadFromStorage();
      return comments.filter(c => c.status === status);
    },
    
    // Get approved comments for public display
    getApproved: () => {
      loadFromStorage();
      return comments.filter(c => c.status === 'approved');
    },
    
    // Get pending comments for moderation
    getPending: () => {
      loadFromStorage();
      return comments.filter(c => c.status === 'pending');
    },
    
    // Get flagged comments
    getFlagged: () => {
      loadFromStorage();
      return comments.filter(c => c.flagged);
    },
    
    // Create new comment
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
    
    // Update comment
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
    
    // Update comment status
    updateStatus: (id: string, status: Comment['status']) => {
      return commentsStore.update(id, { status });
    },
    
    // Delete comment
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
        if (commentsStore.updateStatus(id, status)) {
          updated++;
        }
      });
      return updated;
    },
    
    bulkDelete: (ids: string[]) => {
      let deleted = 0;
      ids.forEach(id => {
        if (commentsStore.delete(id)) {
          deleted++;
        }
      });
      return deleted;
    },
    
    // Flag/unflag comment
    flag: (id: string, reasons: string[] = []) => {
      return commentsStore.update(id, { flagged: true, flagReasons: reasons });
    },
    
    unflag: (id: string) => {
      return commentsStore.update(id, { flagged: false, flagReasons: [] });
    },
    
    // Like/dislike
    addLike: (id: string) => {
      const comment = commentsStore.getById(id);
      if (comment) {
        return commentsStore.update(id, { likes: comment.likes + 1 });
      }
      return null;
    },
    
    addDislike: (id: string) => {
      const comment = commentsStore.getById(id);
      if (comment) {
        return commentsStore.update(id, { dislikes: comment.dislikes + 1 });
      }
      return null;
    },
    
    // Search comments
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
    
    // Get statistics
    getStats: (): CommentStats => {
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
        averagePerPost: comments.length > 0 ? Number((comments.length / 1).toFixed(1)) : 0 // Simplified for now
      };
    }
  };
  
  // ===================================================================
  