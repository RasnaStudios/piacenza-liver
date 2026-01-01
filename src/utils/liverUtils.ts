import {
  type LiverGod,
  liverGods,
  liverGroups,
  liverInscriptions,
} from "../scene/LiverData"

// Type definition for god entries in inscriptions
type GodEntry = string | { id: string; form: string }

// Helper function to extract god ID from god entry
function getGodId(godEntry: GodEntry): string {
  return typeof godEntry === "string" ? godEntry : godEntry.id
}

// Helper function to extract form from god entry
function getGodForm(godEntry: GodEntry): string | null {
  return typeof godEntry === "string" ? null : godEntry.form
}

// Get group for an inscription by checking which group's positions array contains the inscription ID
export function getInscriptionGroup(inscriptionId: number) {
  for (const group of Object.values(liverGroups)) {
    if (group.positions.includes(inscriptionId)) {
      return group
    }
  }
  return null
}

// Get all inscriptions where a specific god appears
export function getGodInscriptions(godId: string) {
  return liverInscriptions.filter((inscription) =>
    inscription.gods.some((god) => getGodId(god) === godId),
  )
}

// Get all unique forms/variations of a god's name from inscriptions
export interface TranscriptionPart {
  text: string
  isReconstructed: boolean
}

export function parseTranscription(transcription: string): TranscriptionPart[] {
  const parts: TranscriptionPart[] = []
  let currentText = ""
  let inBrackets = false

  for (let i = 0; i < transcription.length; i++) {
    const char = transcription[i]

    if (char === "[") {
      if (currentText) {
        parts.push({ text: currentText, isReconstructed: false })
        currentText = ""
      }
      inBrackets = true
    } else if (char === "]") {
      if (currentText) {
        parts.push({ text: currentText, isReconstructed: true })
        currentText = ""
      }
      inBrackets = false
    } else {
      currentText += char
    }
  }

  if (currentText) {
    parts.push({ text: currentText, isReconstructed: inBrackets })
  }

  return parts
}

export function getGodNameVariations(godId: string): string[] {
  const inscriptions = getGodInscriptions(godId)
  const variations = new Set<string>()

  inscriptions.forEach((inscription) => {
    inscription.gods.forEach((god) => {
      if (getGodId(god) === godId) {
        const form = getGodForm(god)
        if (form) {
          variations.add(form)
        } else {
          // Fallback to extracting from Etruscan text for old format
          const etruscanParts = inscription.etruscanText.split(" / ")
          const godIndex = inscription.gods.findIndex(
            (g) => getGodId(g) === godId,
          )
          if (godIndex !== -1 && etruscanParts[godIndex]) {
            variations.add(etruscanParts[godIndex].trim())
          }
        }
      }
    })
  })

  return Array.from(variations)
}

// Get the specific name variation for a god in a particular inscription
export function getGodVariationInInscription(
  godId: string,
  inscriptionId: number,
): string | null {
  const inscription = liverInscriptions.find(
    (insc) => insc.id === inscriptionId,
  )

  if (!inscription) return null

  // Find the god entry in the inscription
  const godEntry = inscription.gods.find((god) => getGodId(god) === godId)
  if (!godEntry) return null

  // If it has a form field, use that
  const form = getGodForm(godEntry)
  if (form) {
    return form
  }

  // Fallback to extracting from Etruscan text for old format
  const etruscanParts = inscription.etruscanText.split(" / ")
  const godIndex = inscription.gods.findIndex((god) => getGodId(god) === godId)

  if (godIndex !== -1 && etruscanParts[godIndex]) {
    return etruscanParts[godIndex].trim()
  }

  return null
}

// Get inscription data with group information for a god
export function getGodInscriptionData(godId: string) {
  const inscriptions = getGodInscriptions(godId)
  const nameVariations = getGodNameVariations(godId)

  // Create combined inscription entries with format "X with [OtherGod] as [Variation]"
  const combinedEntries = inscriptions.map((inscription) => {
    const otherGods = inscription.gods.filter((god) => getGodId(god) !== godId)
    const godVariation =
      getGodVariationInInscription(godId, inscription.id) ||
      nameVariations.find((variation) =>
        inscription.etruscanText
          .toLowerCase()
          .includes(variation.toLowerCase()),
      ) ||
      (liverGods as Record<string, LiverGod>)[godId]?.name ||
      godId

    if (otherGods.length > 0) {
      const otherGodNames = otherGods
        .map(
          (god) =>
            (liverGods as Record<string, LiverGod>)[getGodId(god)]?.name ||
            getGodId(god),
        )
        .join(", ")
      return `${inscription.id} with ${otherGodNames} as ${godVariation.toUpperCase()}`
    } else {
      return `${inscription.id} as ${godVariation.toUpperCase()}`
    }
  })

  // Create godInscriptions with group color and other god data
  const godInscriptions = inscriptions.map((inscription) => {
    const group = getInscriptionGroup(inscription.id)
    const otherGods = inscription.gods.filter((god) => getGodId(god) !== godId)

    return {
      id: inscription.id,
      groupColor: group?.color || "#8B6541",
      otherGods: otherGods.map((god) => getGodId(god)),
    }
  })

  return {
    inscriptions,
    nameVariations,
    combinedEntries,
    godInscriptions,
  }
}

// Get Greek script equivalent for Etruscan script
export function getGreekEquivalent(etruscanScript: string): string {
  // Find god by etruscan script and return their transcription
  const god = Object.values(liverGods as Record<string, LiverGod>).find(
    (g: LiverGod) => g.etruscanScript === etruscanScript,
  )
  return god?.transcription || ""
}

// Get display names for gods in an inscription (used by HoverTooltip, PanelHeader, etc.)
export function getGodsDisplayNames(gods: GodEntry[]): string {
  return gods
    .map((god) => {
      const godId = getGodId(god)
      const godData = (liverGods as Record<string, LiverGod>)[godId]
      return godData?.name || godId
    })
    .join(" + ")
}

// Get all gods that appear with a specific god
export function getAssociatedGods(godId: string) {
  const inscriptions = getGodInscriptions(godId)
  const associatedGods = new Set<string>()

  inscriptions.forEach((inscription) => {
    inscription.gods.forEach((god) => {
      const id = getGodId(god)
      if (id !== godId) {
        associatedGods.add(id)
      }
    })
  })

  return Array.from(associatedGods)
    .map((id) => (liverGods as Record<string, LiverGod>)[id])
    .filter(Boolean)
}
