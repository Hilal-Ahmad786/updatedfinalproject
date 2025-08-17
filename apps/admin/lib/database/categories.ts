// 1. apps/admin/lib/database/categories.ts
// Categories database operations

import { supabaseAdmin } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
}

export class CategoriesDB {
  // Get all categories
  static async getAll(): Promise<Category[]> {
    try {
      const { data: categories, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error

      return categories?.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        createdAt: cat.created_at
      })) || []
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Get category by ID
  static async getById(id: string): Promise<Category | null> {
    try {
      const { data: category, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (!category) return null

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        createdAt: category.created_at
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  }

  // Create new category
  static async create(categoryData: {
    name: string
    description?: string
  }): Promise<Category | null> {
    try {
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { data: newCategory, error } = await supabaseAdmin
        .from('categories')
        .insert({
          name: categoryData.name,
          slug,
          description: categoryData.description || null
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        createdAt: newCategory.created_at
      }
    } catch (error) {
      console.error('Error creating category:', error)
      return null
    }
  }

  // Update category
  static async update(id: string, updates: {
    name?: string
    description?: string
  }): Promise<Category | null> {
    try {
      const updateData: any = {}

      if (updates.name !== undefined) {
        updateData.name = updates.name
        updateData.slug = updates.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }
      if (updates.description !== undefined) updateData.description = updates.description

      const { data: updatedCategory, error } = await supabaseAdmin
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        id: updatedCategory.id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        createdAt: updatedCategory.created_at
      }
    } catch (error) {
      console.error('Error updating category:', error)
      return null
    }
  }

  // Delete category
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    }
  }
}
