
import * as THREE from 'three'

// ================================================================================================
// PIACENZA LIVER DATA
// ================================================================================================
// 
// Based on scholarly transcription showing that inscriptions contain multiple deities
// Structure: Groups → Individual Gods → Inscriptions (1-2 gods per inscription)
//
// ================================================================================================

// GROUPS: Cosmological zones with descriptions and colors (matching color key)
export const liverGroups = {
  sky: {
    id: 'sky',
    name: 'Sky',
    positions: [1, 2, 3, 4],
    color: '#87CEEB', // Sky-blue
    description: 'The celestial realm dominated by Tinia (Jupiter) and his divine court. This zone governs heavenly omens, divine authority, and cosmic order.',
    cosmologicalMeaning: 'Supreme divine authority, celestial omens, and the governance of fate from the heavens.'
  },
  water: {
    id: 'water',
    name: 'Water',
    positions: [5, 6, 7, 8],
    color: '#008B8B', // Teal
    description: 'The aquatic realm presided over by Nethuns (Neptune) and water deities. Controls omens related to water, purification, and life force.',
    cosmologicalMeaning: 'Life-giving waters, purification rituals, and the flow of divine energy through liquid elements.'
  },
  earth: {
    id: 'earth', 
    name: 'Earth',
    positions: [9, 10, 11, 12],
    color: '#CD853F', // Brown-ochre
    description: 'The terrestrial realm of vegetation, boundaries, and earth spirits. Governs agricultural cycles, forest boundaries, and land-based divine forces.',
    cosmologicalMeaning: 'Terrestrial fertility, natural boundaries, vegetation cycles, and earth-bound spiritual forces.'
  },
  underworld: {
    id: 'underworld',
    name: 'Underworld',
    positions: [13, 14, 15, 16],
    color: '#808000', // Olive-green
    description: 'The chthonic realm of earth goddesses, protective spirits, and underworld deities. Controls death omens, protection, and liminal passages.',
    cosmologicalMeaning: 'Death transitions, protective spirits, underworld passages, and chthonic divine authority.'
  },
  pars_familiaris: {
    id: 'pars_familiaris',
    name: 'Pars Familiaris',
    positions: [17, 18, 19, 20, 21, 22, 23, 24],
    color: '#FF0000', // Bright red
    description: 'The familiar/favorable realm containing household spirits and benevolent deities. Represents favorable omens and domestic divine protection.',
    cosmologicalMeaning: 'Household protection, favorable omens, domestic divine forces, and benevolent spiritual guidance.'
  },
  gall_bladder: {
    id: 'gall_bladder',
    name: 'Gall Bladder',
    positions: [25, 26, 27, 28],
    color: '#FF8C00', // Deep orange
    description: 'The bile reservoir representing concentrated divine energy, generative forces, and seasonal transitions. Contains powerful fertility and war deities.',
    cosmologicalMeaning: 'Concentrated divine energy, generative power, seasonal transitions, and intense spiritual forces.'
  },
  central_section: {
    id: 'central_section', 
    name: 'Central Section',
    positions: [29, 30, 37, 38, 39, 40],
    color: '#FFA500', // Light orange
    description: 'The central power zone containing heroic protectors and generating forces. Represents the heart of divine power and cosmic balance.',
    cosmologicalMeaning: 'Central divine authority, heroic protection, cosmic balance, and the generating power of all gods.'
  },
  pars_hostilis: {
    id: 'pars_hostilis',
    name: 'Pars Hostilis',
    positions: [31, 32, 33, 34, 35, 36],
    color: '#9370DB', // Purple-lavender
    description: 'The hostile/unfavorable realm containing border guardians and infernal deities. Represents challenging omens and protective boundaries.',
    cosmologicalMeaning: 'Hostile forces, protective boundaries, infernal powers, and challenging divine tests.'
  },
  retro: {
    id: 'retro',
    name: 'Back / Bottom',
    positions: [41, 42], 
    color: '#808080', // Gray
    description: 'The foundational cosmic anchors representing the Sun and Moon. These mark the fundamental celestial cycles underlying all divination.',
    cosmologicalMeaning: 'Cosmic foundation, solar-lunar cycles, day-night duality, and the fundamental rhythm of time.'
  }
}

