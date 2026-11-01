import type { Metadata, Viewport } from "next"
import { manifestPath, PWA_APPS } from "@/lib/pwa/apps"

export const viewport: Viewport = {
  themeColor: PWA_APPS.fletes.themeColor,
}

export const metadata: Metadata = {
  title: "SARA Fletes | Solicitud de Fletes, Carga Pesada y Renta Vehicular",
  description: PWA_APPS.fletes.description,
  manifest: manifestPath("fletes"),
  appleWebApp: {
    capable: true,
    title: PWA_APPS.fletes.shortName,
    statusBarStyle: "black-translucent",
  },
}

export default function FletesClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
