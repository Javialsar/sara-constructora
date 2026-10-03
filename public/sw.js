/* Service Worker de SARA (conservador a propósito).
 * - Estáticos inmutables y de marca: cache-first.
 * - Navegaciones: network-first; si no hay red, página offline.
 * - NUNCA cachea /api, /admin, /dashboard, /portal ni /manifests (datos privados y sesión).
 */
const VERSION = "sara-v1"
const STATIC_CACHE = `${VERSION}-static`
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll([OFFLINE_URL]))
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

const PRIVATE_PREFIXES = ["/api", "/admin", "/dashboard", "/portal", "/manifests", "/auth"]

function isPrivate(url) {
  return PRIVATE_PREFIXES.some((p) => url.pathname.startsWith(p))
}

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (isPrivate(url)) return

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match(OFFLINE_URL)))
    return
  }

  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
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
