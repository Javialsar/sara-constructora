import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SARA Stays',
    short_name: 'Stays',
    description: 'Reserva de estancias cortas y alojamientos.',
    start_url: '/stays',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#f59e0b',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
