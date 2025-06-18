import * as THREE from 'three'

// ================================================================================================
// PIACENZA LIVER DATA - REFACTORED STRUCTURE
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
    name: 'Under-world',
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
    positions: [29, 30, 31, 32],
    color: '#FFA500', // Light orange
    description: 'The central power zone containing heroic protectors and generating forces. Represents the heart of divine power and cosmic balance.',
    cosmologicalMeaning: 'Central divine authority, heroic protection, cosmic balance, and the generating power of all gods.'
  },
  pars_hostilis: {
    id: 'pars_hostilis',
    name: 'Pars Hostilis',
    positions: [33, 34, 35, 36, 37, 38],
    color: '#9370DB', // Purple-lavender
    description: 'The hostile/unfavorable realm containing border guardians and infernal deities. Represents challenging omens and protective boundaries.',
    cosmologicalMeaning: 'Hostile forces, protective boundaries, infernal powers, and challenging divine tests.'
  },
  retro: {
    id: 'retro',
    name: 'Back / Bottom',
    positions: [39, 40], 
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
    romanEquivalent: 'Jupiter',
    greekEquivalent: 'Zeus', 
    domain: 'Sky, Thunder, Divine Authority',
    description: 'Supreme sky god and father of the gods in the Etruscan pantheon.',
    divinationMeaning: 'Divine authority, favorable celestial omens, cosmic order'
  },
  cilens: {
    id: 'cilens',
    name: 'Cilens',
    etruscanScript: '𐌂𐌉𐌋𐌄𐌍',
    romanEquivalent: 'Nocturnus',
    domain: 'Night, Psychopomp',
    description: 'God of the night and guide of souls between worlds.',
    divinationMeaning: 'Night omens, soul transitions, death passages'
  },
  thufltha: {
    id: 'thufltha', 
    name: 'Thufltha',
    etruscanScript: '𐌚𐌖𐌅𐌋𐌚𐌀',
    romanEquivalent: 'Fortuna',
    domain: 'Fate, Healing, Oracles',
    description: 'Goddess of fate, healing, and oracular wisdom.',
    divinationMeaning: 'Fate determination, healing omens, oracular guidance'
  },
  nethuns: {
    id: 'nethuns',
    name: 'Nethuns', 
    etruscanScript: '𐌍𐌄𐌚',
    romanEquivalent: 'Neptune',
    greekEquivalent: 'Poseidon',
    domain: 'Water, Sea, Atmospheric Humidity',
    description: 'God of fresh water, sea, and atmospheric moisture.',
    divinationMeaning: 'Water omens, purification, life force flow'
  },
  uni: {
    id: 'uni',
    name: 'Uni',
    etruscanScript: '𐌖𐌍𐌉',
    romanEquivalent: 'Juno',
    greekEquivalent: 'Hera',
    domain: 'Marriage, Fertility, Cities',
    description: 'Wife of Tinia, guardian of marriage, fertility, birth, and cities.',
    divinationMeaning: 'Marital harmony, fertility, civic protection'
  },
  mae: {
    id: 'mae',
    name: 'Mae',
    etruscanScript: '𐌌𐌀𐌄',
    domain: 'Maternal, Generative',
    description: 'Possibly maternal or generative attribute deity.',
    divinationMeaning: 'Maternal protection, generative power'
  },
  tecvm: {
    id: 'tecvm',
    name: 'Tecvm', 
    etruscanScript: '𐌕𐌄𐌂',
    romanEquivalent: 'Tece Sans (Father)',
    domain: 'Paternal Water Spirit',
    description: 'Paternal water-spirit, possibly ancestral water deity.',
    divinationMeaning: 'Ancestral water protection, paternal guidance'
  },
  lusal: {
    id: 'lusal',
    name: 'Lusal',
    etruscanScript: '𐌋𐌖𐌔𐌋',
    domain: 'Water (unidentified)',
    description: 'Unidentified water deity, possibly related to light or purification.',
    divinationMeaning: 'Water purification, luminous guidance'
  },
  catha: {
    id: 'catha',
    name: 'Catha',
    etruscanScript: '𐌂𐌀𐌚',
    romanEquivalent: 'Kore',
    domain: 'Sun, Solar-Nymph',
    description: 'Goddess of the sun in her solar-nymph form.',
    divinationMeaning: 'Solar transitions, dawn/dusk omens, illumination'
  },
  fufluns: {
    id: 'fufluns',
    name: 'Fufluns',
    etruscanScript: '𐌅𐌖𐌅𐌋𐌖𐌍',
    romanEquivalent: 'Bacchus',
    greekEquivalent: 'Dionysus',
    domain: 'Wine, Vegetation, Inebriation',
    description: 'God of wine, inebriation, and vegetation cycles.',
    divinationMeaning: 'Fertility, ecstatic transformation, vegetation cycles'
  },
  selvans: {
    id: 'selvans',
    name: 'Selvans',
    etruscanScript: '𐌔𐌄𐌋𐌅𐌀',
    romanEquivalent: 'Silvanus',
    domain: 'Forests, Borders',
    description: 'God of borders and forest boundaries.',
    divinationMeaning: 'Boundary protection, forest omens, territorial limits'
  },
  lethns: {
    id: 'lethns',
    name: 'Lethns',
    etruscanScript: '𐌋𐌄𐌚𐌍',
    romanEquivalent: 'Lethams',
    domain: 'Local Spirit, Genius',
    description: 'Genius or local spirit, possibly related to memory/forgetfulness.',
    divinationMeaning: 'Local protection, memory transitions, genius loci'
  },
  tluscva: {
    id: 'tluscva',
    name: 'Tluscva',
    etruscanScript: '𐌕𐌋𐌖𐌔𐌂',
    domain: 'Water Nymphs, Sacred Water',
    description: 'Nymphs tied to water cult and sacred offerings.',
    divinationMeaning: 'Sacred water rituals, nymph protection, ritual purity'
  },
  cels: {
    id: 'cels',
    name: 'Cels',
    etruscanScript: '𐌂𐌄𐌋𐌔',
    romanEquivalent: 'Gea',
    domain: 'Earth Goddess',
    description: 'Goddess of the earth and chthonic forces.',
    divinationMeaning: 'Earth power, foundational stability, chthonic wisdom'
  },
  culsans: {
    id: 'culsans',
    name: 'Culsans',
    etruscanScript: '𐌂𐌖𐌋',
    romanEquivalent: 'Janus',
    domain: 'Doors, Protection',
    description: 'Benevolent protector of doors and thresholds.',
    divinationMeaning: 'Threshold protection, doorway blessings, transitions'
  },
  alpans: {
    id: 'alpans',
    name: 'Alpans',
    etruscanScript: '𐌀𐌋𐌐',
    domain: 'Protective Spirit',
    description: 'Protective spirit associated with Culsans.',
    divinationMeaning: 'Divine protection, spiritual guardianship'
  },
  vetlsi: {
    id: 'vetlsi',
    name: 'Vetlsi',
    etruscanScript: '𐌅𐌄𐌕𐌋𐌔𐌉',
    romanEquivalent: 'Veiovis',
    domain: 'Underworld Apollo',
    description: 'Underworld "Apollo", chthonic version of the light god.',
    divinationMeaning: 'Underworld illumination, chthonic prophecy, dark wisdom'
  },
  pul: {
    id: 'pul',
    name: 'Pul',
    etruscanScript: '𐌐𐌖𐌋',
    domain: 'Uncertain',
    description: 'Uncertain deity, possibly related to purification.',
    divinationMeaning: 'Uncertain omens, purification needs'
  },
  lasl: {
    id: 'lasl',
    name: 'Lasl',
    etruscanScript: '𐌋𐌀𐌔𐌋',
    romanEquivalent: 'Lasi',
    domain: 'Household Spirit',
    description: 'Household female spirit, domestic protection.',
    divinationMeaning: 'Household harmony, domestic protection, family spirits'
  },
  maris: {
    id: 'maris',
    name: 'Maris',
    etruscanScript: '𐌌𐌀𐌓',
    domain: 'Generative Force, Youth',
    description: 'Generative force and generating power of all the gods.',
    divinationMeaning: 'Youth renewal, generative power, divine regeneration'
  },
  laran: {
    id: 'laran',
    name: 'Laran', 
    etruscanScript: '𐌋𐌀𐌓',
    romanEquivalent: 'Ares',
    domain: 'War, Fire',
    description: 'God of war and fire, representing martial force.',
    divinationMeaning: 'Martial conflicts, fiery energy, warrior protection'
  },
  letams: {
    id: 'letams',
    name: 'Letams',
    etruscanScript: '𐌋𐌄𐌕𐌀',
    domain: 'Local Spirit',
    description: 'Local spirit or genius, memory-related deity.',
    divinationMeaning: 'Memory preservation, local guidance, ancestral wisdom'
  },
  tvnth: {
    id: 'tvnth',
    name: 'Tvnth',
    etruscanScript: '𐌕𐌖𐌍𐌚',
    domain: 'Uncertain',
    description: 'Uncertain deity in the gall bladder zone.',
    divinationMeaning: 'Concentrated energy, uncertain manifestation'
  },
  hercle: {
    id: 'hercle',
    name: 'Hercle',
    etruscanScript: '𐌇𐌄𐌓𐌂',
    romanEquivalent: 'Hercules', 
    domain: 'Heroic Protection',
    description: 'Hero-protector, divine strength and protection.',
    divinationMeaning: 'Heroic intervention, protective strength, noble courage'
  },
  metlvmth: {
    id: 'metlvmth',
    name: 'Metlvmth',
    etruscanScript: '𐌌𐌄𐌕𐌋𐌖𐌌𐌚',
    domain: 'Epithet/Attribute',
    description: 'Epithet or attribute associated with Lethams.',
    divinationMeaning: 'Enhanced local protection, strengthened genius'
  },
  marutl: {
    id: 'marutl',
    name: 'Marutl',
    etruscanScript: '𐌌𐌀𐌓𐌖𐌕𐌋',
    domain: 'Epithet/Attribute',
    description: 'Double epithet associated with Tluscva.',
    divinationMeaning: 'Enhanced water nymph power, sacred ritual strength'
  },
  lethams: {
    id: 'lethams',
    name: 'Lethams',
    etruscanScript: '𐌋𐌄𐌚𐌀𐌌',
    domain: 'Local Spirit',
    description: 'Local tutelary spirit, genius of place.',
    divinationMeaning: 'Local divine protection, genius loci, territorial blessing'
  },
  velch: {
    id: 'velch',
    name: 'Velch',
    etruscanScript: '𐌅𐌄𐌋𐌒',
    romanEquivalent: 'Vulcan',
    domain: 'Fire, Underworld',
    description: 'Infernal form of Sethlans (Vulcan), fire deity.',
    divinationMeaning: 'Infernal fire, transformative power, underworld craftsmanship'
  },
  satres: {
    id: 'satres',
    name: 'Satres',
    etruscanScript: '𐌔𐌀𐌕𐌓𐌄𐌔',
    romanEquivalent: 'Saturn',
    domain: 'Underworld, Time',
    description: 'God of the underworld and temporal cycles.',
    divinationMeaning: 'Temporal boundaries, underworld authority, cyclical time'
  },
  usil: {
    id: 'usil',
    name: 'Usil',
    etruscanScript: '𐌖𐌔𐌉𐌋',
    domain: 'Sun',
    description: 'The sun god, representing solar power and illumination.',
    divinationMeaning: 'Solar cycles, illumination, divine light'
  },
  tiur: {
    id: 'tiur',
    name: 'Tiur',
    etruscanScript: '𐌕𐌉𐌖𐌓',
    domain: 'Moon',
    description: 'The moon god, representing lunar cycles and night illumination.',
    divinationMeaning: 'Lunar cycles, nocturnal wisdom, cyclical time'
  }
}

