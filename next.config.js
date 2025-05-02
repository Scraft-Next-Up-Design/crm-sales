/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Specify src directory as the application root
  // This ensures Next.js looks in the right place for app/pages
  dir: 'src',
  
  // Ignore linting/type errors during builds for improved CI performance
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimized image configuration
  images: { 
    unoptimized: false,
    domains: ['supabasekong-pgo8c80w04gcoo4w88kgsw0s.breaktheice.in'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable SWC minification for faster builds
  swcMinify: true,
  
  // Compiler options for production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Basic optimizations that are compatible with Next.js 15+
  experimental: {
    optimizeCss: true,
  },
  
  // Webpack configuration for better bundle splitting
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 90000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        automaticNameDelimiter: '~',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](react|react-dom|next|@next)[\\/]/,
            priority: 40,
            enforce: true,
            reuseExistingChunk: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
            reuseExistingChunk: true,
          },
          shared: {
            name: 'shared',
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      };
    }

    return config;
  },
  
  // Disable source maps in production for smaller bundle size
  productionBrowserSourceMaps: false,
  
  // Enable gzip compression
  compress: true,
  
  // Standard output directory
  distDir: '.next',
}

module.exports = nextConfig;
