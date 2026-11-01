import { NextResponse } from "next/server"
import { PWA_APPS, type PwaAppId } from "@/lib/pwa/apps"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ app: string }> }
) {
  const { app: appId } = await params
  const hasApp = Object.prototype.hasOwnProperty.call(PWA_APPS, appId)
  const app = hasApp ? PWA_APPS[appId as PwaAppId] : undefined

  if (!app) {
    return NextResponse.json({ error: "PWA no encontrada" }, { status: 404 })
  }

  const manifest = {
    id: `/pwa/${app.id}`,
    name: app.name,
    short_name: app.shortName,
    description: app.description,
    lang: "es",
    start_url: app.startUrl,
    scope: app.scope,
    display: "standalone",
    orientation: "any",
    background_color: app.backgroundColor,
    theme_color: app.themeColor,
    icons: [
      { src: `/icons/${app.id}-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `/icons/${app.id}-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `/icons/${app.id}-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
