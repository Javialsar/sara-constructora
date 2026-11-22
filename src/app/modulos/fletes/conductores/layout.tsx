import type { Metadata, Viewport } from "next"
import { manifestPath, PWA_APPS } from "@/lib/pwa/apps"

const driverApp = PWA_APPS["fletes-conductor"]

export const viewport: Viewport = {
  themeColor: driverApp.themeColor,
}

export const metadata: Metadata = {
  title: "SARA Conductor | Radar de Viajes, Ofertas y Billetera de Transportista",
  description: driverApp.description,
  manifest: manifestPath("fletes-conductor"),
  appleWebApp: {
    capable: true,
    title: driverApp.name,
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function FletesDriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
