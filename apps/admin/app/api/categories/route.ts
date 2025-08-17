
// 3. apps/admin/app/api/categories/route.ts
// Replace your existing categories API

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

export async function GET() {
  try {
    const categories = await CategoriesDB.getAll()

    const response = NextResponse.json({
      categories,
      total: categories.length,
      success: true
    })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Categories API error:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    const categoryData = await request.json()
    
    const newCategory = await CategoriesDB.create(categoryData)

    if (!newCategory) {
      const response = NextResponse.json({
        error: 'Failed to create category',
        success: false
      }, { status: 500 })
      return addCorsHeaders(response)
    }

    const response = NextResponse.json({
      category: newCategory,
      success: true,
      message: 'Category created successfully'
    }, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Failed to create category:', error)
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create category',
      success: false
    }, { status: 500 })
    return addCorsHeaders(response)
  }
}
