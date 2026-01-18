// CACHE_VERSION is overwritten at build time by scripts/update-sw-cache-version.mjs
const CACHE_VERSION = "dev"
const CACHE_NAME = `piacenza-liver-${CACHE_VERSION}`

const CACHEABLE_PATTERNS = [
  /\.obj$/,
  /\.jpg$/,
  /\.png$/,
  /\.woff2$/,
  /\.js$/,
  /\.css$/,
]

function isCacheable(url) {
  const urlObj = new URL(url)
  if (urlObj.pathname === "/" || urlObj.pathname === "/index.html") {
    return true
  }
  return CACHEABLE_PATTERNS.some((pattern) => pattern.test(urlObj.pathname))
}

self.addEventListener("install", (_event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) => name.startsWith("piacenza-liver-") && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      )
    }),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") return

  if (isCacheable(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
        })
      }),
    )
  }
})
