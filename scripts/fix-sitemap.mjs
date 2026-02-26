// This script fixes the sitemap.xml file by adding trailing slashes to the URLs.
// It is used to ensure that the sitemap.xml file is valid and can be used by search engines.
// Otherwise Google will complain about redirects due to Github Pages redirecting when the URL is missing a trailing slash.
// It is also used to ensure that the sitemap.xml file is consistent with the other files in the dist directory.
// It is run automatically by the deploy script.
// It is not run manually.


import fs from "node:fs"
import path from "node:path"

const sitemapPath = path.resolve("dist", "sitemap.xml")

if (!fs.existsSync(sitemapPath)) {
  console.log(`[fix-sitemap] ${sitemapPath} not found; skipping.`)
  process.exit(0)
}

const xml = fs.readFileSync(sitemapPath, "utf8").replace(/\r\n/g, "\n")

const excludePathnames = [/\/google[a-f0-9]+\/?$/]
const seenPathnames = new Set()
const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || []
const processed = urlBlocks
  .map((block) => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/)
    if (!locMatch) return null
    let pathname
    try {
      pathname = new URL(locMatch[1]).pathname.replace(/\/+$/, "") || "/"
    } catch {
      return block
    }
    if (excludePathnames.some((re) => re.test(pathname))) return null
    if (seenPathnames.has(pathname)) return null
    seenPathnames.add(pathname)

    let url
    try {
      url = new URL(locMatch[1])
    } catch {
      return block
    }
    const normalizedPath = url.pathname
    const hasExtension = path.extname(normalizedPath) !== ""
    if (normalizedPath !== "/" && !normalizedPath.endsWith("/") && !hasExtension) {
      url.pathname = `${normalizedPath}/`
    }
    let cleaned = block.replace(/<loc>[^<]+<\/loc>/, `<loc>${url.toString()}</loc>`)
    cleaned = cleaned.replace(
      /<lastmod>\s*([^<]+)\s*<\/lastmod>/,
      (_, v) => `<lastmod>${v.trim()}</lastmod>`,
    )
    cleaned = cleaned.replace(
      /<changefreq>\s*([^<]+)\s*<\/changefreq>/,
      (_, v) => `<changefreq>${v.trim()}</changefreq>`,
    )
    cleaned = cleaned.replace(
      /<priority>\s*([^<]+)\s*<\/priority>/,
      (_, v) => `<priority>${v.trim()}</priority>`,
    )
    return cleaned
  })
  .filter(Boolean)

const urlsetMatch = xml.match(/^(<\?xml[^>]*>[\s\S]*?<urlset[^>]*>)([\s\S]*)(<\/urlset>[\s\S]*)$/)
const updated = urlsetMatch
  ? `${urlsetMatch[1]}\n${processed.join("\n")}\n${urlsetMatch[3]}`
  : xml

if (updated !== xml) {
  fs.writeFileSync(sitemapPath, updated, "utf8")
  console.log(`[fix-sitemap] Updated ${sitemapPath}`)
}
