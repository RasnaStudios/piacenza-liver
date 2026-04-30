import { AppConfig } from "../config/AppConfig"
import {
  getInscriptionGroup,
  type IdentificationStatus,
  liverGods,
  liverGroups,
  liverInscriptions,
  type ParallelLocaleTranslator,
  type ParallelStatus,
  type ParallelTradition,
  type ReadingStatus,
  resolveDeityParallels,
} from "../scene/LiverData"
import {
  getDeitySources,
  scholarshipEntries,
  sourceIdFromShortRef,
} from "./Scholarship"

export type TranslationValue = string | Record<string, string>

export type TranslateFn = (
  key: string,
  options?: { defaultValue?: TranslationValue; returnObjects?: boolean },
) => TranslationValue

export interface DatasetZone {
  id: string
  name: string
  description: string
}

export interface DatasetInscription {
  id: number
  zoneId: string
  etruscanText: string
  transcription: string
  gods: string[]
  description?: string
  readingNote?: string
}

export interface DatasetParallel {
  tradition: ParallelTradition
  name: string
  status: ParallelStatus
}

export interface DatasetSourceRecord {
  citeAs: string
  authors: string
  year: number | string
  title: string
  venue?: string
  pages?: string
  url?: string
}

export interface DatasetDeity {
  id: string
  name: string
  readingStatus: ReadingStatus
  identificationStatus: IdentificationStatus
  description?: string
  parallels?: DatasetParallel[]
  sources?: string[]
}

export interface LiverDataset {
  metadata: {
    title: string
    totalInscriptions: number
    totalZones: number
    totalDeities: number
    creator: string
    website: string
    corpusReferences: { ET: string; TLE: string }
  }
  zones: DatasetZone[]
  inscriptions: DatasetInscription[]
  deities: DatasetDeity[]
  sources: Record<string, DatasetSourceRecord>
}

function tString(t: TranslateFn, key: string, defaultValue = ""): string {
  const value = t(key, { defaultValue })
  return typeof value === "string" ? value : defaultValue
}

export function buildLiverDataset(t: TranslateFn): LiverDataset {
  const zones = Object.entries(liverGroups).map(([zoneId, group]) => ({
    id: zoneId,
    name: tString(t, `groups.${group.id}.name`),
    description: tString(t, `groups.${group.id}.description`),
  }))

  const inscriptions = liverInscriptions.map((ins) => {
    const group = getInscriptionGroup(ins.id)
    const entry: DatasetInscription = {
      id: ins.id,
      zoneId: group?.id || "",
      etruscanText: ins.etruscanText,
      transcription: ins.transcription,
      gods: ins.gods.map((g) => (typeof g === "string" ? g : g.id)),
    }
    if (ins.description) entry.description = ins.description
    const readingNote = tString(t, `inscriptions.${ins.id}.readingNote`)
    if (readingNote) entry.readingNote = readingNote
    return entry
  })

  const deities = Object.entries(liverGods).map(([id, deity]) => {
    const description = tString(t, `deities.${id}.description`)
    const parallels = resolveDeityParallels(t as ParallelLocaleTranslator, id)
    const refIds = getDeitySources(id).map(sourceIdFromShortRef)

    return {
      id,
      name: deity.name,
      readingStatus: deity.readingStatus,
      identificationStatus: deity.identificationStatus,
      ...(description ? { description } : {}),
      ...(parallels.length > 0 ? { parallels } : {}),
      ...(refIds.length > 0 ? { sources: refIds } : {}),
    }
  })

  const sources: Record<string, DatasetSourceRecord> = {}
  for (const entry of scholarshipEntries) {
    const id = sourceIdFromShortRef(entry.shortRef)
    sources[id] = {
      citeAs: entry.shortRef,
      authors: entry.authors,
      year: entry.year,
      title: entry.title,
      ...(entry.venue !== undefined ? { venue: entry.venue } : {}),
      ...(entry.pages !== undefined ? { pages: entry.pages } : {}),
      ...(entry.url !== undefined ? { url: entry.url } : {}),
    }
  }

  return {
    metadata: {
      title: "Piacenza Liver Inscriptions Dataset",
      totalInscriptions: liverInscriptions.length,
      totalZones: Object.keys(liverGroups).length,
      totalDeities: Object.keys(liverGods).length,
      creator: AppConfig.creator.name,
      website: "https://piacenzaliver.com/",
      corpusReferences: { ET: "Pa 4.2", TLE: "719" },
    },
    zones,
    inscriptions,
    deities,
    sources,
  }
}
