import { NextResponse } from 'next/server';

export async function GET() {
  // Return mock user data for now
  const user = {
    id: '1',
    name: 'Admin',
    email: 'admin@blog.com',
    role: 'admin'
  };
  
  return NextResponse.json({ user, success: true }, {
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