// INSCRIPTIONS: All 40 liver sections with their gods and relationships
export const liverInscriptions = [
  // SKY GROUP (1-4) - Outer rim top
  {
    id: 1,
    groupId: 'sky',
    etruscanText: '𐌕𐌉𐌍 / 𐌂𐌉𐌋 / 𐌄𐌍', 
    gods: ['tinia', 'cilens'],
    relationship: 'Region shared by Tinia, father of the gods, and Cilens, god of the night',
    divinationMeaning: 'Divine authority governing both day and night realms'
  },
  {
    id: 2,
    groupId: 'sky',
    etruscanText: '𐌕𐌉𐌍 / 𐌚𐌖𐌐',
    gods: ['tinia', 'thufltha'],
    relationship: 'Tinia flanked by Thufltha, goddess of fate',
    divinationMeaning: 'Divine authority guided by fate and oracular wisdom'
  },
  {
    id: 3,
    groupId: 'sky', 
    etruscanText: '𐌕𐌉𐌍𐌔𐌕 / 𐌍𐌄𐌕',
    gods: ['tinia', 'nethuns'],
    relationship: 'Region dedicated to Nethuns in the (house) of Tinia',
    divinationMeaning: 'Water powers operating under divine celestial authority'
  },
  {
    id: 4,
    groupId: 'sky',
    etruscanText: '𐌖𐌍𐌉 / 𐌌𐌀𐌄',
    gods: ['uni', 'mae'],
    relationship: 'Uni with possible maternal/generative attribute Mae',
    divinationMeaning: 'Divine feminine power, marriage and maternal protection'
  },

  // WATER GROUP (5-8) - Right side moving down
  {
    id: 5,
    groupId: 'water',
    etruscanText: '𐌕𐌄𐌂 / 𐌖𐌌',
    gods: ['tecvm'],
    relationship: 'Tece Sans, "Father"',
    divinationMeaning: 'Ancestral water protection and paternal guidance'
  },
  {
    id: 6,
    groupId: 'water',
    etruscanText: '𐌋𐌖𐌔𐌋',
    gods: ['lusal'],
    relationship: 'Probably Lusa',
    divinationMeaning: 'Mysterious water forces and purification'
  },
  {
    id: 7,
    groupId: 'water',
    etruscanText: '𐌍𐌄𐌕',
    gods: ['nethuns'],
    relationship: 'Primary water deity in his own domain',
    divinationMeaning: 'Direct water omens, sea/freshwater balance'
  },
  {
    id: 8,
    groupId: 'water',
    etruscanText: '𐌂𐌀𐌚',
    gods: ['catha'],
    relationship: 'Solar goddess in water context (solar-nymph form)',
    divinationMeaning: 'Solar reflection in water, light-water interaction'
  },

  // EARTH GROUP (9-12) - Bottom right to bottom left
  {
    id: 9,
    groupId: 'earth',
    etruscanText: '𐌅𐌖𐌅𐌋𐌖 / 𐌍𐌔',
    gods: ['fufluns'],
    relationship: 'Vegetation deity in earth domain',
    divinationMeaning: 'Earth fertility, vegetation cycles, wine harvest'
  },
  {
    id: 10,
    groupId: 'earth',
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    gods: ['selvans'],
    relationship: 'Forest boundary guardian in earth realm',
    divinationMeaning: 'Forest boundaries, territorial limits, wild spaces'
  },
  {
    id: 11,
    groupId: 'earth',
    etruscanText: '𐌋𐌄𐌚𐌍𐌔',
    gods: ['lethns'],
    relationship: 'Local earth spirit/genius',
    divinationMeaning: 'Local earth protection, genius loci, memory of place'
  },
  {
    id: 12,
    groupId: 'earth',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂𐌖',
    gods: ['tluscva'],
    relationship: 'Water nymphs in earth context (springs, sacred groves)',
    divinationMeaning: 'Sacred water sources, spring protection, ritual purity'
  },

  // UNDERWORLD GROUP (13-16) - Left side
  {
    id: 13,
    groupId: 'underworld',
    etruscanText: '𐌂𐌄𐌋𐌔',
    gods: ['cels'],
    relationship: 'Earth goddess in underworld domain',
    divinationMeaning: 'Chthonic earth power, foundational stability'
  },
  {
    id: 14,
    groupId: 'underworld',
    etruscanText: '𐌂𐌖𐌋𐌀𐌋𐌐',
    gods: ['culsans', 'alpans'],
    relationship: 'Culsans (Janus) paired with protective spirit Alpans',
    divinationMeaning: 'Threshold protection enhanced by benevolent spirits'
  },
  {
    id: 15,
    groupId: 'underworld',
    etruscanText: '𐌅𐌄𐌕𐌉𐌔𐌋',
    gods: ['vetlsi'],
    relationship: 'Underworld "Apollo" as solitary chthonic light',
    divinationMeaning: 'Underworld illumination, dark prophecy, chthonic wisdom'
  },
  {
    id: 16,
    groupId: 'underworld',
    etruscanText: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋',
    gods: ['cilens'],
    relationship: 'Night god in underworld context',
    divinationMeaning: 'Underworld night passages, soul guidance'
  },

  // PARS FAMILIARIS GROUP (17-24) - Red regions
  {
    id: 17,
    groupId: 'pars_familiaris',
    etruscanText: '𐌐𐌖𐌋',
    gods: ['pul'],
    relationship: 'Uncertain deity in favorable realm',
    divinationMeaning: 'Uncertain but favorable divine presence'
  },
  {
    id: 18,
    groupId: 'pars_familiaris',
    etruscanText: '𐌋𐌄𐌚𐌍',
    gods: ['lethns'],
    relationship: 'Local spirit in familiar context',
    divinationMeaning: 'Familiar local protection, household genius'
  },
  {
    id: 19,
    groupId: 'pars_familiaris',
    etruscanText: '𐌋𐌀 / 𐌔𐌋',
    gods: ['lasl'],
    relationship: 'Household female spirit',
    divinationMeaning: 'Domestic harmony, household divine protection'
  },
  {
    id: 20,
    groupId: 'pars_familiaris',
    etruscanText: '𐌕𐌉𐌍𐌔 / 𐌚𐌖𐌐',
    gods: ['tinia', 'thufltha'],
    relationship: 'Tinia under Thufltha\'s protection',
    divinationMeaning: 'Divine authority guided by protective fate'
  },
  {
    id: 21,
    groupId: 'pars_familiaris',
    etruscanText: '𐌚𐌖𐌐𐌋 / 𐌚𐌀𐌔',
    gods: ['thufltha'],
    relationship: 'Fate goddess as solitary favorable force',
    divinationMeaning: 'Favorable fate, healing protection, oracular guidance'
  },
  {
    id: 22,
    groupId: 'pars_familiaris',
    etruscanText: '𐌕𐌉𐌍𐌔𐌚 / 𐌍𐌄𐌚',
    gods: ['tinia', 'nethuns'],
    relationship: 'Nethuns in Tinia\'s house - atmospheric humidity',
    divinationMeaning: 'Favorable water omens under divine protection'
  },
  {
    id: 23,
    groupId: 'pars_familiaris',
    etruscanText: '𐌂𐌀𐌈𐌀',
    gods: ['catha'],
    relationship: 'Dea del Sole',
    divinationMeaning: 'Favorable solar transitions and illumination'
  },
  {
    id: 24,
    groupId: 'pars_familiaris',
    etruscanText: '𐌅𐌖𐌅 / 𐌋𐌖𐌔',
    gods: ['fufluns'],
    relationship: 'Fufluns',
    divinationMeaning: 'Favorable fertility and vegetation cycles'
  },

  // GALL BLADDER GROUP (25-28) - Blue-green regions
  {
    id: 25,
    groupId: 'gall_bladder',
    etruscanText: '𐌕𐌖𐌍𐌚',
    gods: ['tvnth'],
    relationship: 'Uncertain deity in concentrated energy zone',
    divinationMeaning: 'Concentrated unknown force, powerful uncertainty'
  },
  {
    id: 26,
    groupId: 'gall_bladder',
    etruscanText: '𐌌𐌀𐌓𐌉𐌔𐌋 / 𐌋𐌀𐌚',
    gods: ['maris', 'laran'],
    relationship: 'Maris (generative force) paired with Laran (war & fire)',
    divinationMeaning: 'Creative force combined with martial energy'
  },
  {
    id: 27,
    groupId: 'gall_bladder',
    etruscanText: '𐌋𐌄𐌕𐌀',
    gods: ['letams'],
    relationship: 'Local spirit in concentrated form',
    divinationMeaning: 'Intensified local protection, concentrated genius'
  },
  {
    id: 28,
    groupId: 'gall_bladder',
    etruscanText: '𐌍𐌄𐌚',
    gods: ['nethuns'],
    relationship: 'Water god in concentrated energy context',
    divinationMeaning: 'Concentrated water power, intense purification'
  },

  // CENTRAL SECTION GROUP (29-32) - Yellow regions
  {
    id: 29,
    groupId: 'central_section',
    etruscanText: '𐌇𐌄𐌓𐌂',
    gods: ['hercle'],
    relationship: 'Hero-protector at cosmic center',
    divinationMeaning: 'Central heroic protection, cosmic balance guardian'
  },
  {
    id: 30,
    groupId: 'central_section',
    etruscanText: '𐌌𐌀𐌓',
    gods: ['maris'],
    relationship: 'Generating power of all the gods at center',
    divinationMeaning: 'Central generative force, divine creative power'
  },
  {
    id: 31,
    groupId: 'central_section',
    etruscanText: '𐌋𐌄𐌚𐌀𐌌𐌔𐌋 𐌌𐌄𐌕𐌋𐌖𐌌𐌕',
    gods: ['lethams', 'metlvmth'],
    relationship: 'Local tutelary spirit with epithet enhancement',
    divinationMeaning: 'Enhanced central protection, strengthened genius'
  },
  {
    id: 32,
    groupId: 'central_section',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂𐌀𐌋 𐌌𐌀𐌓𐌖𐌕𐌋',
    gods: ['tluscva', 'marutl'],
    relationship: 'Water nymphs with double epithet at center',
    divinationMeaning: 'Central water sanctity, enhanced nymph protection'
  },

  // PARS HOSTILIS GROUP (33-38) - Central purple region
  {
    id: 33,
    groupId: 'pars_hostilis',
    etruscanText: '𐌔𐌄𐌋𐌅𐌀',
    gods: ['selvans'],
    relationship: 'Border god in hostile realm',
    divinationMeaning: 'Hostile boundary challenges, territorial conflicts'
  },
  {
    id: 34,
    groupId: 'pars_hostilis',
    etruscanText: '𐌋𐌄𐌚𐌀𐌌𐌔𐌋',
    gods: ['lethams'],
    relationship: 'Local spirit in unfavorable context',
    divinationMeaning: 'Challenged local protection, tested genius'
  },
  {
    id: 35,
    groupId: 'pars_hostilis',
    etruscanText: '𐌕𐌋𐌖𐌔𐌂',
    gods: ['tluscva'],
    relationship: 'Water nymphs in hostile realm',
    divinationMeaning: 'Threatened water sources, challenged purity'
  },
  {
    id: 36,
    groupId: 'pars_hostilis',
    etruscanText: '𐌋𐌖𐌔𐌋 𐌅𐌄𐌋𐌒',
    gods: ['lusal', 'velch'],
    relationship: 'Lusal paired with infernal Vulcan (Velchans)',
    divinationMeaning: 'Mysterious forces combined with underworld fire'
  },
  {
    id: 37,
    groupId: 'pars_hostilis',
    etruscanText: '𐌔𐌀𐌕𐌓𐌄𐌔',
    gods: ['satres'],
    relationship: 'Underworld Saturn in hostile context',
    divinationMeaning: 'Temporal boundaries, restrictive cycles, limitation'
  },
  {
    id: 38,
    groupId: 'pars_hostilis',
    etruscanText: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋',
    gods: ['cilens'],
    relationship: 'Night god in hostile realm',
    divinationMeaning: 'Difficult passages, challenging transitions'
  },

  // RETRO GROUP (39-40) - Left outer rim
  {
    id: 39,
    groupId: 'retro',
    etruscanText: '𐌖𐌔𐌉𐌋𐌔',
    gods: ['usil'],
    relationship: 'The Sun as cosmic foundation',
    divinationMeaning: 'Solar foundation, fundamental day cycle'
  },
  {
    id: 40,
    groupId: 'retro',
    etruscanText: '𐌕𐌉𐌖𐌔',
    gods: ['tiur'],
    relationship: 'The Moon as cosmic foundation',
    divinationMeaning: 'Lunar foundation, fundamental night cycle'
  }
] 