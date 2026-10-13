import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
      {
        source: '/alojamiento',
        destination: '/stays',
        permanent: true,
      },
      {
        source: '/alojamiento/:path*',
        destination: '/stays/:path*',
        permanent: true,
      },
      {
        source: '/fletes',
        destination: '/modulos/fletes',
        permanent: true,
      },
      {
        source: '/talento',
        destination: '/modulos/talento',
        permanent: true,
      },
      {
        source: '/marketplace',
        destination: '/modulos/compras',
        permanent: true,
      },
      {
        source: '/compras',
        destination: '/modulos/compras',
        permanent: true,
      },
      {
        source: '/pagos',
        destination: '/modulos/financiero',
        permanent: true,
      },
      {
        source: '/financiero',
        destination: '/modulos/financiero',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
