import fs from "node:fs"
import type { IncomingMessage, ServerResponse } from "node:http"
import path from "node:path"
import react from "@vitejs/plugin-react"
import { type Connect, defineConfig, type ViteDevServer } from "vite"
import { VitePWA } from "vite-plugin-pwa"

const LIVER_DATA_PATH = path.resolve("src/scene/LiverData.ts")

const inscriptionPoseWriter = {
  name: "inscription-pose-writer",
  apply: "serve" as const,
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      async (
        req: IncomingMessage,
        res: ServerResponse,
        next: Connect.NextFunction,
      ) => {
        if (req.method !== "POST" || req.url !== "/__inscription_pose") {
          return next()
        }
        if (process.env.VITE_ENABLE_POSE_WRITER !== "true") {
          res.statusCode = 403
          res.end("Pose writer is disabled")
          return
        }
        const address = req.socket.remoteAddress
        if (address !== "::1" && address !== "127.0.0.1") {
          res.statusCode = 403
          res.end("Pose writer only accepts localhost requests")
          return
        }

        try {
          let body = ""
          let bodyTooLarge = false
          req.on("data", (chunk: Buffer) => {
            if (body.length + chunk.length > 16 * 1024) {
              bodyTooLarge = true
              return
            }
            body += chunk.toString()
          })
          await new Promise<void>((resolve) => req.on("end", () => resolve()))
          if (bodyTooLarge) {
            res.statusCode = 413
            res.end("Request body too large")
            return
          }
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
      },
    )
  },
}

export default defineConfig({
  assetsInclude: ["**/*.obj"],
  plugins: [
    react(),
    inscriptionPoseWriter,
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: false,
      workbox: {
        maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,json,txt,woff2,jpg,jpeg,obj,xml}",
        ],
        navigateFallbackDenylist: [
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/llms\.txt$/,
        ],
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
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
