import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import YAML from "yaml"
import { buildLiverDataset, type TranslateFn } from "../src/data/LiverDataset"

type JsonRecord = Record<string, unknown>

const getNestedValue = (data: JsonRecord, key: string): unknown => {
  return key.split(".").reduce<unknown>((value, part) => {
    if (value && typeof value === "object") {
      return (value as JsonRecord)[part]
    }
    return undefined
  }, data)
}

const loadLiverData = async (): Promise<JsonRecord> => {
  const dataPath = path.join(
    process.cwd(),
    "src",
    "locales",
    "en_US",
    "liverData.json",
  )
  const raw = await readFile(dataPath, "utf8")
  return JSON.parse(raw) as JsonRecord
}

const liverData = await loadLiverData()

const tLiverData: TranslateFn = (key, options) => {
  const value = getNestedValue(liverData, key)
  if (options?.returnObjects && value && typeof value === "object") {
    return value as Record<string, string>
  }
  if (typeof value === "string") {
    return value
  }
  if (options?.defaultValue !== undefined) {
    return options.defaultValue
  }
  return key
}

const dataset = buildLiverDataset(tLiverData)
const yamlContent = YAML.stringify(dataset)

const outputDir = path.join(process.cwd(), "dist", "data")
await mkdir(outputDir, { recursive: true })
await writeFile(path.join(outputDir, "inscriptions.yaml"), yamlContent, "utf8")
