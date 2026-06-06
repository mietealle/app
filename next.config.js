/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    // Fallback: unoptimized mode so demo works without any image config errors
    unoptimized: process.env.NODE_ENV === 'development' ? false : false,
  },
  // Suppress build-time env warnings for missing Supabase keys in demo mode
  typescript: { ignoreBuildErrors: false },
}

module.exports = nextConfig
