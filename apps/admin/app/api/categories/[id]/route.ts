// 4. apps/admin/app/api/categories/[id]/route.ts
// Individual category operations

import { NextRequest, NextResponse } from 'next/server'
import { CategoriesDB } from '@/lib/database/categories'

function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await CategoriesDB.getById(params.id)

    if (!category) {
      const response = NextResponse.json({
        error: 'Category not found',
        success: false
      }, { status: 404 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      category,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    const response = NextResponse.json({
      error: 'Category not found',
      success: false
    }, { status: 404 })
    return addCorsHeaders(response)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    
    const updatedCategory = await CategoriesDB.update(params.id, updates)

    if (!updatedCategory) {
      const response = NextResponse.json({
        error: 'Failed to update category',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      category: updatedCategory,
      success: true,
      message: 'Category updated successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to update category:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update category',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await CategoriesDB.delete(params.id)

    if (!success) {
      const response = NextResponse.json({
        error: 'Failed to delete category',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to delete category:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete category',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
