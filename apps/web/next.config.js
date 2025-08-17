// Create or update apps/web/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@100lesme-blog/ui', '@100lesme-blog/database'],
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable image optimization to fix loading issues
    unoptimized: true
  },
  
  // Add environment variables for the website
  env: {
    SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'https://blog-admin-final.vercel.app',
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Debug environment variables during build
  generateBuildId: async () => {
    console.log('🔍 Website Build-time env check:', {
      adminApiUrl: process.env.NEXT_PUBLIC_ADMIN_API_URL ? 'PRESENT' : 'MISSING',
      supabaseUrl: process.env.SUPABASE_PROJECT_URL || process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
      supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING'
    })
    return null
  }
}

module.exports = nextConfig