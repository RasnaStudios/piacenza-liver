import fs from "node:fs"
import path from "node:path"

const distDir = path.resolve("dist")
const indexPath = path.join(distDir, "index.html")

const routesNeedingEntrypoints = ["/inscriptions"]

if (!fs.existsSync(indexPath)) {
  throw new Error(
    `[create-route-entries] Expected ${indexPath} to exist. Run the build before generating route entrypoints.`,
  )
}

const indexHtml = fs.readFileSync(indexPath, "utf8")

routesNeedingEntrypoints.forEach((route) => {
  const cleanRoute = route.replace(/^\//, "")
  if (!cleanRoute) return

  const routeDir = path.join(distDir, cleanRoute)
  fs.mkdirSync(routeDir, { recursive: true })

  const destination = path.join(routeDir, "index.html")
  fs.writeFileSync(destination, indexHtml)
  console.log(`[create-route-entries] Wrote ${destination}`)
})
