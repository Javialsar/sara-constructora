import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Grupo SARA Ecosistema',
    short_name: 'SARA',
    description: 'Constructora, SaaS APU, Inmobiliaria y Stays',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/logo-hero.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
