
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
    description: 'The first three houses are occupied by Tinia, the supreme god linked to the Greek god Zeus, followed by Cilens, goddess of the night, and Thufltha, who governed the fate of men and the world, and Nethuns, in the form of divinity of atmospheric humidity. In fourth place is Uni, wife of Tinia, protectress of cities and births.'
  },
  water: {
    id: 'water',
    name: 'Water',
    positions: [5, 6, 7, 8],
    color: '#008B8B', // Teal
    description: 'The second four houses are occupied by Tecum, a still-mysterious figure: the sanctuary of Tuoro on Lake Trasimeno is dedicated to this diety. Lur, a deified hero or mythical founder, occupies the next space, followed by Nethuns, originally the diety of fresh-water, only later identified with the Greek god Poseidon. Catha, the sun goddess, occupies the last house.'
  },
  earth: {
    id: 'earth', 
    name: 'Earth',
    positions: [9, 10, 11, 12],
    color: '#CD853F', // Brown-ochre
    description: 'The terrestrial realm of vegetation, boundaries, and earth spirits. Governs agricultural cycles, forest boundaries, and land-based divine forces.'
  },
  underworld: {
    id: 'underworld',
    name: 'Underworld',
    positions: [13, 14, 15, 16],
    color: '#808000', // Olive-green
    description: 'The chthonic realm of earth goddesses, protective spirits, and underworld deities. Controls death omens, protection, and liminal passages.'
  },
  pars_familiaris: {
    id: 'pars_familiaris',
    name: 'Pars Familiaris',
    positions: [17, 18, 19, 20, 21, 22, 23, 24],
    color: '#FF0000', // Bright red
    description: 'The familiar/favorable realm containing household spirits and benevolent deities. Represents favorable omens and domestic divine protection.'
  },
  gall_bladder: {
    id: 'gall_bladder',
    name: 'Gall Bladder',
    positions: [25, 26, 27, 28],
    color: '#FF8C00', // Deep orange
    description: 'The bile reservoir representing concentrated divine energy, generative forces, and seasonal transitions. Contains powerful fertility and war deities.'
  },
  central_section: {
    id: 'central_section', 
    name: 'Central Section',
    positions: [29, 30, 37, 38, 39, 40],
    color: '#FFA500', // Light orange
    description: 'The central power zone containing heroic protectors and generating forces. Represents the heart of divine power and cosmic balance.'
  },
  pars_hostilis: {
    id: 'pars_hostilis',
    name: 'Pars Hostilis',
    positions: [31, 32, 33, 34, 35, 36],
    color: '#9370DB', // Purple-lavender
    description: 'The hostile/unfavorable realm containing border guardians and infernal deities. Represents challenging omens and protective boundaries.'
  },
  back: {
    id: 'back',
    name: 'Back',
    positions: [41, 42], 
    color: '#808080', // Gray
    description: 'The foundational cosmic anchors representing the Sun and Moon. These mark the fundamental celestial cycles underlying all divination.'
  }
}

