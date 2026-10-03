import { Metadata } from "next"

export const metadata: Metadata = {
  title: "SARA Inmobiliaria | Venta y Arriendo de Propiedades en Cuenca",
  description: "Encuentra casas, departamentos, terrenos y locales en Cuenca y el Austro con SARA Inmobiliaria. Inversión con respaldo constructivo, seguridad jurídica, y asesoría para Crédito VIP y Biess.",
  openGraph: {
    title: "SARA Inmobiliaria | Catálogo de Propiedades Exclusivas",
    description: "Patrimonio sólido e inversión con respaldo constructivo. Descubre residencias de alta gama, departamentos de diseño y lotes urbanizados en Cuenca.",
    url: "https://saraconstructora.ec/inmobiliaria",
    siteName: "SARA Inmobiliaria",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "SARA Inmobiliaria - Residencias de Alta Gama",
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SARA Inmobiliaria | Venta y Arriendo de Propiedades",
    description: "Patrimonio sólido e inversión con respaldo constructivo. Descubre residencias de alta gama en Cuenca.",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"],
  },
}

export default function InmobiliariaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
