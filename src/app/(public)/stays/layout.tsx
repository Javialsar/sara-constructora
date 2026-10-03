import type { Metadata, Viewport } from "next"
import { manifestPath, PWA_APPS } from "@/lib/pwa/apps"

export const viewport: Viewport = {
  themeColor: PWA_APPS.stays.themeColor,
}

export const metadata: Metadata = {
  manifest: manifestPath("stays"),
  appleWebApp: { capable: true, title: "SARA Stays", statusBarStyle: "black-translucent" },
}

export default function StaysLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