// INDIVIDUAL GODS: Complete deity information
export const liverGods = {
  tinia: {
    id: 'tinia',
    name: 'Tinia',
    etruscanScript: '𐌕𐌉𐌍',
    transcription: 'tinia',
    romanEquivalent: 'Jupiter',
    greekEquivalent: 'Zeus', 
    domain: 'Sky, Thunder, Divine Authority',
    description: 'Supreme sky god and father of the gods in the Etruscan pantheon.',
    
  },
  cilens: {
    id: 'cilens',
    name: 'Cilens',
    etruscanScript: '𐌂𐌉𐌋𐌄𐌍',
    transcription: 'cilens',
    romanEquivalent: 'Nocturnus',
    domain: 'Night, Psychopomp',
    description: 'God of the night and guide of souls between worlds.',
    
  },
  thufltha: {
    id: 'thufltha', 
    name: 'Thufltha',
    etruscanScript: '𐌚𐌖𐌅𐌋𐌚𐌀',
    transcription: '',
    romanEquivalent: 'Fortuna',
    domain: 'Fate, Healing, Oracles',
    description: 'Goddess of fate, healing, and oracular wisdom.',
    
  },
  nethuns: {
    id: 'nethuns',
    name: 'Nethuns', 
    etruscanScript: '𐌍𐌄𐌈',
    transcription: 'neθ',
    romanEquivalent: 'Neptune',
    greekEquivalent: 'Poseidon',
    domain: 'Water, Sea, Atmospheric Humidity',
    description: 'God of fresh water, sea, and atmospheric moisture.',
    
  },
  uni: {
    id: 'uni',
    name: 'Uni',
    etruscanScript: '𐌖𐌍𐌉',
    transcription: 'Uni',
    romanEquivalent: 'Juno',
    greekEquivalent: 'Hera',
    domain: 'Marriage, Fertility, Cities',
    description: 'Wife of Tinia, guardian of marriage, fertility, birth, and cities.',
    
  },
  mae: {
    id: 'mae',
    name: 'Mae',
    etruscanScript: '𐌌𐌀𐌄',
    romanEquivalent: 'Maius',
    transcription: '',
    domain: 'Maternal, Generative',
    description: 'Possibly maternal or generative attribute deity.',
    
  },
  tecvm: {
    id: 'tecvm',
    name: 'Tecum', 
    etruscanScript: '𐌕𐌄𐌂𐌅𐌌',
    transcription: 'tecvm',
    domain: 'Paternal Water Spirit',
    description: 'God of the lucomenes, or ruling class.',
    
  },
  lusal: {
    id: 'lusal',
    name: 'Lusal',
    etruscanScript: '𐌋𐌖𐌔𐌋',
    transcription: 'lusl',
    domain: 'Water (unidentified)',
    description: 'Unidentified water deity, possibly related to light or purification.',
    
  },
  catha: {
    id: 'catha',
    name: 'Catha',
    etruscanScript: '𐌂𐌀𐌚',
    transcription: '',
    romanEquivalent: 'Kore',
    domain: 'Sun, Solar-Nymph',
    description: 'Goddess of the sun in her solar-nymph form.',
    
  },
  fufluns: {
    id: 'fufluns',
    name: 'Fufluns',
    etruscanScript: '𐌅𐌖𐌅𐌋𐌖𐌍',
    transcription: 'fuflun',
    romanEquivalent: 'Bacchus',
    greekEquivalent: 'Dionysus',
    domain: 'Wine, Vegetation, Inebriation',
    description: 'God of wine, inebriation, and vegetation cycles.',
    
  },
  selvans: {
    id: 'selvans',
    name: 'Selvans',
    etruscanScript: '𐌔𐌄𐌋𐌅𐌀',
    transcription: '',
    romanEquivalent: 'Silvanus',
    domain: 'Forests, Borders',
    description: 'God of borders and forest boundaries.',
    
  },
  lethns: {
    id: 'lethns',
    name: 'Lethns',
    etruscanScript: '𐌋𐌄𐌚𐌍',
    transcription: '',
    romanEquivalent: 'Lethams',
    domain: 'Local Spirit, Genius',
    description: 'Genius or local spirit, possibly related to memory/forgetfulness.',
    
  },
  tluscva: {
    id: 'tluscva',
    name: 'Tluscva',
    etruscanScript: '𐌕𐌋𐌖𐌔𐌂',
    transcription: '',
    domain: 'Water Nymphs, Sacred Water',
    description: 'Nymphs tied to water cult and sacred offerings.',
    
  },
  cels: {
    id: 'cels',
    name: 'Cels',
    etruscanScript: '𐌂𐌄𐌋𐌔',
    transcription: '',
    romanEquivalent: 'Gea',
    domain: 'Earth Goddess',
    description: 'Goddess of the earth and chthonic forces.',
    
  },
  culsans: {
    id: 'culsans',
    name: 'Culsans',
    etruscanScript: '𐌂𐌖𐌋',
    transcription: '',
    romanEquivalent: 'Janus',
    domain: 'Doors, Protection',
    description: 'Benevolent protector of doors and thresholds.',
    
  },
  alpans: {
    id: 'alpans',
    name: 'Alpans',
    etruscanScript: '𐌀𐌋𐌐',
    transcription: '',
    domain: 'Protective Spirit',
    description: 'Protective spirit associated with Culsans.',
    
  },
  vetlsi: {
    id: 'vetlsi',
    name: 'Vetlsi',
    etruscanScript: '𐌅𐌄𐌕𐌋𐌔𐌉',
    transcription: '',
    romanEquivalent: 'Veiovis',
    domain: 'Underworld Apollo',
    description: 'Underworld "Apollo", chthonic version of the light god.',
    
  },
  pul: {
    id: 'pul',
    name: 'Pul',
    etruscanScript: '𐌐𐌖𐌋',
    transcription: '',
    domain: 'Uncertain',
    description: 'Uncertain deity, possibly related to purification.',
    
  },
  lasl: {
    id: 'lasl',
    name: 'Lasl',
    etruscanScript: '𐌋𐌀𐌔𐌋',
    transcription: '',
    romanEquivalent: 'Lasi',
    domain: 'Household Spirit',
    description: 'Household female spirit, domestic protection. Companion of Turan.',
    
  },
  maris: {
    id: 'maris',
    name: 'Maris',
    etruscanScript: '𐌌𐌀𐌓',
    transcription: 'mar',
    domain: 'Generative Force, Youth',
    description: 'Generative force and generating power of all the gods.',
    
  },
  laran: {
    id: 'laran',
    name: 'Laran', 
    etruscanScript: '𐌋𐌀𐌓',
    transcription: 'lar',
    romanEquivalent: 'Ares',
    domain: 'War, Fire',
    description: 'God of war and fire, representing martial force.',
    
  },
  letams: {
    id: 'letams',
    name: 'Letams',
    etruscanScript: '𐌋𐌄𐌕𐌀',
    transcription: 'leta',
    domain: 'Local Spirit',
    description: 'Local spirit or genius, memory-related deity.',
    
  },
  tvnth: {
    id: 'tvnth',
    name: 'Tvnth',
    etruscanScript: '𐌕𐌖𐌍𐌚',
    transcription: '',
    domain: 'Uncertain',
    description: 'Uncertain deity in the gall bladder zone.',
    
  },
  hercle: {
    id: 'hercle',
    name: 'Hercle',
    etruscanScript: '𐌇𐌄𐌓𐌂',
    transcription: '',
    romanEquivalent: 'Hercules', 
    domain: 'Heroic Protection',
    description: 'Hero-protector, divine strength and protection.',
    
  },
  metlvmth: {
    id: 'metlvmth',
    name: 'Metlvmth',
    etruscanScript: '𐌌𐌄𐌕𐌋𐌖𐌌𐌚',
    transcription: '',
    domain: 'Epithet/Attribute',
    description: 'Epithet or attribute associated with Lethams.',
    
  },
  marutl: {
    id: 'marutl',
    name: 'Marutl',
    etruscanScript: '𐌌𐌀𐌓𐌖𐌕𐌋',
    transcription: '',
    domain: 'Epithet/Attribute',
    description: 'Double epithet associated with Tluscva.',
    
  },
  lethams: {
    id: 'lethams',
    name: 'Lethams',
    etruscanScript: '𐌋𐌄𐌚𐌀𐌌',
    transcription: '',
    domain: 'Local Spirit',
    description: 'Local tutelary spirit, genius of place.',
    
  },
  velch: {
    id: 'velch',
    name: 'Velch',
    etruscanScript: '𐌅𐌄𐌋𐌒',
    transcription: '',
    romanEquivalent: 'Vulcan',
    domain: 'Fire, Underworld',
    description: 'Infernal form of Sethlans (Vulcan), fire deity.',
    
  },
  satres: {
    id: 'satres',
    name: 'Satres',
    etruscanScript: '𐌔𐌀𐌕𐌓𐌄𐌔',
    transcription: '',
    romanEquivalent: 'Saturn',
    domain: 'Underworld, Time',
    description: 'God of the underworld and temporal cycles.',
    
  },
  usil: {
    id: 'usil',
    name: 'Usil',
    etruscanScript: '𐌖𐌔𐌉𐌋',
    transcription: 'usil',
    domain: 'Sun',
    description: 'The sun god, representing solar power and illumination.',
    
  },
  tiur: {
    id: 'tiur',
    name: 'Tiur',
    etruscanScript: '𐌕𐌉𐌖𐌓',
    transcription: 'tiur',
    domain: 'Moon',
    description: 'The moon god, representing lunar cycles and night illumination.',
    
  }
}

