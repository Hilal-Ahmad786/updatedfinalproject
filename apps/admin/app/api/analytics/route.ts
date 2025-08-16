import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock analytics data
  const analytics = {
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    popularPosts: []
  };
  
  return NextResponse.json(analytics, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
