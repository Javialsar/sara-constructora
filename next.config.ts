import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/airbnb',
        destination: '/stays',
        permanent: true,
      },
      {
        source: '/airbnb/:path*',
        destination: '/stays/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