// INDIVIDUAL GODS: Complete deity information
export const liverGods = {
  tinia: {
    id: 'tinia',
    name: 'Tinia',
    romanEquivalent: 'Jupiter',
    greekEquivalent: 'Zeus', 
    description: 'Supreme sky god and father of the gods in the Etruscan pantheon.',
    
  },
  cilens: {
    id: 'cilens',
    name: 'Cilens',
    romanEquivalent: 'Nocturnus',
    description: 'God of the night and guide of souls between worlds.',
    
  },
  thufltha: {
    id: 'thufltha', 
    name: 'Thufltha',
    romanEquivalent: 'Fortuna',
    description: 'Goddess of fate, healing, and oracular wisdom.',
    
  },
  nethuns: {
    id: 'nethuns',
    name: 'Nethuns', 
    romanEquivalent: 'Neptune',
    greekEquivalent: 'Poseidon',
    description: 'God of fresh water, sea, and atmospheric moisture.',
    
  },
  uni: {
    id: 'uni',
    name: 'Uni',
    romanEquivalent: 'Juno',
    greekEquivalent: 'Hera',
    description: 'Wife of Tinia, guardian of marriage, fertility, birth, and cities.',
    
  },
  mae: {
    id: 'mae',
    name: 'Mae',
    romanEquivalent: 'Maius',
    description: 'Possibly maternal or generative attribute deity.',
    
  },
  tecvm: {
    id: 'tecvm',
    name: 'Tecum',
    description: 'God of the lucomenes, or ruling class.',
    
  },
  lusal: {
    id: 'lusal',
    name: 'Lusal',
    description: 'Unidentified water deity, possibly related to light or purification.',
    
  },
  catha: {
    id: 'catha',
    name: 'Catha',
    greekEquivalent: 'Leucothea',
    description: 'Goddess of the sun in her solar-nymph form.',
    
  },
  fufluns: {
    id: 'fufluns',
    name: 'Fufluns',
    romanEquivalent: 'Bacchus',
    greekEquivalent: 'Dionysus',
    description: 'God of wine, inebriation, and vegetation cycles.',
    
  },
  selvans: {
    id: 'selvans',
    name: 'Selvans',
    romanEquivalent: 'Silvanus',
    description: 'God of borders and forest boundaries.',
    
  },
  tluscva: {
    id: 'tluscva',
    name: 'Tluscva',
    description: 'Nymphs tied to water cult and sacred offerings.',
    
  },
  cels: {
    id: 'cels',
    name: 'Cels',
    romanEquivalent: 'Gea',
    description: 'Goddess of the earth and chthonic forces.',
    
  },
  culsans: {
    id: 'culsans',
    name: 'Culsans',
    romanEquivalent: 'Janus',
    description: 'Benevolent protector of doors and thresholds.',
    
  },
  alpans: {
    id: 'alpans',
    name: 'Alpans',
    description: 'Protective spirit associated with Culsans.',
    
  },
  vetis: {
    id: 'vetis',
    name: 'Vetis',
    romanEquivalent: 'Veiovis',
    description: 'Underworld "Apollo", chthonic version of the light god.',
    
  },
  pul: {
    id: 'pul',
    name: 'Pul',
    description: 'Uncertain deity, possibly related to purification.',
    
  },
  lasl: {
    id: 'lasl',
    name: 'Lasl',
    romanEquivalent: 'Lares',
    description: 'Household female spirit, domestic protection. Companion of Turan.',
    
  },
  maris: {
    id: 'maris',
    name: 'Maris',
    transcription: 'mar',
    description: 'Generative force and generating power of all the gods.',
    
  },
  laran: {
    id: 'laran',
    name: 'Laran', 
    transcription: 'lar',
    romanEquivalent: 'Ares',
    description: 'God of war and fire, representing martial force.',
    
  },
  tvnth: {
    id: 'tvnth',
    name: 'Tvnth',
    description: 'Uncertain deity in the gall bladder zone.',
    
  },
  hercle: {
    id: 'hercle',
    name: 'Hercle',
    romanEquivalent: 'Hercules', 
    description: 'Hero-protector, divine strength and protection.',
    
  },
  metlvmth: {
    id: 'metlvmth',
    name: 'Metlvmth',
    description: 'Epithet or attribute associated with Lethams.',
    
  },
  marutl: {
    id: 'marutl',
    name: 'Marutl',
    description: 'Double epithet associated with Tluscva.',
    
  },
  letham: {
    id: 'letham',
    name: 'Letham',
    description: 'Goddess associated with the underworld and the protector of pregnant mothers and newborns.',
    
  },
  velch: {
    id: 'velch',
    name: 'Velch',
    romanEquivalent: 'Vulcan',
    description: 'Infernal form of Sethlans (Vulcan), fire deity.',
    
  },
  satres: {
    id: 'satres',
    name: 'Satres',
    romanEquivalent: 'Saturn',
    description: 'God of the underworld and temporal cycles.',
    
  },
  usil: {
    id: 'usil',
    name: 'Usil',
    description: 'The sun god, representing solar power and illumination.',
    
  },
  tiur: {
    id: 'tiur',
    name: 'Tiur',
    description: 'The moon god, representing lunar cycles and night illumination.',
    
  }
}

