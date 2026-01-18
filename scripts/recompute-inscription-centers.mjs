import fs from "fs"
import { execSync } from "child_process"
import { PNG } from "pngjs"
import { Vector2, Vector3 } from "three"

const OBJ_PATH = "src/assets/liver-model/Fegato.obj"
const MASK_PATH = "src/assets/segmentation.png"
const DATA_PATH = "src/scene/LiverData.ts"
const MAX_ID = 42
const SAMPLE_STEP = 4 // Skip pixels to speed up; 4 => ~1M samples
const EPS = 1e-5
const DEFAULT_CAMERA_DISTANCE = 1

const toIndex = (raw, length) => {
  const idx = Number.parseInt(raw, 10)
  if (Number.isNaN(idx)) return null
  return idx >= 0 ? idx - 1 : length + idx
}

const parseObj = (filePath) => {
  const text = fs.readFileSync(filePath, "utf8")
  const vertices = []
  const uvs = []
  const triangles = []

  for (const line of text.split("\n")) {
    if (line.startsWith("v ")) {
      const [x, y, z] = line
        .slice(2)
        .trim()
        .split(/\s+/)
        .map(Number)
      vertices.push(new Vector3(x, y, z))
    } else if (line.startsWith("vt ")) {
      const [u, v] = line
        .slice(3)
        .trim()
        .split(/\s+/)
        .map(Number)
      uvs.push(new Vector2(u, v))
    } else if (line.startsWith("f ")) {
      const parts = line.slice(2).trim().split(/\s+/)
      const face = parts
        .map((p) => {
          const [vIdx, tIdx] = p.split("/")
          const v = toIndex(vIdx, vertices.length)
          const t = toIndex(tIdx, uvs.length)
          if (v == null || t == null) return null
          return { v, t }
        })
        .filter(Boolean)
      if (face.length < 3) continue
      for (let i = 1; i < face.length - 1; i++) {
        const f0 = face[0]
        const f1 = face[i]
        const f2 = face[i + 1]
        const pos = [vertices[f0.v], vertices[f1.v], vertices[f2.v]]
        const uv = [uvs[f0.t], uvs[f1.t], uvs[f2.t]]
        const normal = new Vector3()
          .crossVectors(
            pos[1].clone().sub(pos[0]),
            pos[2].clone().sub(pos[0]),
          )
          .normalize()
        const center = pos[0]
          .clone()
          .add(pos[1])
          .add(pos[2])
          .multiplyScalar(1 / 3)
        triangles.push({ pos, uv, normal, center })
      }
    }
  }

  const meshCenter =
    vertices.length === 0
      ? new Vector3(0, 0, 0)
      : vertices
          .reduce((acc, v) => acc.add(v), new Vector3())
          .divideScalar(vertices.length)

  return { triangles, meshCenter }
}

const loadUvCentroids = (filePath, step = 1) => {
  const png = PNG.sync.read(fs.readFileSync(filePath))
  const { width, height, data } = png
  const accum = Array.from({ length: MAX_ID + 1 }, () => ({
    u: 0,
    v: 0,
    count: 0,
  }))

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      const id = data[idx] // grayscale => use red channel
      if (id <= 0 || id > MAX_ID) continue
      const u = (x + 0.5) / width
      const v = 1 - (y + 0.5) / height // flip to match UV convention
      accum[id].u += u
      accum[id].v += v
      accum[id].count++
    }
  }

  return accum.map((a) => {
    if (!a || a.count === 0) return null
    return new Vector2(a.u / a.count, a.v / a.count)
  })
}

const barycentric = (p, a, b, c) => {
  const denom = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
  if (Math.abs(denom) < 1e-12) return null
  const w1 = ((b.y - c.y) * (p.x - c.x) + (c.x - b.x) * (p.y - c.y)) / denom
  const w2 = ((c.y - a.y) * (p.x - c.x) + (a.x - c.x) * (p.y - c.y)) / denom
  const w3 = 1 - w1 - w2
  return { w1, w2, w3 }
}

const interpolate = (weights, verts) => {
  return new Vector3()
    .addScaledVector(verts[0], weights.w1)
    .addScaledVector(verts[1], weights.w2)
    .addScaledVector(verts[2], weights.w3)
}

