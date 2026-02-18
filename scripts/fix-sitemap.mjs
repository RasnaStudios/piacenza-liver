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

const xml = fs.readFileSync(sitemapPath, "utf8")

const excludePathnames = [/\/google[a-f0-9]+\/?$/]
const withoutExcluded = xml.replace(
  /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g,
  (block, loc) => {
    try {
      const pathname = new URL(loc).pathname
      if (excludePathnames.some((re) => re.test(pathname))) return ""
    } catch {}
    return block
  },
)

const updated = withoutExcluded.replace(/<loc>([^<]+)<\/loc>/g, (match, loc) => {
  let url
  try {
    url = new URL(loc)
  } catch {
    return match
  }

  const pathname = url.pathname
  const hasExtension = path.extname(pathname) !== ""
  const needsRootSlash = pathname === "/" && !loc.endsWith("/")
  const needsTrailingSlash =
    !hasExtension && pathname !== "/" && !pathname.endsWith("/")

  if (!needsRootSlash && !needsTrailingSlash) {
    return match
  }

  if (pathname !== "/" && !pathname.endsWith("/")) {
    url.pathname = `${pathname}/`
  }

  return `<loc>${url.toString()}</loc>`
})

if (updated !== xml) {
  fs.writeFileSync(sitemapPath, updated, "utf8")
  console.log(`[fix-sitemap] Updated ${sitemapPath}`)
}
