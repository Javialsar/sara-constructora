import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sara-constructora.vercel.app'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/nosotros',
          '/servicios',
          '/servicios/*',
          '/proyectos',
          '/proyectos/*',
          '/clientes',
          '/contacto',
          '/noticias',
          '/noticias/*',
          '/inmobiliaria',
          '/stays',
          '/apu',
          '/compras',
          '/fletes',
          '/modulos/fletes',
          '/modulos/compras',
          '/modulos/talento',
          '/modulos/financiero',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/manifests/*',
          '/modulos/fletes/mi-perfil',
          '/modulos/fletes/mi-perfil/*',
          '/modulos/fletes/auth',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
