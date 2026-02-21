import http from "node:http"
import path from "node:path"
import { access, mkdir, readFile, writeFile } from "node:fs/promises"
import {
  Browser,
  ChromeReleaseChannel,
  computeSystemExecutablePath,
  detectBrowserPlatform,
  install,
  resolveBuildId,
} from "@puppeteer/browsers"
import puppeteer from "puppeteer"

const distDir = path.join(process.cwd(), "dist")
const shouldSkip = process.env.SKIP_PRERENDER === "true"
const cacheDir =
  process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), ".cache", "puppeteer")

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".obj": "text/plain; charset=utf-8",
}

const resolveFilePath = (urlPath: string) => {
  let resolvedPath = decodeURIComponent(urlPath.split("?")[0])
  if (resolvedPath.endsWith("/")) {
    resolvedPath += "index.html"
  }
  if (!path.extname(resolvedPath)) {
    resolvedPath = path.join(resolvedPath, "index.html")
  }
  const fullPath = path.resolve(distDir, `.${resolvedPath}`)
  const distRoot = path.resolve(distDir)
  if (!fullPath.startsWith(distRoot)) {
    return null
  }
  return fullPath
}

const startServer = async () => {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      res.statusCode = 400
      res.end("Bad request")
      return
    }

    const filePath = resolveFilePath(req.url)
    if (!filePath) {
      res.statusCode = 403
      res.end("Forbidden")
      return
    }

    try {
      const data = await readFile(filePath)
      const ext = path.extname(filePath)
      res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream")
      res.statusCode = 200
      res.end(data)
    } catch {
      const requestedPath = decodeURIComponent(req.url.split("?")[0])
      if (!path.extname(requestedPath)) {
        try {
          const fallbackPath = path.join(distDir, "index.html")
          const data = await readFile(fallbackPath)
          res.setHeader("Content-Type", contentTypes[".html"])
          res.statusCode = 200
          res.end(data)
          return
        } catch {
          // Fall through to 404 if the SPA entry is missing.
        }
      }
      res.statusCode = 404
      res.end("Not found")
    }
  })

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve())
  })

  const address = server.address()
  if (!address || typeof address === "string") {
    throw new Error("Failed to bind prerender server")
  }

  return { server, port: address.port }
}

const fileExists = async (filePath: string) => {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

const resolveExecutablePath = async () => {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH
  if (envPath && (await fileExists(envPath))) {
    return envPath
  }

  try {
    const systemPath = computeSystemExecutablePath({
      browser: Browser.CHROME,
      channel: ChromeReleaseChannel.STABLE,
    })
    if (await fileExists(systemPath)) {
      return systemPath
    }
  } catch {
    // Fall back to downloading a known-good Chrome build.
  }

  const platform = detectBrowserPlatform()
  if (!platform) {
    throw new Error("Unsupported platform for downloading Chrome.")
  }

  const buildId = await resolveBuildId(
    Browser.CHROME,
    platform,
    ChromeReleaseChannel.STABLE,
  )
  const installed = await install({
    cacheDir,
    platform,
    browser: Browser.CHROME,
    buildId,
    buildIdAlias: ChromeReleaseChannel.STABLE,
    downloadProgressCallback: "default",
  })

  return installed.executablePath
}

const getDoctype = async (page: puppeteer.Page) => {
  return page.evaluate(() => {
    const { doctype } = document
    if (!doctype) return ""
    const publicId = doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : ""
    const systemId = doctype.systemId ? ` "${doctype.systemId}"` : ""
    return `<!doctype ${doctype.name}${publicId}${systemId}>`
  })
}

const snapshotRoute = async (
  page: puppeteer.Page,
  url: string,
  selector: string | null,
  outputPath: string,
  postWaitMs = 2000,
) => {
  await page.goto(url, { waitUntil: "load" })
  if (selector) {
    try {
      await page.waitForSelector(selector, { timeout: 25000 })
    } catch (error) {
      console.warn(
        `[prerender] Selector "${selector}" not found for ${url}, continuing.`,
        error,
      )
    }
  }
  if (selector === "[data-prerender-ready]") {
    try {
      await page.waitForFunction(
        () => document.getElementById("root")?.children?.length > 0,
        { timeout: 8000 },
      )
    } catch {
      console.warn(`[prerender] #root still empty for ${url} after wait`)
    }
  }
  await new Promise((resolve) => setTimeout(resolve, postWaitMs))

  const html = await page.content()
  const doctype = html.trim().toLowerCase().startsWith("<!doctype")
    ? ""
    : await getDoctype(page)
  const output = `${doctype}${doctype ? "\n" : ""}${html}`

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, output, "utf8")
  console.log(`[prerender] Wrote ${outputPath}`)
}

const run = async () => {
  if (shouldSkip) {
    console.log("[prerender] SKIP_PRERENDER=true, skipping prerender step.")
    return
  }

  const { server, port } = await startServer()
  const baseUrl = `http://127.0.0.1:${port}`

  const executablePath = await resolveExecutablePath()

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--use-gl=swiftshader",
    ],
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(30000)

  await page.evaluateOnNewDocument(() => {
    ;(window as Window & { __PRERENDERING?: boolean }).__PRERENDERING = true
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register = () => Promise.resolve(null as never)
    }
  })

  try {
    await snapshotRoute(
      page,
      `${baseUrl}/`,
      "[data-prerender-ready]",
      path.join(distDir, "index.html"),
      6000,
    )
    await snapshotRoute(
      page,
      `${baseUrl}/en`,
      "[data-prerender-ready]",
      path.join(distDir, "en", "index.html"),
      3000,
    )
    await snapshotRoute(
      page,
      `${baseUrl}/it`,
      "[data-prerender-ready]",
      path.join(distDir, "it", "index.html"),
      3000,
    )
    await snapshotRoute(
      page,
      `${baseUrl}/inscriptions`,
      ".inscription-exploration",
      path.join(distDir, "inscriptions", "index.html"),
      2000,
    )
    await snapshotRoute(
      page,
      `${baseUrl}/en/inscriptions`,
      ".inscription-exploration",
      path.join(distDir, "en", "inscriptions", "index.html"),
      2000,
    )
    await snapshotRoute(
      page,
      `${baseUrl}/it/inscriptions`,
      ".inscription-exploration",
      path.join(distDir, "it", "inscriptions", "index.html"),
      2000,
    )
  } finally {
    await browser.close()
    server.close()
  }
}

run().catch((error) => {
  console.error("[prerender] Failed to prerender routes:", error)
  process.exit(1)
})
