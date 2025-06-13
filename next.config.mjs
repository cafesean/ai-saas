/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001', 
        process.env.NEXT_PUBLIC_BASE_URL,
        process.env.NEXT_PUBLIC_CDN_BASE_URL,
        // Add your production domains here
        'your-production-domain.com',
      ].filter(Boolean),
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