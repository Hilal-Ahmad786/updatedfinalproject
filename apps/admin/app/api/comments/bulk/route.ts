// apps/admin/app/api/comments/bulk/route.ts
// Bulk operations for comments

import { NextRequest, NextResponse } from 'next/server'
import { commentsStore } from '@/lib/comments-store'

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

export async function POST(request: NextRequest) {
  try {
    const { action, commentIds, status, flagReasons } = await request.json()
    
    if (!action || !commentIds || !Array.isArray(commentIds)) {
      const response = NextResponse.json(
        { error: 'Invalid request. Action and commentIds array required.', success: false }, 
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    let result: any = {}

    switch (action) {
      case 'updateStatus':
        if (!status) {
          const response = NextResponse.json(
            { error: 'Status is required for updateStatus action', success: false }, 
            { status: 400 }
          )
          return addCorsHeaders(response)
        }
        result.updated = commentsStore.bulkUpdateStatus(commentIds, status)
        result.message = `${result.updated} comments updated to ${status}`
        break

      case 'delete':
        result.deleted = commentsStore.bulkDelete(commentIds)
        result.message = `${result.deleted} comments deleted`
        break

      case 'flag':
        let flagged = 0
        commentIds.forEach(id => {
          if (commentsStore.flag(id, flagReasons || ['inappropriate'])) {
            flagged++
          }
        })
        result.flagged = flagged
        result.message = `${flagged} comments flagged`
        break

      case 'unflag':
        let unflagged = 0
        commentIds.forEach(id => {
          if (commentsStore.unflag(id)) {
            unflagged++
          }
        })
        result.unflagged = unflagged
        result.message = `${unflagged} comments unflagged`
        break

      default:
        const response = NextResponse.json(
          { error: 'Invalid action. Supported: updateStatus, delete, flag, unflag', success: false }, 
          { status: 400 }
        )
        return addCorsHeaders(response)
    }
    
    const response = NextResponse.json({
      ...result,
      success: true
    })
    
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Bulk operation failed:', error)
    const response = NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Bulk operation failed', 
        success: false 
      }, 
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

