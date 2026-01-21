import fs from "node:fs"
import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"
import Sitemap from "vite-plugin-sitemap"

const LIVER_DATA_PATH = path.resolve("src/scene/LiverData.ts")
const SITEMAP_ROUTES = [
  "/en",
  "/it",
  "/inscriptions",
  "/en/inscriptions",
  "/it/inscriptions",
]

const inscriptionPoseWriter = {
  name: "inscription-pose-writer",
  apply: "serve",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.method !== "POST" || req.url !== "/__inscription_pose") {
        return next()
      }

      try {
        let body = ""
        req.on("data", (chunk) => {
          body += chunk
        })
        await new Promise<void>((resolve) => req.on("end", () => resolve()))
        const parsed = JSON.parse(body || "{}")
        const id = Number(parsed.id)
        if (!Number.isFinite(id) || id <= 0) {
          res.statusCode = 400
          res.end("Invalid inscription id")
          return
        }
        const pos = parsed.cameraPosition || {}
        const tgt = parsed.cameraTarget || {}
        const formatNum = (n: number) =>
          Number.isFinite(n) ? Number(n).toFixed(3) : "0"
        const replacementPos = `new THREE.Vector3(${formatNum(pos.x)}, ${formatNum(pos.y)}, ${formatNum(pos.z)})`
        const replacementTgt = `new THREE.Vector3(${formatNum(tgt.x)}, ${formatNum(tgt.y)}, ${formatNum(tgt.z)})`

        const src = fs.readFileSync(LIVER_DATA_PATH, "utf8")
        const regex = new RegExp(
          `(id:\\s*${id}[\\s\\S]*?cameraPosition:\\s*)new THREE\\.Vector3\\([^)]+\\)([\\s\\S]*?cameraTarget:\\s*)new THREE\\.Vector3\\([^)]+\\)`,
        )
        if (!regex.test(src)) {
          res.statusCode = 404
          res.end(`Inscription ${id} not found in LiverData.ts`)
          return
        }
        const updated = src.replace(
          regex,
          `$1${replacementPos}$2${replacementTgt}`,
        )
        fs.writeFileSync(LIVER_DATA_PATH, updated, "utf8")
        res.statusCode = 200
        res.end("ok")
      } catch (err) {
        console.error("Failed to update LiverData.ts via dev API:", err)
        res.statusCode = 500
        res.end("Failed to update LiverData.ts")
      }
    })
  },
}

export default defineConfig({
  assetsInclude: ["**/*.obj"],
  plugins: [
    react(),
    inscriptionPoseWriter,
    Sitemap({
      hostname: "https://liver.rasna.dev",
      dynamicRoutes: SITEMAP_ROUTES,
      changefreq: "yearly",
      priority: {
        "/": 1.0,
        "/en": 0.9,
        "/it": 0.9,
        "/inscriptions": 0.9,
        "/en/inscriptions": 0.8,
        "/it/inscriptions": 0.8,
      },
      generateRobotsTxt: false,
      readable: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,txt,woff2,jpg,jpeg,obj}",
        ],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith(".obj"),
            handler: "CacheFirst",
            options: {
              cacheName: "models",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  preview: {
    headers: {
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          vendor: ["react", "react-dom"],
          mantine: ["@mantine/core", "@mantine/hooks"],
        },
      },
    },
  },
})
