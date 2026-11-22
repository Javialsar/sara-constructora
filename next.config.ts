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
  async headers() {
    // Definición estricta de Content-Security-Policy (CSP) OWASP 2025
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.kushkipagos.com https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.kushkipagos.com https://api.resend.com",
      "frame-src 'self' https://js.stripe.com https://*.kushkipagos.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=(self)',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