// INSCRIPTIONS: All 42 liver sections with their gods and descriptions
export const liverInscriptions = [
  {
    id: 1,
    etruscanText: '𐌕𐌉𐌍 / 𐌂𐌉𐌋 / 𐌄𐌍', 
    transcription: 'tin / cil / en',
    gods: [{id: 'tinia', form: '𐌕𐌉𐌍'}, {id: 'cilens', form: '𐌂𐌉𐌋𐌄𐌍'}],
    cameraPosition: new THREE.Vector3(-2.491, 0.722, -1.246),
    cameraTarget: new THREE.Vector3(-2.357, 0.865, 1.013)
  },
  {
    id: 2,
    etruscanText: '𐌕𐌉𐌍 / 𐌏𐌅𐌚',
    transcription: 'tin / θvf',
    gods: [{id: 'tinia', form: '𐌕𐌉𐌍'}, {id: 'thufltha', form: '𐌏𐌅𐌚'}],
    cameraPosition: new THREE.Vector3(-2.608, 0.055, -1.174),
    cameraTarget: new THREE.Vector3(-2.567, 0.305, 1.079)
  },
  {
    id: 3,
    etruscanText: '𐌕𐌉𐌍𐌔 / 𐌏𐌍𐌄',
    transcription: 'tins / θne',
    gods: [{id: 'tinia', form: '𐌕𐌉𐌍𐌔𐌏'}, {id: 'nethuns', form: '𐌍𐌄'}],
    cameraPosition: new THREE.Vector3(-2.517, -0.611, -1.069),
    cameraTarget: new THREE.Vector3(-2.609, -0.247, 1.167)
  },
  {
    id: 4,
    etruscanText: '𐌖𐌍𐌉 / 𐌡𐌀𐌄',
    transcription: 'uni / mae',
    gods: [{id: 'uni', form: '𐌖𐌍𐌉'}, {id: 'mae', form: '𐌡𐌀𐌄'}],
    cameraPosition: new THREE.Vector3(-2.220, -1.169, -0.953),
    cameraTarget: new THREE.Vector3(-2.480, -0.819, 1.272)
  },
  {
    id: 5,
    etruscanText: '𐌕𐌄𐌂 / 𐌅𐌡',
    transcription: 'tec / vm',
    gods: [{id: 'tecvm', form: '𐌕𐌄𐌂𐌅𐌡'}],
    description: 'Tece Sans, "Father"',
    cameraPosition: new THREE.Vector3(-1.838, -1.580, -0.839),
    cameraTarget: new THREE.Vector3(-2.221, -1.297, 1.377)
  },
  {
    id: 6,
    etruscanText: '𐌋𐌅𐌔𐌀𐌋',
    transcription: 'lvsal',
    gods: [{id: 'lusal', form: '𐌋𐌅𐌔𐌀𐌋'}],
    description: 'Fertility goddess Lusal',
    cameraPosition: new THREE.Vector3(-1.365, -1.7185, -0.5965),
    cameraTarget: new THREE.Vector3(-1.6015, -1.3815, 1.4875)
  },
  {
    id: 7,
    etruscanText: '𐌍𐌄𐌏',
    transcription: 'neθ',
    gods: [{id: 'nethuns', form: '𐌍𐌄𐌏'}],
    description: 'Primary water deity in his own domain',
    cameraPosition: new THREE.Vector3(-0.892, -1.857, -0.354),
    cameraTarget: new THREE.Vector3(-0.982, -1.466, 1.598)
  },
  {
    id: 8,
    etruscanText: '𐌂𐌀𐌏',
    transcription: 'caθ',
    gods: [{id: 'catha', form: '𐌂𐌀𐌏'}],
    description: 'Solar goddess in water context',
    cameraPosition: new THREE.Vector3(-0.191, -1.726, -0.265),
    cameraTarget: new THREE.Vector3(-0.573, -1.313, 1.647)
  },
  {
    id: 9,
    etruscanText: '𐌚𐌖𐌚𐌋𐌖 / 𐌍𐌔',
    transcription: 'fuflu / ns',
    gods: [{id: 'fufluns', form: '𐌚𐌖𐌚𐌋𐌖𐌍𐌔'}],
    description: 'Vegetation deity in earth domain',
    cameraPosition: new THREE.Vector3(0.066, -1.213, -0.702),
    cameraTarget: new THREE.Vector3(0.068, -1.275, 1.659)
  },
  {
    id: 10,
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    transcription: 'selva',
    gods: [{id: 'selvans', form: '𐌔𐌄𐌋𐌅𐌀'}],
    description: 'Forest boundary guardian in earth realm',
    cameraPosition: new THREE.Vector3(0.896, -1.509, -0.514),
    cameraTarget: new THREE.Vector3(0.869, -1.426, 1.657)
  },
  {
    id: 11,
    etruscanText: '𐌋𐌄𐌏𐌍𐌔',
    transcription: 'leθns',
    gods: [{id: 'letham', form: '𐌋𐌄𐌏𐌍𐌔'}],
    description: 'Local earth spirit/genius',
    cameraPosition: new THREE.Vector3(1.577, -1.542, -0.604),
    cameraTarget: new THREE.Vector3(1.348, -1.245, 1.654)
  },
  {
    id: 12,
    etruscanText: '𐌕𐌋𐌖𐌔𐌂𐌅',
    transcription: 'tluscv',
    gods: [{id: 'tluscva', form: '𐌕𐌋𐌖𐌔𐌂𐌅'}],
    description: 'Water nymphs in earth context (springs, sacred groves)',
    cameraPosition: new THREE.Vector3(2.238, -0.057, -1.039),
    cameraTarget: new THREE.Vector3(2.247, -0.257, 1.788)
  },
  {
    id: 13,
    etruscanText: '𐌂𐌄𐌋𐌔',
    transcription: 'cels',
    gods: [{id: 'cels', form: '𐌂𐌄𐌋𐌔'}],
    description: 'Earth goddess in underworld domain',
    cameraPosition: new THREE.Vector3(1.640, 0.505, -0.994),
    cameraTarget: new THREE.Vector3(1.667, 0.355, 1.836)
  },
  {
    id: 14,
    etruscanText: '𐌂𐌅𐌋 / 𐌀𐌋𐌐',
    transcription: 'cvl / alp',
    gods: [{id: 'culsans', form: '𐌂𐌅𐌋'}, {id: 'alpans', form: '𐌀𐌋𐌐'}],
    description: 'Culsans (Janus) paired with protective spirit Alpans',
    cameraPosition: new THREE.Vector3(0.949, 0.906, -0.964),
    cameraTarget: new THREE.Vector3(0.981, 0.805, 1.868)
  },
  {
    id: 15,
    etruscanText: '𐌅𐌄𐌕𐌉𐌔𐌋',
    transcription: 'vetisl',
    gods: [{id: 'vetis', form: '𐌅𐌄𐌕𐌉𐌔𐌋'}],
    description: 'Underworld "Apollo" as solitary chthonic light',
    cameraPosition: new THREE.Vector3(0.053, 0.838, -0.949),
    cameraTarget: new THREE.Vector3(0.036, 0.825, 1.885)
  },
  {
    id: 16,
    etruscanText: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋',
    transcription: 'cilensl',
    gods: [{id: 'cilens', form: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋'}],
    description: 'Night god in underworld context',
    cameraPosition: new THREE.Vector3(-1.536, 0.831, -1.864),
    cameraTarget: new THREE.Vector3(-1.578, 0.665, 1.912)
  },
  {
    id: 17,
    etruscanText: '𐌐𐌖𐌋',
    transcription: 'pul',
    gods: [{id: 'pul', form: '𐌐𐌖𐌋'}],
    description: 'Protective spirit Alpans',
    cameraPosition: new THREE.Vector3(-1.679, -1.661, -0.829),
    cameraTarget: new THREE.Vector3(-1.672, -0.941, 2.223)
  },
  {
    id: 18,
    etruscanText: '𐌋𐌄𐌏𐌍',
    transcription: 'leθn',
    gods: [{id: 'letham', form: '𐌋𐌄𐌏𐌍'}],
    description: 'Local spirit in familiar context',
    cameraPosition: new THREE.Vector3(-1.664, -1.309, -0.891),
    cameraTarget: new THREE.Vector3(-1.672, -0.941, 2.223)
  },
  {
    id: 19,
    etruscanText: '𐌋𐌀 / 𐌔𐌋',
    transcription: 'la / sl',
    gods: [{id: 'lasl', form: '𐌋𐌀𐌔𐌋'}],
    description: 'Household female spirit',
    cameraPosition: new THREE.Vector3(-1.492, -1.157, -0.908),
    cameraTarget: new THREE.Vector3(-1.486, -0.807, 2.208)
  },
  {
    id: 20,
    etruscanText: '𐌕𐌉𐌍𐌔 / 𐌏𐌅𐌚',
    transcription: 'tins / θvf',
    gods: [{id: 'tinia', form: '𐌕𐌉𐌍𐌔'}, {id: 'thufltha', form: '𐌏𐌅𐌚'}],
    description: 'Tinia and Thufltha',
    cameraPosition: new THREE.Vector3(-1.909, -1.121, -0.911),
    cameraTarget: new THREE.Vector3(-1.902, -0.772, 2.204)
  },
  {
    id: 21,
    etruscanText: '𐌏𐌖𐌚𐌋 / 𐌏𐌀𐌔',
    transcription: 'θufl / θas',
    gods: [{id: 'thufltha', form: '𐌏𐌖𐌚𐌋𐌏𐌀𐌔'}],
    description: 'Fate goddess as solitary favorable force',
    cameraPosition: new THREE.Vector3(-2.003, -0.707, -0.958),
    cameraTarget: new THREE.Vector3(-1.996, -0.357, 2.158)
  },
  {
    id: 22,
    etruscanText: '𐌕𐌉𐌍𐌔𐌏 / 𐌍𐌄𐌏',
    transcription: 'tinsθ/neθ',
    gods: [{id: 'tinia', form: '𐌕𐌉𐌍𐌔𐌏'}, {id: 'nethuns', form: '𐌍𐌄𐌏'}],
    description: 'Tinia and Nethuns',
    cameraPosition: new THREE.Vector3(-1.989, -0.296, -1.004),
    cameraTarget: new THREE.Vector3(-1.982, 0.051, 2.112)
  },
  {
    id: 23,
    etruscanText: '𐌂𐌀𐌏𐌀',
    transcription: 'caθa',
    gods: [{id: 'catha', form: '𐌂𐌀𐌏𐌀'}],
    description: 'Solar goddess in familiar realm',
    cameraPosition: new THREE.Vector3(-1.397, -0.335, -1.004),
    cameraTarget: new THREE.Vector3(-1.382, -0.056, 2.119)
  },
  {
    id: 24,
    etruscanText: '𐌚𐌖𐌚𐌋𐌖𐌔',
    transcription: 'fuf/lus',
    gods: [{id: 'fufluns', form: '𐌚𐌖𐌚𐌋𐌖𐌔'}],
    description: 'Fufluns in favorable context',
    cameraPosition: new THREE.Vector3(-1.322, -0.636, -0.977),
    cameraTarget: new THREE.Vector3(-1.307, -0.356, 2.146)
  },
  {
    id: 25,
    etruscanText: '𐌕𐌅𐌖𐌏',
    transcription: 'tvnθ',
    gods: [{id: 'tvnth', form: '𐌕𐌅𐌖𐌏'}],
    description: 'Uncertain deity in concentrated energy zone',
    cameraPosition: new THREE.Vector3(-1.014, -1.772, -0.893),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 26,
    etruscanText: '𐌡𐌀𐌓𐌉𐌔𐌋 / 𐌋𐌀𐌏',
    transcription: 'marisl/laθ',
    gods: [{id: 'maris', form: '𐌡𐌀𐌓𐌉𐌔𐌋'}, {id: 'laran', form: '𐌋𐌀𐌏'}],
    description: 'Maris (generative force) paired with Laran (war & fire)',
    cameraPosition: new THREE.Vector3(-1.023, -1.475, -0.974),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 27,
    etruscanText: '𐌋𐌄𐌕𐌀',
    transcription: 'leta',
    gods: [{id: 'letham', form: '𐌋𐌄𐌕𐌀'}],
    description: 'Local spirit in concentrated form',
    cameraPosition: new THREE.Vector3(-1.048, -0.807, -1.049),
    cameraTarget: new THREE.Vector3(-1.078, -0.796, 2.086)
  },
  {
    id: 28,
    etruscanText: '𐌍𐌄𐌏',
    transcription: 'neθ',
    gods: [{id: 'nethuns', form: '𐌍𐌄𐌏'}],
    description: 'Water god in concentrated energy context',
    cameraPosition: new THREE.Vector3(-1.039, -0.547, -1.039),
    cameraTarget: new THREE.Vector3(-1.065, -0.744, 2.090)
  },
  {
    id: 29,
    etruscanText: '𐌇𐌄𐌓𐌂',
    transcription: 'herc',
    gods: [{id: 'hercle', form: '𐌇𐌄𐌓𐌂'}],
    description: 'Hero-protector at cosmic center',
    cameraPosition: new THREE.Vector3(-0.098, -1.144, -0.839),
    cameraTarget: new THREE.Vector3(-0.232, -1.333, 1.801)
  },
  {
    id: 30,
    etruscanText: '𐌡𐌀𐌓',
    transcription: 'mar',
    gods: [{id: 'maris', form: '𐌡𐌀𐌓'}],
    description: 'Generating god Maris at the center',
    cameraPosition: new THREE.Vector3(-0.142, -0.576, -0.801),
    cameraTarget: new THREE.Vector3(-0.277, -0.766, 1.839)
  },
  {
    id: 31,
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    transcription: 'selva',
    gods: [{id: 'selvans', form: '𐌔𐌄𐌋𐌅𐌀'}],
    description: 'Forest deity in central section',
    cameraPosition: new THREE.Vector3(1.120, -0.447, -0.973),
    cameraTarget: new THREE.Vector3(1.107, -0.665, 2.155)
  },
  {
    id: 32,
    etruscanText: '𐌋𐌄𐌏𐌀',
    transcription: 'leθa',
    gods: [{id: 'letham', form: '𐌋𐌄𐌏𐌀'}],
    description: 'Local tutelary spirit at center',
    cameraPosition: new THREE.Vector3(1.313, -0.349, -0.950),
    cameraTarget: new THREE.Vector3(1.392, -0.381, 2.184)
  },
  {
    id: 33,
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    transcription: 'tlusc',
    gods: [{id: 'tluscva', form: '𐌕𐌋𐌖𐌔𐌂'}],
    description: 'Water nymphs in hostile realm',
    cameraPosition: new THREE.Vector3(1.359, -0.251, -0.950),
    cameraTarget: new THREE.Vector3(1.313, -0.445, 2.179)
  },
  {
    id: 34,
    etruscanText: '𐌋𐌖𐌔𐌋 / 𐌅𐌄𐌋𐌗',
    transcription: 'lvsl/velϰ',
    gods: [{id: 'lusal', form: '𐌋𐌅𐌔𐌋'}, {id: 'velch', form: '𐌅𐌄𐌋𐌗'}],
    description: 'Lusal paired with infernal Vulcan (Velchans)',
    cameraPosition: new THREE.Vector3(0.747, 0.573, -0.982),
    cameraTarget: new THREE.Vector3(1.194, 0.643, 2.630)
  },
  {
    id: 35,
    etruscanText: '𐌔𐌀𐌕𐌓 / 𐌄𐌔',
    transcription: 'satr/es',
    gods: [{id: 'satres', form: '𐌔𐌀𐌕𐌓𐌄𐌔'}],
    description: 'Underworld Saturn in hostile context',
    cameraPosition: new THREE.Vector3(0.287, -0.133, -0.900),
    cameraTarget: new THREE.Vector3(0.396, -0.013, 2.737)
  },
  {
    id: 36,
    etruscanText: '𐌂𐌉𐌋𐌄𐌍',
    transcription: 'cilen',
    gods: [{id: 'cilens', form: '𐌂𐌉𐌋𐌄𐌍'}],
    description: 'Night god in hostile realm',
    cameraPosition: new THREE.Vector3(0.359, -0.996, -0.756),
    cameraTarget: new THREE.Vector3(0.301, -1.122, 1.890)
  },
  {
    id: 37,
    etruscanText: '𐌋𐌄𐌏𐌀𐌡',
    transcription: 'leθam',
    gods: [{id: 'letham', form: '𐌋𐌄𐌏𐌀𐌡'}],
    description: 'Local spirit in unfavorable context',
    cameraPosition: new THREE.Vector3(0.165, -0.612, -0.787),
    cameraTarget: new THREE.Vector3(0.030, -0.801, 1.852)
  },
  {
    id: 38,
    etruscanText: '𐌡𐌄𐌕𐌋𐌅𐌡𐌏',
    transcription: 'metlvmθ',
    gods: [{id: 'metlvmth', form: '𐌡𐌄𐌕𐌋𐌅𐌡𐌏'}],
    description: 'Epithet or attribute deity in hostile realm',
    cameraPosition: new THREE.Vector3(0.729, 0.769, -1.313),
    cameraTarget: new THREE.Vector3(0.589, -0.129, 2.763)
  },
  {
    id: 39,
    etruscanText: '𐌡𐌀𐌓',
    transcription: 'mar',
    gods: [{id: 'maris', form: '𐌡𐌀𐌓'}],
    description: 'Generative force in foundational context',
    cameraPosition: new THREE.Vector3(-0.382, 0.398, -0.719),
    cameraTarget: new THREE.Vector3(-0.723, 0.132, 1.503)
  },
  {
    id: 40,
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    transcription: 'tlusc',
    gods: [{id: 'tluscva', form: '𐌕𐌋𐌖𐌔𐌂'}],
    description: 'Water nymphs as foundational spirits',
    cameraPosition: new THREE.Vector3(-0.741, 0.125, -1.025),
    cameraTarget: new THREE.Vector3(-0.804, -0.067, 1.464)
  },
  {
    id: 41,
    etruscanText: '𐌕𐌉𐌅𐌓',
    transcription: 'tivr',
    gods: [{id: 'tiur', form: '𐌕𐌉𐌅𐌓'}],
    description: 'The Moon as cosmic foundation',
  },
  {
    id: 42,
    etruscanText: '𐌖𐌔𐌉𐌋𐌔',
    transcription: 'usils',
    gods: [{id: 'usil', form: '𐌖𐌔𐌉𐌋𐌔'}],
    description: 'The Sun as cosmic foundation',
  }
]