const uvToPoint = (uv, triangles, meshCenter) => {
  let best = null
  let bestMinW = -Infinity
  for (const tri of triangles) {
    const weights = barycentric(uv, tri.uv[0], tri.uv[1], tri.uv[2])
    if (!weights) continue
    const minW = Math.min(weights.w1, weights.w2, weights.w3)
    const orientedNormal =
      tri.normal.lengthSq() === 0
        ? new Vector3(0, 1, 0)
        : tri.normal.clone()
    const triCenter = tri.center
    const toOutside = triCenter.clone().sub(meshCenter)
    if (orientedNormal.dot(toOutside) < 0) {
      orientedNormal.multiplyScalar(-1)
    }
    const point = interpolate(weights, tri.pos)

    if (minW >= -EPS) {
      return { point, normal: orientedNormal }
    }
    if (minW > bestMinW) {
      bestMinW = minW
      best = { point, normal: orientedNormal }
    }
  }
  return best
}

const formatNum = (n) => {
  const fixed = Number.parseFloat(n.toFixed(3))
  return Object.is(fixed, -0) ? 0 : fixed
}

const formatVec = (v) =>
  `new THREE.Vector3(${formatNum(v.x)}, ${formatNum(v.y)}, ${formatNum(v.z)})`

const loadCameraDistanceFromSceneConfig = () => {
  try {
    const text = fs.readFileSync("src/config/SceneConfig.ts", "utf8")
    const match = text.match(/inscriptions:\s*{[^}]*cameraDistance:\s*([0-9.]+)/)
    if (match && match[1]) {
      const parsed = Number(match[1])
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn(
      "Could not read camera distance from SceneConfig.ts, using default.",
      err?.message || err,
    )
  }
  return DEFAULT_CAMERA_DISTANCE
}

const main = () => {
  const CAMERA_DISTANCE = loadCameraDistanceFromSceneConfig()

  console.log("Parsing OBJ…")
  const { triangles, meshCenter } = parseObj(OBJ_PATH)
  console.log(`Loaded ${triangles.length} triangles`)

  console.log("Computing UV centroids from segmentation…")
  const uvCentroids = loadUvCentroids(MASK_PATH, SAMPLE_STEP)

  console.log(`Using uniform camera distance: ${CAMERA_DISTANCE}`)

  console.log("Mapping UVs to mesh surface…")
  const targets = Array(MAX_ID + 1).fill(null)
  const positions = Array(MAX_ID + 1).fill(null)
  for (let id = 1; id <= MAX_ID; id++) {
    const uv = uvCentroids[id]
    if (!uv) {
      console.warn(`No UV centroid for id ${id}`)
      continue
    }
    const hit = uvToPoint(uv, triangles, meshCenter)
    if (!hit) {
      console.warn(`No triangle found for id ${id}`)
      continue
    }
    const target = hit.point
    const normal = hit.normal.lengthSq() === 0 ? new Vector3(0, 1, 0) : hit.normal
    const distance = CAMERA_DISTANCE

    targets[id] = target
    positions[id] = target.clone().add(normal.clone().multiplyScalar(distance))
  }

  let data = fs.readFileSync(DATA_PATH, "utf8")
  let updatedTargets = 0
  let updatedPositions = 0

  for (let id = 1; id <= MAX_ID; id++) {
    const target = targets[id]
    const position = positions[id]
    if (!target || !position) continue
    const re = new RegExp(
      `(id:\\s*${id}[\\s\\S]*?cameraPosition:\\s*)new THREE\\.Vector3\\([^)]+\\)([\\s\\S]*?cameraTarget:\\s*)new THREE\\.Vector3\\([^)]+\\)`,
    )
    const next = data.replace(
      re,
      `$1${formatVec(position)}$2${formatVec(target)}`,
    )
    if (next !== data) {
      updatedTargets++
      updatedPositions++
      data = next
    }
  }

  fs.writeFileSync(DATA_PATH, data)
  console.log(
    `Updated ${updatedTargets} cameraTarget entries and ${updatedPositions} cameraPosition entries in ${DATA_PATH}`,
  )
}

main()
