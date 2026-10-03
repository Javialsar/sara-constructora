import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SARA APU',
    short_name: 'APU',
    description: 'Análisis de Precios Unitarios y bases de datos.',
    start_url: '/dashboard/apus',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
}
