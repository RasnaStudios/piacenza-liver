import fs from "node:fs"
import path from "node:path"

const rootDir = process.cwd()
const swPath = path.join(rootDir, "dist", "sw.js")

const sanitize = (value) =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 32)

const fallbackVersion = () =>
  new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)

const buildVersion = () => {
  const manual =
    process.env.SW_CACHE_VERSION ||
    process.env.CACHE_VERSION ||
    process.env.VITE_CACHE_VERSION
  if (manual?.trim()) return sanitize(manual)

  const sha =
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.COMMIT_SHA ||
    process.env.SOURCE_VERSION
  const run =
    process.env.GITHUB_RUN_ID ||
    process.env.GITHUB_RUN_NUMBER ||
    process.env.BUILD_NUMBER ||
    process.env.CI_PIPELINE_ID

  const parts = [sha?.slice(0, 12), run]
    .filter(Boolean)
    .map((part) => sanitize(part))
    .filter(Boolean)

  if (parts.length) {
    return parts.join("-")
  }

  return fallbackVersion()
}

const version = `build-${buildVersion()}`

if (!fs.existsSync(swPath)) {
  throw new Error(
    `Service worker not found at ${swPath}. Build the project before running this script.`,
  )
}

const content = fs.readFileSync(swPath, "utf8")
const replaced = content.replace(
  /const CACHE_VERSION = ".*?"/,
  `const CACHE_VERSION = "${version}"`,
)

if (replaced === content) {
  throw new Error(
    "Failed to update CACHE_VERSION in dist/sw.js. Ensure the file contains the expected declaration.",
  )
}

fs.writeFileSync(swPath, replaced)
console.log(`[sw-cache-version] Updated CACHE_VERSION to ${version}`)
