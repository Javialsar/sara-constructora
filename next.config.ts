import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
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

export default withPWA(nextConfig);
