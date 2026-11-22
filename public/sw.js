/* Service Worker SARA Modernizado (v2)
 * - Catálogo Inmobiliaria: Stale-While-Revalidate para navegación fluida.
 * - Medios Supabase Storage: Cache-First con fallback de red.
 * - Navegación: Network-First con fallback a offline.html.
 * - Exclusión estricta de rutas autenticadas y transaccionales (/admin, /dashboard, /auth).
 */
const VERSION = "sara-v2"
const STATIC_CACHE = `${VERSION}-static`
const DATA_CACHE = `${VERSION}-data`
const MEDIA_CACHE = `${VERSION}-media`
const OFFLINE_URL = "/offline.html"

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/manifests/inmobiliaria",
  "/icons/inmobiliaria-192.png",
  "/icons/inmobiliaria-512.png"
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

const STRICT_PRIVATE_PREFIXES = [
  "/admin",
  "/dashboard",
  "/portal",
  "/auth",
  "/modulos/fletes/conductores",
  "/modulos/fletes/mi-perfil",
  "/modulos/fletes/auth",
  "/modulos/talento/mi-perfil",
]

function isStrictPrivate(url) {
  const p = url.pathname
  return (
    STRICT_PRIVATE_PREFIXES.some((prefix) => p.startsWith(prefix)) ||
    p.includes("/mi-perfil") ||
    p.includes("/auth")
  )
}

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)

  // 1. Rutas estrictamente privadas: NUNCA en caché de navegador
  if (isStrictPrivate(url)) return

  // 2. Catálogo público de Inmobiliaria (/api/inmobiliaria/inmuebles): Stale-While-Revalidate
  if (url.origin === self.location.origin && url.pathname === "/api/inmobiliaria/inmuebles") {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(req)
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            if (networkRes.ok) {
              cache.put(req, networkRes.clone())
            }
            return networkRes
          })
          .catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }

  // 3. Imágenes y activos de Supabase Storage (Cross-Origin): Cache-First
  if (url.hostname.includes("supabase.co") && url.pathname.includes("/storage/v1/object/public/")) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(req)
        if (cached) return cached
        try {
          const networkRes = await fetch(req)
          if (networkRes.ok) {
            cache.put(req, networkRes.clone())
          }
          return networkRes
        } catch {
          return new Response("", { status: 404 })
        }
      })
    )
    return
  }

  // 4. Si es cross-origin y no es Supabase Storage: ignorar
  if (url.origin !== self.location.origin) return

  // 5. Navegaciones HTML: Network First con fallback a Offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => {
        const hit = await caches.match(req)
        return hit || caches.match(OFFLINE_URL)
      })
    )
    return
  }

  // 6. Archivos estáticos locales (_next/static, fuentes, imágenes locales)
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/manifests/") ||
    /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(url.pathname)

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(STATIC_CACHE).then((c) => c.put(req, copy))
            }
            return res
          })
      )
    )
  }
})
