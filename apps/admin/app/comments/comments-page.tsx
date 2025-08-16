// apps/admin/app/comments/comments-page.tsx
// Enhanced version with real API integration

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Reply,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  User,
  Calendar,
  Clock,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Ban,
  Mail,
  ExternalLink,
  RefreshCw,
  Plus,
  MoreHorizontal
} from 'lucide-react'

interface Comment {
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

interface CommentStats {
  total: number
  approved: number
  pending: number
  spam: number
  trash: number
  todayCount: number
  averagePerPost: number
}

export default function CommentsManagementPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedComments, setSelectedComments] = useState<string[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  useEffect(() => {
    fetchComments()
    fetchStats()
  }, [])

  const fetchComments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/comments')
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      } else {
        console.error('Failed to fetch comments:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/comments?stats=true')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const updateCommentStatus = async (commentId: string, status: Comment['status']) => {
    try {
      setUpdating(commentId)
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(comments.map(comment => 
          comment.id === commentId ? data.comment : comment
        ))
        // Refresh stats
        fetchStats()
      } else {
        console.error('Failed to update comment status')
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    } finally {
      setUpdating(null)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to permanently delete this comment?')) return

    try {
      setUpdating(commentId)
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId))
        setSelectedComments(selectedComments.filter(id => id !== commentId))
        // Refresh stats
        fetchStats()
      } else {
        console.error('Failed to delete comment')
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setUpdating(null)
    }
  }

  const flagComment = async (commentId: string, reasons: string[] = ['inappropriate']) => {
    try {
      setUpdating(commentId)
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flagged: true, flagReasons: reasons }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(comments.map(comment => 
          comment.id === commentId ? data.comment : comment
        ))
      }
    } catch (error) {
      console.error('Failed to flag comment:', error)
    } finally {
      setUpdating(null)
    }
  }

  const bulkUpdateStatus = async (status: Comment['status']) => {
    if (selectedComments.length === 0) return
    
    try {
      setUpdating('bulk')
      
      // Update each selected comment
      const promises = selectedComments.map(commentId =>
        fetch(`/api/comments/${commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        })
      )

      await Promise.all(promises)
      
      // Refresh data
      await fetchComments()
      await fetchStats()
      setSelectedComments([])
    } catch (error) {
      console.error('Failed to bulk update:', error)
    } finally {
      setUpdating(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'spam': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'trash': return <Trash2 className="h-4 w-4 text-gray-500" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'spam': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'trash': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
                         comment.author.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
                         comment.postTitle.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
                         comment.author.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments(prev => 
      prev.indexOf(commentId) !== -1
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    )
  }

  const toggleAllComments = (checked: boolean) => {
    if (checked) {
      setSelectedComments(filteredComments.map(c => c.id))
    } else {
      setSelectedComments([])
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Comments</h1>
          <p className="text-muted-foreground">
            Manage and moderate user comments
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={fetchComments}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            Flagged ({comments.filter(c => c.flagged).length})
          </Button>
          {selectedComments.length > 0 && (
            <>
              <Button
                onClick={() => bulkUpdateStatus('approved')}
                disabled={updating === 'bulk'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve ({selectedComments.length})
              </Button>
              <Button
                variant="destructive"
                onClick={() => bulkUpdateStatus('spam')}
                disabled={updating === 'bulk'}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark Spam
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.spam}
              </div>
              <div className="text-sm text-muted-foreground">Spam</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.trash}
              </div>
              <div className="text-sm text-muted-foreground">Trash</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.todayCount}
              </div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.averagePerPost.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">Avg/Post</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments, authors, or posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-border rounded-lg bg-background"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="spam">Spam</option>
                <option value="trash">Trash</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      {filteredComments.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No comments found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No comments have been posted yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Bulk actions header */}
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
                    onChange={(e) => toggleAllComments(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedComments.length > 0 
                      ? `${selectedComments.length} of ${filteredComments.length} selected`
                      : `${filteredComments.length} comments`
                    }
                  </span>
                </div>
                
                {selectedComments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => bulkUpdateStatus('approved')}
                      disabled={updating === 'bulk'}
                    >
                      Approve All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => bulkUpdateStatus('spam')}
                      disabled={updating === 'bulk'}
                    >
                      Mark as Spam
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => bulkUpdateStatus('trash')}
                      disabled={updating === 'bulk'}
                    >
                      Move to Trash
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          {filteredComments.map((comment) => (
            <Card key={comment.id} className={`glass hover:shadow-lg transition-all duration-200 ${
              selectedComments.indexOf(comment.id) !== -1 ? 'ring-2 ring-primary' : ''
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.indexOf(comment.id) !== -1}
                    onChange={() => toggleCommentSelection(comment.id)}
                    className="mt-1 rounded"
                  />

                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {comment.author.avatar ? (
                      <img 
                        src={comment.author.avatar} 
                        alt={comment.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{comment.author.name}</span>
                          {comment.author.isRegistered && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Registered
                            </Badge>
                          )}
                          {comment.flagged && (
                            <Badge variant="destructive" className="text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {comment.author.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {comment.postTitle}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={() => setShowDetails(showDetails === comment.id ? null : comment.id)}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Status Badge */}
                      <Badge className={getStatusColor(comment.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(comment.status)}
                          {comment.status}
                        </span>
                      </Badge>
                    </div>

                    {/* Comment Content */}
                    <div className="bg-muted/20 p-3 rounded-lg">
                      <p className="text-sm">{comment.content}</p>
                    </div>

                    {/* Details (expandable) */}
                    {showDetails === comment.id && (
                      <div className="bg-muted/10 p-3 rounded-lg text-xs text-muted-foreground space-y-2">
                        <div><strong>IP Address:</strong> {comment.ipAddress}</div>
                        <div><strong>User Agent:</strong> {comment.userAgent}</div>
                        {comment.flagReasons.length > 0 && (
                          <div><strong>Flag Reasons:</strong> {comment.flagReasons.join(', ')}</div>
                        )}
                        {comment.author.website && (
                          <div><strong>Website:</strong> {comment.author.website}</div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{comment.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ThumbsDown className="h-4 w-4" />
                          <span>{comment.dislikes}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {comment.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateCommentStatus(comment.id, 'approved')}
                            disabled={updating === comment.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {updating === comment.id ? 'Updating...' : 'Approve'}
                          </Button>
                        )}
                        
                        {comment.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCommentStatus(comment.id, 'pending')}
                            disabled={updating === comment.id}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Unapprove
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateCommentStatus(comment.id, 'spam')}
                          disabled={updating === comment.id}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Spam
                        </Button>

                        {!comment.flagged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => flagComment(comment.id)}
                            disabled={updating === comment.id}
                          >
                            <Flag className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteComment(comment.id)}
                          disabled={updating === comment.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}