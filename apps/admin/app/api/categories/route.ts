//apps/admin/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/shared-data';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET() {
  try {
    const categories = dataStore.categories.getAll();
    return NextResponse.json({ 
      categories, 
      success: true, 
      total: categories.length 
    }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch categories',
      success: false 
    }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const category = dataStore.categories.create({
      name: data.name,
      slug: data.slug,
      description: data.description || ''
    });
    
    return NextResponse.json({ 
      category, 
      success: true 
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create category',
      success: false 
    }, { status: 500, headers: corsHeaders });
  }
}