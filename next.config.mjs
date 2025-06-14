/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        // Development origins
        ...(process.env.NODE_ENV === 'development' ? [
          'localhost:3000',
          'localhost:3001',
          '127.0.0.1:3000',
          '127.0.0.1:3001',
        ] : []),
        // Environment-specific origins
        process.env.NEXT_PUBLIC_BASE_URL,
        process.env.NEXT_PUBLIC_CDN_BASE_URL,
        process.env.NEXTAUTH_URL,
        // Production domains (configure via environment variables)
        process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim()),
      ].flat().filter(Boolean),
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle postgres on client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        perf_hooks: false,
        pg: false,
        'pg-native': false,
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig; 