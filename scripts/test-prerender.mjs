#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"

const distDir = path.resolve(process.cwd(), "dist")
const errors = []

function check(name, condition, message) {
  if (!condition) {
    errors.push(`FAIL: ${name} - ${message}`)
    return false
  }
  console.log(`OK: ${name}`)
  return true
}

console.log("\n=== Prerender Test ===\n")

const indexPath = path.join(distDir, "index.html")
const inscriptionsPath = path.join(distDir, "inscriptions", "index.html")

if (!fs.existsSync(indexPath)) {
  errors.push("FAIL: dist/index.html does not exist - run build first")
} else {
  const indexHtml = fs.readFileSync(indexPath, "utf8")

  check(
    "Homepage exists",
    indexHtml.length > 0,
    `index.html is empty (${indexHtml.length} bytes)`,
  )

  check(
    "Homepage: title",
    indexHtml.includes("Piacenza Liver"),
    "Missing title/keywords",
  )

  check(
    "Homepage: meta description",
    indexHtml.includes('name="description"'),
    "Missing meta description",
  )

  check(
    "Homepage: JSON-LD",
    indexHtml.includes('application/ld+json'),
    "Missing structured data",
  )

  check(
    "Homepage: robots index",
    indexHtml.includes("index, follow"),
    "Missing or wrong robots meta",
  )

  check(
    "Homepage: canonical",
    indexHtml.includes('rel="canonical"'),
    "Missing canonical link",
  )

  check(
    "Homepage: h1",
    indexHtml.includes("<h1") && indexHtml.includes("Piacenza Liver"),
    "Missing h1",
  )

  check(
    "Homepage: prerender signal",
    indexHtml.includes('data-prerender-ready'),
    "data-prerender-ready not found - React may not have run",
  )

  const rootMatch = indexHtml.match(/<div id="root">(.*?)<\/div>/s)
  const rootContent = rootMatch ? rootMatch[1].trim() : ""
  check(
    "Homepage: #root has content",
    rootContent.length > 100,
    `#root has ${rootContent.length} chars (expected >100)`,
  )
}

if (!fs.existsSync(inscriptionsPath)) {
  errors.push("FAIL: dist/inscriptions/index.html does not exist")
} else {
  const inscriptionsHtml = fs.readFileSync(inscriptionsPath, "utf8")

  check(
    "Inscriptions: exists",
    inscriptionsHtml.length > 10000,
    `inscriptions page too small (${inscriptionsHtml.length} bytes)`,
  )

  check(
    "Inscriptions: main content",
    inscriptionsHtml.includes("inscription-exploration"),
    "Missing inscription-exploration class",
  )

  check(
    "Inscriptions: deity content",
    inscriptionsHtml.includes("Tinia") || inscriptionsHtml.includes("Cilens"),
    "Missing deity names - content may not have rendered",
  )

  check(
    "Inscriptions: inscription cards",
    (inscriptionsHtml.match(/inscription-card/g) || []).length >= 10,
    "Too few inscription cards",
  )
}

const sitemapPath = path.join(distDir, "sitemap.xml")
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8")
  check("Sitemap: has /", sitemap.includes("liver.rasna.dev/"), "Root URL missing")
  check(
    "Sitemap: has inscriptions",
    sitemap.includes("inscriptions/"),
    "Inscriptions URL missing",
  )
}

console.log("")
if (errors.length > 0) {
  console.error("PRERENDER TEST FAILED\n")
  errors.forEach((e) => console.error(`  ${e}`))
  process.exit(1)
} else {
  console.log("All prerender tests passed.\n")
  process.exit(0)
}
