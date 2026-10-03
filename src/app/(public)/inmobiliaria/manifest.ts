import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SARA Inmobiliaria',
    short_name: 'Inmobiliaria',
    description: 'Catálogo de propiedades exclusivas.',
    start_url: '/inmobiliaria',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#f59e0b',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
