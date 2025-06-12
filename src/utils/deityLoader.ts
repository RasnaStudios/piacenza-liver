import { load as yamlLoad } from 'js-yaml'

// Cache for loaded deity content
const deityCache = new Map()

// Load and parse deity markdown content
export async function loadDeityContent(docFile) {
  // Check cache first
  if (deityCache.has(docFile)) {
    return deityCache.get(docFile)
  }

  if (!docFile) {
    console.warn(`No docFile provided`)
    return null
  }

  // Support both .yaml and .md files
  const isYaml = docFile.endsWith('.yaml') || docFile.endsWith('.yml')
  const filePath = `/docs/deities/${docFile}`

  try {
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status}`)
    }
    
    const content = await response.text()
    const parsed = isYaml ? parseDeityYaml(content) : parseDeityMarkdown(content)
    
    // Cache the result
    deityCache.set(docFile, parsed)
    return parsed
  } catch (error) {
    console.error(`Error loading deity content for ${docFile}:`, error)
    return null
  }
}

// Parse YAML content into structured data
function parseDeityYaml(content) {
  try {
    const data = yamlLoad(content)
    return {
      name: data.name || '',
      romanEquivalent: data.roman_equivalent || '',
      shortDescription: data.short_description || '',
      description: data.description || '',
      divinationMeaning: data.divination_meaning || [],
      locationOnLiver: data.location_on_liver || '',
      historicalContext: data.historical_context || '',
      hepatoscopyFavorable: data.hepatoscopy?.favorable || [],
      hepatoscopyUnfavorable: data.hepatoscopy?.unfavorable || [],
      ritualAssociations: data.ritual_associations || [],
      symbols: data.symbols || [],
      archaeologicalNotes: data.archaeological_notes || ''
    }
  } catch (error) {
    console.error('Error parsing YAML:', error)
    return null
  }
}

// Parse markdown content into structured data
function parseDeityMarkdown(content) {
  const lines = content.split('\n')
  const deity = {
    name: '',
    romanEquivalent: '',
    description: '',
    divinationMeaning: [],
    locationOnLiver: '',
    historicalContext: '',
    hepatoscopyFavorable: [],
    hepatoscopyUnfavorable: [],
    ritualAssociations: [],
    symbols: [],
    archaeologicalNotes: ''
  }

  let currentSection = ''
  let currentList = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('# ')) {
      deity.name = line.substring(2).split('(')[0].trim()
      if (line.includes('(')) {
        deity.romanEquivalent = line.match(/\((.*?)\)/)?.[1] || ''
      }
    } else if (line.startsWith('## ')) {
      currentSection = line.substring(3).toLowerCase()
      currentList = null
    } else if (currentSection === 'description' && line && !line.startsWith('-')) {
      deity.description += (deity.description ? ' ' : '') + line
    } else if (currentSection === 'divination meaning') {
      if (line.startsWith('- ')) {
        deity.divinationMeaning.push(line.substring(2))
      } else if (line && !line.startsWith('-')) {
        deity.divinationMeaning.push(line)
      }
    } else if (currentSection === 'location on liver' && line && !line.startsWith('**')) {
      deity.locationOnLiver += (deity.locationOnLiver ? ' ' : '') + line
    } else if (currentSection === 'historical context' && line && !line.startsWith('-')) {
      deity.historicalContext += (deity.historicalContext ? ' ' : '') + line
    } else if (currentSection === 'hepatoscopy significance') {
      if (line.includes('favorable signs:') || line.includes('When this section of the liver showed favorable')) {
        currentList = 'favorable'
      } else if (line.includes('unfavorable:') || line.includes('When unfavorable:')) {
        currentList = 'unfavorable'
      } else if (line.startsWith('- ') && currentList) {
        if (currentList === 'favorable') {
          deity.hepatoscopyFavorable.push(line.substring(2))
        } else if (currentList === 'unfavorable') {
          deity.hepatoscopyUnfavorable.push(line.substring(2))
        }
      }
    } else if (currentSection === 'ritual associations' && line.startsWith('- ')) {
      deity.ritualAssociations.push(line.substring(2))
    } else if (currentSection === 'symbols and attributes' && line.startsWith('- ')) {
      deity.symbols.push(line.substring(2))
    } else if (currentSection === 'archaeological notes' && line && !line.startsWith('-')) {
      deity.archaeologicalNotes += (deity.archaeologicalNotes ? ' ' : '') + line
    }
  }

  return deity
}

// Get basic deity info (fallback for when MD loading fails)
export function getBasicDeityInfo(name) {
  const basicInfo = {
    'TIN': { description: 'Tinia - Sky god, equivalent to Jupiter', romanEquivalent: 'Jupiter' },
    'UNI': { description: 'Uni - Queen goddess, equivalent to Juno', romanEquivalent: 'Juno' },
    'MENRVA': { description: 'Menrva - Wisdom goddess, equivalent to Minerva', romanEquivalent: 'Minerva' },
    'FUFLUNS': { description: 'Fufluns - Wine god, equivalent to Bacchus', romanEquivalent: 'Bacchus' },
    'SETHLANS': { description: 'Sethlans - Fire god, equivalent to Vulcan', romanEquivalent: 'Vulcan' },
    'TURAN': { description: 'Turan - Love goddess, equivalent to Venus', romanEquivalent: 'Venus' },
    'LARAN': { description: 'Laran - War god, equivalent to Mars', romanEquivalent: 'Mars' },
    'NETHUNS': { description: 'Nethuns - Sea god, equivalent to Neptune', romanEquivalent: 'Neptune' }
  }
  
  return basicInfo[name] || { description: `${name} - Etruscan deity`, romanEquivalent: 'Unknown' }
} 