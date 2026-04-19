import { AppConfig } from "../config/AppConfig"
import {
  getInscriptionGroup,
  liverGods,
  liverGroups,
  liverInscriptions,
} from "../scene/LiverData"

export type TranslateFn = (
  key: string,
  options?: { defaultValue?: string },
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
}

export interface DatasetDeity {
  id: string
  name: string
  romanEquivalent: string
  greekEquivalent?: string
  description?: string
}

export interface LiverDataset {
  metadata: {
    title: string
    totalInscriptions: number
    totalZones: number
    totalDeities: number
    creator: string
    source: string
  }
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
    return entry
  })

  const deities = Object.entries(liverGods).map(([id, deity]) => {
    const d: DatasetDeity = {
      id,
      name: deity.name,
      romanEquivalent:
        t(`deities.${id}.romanEquivalent`, {
          defaultValue: "",
        }) || "N/A",
    }
    const greek = t(`deities.${id}.greekEquivalent`, {
      defaultValue: "",
    })
    if (greek) {
      d.greekEquivalent = greek
    }
    const description = t(`deities.${id}.description`)
    if (description) {
      d.description = description
    }
    return d
  })

  return {
    metadata: {
      title: "Piacenza Liver Dataset - Complete Archaeological Data",
      totalInscriptions: liverInscriptions.length,
      totalZones: Object.keys(liverGroups).length,
      totalDeities: Object.keys(liverGods).length,
      creator: AppConfig.creator.name,
      source: "https://piacenzaliver.com/",
    },
    zones,
    inscriptions,
    deities,
  }
}