// INSCRIPTIONS: All 42 liver sections with their gods and descriptions
export const liverInscriptions = [
  // SKY GROUP (1-4) - Outer rim top
  {
    id: 1,
    groupId: 'sky',
    etruscanText: '𐌕𐌉𐌍 / 𐌂𐌉𐌋 / 𐌄𐌍', 
    transcription: 'tin/cil/en',
    gods: ['tinia', 'cilens'],
    cameraPosition: new THREE.Vector3(-2.491, 0.722, -1.246),
    cameraTarget: new THREE.Vector3(-2.357, 0.865, 1.013)
  },
  {
    id: 2,
    groupId: 'sky',
    etruscanText: '𐌕𐌉𐌍 / 𐌈𐌖𐌚',
    transcription: 'tin/θvf',
    gods: ['tinia', 'thufltha'],
    cameraPosition: new THREE.Vector3(-2.608, 0.055, -1.174),
    cameraTarget: new THREE.Vector3(-2.567, 0.305, 1.079)
  },
  {
    id: 3,
    groupId: 'sky', 
    etruscanText: '𐌕𐌉𐌍𐌔 / 𐌈𐌍𐌄',
    transcription: 'tins/θne',
    gods: ['tinia', 'nethuns'],
    cameraPosition: new THREE.Vector3(-2.517, -0.611, -1.069),
    cameraTarget: new THREE.Vector3(-2.609, -0.247, 1.167)
  },
  {
    id: 4,
    groupId: 'sky',
    etruscanText: '𐌖𐌍𐌉 / 𐌌𐌀𐌄',
    transcription: 'uni/mae',
    gods: ['uni', 'mae'],
    cameraPosition: new THREE.Vector3(-2.220, -1.169, -0.953),
    cameraTarget: new THREE.Vector3(-2.480, -0.819, 1.272)
  },

  // WATER GROUP (5-8) - Right side moving down
  {
    id: 5,
    groupId: 'water',
    etruscanText: '𐌕𐌄𐌂 / 𐌅𐌌',
    transcription: 'tec/vm',
    gods: ['tecvm'],
    description: 'Tece Sans, "Father"',
    cameraPosition: new THREE.Vector3(-1.838, -1.580, -0.839),
    cameraTarget: new THREE.Vector3(-2.221, -1.297, 1.377)
  },
  {
    id: 6,
    groupId: 'water',
    etruscanText: '𐌋𐌖𐌔𐌋',
    transcription: 'lvsl',
    gods: ['lusal'],
    description: 'Fertility goddess Lusal',
    cameraPosition: new THREE.Vector3(-1.365, -1.7185, -0.5965),
    cameraTarget: new THREE.Vector3(-1.6015, -1.3815, 1.4875)
  },
  {
    id: 7,
    groupId: 'water',
    etruscanText: '𐌍𐌄𐌈',
    transcription: 'neθ',
    gods: ['nethuns'],
    description: 'Primary water deity in his own domain',
    cameraPosition: new THREE.Vector3(-0.892, -1.857, -0.354),
    cameraTarget: new THREE.Vector3(-0.982, -1.466, 1.598)
  },
  {
    id: 8,
    groupId: 'water',
    etruscanText: '𐌂𐌀𐌈',
    transcription: 'caθ',
    gods: ['catha'],
    description: 'Solar goddess in water context',
    cameraPosition: new THREE.Vector3(-0.191, -1.726, -0.265),
    cameraTarget: new THREE.Vector3(-0.573, -1.313, 1.647)
  },

  // EARTH GROUP (9-12) - Bottom right to bottom left
  {
    id: 9,
    groupId: 'earth',
    etruscanText: '𐌅𐌖𐌅𐌋𐌖 / 𐌍𐌔',
    transcription: 'fuflu/ns',
    gods: ['fufluns'],
    description: 'Vegetation deity in earth domain',
    cameraPosition: new THREE.Vector3(0.066, -1.213, -0.702),
    cameraTarget: new THREE.Vector3(0.068, -1.275, 1.659)
  },
  {
    id: 10,
    groupId: 'earth',
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    transcription: 'selva',
    gods: ['selvans'],
    description: 'Forest boundary guardian in earth realm',
    cameraPosition: new THREE.Vector3(0.896, -1.509, -0.514),
    cameraTarget: new THREE.Vector3(0.869, -1.426, 1.657)
  },
  {
    id: 11,
    groupId: 'earth',
    etruscanText: '𐌋𐌄𐌈𐌍𐌔',
    transcription: 'leθns',
    gods: ['lethns'],
    description: 'Local earth spirit/genius',
    cameraPosition: new THREE.Vector3(1.577, -1.542, -0.604),
    cameraTarget: new THREE.Vector3(1.348, -1.245, 1.654)
  },
  {
    id: 12,
    groupId: 'earth',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    transcription: 'tluscv',
    gods: ['tluscva'],
    description: 'Water nymphs in earth context (springs, sacred groves)',
    cameraPosition: new THREE.Vector3(2.352, -0.992, -0.521),
    cameraTarget: new THREE.Vector3(1.938, -1.027, 1.731)
  },

  // UNDERWORLD GROUP (13-16) - Left side
  {
    id: 13,
    groupId: 'underworld',
    etruscanText: '𐌂𐌄𐌋𐌔',
    transcription: 'cels',
    gods: ['cels'],
    description: 'Earth goddess in underworld domain',
    cameraPosition: new THREE.Vector3(2.485, -0.088, -0.881),
    cameraTarget: new THREE.Vector3(2.241, -0.444, 1.854)
  },
  {
    id: 14,
    groupId: 'underworld',
    etruscanText: '𐌂𐌖𐌋 / 𐌀𐌋𐌐',
    transcription: 'cvlalp',
    gods: ['culsans', 'alpans'],
    description: 'Culsans (Janus) paired with protective spirit Alpans',
    cameraPosition: new THREE.Vector3(1.721, 0.508, -0.842),
    cameraTarget: new THREE.Vector3(1.529, 0.078, 1.886)
  },
  {
    id: 15,
    groupId: 'underworld',
    etruscanText: '𐌅𐌄𐌕𐌉𐌔𐌋',
    transcription: 'vetisl',
    gods: ['vetlsi'],
    description: 'Underworld "Apollo" as solitary chthonic light',
    cameraPosition: new THREE.Vector3(0.986, 1.042, -0.812),
    cameraTarget: new THREE.Vector3(0.946, 0.628, 1.925)
  },
  {
    id: 16,
    groupId: 'underworld',
    etruscanText: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋',
    transcription: 'cilensl',
    gods: ['cilens'],
    description: 'Night god in underworld context',
    cameraPosition: new THREE.Vector3(-0.213, 1.456, -1.461),
    cameraTarget: new THREE.Vector3(-0.241, 0.723, 1.922)
  },

  // PARS FAMILIARIS GROUP (17-24) - Red regions
  {
    id: 17,
    groupId: 'pars_familiaris',
    etruscanText: '𐌐𐌖𐌋',
    transcription: 'pul',
    gods: ['pul'],
    description: 'Uncertain deity in favorable realm',
    cameraPosition: new THREE.Vector3(-1.679, -1.661, -0.829),
    cameraTarget: new THREE.Vector3(-1.672, -0.941, 2.223)
  },
  {
    id: 18,
    groupId: 'pars_familiaris',
    etruscanText: '𐌋𐌄𐌈𐌍',
    transcription: 'leθn',
    gods: ['lethns'],
    description: 'Local spirit in familiar context',
    cameraPosition: new THREE.Vector3(-1.664, -1.309, -0.891),
    cameraTarget: new THREE.Vector3(-1.672, -0.941, 2.223)
  },
  {
    id: 19,
    groupId: 'pars_familiaris',
    etruscanText: '𐌋𐌀 / 𐌔𐌋',
    transcription: 'la/sl',
    gods: ['lasl'],
    description: 'Household female spirit',
    cameraPosition: new THREE.Vector3(-1.492, -1.157, -0.908),
    cameraTarget: new THREE.Vector3(-1.486, -0.807, 2.208)
  },
  {
    id: 20,
    groupId: 'pars_familiaris',
    etruscanText: '𐌕𐌉𐌍 / 𐌈𐌖𐌚',
    transcription: 'tins/θvf',
    gods: ['tinia', 'thufltha'],
    description: 'Tinia under Thufltha\'s protection',
    cameraPosition: new THREE.Vector3(-1.909, -1.121, -0.911),
    cameraTarget: new THREE.Vector3(-1.902, -0.772, 2.204)
  },
  {
    id: 21,
    groupId: 'pars_familiaris',
    etruscanText: '𐌈𐌖𐌅𐌋 / 𐌈𐌀𐌔',
    transcription: 'θufl/θas',
    gods: ['thufltha'],
    description: 'Fate goddess as solitary favorable force',
    cameraPosition: new THREE.Vector3(-2.003, -0.707, -0.958),
    cameraTarget: new THREE.Vector3(-1.996, -0.357, 2.158)
  },
  {
    id: 22,
    groupId: 'pars_familiaris',
    etruscanText: '𐌕𐌉𐌍𐌔𐌚 / 𐌍𐌄𐌈',
    transcription: 'tinsθ/neθ',
    gods: ['tinia', 'nethuns'],
    description: 'Nethuns in Tinia\'s house - atmospheric humidity',
    cameraPosition: new THREE.Vector3(-1.989, -0.296, -1.004),
    cameraTarget: new THREE.Vector3(-1.982, 0.051, 2.112)
  },
  {
    id: 23,
    groupId: 'pars_familiaris',
    etruscanText: '𐌂𐌀𐌈𐌀',
    transcription: 'caθa',
    gods: ['catha'],
    description: 'Solar goddess in familiar realm',
    cameraPosition: new THREE.Vector3(-1.397, -0.335, -1.004),
    cameraTarget: new THREE.Vector3(-1.382, -0.056, 2.119)
  },
  {
    id: 24,
    groupId: 'pars_familiaris',
    etruscanText: '𐌅𐌖𐌅𐌋𐌖𐌔',
    transcription: 'fuf/lus',
    gods: ['fufluns'],
    description: 'Fufluns in favorable context',
    cameraPosition: new THREE.Vector3(-1.322, -0.636, -0.977),
    cameraTarget: new THREE.Vector3(-1.307, -0.356, 2.146)
  },

  // GALL BLADDER GROUP (25-28) - Blue-green regions
  {
    id: 25,
    groupId: 'gall_bladder',
    etruscanText: '𐌕𐌖𐌍𐌈',
    transcription: 'tvnθ',
    gods: ['tvnth'],
    description: 'Uncertain deity in concentrated energy zone',
    cameraPosition: new THREE.Vector3(-1.014, -1.772, -0.893),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 26,
    groupId: 'gall_bladder',
    etruscanText: '𐌌𐌀𐌓 / 𐌔𐌋 / 𐌋𐌀𐌚',
    transcription: 'marisl/laθ',
    gods: ['maris', 'laran'],
    description: 'Maris (generative force) paired with Laran (war & fire)',
    cameraPosition: new THREE.Vector3(-1.023, -1.475, -0.974),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 27,
    groupId: 'gall_bladder',
    etruscanText: '𐌋𐌄𐌕𐌀',
    transcription: 'leta',
    gods: ['letams'],
    description: 'Local spirit in concentrated form',
    cameraPosition: new THREE.Vector3(-1.048, -0.807, -1.049),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 28,
    groupId: 'gall_bladder',
    etruscanText: '𐌍𐌄𐌚',
    transcription: 'neθ',
    gods: ['nethuns'],
    description: 'Water god in concentrated energy context',
    cameraPosition: new THREE.Vector3(-1.039, -0.547, -1.039),
    cameraTarget: new THREE.Vector3(-1.065, -0.744, 2.090)
  },

  // CENTRAL SECTION GROUP (29-32) - Yellow regions
  {
    id: 29,
    groupId: 'central_section',
    etruscanText: '𐌇𐌄𐌓𐌂',
    transcription: 'herc',
    gods: ['hercle'],
    description: 'Hero-protector at cosmic center',
    cameraPosition: new THREE.Vector3(-0.098, -1.144, -0.839),
    cameraTarget: new THREE.Vector3(-0.232, -1.333, 1.801)
  },
  {
    id: 30,
    groupId: 'central_section',
    etruscanText: '𐌌𐌀𐌓',
    transcription: 'mar',
    gods: ['maris'],
    description: 'Generating power of all the gods at center',
    cameraPosition: new THREE.Vector3(-0.142, -0.576, -0.801),
    cameraTarget: new THREE.Vector3(-0.277, -0.766, 1.839)
  },
  {
    id: 31,
    groupId: 'central_section',
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    transcription: 'selva',
    gods: ['selvans'],
    description: 'Forest deity in central section',
    cameraPosition: new THREE.Vector3(1.435, -1.285, -1.024),
    cameraTarget: new THREE.Vector3(1.115, -1.547, 2.084)
  },
  {
    id: 32,
    groupId: 'central_section',
    etruscanText: '𐌋𐌄𐌚𐌀',
    transcription: 'leθa',
    gods: ['lethams'],
    description: 'Local tutelary spirit at center',
    cameraPosition: new THREE.Vector3(2.274, -0.693, -1.106),
    cameraTarget: new THREE.Vector3(2.115, -1.196, 2.204)
  },

  // PARS HOSTILIS GROUP (33-38) - Central purple region
  {
    id: 33,
    groupId: 'pars_hostilis',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    transcription: 'tlusc',
    gods: ['tluscva'],
    description: 'Water nymphs in hostile realm',
    cameraPosition: new THREE.Vector3(2.009, 0.291, -0.858),
    cameraTarget: new THREE.Vector3(2.299, -0.550, 2.372)
  },
  {
    id: 34,
    groupId: 'pars_hostilis',
    etruscanText: '𐌋𐌖𐌔𐌋 / 𐌅𐌄𐌋𐌗',
    transcription: 'lvsl/velϰ',
    gods: ['lusal', 'velch'],
    description: 'Lusal paired with infernal Vulcan (Velchans)',
    cameraPosition: new THREE.Vector3(0.747, 0.573, -0.982),
    cameraTarget: new THREE.Vector3(1.194, 0.643, 2.630)
  },
  {
    id: 35,
    groupId: 'pars_hostilis',
    etruscanText: '𐌔𐌀𐌕𐌓 / 𐌄𐌔',
    transcription: 'satr/es',
    gods: ['satres'],
    description: 'Underworld Saturn in hostile context',
    cameraPosition: new THREE.Vector3(0.287, -0.133, -0.900),
    cameraTarget: new THREE.Vector3(0.396, -0.013, 2.737)
  },
  {
    id: 36,
    groupId: 'pars_hostilis',
    etruscanText: '𐌂𐌉𐌋𐌄𐌍',
    transcription: 'cilen',
    gods: ['cilens'],
    description: 'Night god in hostile realm',
    cameraPosition: new THREE.Vector3(0.291, -1.060, -0.761),
    cameraTarget: new THREE.Vector3(0.233, -1.186, 1.885)
  },
  {
    id: 37,
    groupId: 'pars_hostilis',
    etruscanText: '𐌋𐌀𐌌',
    transcription: 'leθam',
    gods: ['lethams'],
    description: 'Local spirit in unfavorable context',
    cameraPosition: new THREE.Vector3(0.165, -0.612, -0.787),
    cameraTarget: new THREE.Vector3(0.030, -0.801, 1.852)
  },
  {
    id: 38,
    groupId: 'pars_hostilis',
    etruscanText: '𐌌𐌄𐌕𐌋𐌖𐌌𐌚',
    transcription: 'metlvmθ',
    gods: ['metlvmth'],
    description: 'Epithet or attribute deity in hostile realm',
    cameraPosition: new THREE.Vector3(0.854, 0.717, -0.798),
    cameraTarget: new THREE.Vector3(0.731, -0.071, 2.781)
  },

  // RETRO GROUP (39-42) - Back/foundational sections
  {
    id: 39,
    groupId: 'retro',
    etruscanText: '𐌌𐌀𐌓',
    transcription: 'mar',
    gods: ['maris'],
    description: 'Generative force in foundational context',
    cameraPosition: new THREE.Vector3(-0.382, 0.398, -0.719),
    cameraTarget: new THREE.Vector3(-0.723, 0.132, 1.503)
  },
  {
    id: 40,
    groupId: 'retro',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    transcription: 'tlusc',
    gods: ['tluscva'],
    description: 'Water nymphs as foundational spirits',
    cameraPosition: new THREE.Vector3(-0.741, 0.125, -1.025),
    cameraTarget: new THREE.Vector3(-0.804, -0.067, 1.464)
  },
  {
    id: 41,
    groupId: 'retro',
    etruscanText: '𐌕𐌉𐌖𐌔',
    transcription: 'tivs',
    gods: ['tiur'],
    description: 'The Moon as cosmic foundation',
    
  },
  {
    id: 42,
    groupId: 'retro',
    etruscanText: '𐌖𐌔𐌉𐌋𐌔',
    transcription: 'usils',
    gods: ['usil'],
    description: 'The Sun as cosmic foundation',
    
  }
]

// Camera utilities removed; camera transformation logic is centralized in the camera layer

 