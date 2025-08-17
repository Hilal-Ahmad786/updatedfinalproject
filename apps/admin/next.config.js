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
  },
  
  // Use the new environment variable names
  env: {
    SUPABASE_PROJECT_URL: process.env.SUPABASE_PROJECT_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    // Keep the old ones as backup
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_PROJECT_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  
  // Debug environment variables during build
  generateBuildId: async () => {
    console.log('🔍 Build-time env check (all methods):', {
      // Old method
      oldUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'PRESENT' : 'MISSING',
      oldKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      // New method
      newUrl: process.env.SUPABASE_PROJECT_URL ? 'PRESENT' : 'MISSING',
      newKey: process.env.SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
      // All available env vars
      allSupabaseVars: Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase'))
    })
    return null
  }
}

module.exports = nextConfig