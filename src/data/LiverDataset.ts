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

export type TranslateFn = (
  key: string,
  options?: { defaultValue?: string; returnObjects?: boolean },
) => string

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
  note?: string
}

/** One row in the top-level `sources` map keyed by stable source id (see `sourceIdFromShortRef`). */
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
  /** Source ids; join with `sources`. */
  sources?: string[]
}

export interface LiverDataset {
  metadata: {
    title: string
    totalInscriptions: number
    totalZones: number
    totalDeities: number
    creator: string
    source: string
    corpusReferences: { ET: string; TLE: string }
  }
  sources: Record<string, DatasetSourceRecord>
  zones: DatasetZone[]
  inscriptions: DatasetInscription[]
  deities: DatasetDeity[]
}

export function buildLiverDataset(t: TranslateFn): LiverDataset {
  const zones = Object.entries(liverGroups).map(([zoneId, group]) => ({
    id: zoneId,
    name: t(`groups.${group.id}.name`),
    description: t(`groups.${group.id}.description`),
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
    const readingNote = t(`inscriptions.${ins.id}.readingNote`, {
      defaultValue: "",
    })
    if (readingNote) entry.readingNote = readingNote
    return entry
  })

  const deities = Object.entries(liverGods).map(([id, deity]) => {
    const d: DatasetDeity = {
      id,
      name: deity.name,
      readingStatus: deity.readingStatus,
      identificationStatus: deity.identificationStatus,
    }

    const description = t(`deities.${id}.description`, { defaultValue: "" })
    if (description) d.description = description

    const parallels = resolveDeityParallels(t as ParallelLocaleTranslator, id)
    if (parallels.length > 0) {
      d.parallels = parallels
    }

    const refIds = getDeitySources(id).map(sourceIdFromShortRef)
    if (refIds.length > 0) {
      d.sources = refIds
    }

    return d
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
      source: "https://piacenzaliver.com/",
      corpusReferences: { ET: "Pa 4.2", TLE: "719" },
    },
    sources,
    zones,
    inscriptions,
    deities,
  }
}
