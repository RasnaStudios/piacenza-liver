import { liverInscriptions, liverGroups, liverGods } from '../scene/LiverData'

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
  return liverInscriptions.filter(inscription => 
    inscription.gods.includes(godId)
  )
}

// Get all unique forms/variations of a god's name from inscriptions
export interface TranscriptionPart {
  text: string
  isReconstructed: boolean
}

export function parseTranscription(transcription: string): TranscriptionPart[] {
  const parts: TranscriptionPart[] = []
  let currentText = ''
  let inBrackets = false
  
  for (let i = 0; i < transcription.length; i++) {
    const char = transcription[i]
    
    if (char === '[') {
      if (currentText) {
        parts.push({ text: currentText, isReconstructed: false })
        currentText = ''
      }
      inBrackets = true
    } else if (char === ']') {
      if (currentText) {
        parts.push({ text: currentText, isReconstructed: true })
        currentText = ''
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
  
  inscriptions.forEach(inscription => {
    // Only extract from Etruscan text, not Latin text
    const etruscanParts = inscription.etruscanText.split(' / ')
    
    // Try to match god positions with text parts
    inscription.gods.forEach((currentGodId, index) => {
      if (currentGodId === godId) {
        if (etruscanParts[index]) {
          variations.add(etruscanParts[index].trim())
        }
      }
    })
  })
  
  return Array.from(variations)
}

// Get the specific name variation for a god in a particular inscription
export function getGodVariationInInscription(godId: string, inscriptionId: number): string | null {
  const inscriptions = getGodInscriptions(godId)
  const inscription = inscriptions.find(insc => insc.id === inscriptionId)
  
  if (!inscription) return null
  
  const etruscanParts = inscription.etruscanText.split(' / ')
  const godIndex = inscription.gods.findIndex(id => id === godId)
  
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
  const combinedEntries = inscriptions.map(inscription => {
    const otherGods = inscription.gods.filter(id => id !== godId)
    const godVariation = nameVariations.find(variation => 
      inscription.etruscanText.toLowerCase().includes(variation.toLowerCase())
    ) || (liverGods as any)[godId]?.name || godId
    
    if (otherGods.length > 0) {
      const otherGodNames = otherGods.map(id => (liverGods as any)[id]?.name || id).join(', ')
      return `${inscription.id} with ${otherGodNames} as ${godVariation.toUpperCase()}`
    } else {
      return `${inscription.id} as ${godVariation.toUpperCase()}`
    }
  })

  // Create godInscriptions with group color and other god data
  const godInscriptions = inscriptions.map(inscription => {
    const group = getInscriptionGroup(inscription.id)
    const otherGods = inscription.gods.filter(id => id !== godId)
    
    return {
      id: inscription.id,
      groupColor: group?.color || '#8B6541',
      otherGods
    }
  })
  
  return {
    inscriptions,
    nameVariations,
    combinedEntries,
    godInscriptions
  }
}

// Get Greek script equivalent for Etruscan script
export function getGreekEquivalent(etruscanScript: string): string {
  // Find god by etruscan script and return their transcription
  const god = Object.values(liverGods as any).find((g: any) => g.etruscanScript === etruscanScript)
  return (god as any)?.transcription || ''
}

// Get all gods that appear with a specific god
export function getAssociatedGods(godId: string) {
  const inscriptions = getGodInscriptions(godId)
  const associatedGods = new Set<string>()
  
  inscriptions.forEach(inscription => {
    inscription.gods.forEach(id => {
      if (id !== godId) {
        associatedGods.add(id)
      }
    })
  })
  
  return Array.from(associatedGods).map(id => (liverGods as any)[id]).filter(Boolean)
}
