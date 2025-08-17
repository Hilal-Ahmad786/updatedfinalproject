// Replace: apps/admin/components/media-picker.tsx
// Complete fixed version with better UI and functionality

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  ImageIcon, 
  UploadIcon, 
  SearchIcon, 
  CheckIcon,
  XIcon,
  Loader2Icon,
  FileImageIcon
} from 'lucide-react'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  mimeType: string
  size: number
  width?: number
  height?: number
  altText?: string
  caption?: string
  folder?: string
  uploadedAt: string
}

interface MediaPickerProps {
  onSelect: (file: MediaFile) => void
  selectedFileId?: string
  triggerText?: string
  allowUpload?: boolean
  children?: React.ReactNode
}

export default function MediaPicker({ 
  onSelect, 
  selectedFileId, 
  triggerText = "Select Image",
  allowUpload = true,
  children 
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchFiles()
    }
  }, [isOpen])

  useEffect(() => {
    if (selectedFileId && files.length > 0) {
      const file = files.find(f => f.id === selectedFileId)
      setSelectedFile(file || null)
    }
  }, [selectedFileId, files])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      console.log('🔄 Starting to fetch media files...')
      
      const response = await fetch('/api/media')
      console.log('📡 API Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 API Response data:', data)
        
        const allFiles = data.files || []
        console.log('📁 All files count:', allFiles.length)
        
        // Filter only image files for featured images
        const imageFiles = allFiles.filter((file: MediaFile) => 
          file.mimeType.startsWith('image/')
        )
        
        console.log('🖼️ Image files count:', imageFiles.length)
        console.log('🖼️ Image files:', imageFiles)
        
        setFiles(imageFiles)
      } else {
        console.error('❌ API Response not OK:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
    } finally {
      setLoading(false)
      console.log('✅ Finished fetching media files')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'featured-images')
      formData.append('altText', file.name.replace(/\.[^/.]+$/, ''))

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        const newFile = data.file
        setFiles(prev => [newFile, ...prev])
        
        // Auto-select the newly uploaded file
        setSelectedFile(newFile)
        onSelect(newFile)
        setIsOpen(false)
        
        alert('Image uploaded and selected successfully!')
      } else {
        const errorData = await response.json()
        alert(`Upload failed: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSelect = (file: MediaFile) => {
    console.log('🎯 Selecting file:', file)
    setSelectedFile(file)
    onSelect(file)
    setIsOpen(false)
  }

  const filteredFiles = files.filter(file => 
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.caption?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <ImageIcon className="w-4 h-4 mr-2" />
            {triggerText}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileImageIcon className="w-5 h-5" />
            Select Featured Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search and Upload */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {allowUpload && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <Button disabled={uploading} className="bg-blue-600 hover:bg-blue-700">
                  {uploading ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadIcon className="w-4 h-4 mr-2" />
                      Upload New
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Selected File Preview */}
          {selectedFile && (
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.altText || selectedFile.originalName}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-blue-200"
                    />
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1">
                      <CheckIcon className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedFile.originalName}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedFile.width && selectedFile.height && 
                        `${selectedFile.width} × ${selectedFile.height} px • `
                      }
                      {formatFileSize(selectedFile.size)}
                    </p>
                    {selectedFile.altText && (
                      <p className="text-xs text-gray-500 mt-1">
                        Alt: {selectedFile.altText}
                      </p>
                    )}
                  </div>
                  <div className="text-blue-600 font-medium">
                    ✓ Selected
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Grid */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-12">
                <Loader2Icon className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading your images...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'No images found' : 'No images available'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'Try a different search term or upload a new image.'
                      : 'Upload some images to get started with your blog posts.'
                    }
                  </p>
                  {allowUpload && !searchTerm && (
                    <div className="relative inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload Your First Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <Card 
                    key={file.id} 
                    className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-lg ${
                      selectedFile?.id === file.id 
                        ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => handleSelect(file)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square relative mb-3 group">
                        <img 
                          src={file.url} 
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <ImageIcon className="w-4 h-4 text-gray-600" />
                            </div>
                          </div>
                        </div>
                        {/* Selection indicator */}
                        {selectedFile?.id === file.id && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center rounded-md">
                            <div className="bg-blue-600 text-white rounded-full p-2 shadow-lg">
                              <CheckIcon className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium truncate mb-1" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.width && file.height && `${file.width}×${file.height} • `}
                          {formatFileSize(file.size)}
                        </p>
                        {file.altText && (
                          <p className="text-xs text-gray-400 truncate mt-1" title={file.altText}>
                            {file.altText}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t bg-gray-50 -mx-6 px-6 -mb-6 pb-6">
            <Button 
              onClick={() => selectedFile && handleSelect(selectedFile)}
              disabled={!selectedFile}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Select This Image
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="px-8">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}