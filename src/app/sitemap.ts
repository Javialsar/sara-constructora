import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sara-constructora.vercel.app'
  const currentDate = new Date().toISOString()

  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/servicios`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/proyectos`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/contacto`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${baseUrl}/nosotros`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/clientes`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/noticias`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${baseUrl}/inmobiliaria`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/stays`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/apu`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/modulos/fletes`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/modulos/compras`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/modulos/talento`, lastModified: currentDate, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/modulos/financiero`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.8 },
  ]

  const serviceSlugs = [
    "diseno-arquitectonico",
    "construccion-de-obras",
    "ingenieria-y-calculo-estructural",
    "estudios-de-suelos",
    "topografia-y-planimetria",
    "presupuestos-y-apu",
    "remodelaciones-y-ampliaciones",
    "direccion-y-supervision",
    "modelado-3d-y-renders",
    "consultoria-tecnica",
  ]

  const serviceRoutes = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/servicios/${slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }))

  return [...staticRoutes, ...serviceRoutes]
}
