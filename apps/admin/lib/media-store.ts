// apps/admin/lib/media-store.ts
interface MediaFile {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    width?: number
    height?: number
    url: string
    altText?: string
    caption?: string
    uploadedAt: string
    updatedAt: string
    uploadedBy: string
    tags: string[]
    folder?: string
  }
  
  interface MediaFolder {
    id: string
    name: string
    slug: string
    description?: string
    createdAt: string
    mediaCount: number
  }
  
  // Storage keys
  const MEDIA_FILES_KEY = 'blog_media_files'
  const MEDIA_FOLDERS_KEY = 'blog_media_folders'
  
  // In-memory storage
  let mediaFiles: MediaFile[] = []
  let mediaFolders: MediaFolder[] = []
  
  // Default folders
  const defaultFolders: MediaFolder[] = [
    {
      id: 'uploads',
      name: 'Uploads',
      slug: 'uploads',
      description: 'General uploads',
      createdAt: new Date().toISOString(),
      mediaCount: 0
    },
    {
      id: 'blog-images',
      name: 'Blog Images',
      slug: 'blog-images',
      description: 'Images for blog posts',
      createdAt: new Date().toISOString(),
      mediaCount: 0
    },
    {
      id: 'documents',
      name: 'Documents',
      slug: 'documents',
      description: 'PDF and document files',
      createdAt: new Date().toISOString(),
      mediaCount: 0
    }
  ]
  
  // Default sample files
  const defaultFiles: MediaFile[] = [
    {
      id: '1',
      filename: 'hero-workspace.jpg',
      originalName: 'Modern Workspace Hero.jpg',
      mimeType: 'image/jpeg',
      size: 1024000,
      width: 1920,
      height: 1080,
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop',
      altText: 'Modern workspace with laptop and coffee',
      caption: 'Beautiful modern workspace setup perfect for productivity',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedBy: 'admin',
      tags: ['workspace', 'modern', 'productivity'],
      folder: 'blog-images'
    },
    {
      id: '2',
      filename: 'blog-writing-cover.jpg',
      originalName: 'Blog Writing Cover.jpg',
      mimeType: 'image/jpeg',
      size: 512000,
      width: 1200,
      height: 630,
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop',
      altText: 'Person writing on laptop',
      caption: 'The art of blog writing and content creation',
      uploadedAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      uploadedBy: 'admin',
      tags: ['writing', 'blog', 'content'],
      folder: 'blog-images'
    },
    {
      id: '3',
      filename: 'team-collaboration.jpg',
      originalName: 'Team Collaboration.jpg',
      mimeType: 'image/jpeg',
      size: 768000,
      width: 1600,
      height: 900,
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop',
      altText: 'Team working together at a table',
      caption: 'Effective team collaboration in modern workplace',
      uploadedAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      uploadedBy: 'admin',
      tags: ['team', 'collaboration', 'workplace'],
      folder: 'blog-images'
    },
    {
      id: '4',
      filename: 'sample-guide.pdf',
      originalName: 'Sample User Guide.pdf',
      mimeType: 'application/pdf',
      size: 256000,
      url: 'data:application/pdf;base64,JVBERi0xLjMKJf////8KMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovT3V0bGluZXMgMiAwIFIKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iago=',
      altText: 'User guide document',
      caption: 'Comprehensive user guide and documentation',
      uploadedAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString(),
      uploadedBy: 'admin',
      tags: ['guide', 'documentation', 'help'],
      folder: 'documents'
    }
  ]
  
  // Initialize data from localStorage
  function initializeMediaData() {
    if (typeof window !== 'undefined') {
      try {
        const savedFiles = localStorage.getItem(MEDIA_FILES_KEY)
        const savedFolders = localStorage.getItem(MEDIA_FOLDERS_KEY)
        
        if (savedFiles) {
          mediaFiles = JSON.parse(savedFiles)
        } else {
          mediaFiles = [...defaultFiles]
          saveMediaData()
        }
        
        if (savedFolders) {
          mediaFolders = JSON.parse(savedFolders)
        } else {
          mediaFolders = [...defaultFolders]
          saveMediaData()
        }
        
        updateFolderCounts()
      } catch (error) {
        console.error('Error loading media data:', error)
        mediaFiles = [...defaultFiles]
        mediaFolders = [...defaultFolders]
        saveMediaData()
      }
    }
  }
  
  // Save data to localStorage
  function saveMediaData() {
    if (typeof window !== 'undefined') {
      try {
        updateFolderCounts()
        localStorage.setItem(MEDIA_FILES_KEY, JSON.stringify(mediaFiles))
        localStorage.setItem(MEDIA_FOLDERS_KEY, JSON.stringify(mediaFolders))
      } catch (error) {
        console.error('Error saving media data:', error)
      }
    }
  }
  
  // Update folder media counts
  function updateFolderCounts() {
    mediaFolders.forEach(folder => {
      folder.mediaCount = mediaFiles.filter(file => file.folder === folder.id).length
    })
  }
  
  // File utility functions
  function getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.indexOf('pdf') !== -1) return 'pdf'
    if (mimeType.indexOf('document') !== -1 || mimeType.indexOf('text') !== -1) return 'document'
    if (mimeType.indexOf('zip') !== -1 || mimeType.indexOf('archive') !== -1) return 'archive'
    return 'other'
  }
  
  function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase()
    return `${timestamp}-${randomSuffix}-${safeName}.${extension}`
  }
  
  // Convert File to base64 URL for storage
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  
  // Get image dimensions
  function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve({ width: 0, height: 0 })
        return
      }
  
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Initialize on import
  if (typeof window !== 'undefined') {
    initializeMediaData()
  }
  
  // =============================================================================
  // PUBLIC API FUNCTIONS
  // =============================================================================
  
  export function getAllFiles() {
    return mediaFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
  }
  
  export function getFileById(id: string) {
    return mediaFiles.find(file => file.id === id)
  }
  
  export function getFilesByFolder(folderId?: string) {
    return mediaFiles.filter(file => file.folder === folderId)
  }
  
  export function getFilesByType(type: string) {
    if (type === 'all') return getAllFiles()
    return mediaFiles.filter(file => getFileType(file.mimeType) === type)
  }
  
  export function searchFiles(query: string) {
    const lowercaseQuery = query.toLowerCase()
    return mediaFiles.filter(file => 
      file.originalName.toLowerCase().indexOf(lowercaseQuery) !== -1 ||
      file.filename.toLowerCase().indexOf(lowercaseQuery) !== -1 ||
      (file.altText && file.altText.toLowerCase().indexOf(lowercaseQuery) !== -1) ||
      (file.caption && file.caption.toLowerCase().indexOf(lowercaseQuery) !== -1) ||
      file.tags.some(tag => tag.toLowerCase().indexOf(lowercaseQuery) !== -1)
    )
  }
  
  export async function createFile(file: File, metadata?: {
    altText?: string
    caption?: string
    tags?: string[]
    folder?: string
  }): Promise<MediaFile> {
    try {
      const filename = generateUniqueFilename(file.name)
      const url = await fileToBase64(file)
      const dimensions = await getImageDimensions(file)
      
      const newFile: MediaFile = {
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url,
        altText: metadata?.altText || '',
        caption: metadata?.caption || '',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        tags: metadata?.tags || [],
        folder: metadata?.folder || 'uploads',
        ...(dimensions.width > 0 && {
          width: dimensions.width,
          height: dimensions.height
        })
      }
      
      mediaFiles.unshift(newFile)
      saveMediaData()
      return newFile
    } catch (error) {
      console.error('Error creating file:', error)
      throw new Error('Failed to process file upload')
    }
  }
  
  export function deleteFile(id: string): boolean {
    const index = mediaFiles.findIndex(file => file.id === id)
    if (index === -1) return false
    
    mediaFiles.splice(index, 1)
    saveMediaData()
    return true
  }
  
  export function updateFile(id: string, updates: Partial<Omit<MediaFile, 'id' | 'uploadedAt'>>): MediaFile | null {
    const index = mediaFiles.findIndex(file => file.id === id)
    if (index === -1) return null
    
    mediaFiles[index] = {
      ...mediaFiles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    saveMediaData()
    return mediaFiles[index]
  }
  
  // =============================================================================
  // FOLDER MANAGEMENT
  // =============================================================================
  
  export function getAllFolders() {
    return mediaFolders.sort((a, b) => a.name.localeCompare(b.name))
  }
  
  export function getFolderById(id: string) {
    return mediaFolders.find(folder => folder.id === id)
  }
  
  export function createFolder(folderData: { name: string; description?: string }): MediaFolder {
    const slug = folderData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    
    const newFolder: MediaFolder = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      name: folderData.name,
      slug,
      description: folderData.description,
      createdAt: new Date().toISOString(),
      mediaCount: 0
    }
    
    mediaFolders.push(newFolder)
    saveMediaData()
    return newFolder
  }
  
  export function deleteFolder(id: string): boolean {
    // Don't allow deleting default folders
    if (['uploads', 'blog-images', 'documents'].indexOf(id) !== -1) {
      return false
    }
    
    const index = mediaFolders.findIndex(folder => folder.id === id)
    if (index === -1) return false
    
    // Move files from deleted folder to 'uploads'
    mediaFiles.forEach(file => {
      if (file.folder === id) {
        file.folder = 'uploads'
      }
    })
    
    mediaFolders.splice(index, 1)
    saveMediaData()
    return true
  }
  
  // =============================================================================
  // STATISTICS AND UTILITIES
  // =============================================================================
  
  export function getMediaStats() {
    const stats = {
      totalFiles: mediaFiles.length,
      totalSize: mediaFiles.reduce((sum, file) => sum + file.size, 0),
      byType: {
        images: mediaFiles.filter(f => f.mimeType.startsWith('image/')).length,
        videos: mediaFiles.filter(f => f.mimeType.startsWith('video/')).length,
        documents: mediaFiles.filter(f => f.mimeType.indexOf('pdf') !== -1 || f.mimeType.indexOf('document') !== -1).length,
        audio: mediaFiles.filter(f => f.mimeType.startsWith('audio/')).length,
        other: mediaFiles.filter(f => !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/') && !f.mimeType.startsWith('audio/') && f.mimeType.indexOf('pdf') === -1 && f.mimeType.indexOf('document') === -1).length
      },
      byFolder: mediaFolders.map(folder => ({
        id: folder.id,
        name: folder.name,
        count: mediaFiles.filter(f => f.folder === folder.id).length
      }))
    }
    
    return stats
  }
  
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // =============================================================================
  // INTEGRATION WITH BLOG POSTS
  // =============================================================================
  
  export function getMediaForPosts() {
    return mediaFiles.filter(file => file.mimeType.startsWith('image/'))
  }
  
  export function getFeaturedImages() {
    return mediaFiles.filter(file => 
      file.mimeType.startsWith('image/') && 
      (file.tags.indexOf('featured') !== -1 || file.folder === 'blog-images')
    )
  }