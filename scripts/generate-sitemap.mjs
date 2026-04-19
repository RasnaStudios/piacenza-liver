import fs from "node:fs"
import path from "node:path"

const distDir = path.resolve("dist")
const siteOrigin = (() => {
  const src = fs.readFileSync(
    path.resolve("src/config/siteOrigin.ts"),
    "utf8",
  )
  const m = src.match(/SITE_ORIGIN\s*=\s*["']([^"']+)["']/)
  if (!m) {
    throw new Error("[generate-sitemap] Could not read SITE_ORIGIN from siteOrigin.ts")
  }
  return m[1].replace(/\/$/, "")
})()

const paths = [
  "/",
  "/en/",
  "/it/",
  "/inscriptions/",
  "/en/inscriptions/",
  "/it/inscriptions/",
]

const lastmod = new Date().toISOString().split("T")[0]

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((p) => {
    const loc = `${siteOrigin}${p}`
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === "/" ? "1.0" : "0.8"}</priority>
  </url>`
  })
  .join("\n")}
</urlset>
`

if (!fs.existsSync(distDir)) {
  throw new Error(
    `[generate-sitemap] Missing ${distDir}. Run vite build before generate-sitemap.`,
  )
}

const out = path.join(distDir, "sitemap.xml")
fs.writeFileSync(out, body, "utf8")
console.log(`[generate-sitemap] Wrote ${out}`)
