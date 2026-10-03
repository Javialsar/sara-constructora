import type { Metadata, Viewport } from "next"
import { manifestPath, PWA_APPS } from "@/lib/pwa/apps"

export const viewport: Viewport = {
  themeColor: PWA_APPS.apu.themeColor,
}

export const metadata: Metadata = {
  manifest: manifestPath("apu"),
  appleWebApp: { capable: true, title: "SARA APU", statusBarStyle: "default" },
}

export default function ApusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
