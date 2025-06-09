import * as THREE from 'three'

// ================================================================================================
// PIACENZA LIVER SECTION DATA - SCHOLARLY IMPLEMENTATION
// ================================================================================================
// 
// Based on primary scholarly sources: "Cosmogonica" and "Padanu" 
// Implementing Maggiani-Gottarelli cosmological framework with authentic Etruscan inscriptions
//
// REPEATED DEITIES (indicating ritual primacy):
// - Tluschva: 3 occurrences (Sections 12, 33, 40) - Central ritual importance
// - Maris: 3 occurrences (Sections 26, 30, 39) - Cyclical youth/renewal themes  
// - Selvans: 2 occurrences (Sections 10, 31) - Boundary guardian functions
// - Fufluns: 2 occurrences (Sections 9, 24) - Vegetation/rebirth duality
// - Nethuns: 2 occurrences (Sections 7, 28) - Fresh/salt water bridge
// - Catha: 2 occurrences (Sections 8, 23) - Solar/lunar transitions
// - Cilens variants: 2 occurrences (Sections 16, 36) - Psychopomp specialization
//
// DEBATED IDENTITIES (scholarly ambiguity noted):
// - Tinia θuf vs Tins Thuneθ: Treated as epithets of Tinia, though some scholars 
//   consider them functionally distinct manifestations
// - Letha/Leta/Lethns/Lethans/Letham: May represent functions rather than individual deities
//
// UNCERTAIN DEITIES (speculative attributions):
// - Tecvm (Section 5): Only attested on Piacenza Liver, no broader evidence
// - Lusal (Section 6): Indo-European *leuk- speculation, limited attestation
// - Lethns (Section 11): Variant form, possibly related to underworld functions
// - Vetisl (Section 15): Unique to Piacenza Liver, specialized divinatory function
//
// COSMOLOGICAL STRUCTURE:
// Groups A-G represent distinct cosmological zones encoding solar calendar, 
// chthonic containers, liminal guardianship, and cardinal templum orientation
// ================================================================================================

// Piacenza Liver section data - merging original positions with enhanced YAML data
// Authentic Etruscan inscriptions with proper deity information where available

export const liverSections = [
  // Section 1: Tinia (Jupiter) - Supreme sky deity (enhanced from YAML)
  {
    id: 1,
    position: new THREE.Vector3(0.8, 0.1, 0.6),
    name: '𐌕𐌉𐌍 / 𐌂𐌉𐌋𐌄𐌍',
    deity_name: 'Tinia',
    roman_equivalent: 'Jupiter',
    greek_equivalent: 'Zeus',
    section_type: 'sky',
    short_description: 'Supreme sky deity in Etruscan pantheon.',
    long_description: 'Tinia, the supreme sky god of the Etruscans, is often identified with the Roman Jupiter and the Greek Zeus. As the chief deity, Tinia holds dominion over the celestial domain, thunder, and divine will. The positioning of Tinia\'s name in the most prominent section of the liver model aligns with his overarching authority within the pantheon.',
    divination_meaning: 'Represents favorable signs from the upper heavens; linked to authority and cosmic order.',
    hepatoscopy: 'Located in the outermost ring; associated with the timing of important astronomical events.',
    ritual_associations: 'Linked with rites of state and solar calendrical festivals.',
    archaeological_notes: 'Found in sector 1 of the outer ring on the Piacenza Liver; matches other appearances of Tinia in Etruscan votive artifacts.'
  },

  // Section 2: Tinia variant (enhanced from YAML)
  {
    id: 2,
    position: new THREE.Vector3(0.9, 0.1, 0.2),
    name: '𐌕𐌉𐌍 / 𐌚𐌖𐌅',
    deity_name: 'Tinia',
    roman_equivalent: 'Jupiter',
    greek_equivalent: 'Zeus',
    section_type: 'sky',
    short_description: 'Supreme sky deity in Etruscan pantheon.',
    long_description: 'Tinia, the supreme sky god of the Etruscans, is often identified with the Roman Jupiter and the Greek Zeus. As the chief deity, Tinia holds dominion over the celestial domain, thunder, and divine will. This inscription variant may emphasize different epithets or ritual aspects.',
    divination_meaning: 'Represents favorable signs from the upper heavens; linked to authority and cosmic order.',
    archaeological_notes: 'Variant inscription of Tinia found in sector 2.'
  },

  // Section 3: Tinia variant (enhanced from YAML)
  {
    id: 3,
    position: new THREE.Vector3(0.8, 0.1, -0.2),
    name: '𐌕𐌉𐌍𐌔 / 𐌚𐌍𐌄',
    deity_name: 'Tinia',
    roman_equivalent: 'Jupiter',
    greek_equivalent: 'Zeus',
    section_type: 'sky',
    short_description: 'Supreme sky deity in Etruscan pantheon.',
    long_description: 'Tinia, the supreme sky god of the Etruscans, is often identified with the Roman Jupiter and the Greek Zeus. As the chief deity, Tinia holds dominion over the celestial domain, thunder, and divine will. This inscription variant may represent a sacred or ritualistic aspect.',
    divination_meaning: 'Represents favorable signs from the upper heavens; linked to authority and cosmic order.',
    archaeological_notes: 'Sacred variant inscription of Tinia found in sector 3.'
  },

  // Section 4: Uni (Juno) - Principal goddess (enhanced from YAML)
  {
    id: 4,
    position: new THREE.Vector3(0.6, 0.1, -0.6),
    name: '𐌖𐌍𐌉 / 𐌌𐌀𐌄',
    deity_name: 'Uni',
    roman_equivalent: 'Juno',
    greek_equivalent: 'Hera',
    section_type: 'sky',
    short_description: 'Principal goddess and consort of Tinia.',
    long_description: 'Uni, often aligned with the Roman Juno and the Greek Hera, is the consort of Tinia and presides over marriage, fertility, and social harmony. In Etruscan religion, Uni also held a strong civic role, often appearing in triads alongside Tinia and Menrva. The epithet /mae possibly indicates a maternal or generative attribute.',
    divination_meaning: 'Omens related to protection of the community, fertility, and civic stability.',
    archaeological_notes: 'Associated with inscriptions in sanctuaries and votive deposits, especially in Volsinii and Gravisca.'
  },

  // Section 5: Tecvm - Underworld deity (UNCERTAIN ATTRIBUTION)
  {
    id: 5,
    position: new THREE.Vector3(0.2, 0.1, -0.9),
    name: '𐌕𐌄𐌂 / 𐌖𐌌',
    deity_name: 'Tecvm',
    section_type: 'infernal',
    short_description: 'Possibly an underworld deity [SPECULATIVE]',
    long_description: 'The deity Tecvm is attested only on the Piacenza Liver and has not been securely identified in other Etruscan sources. Its position among other deities of the infernal sphere suggests a chthonic role, possibly connected with ancestral or liminal functions in the cosmological mapping. [UNCERTAIN: No corroborating evidence outside this artifact]',
    archaeological_notes: 'Only known occurrence on the Piacenza Liver. Attribution remains speculative.'
  },

  // Section 6: Lusal - Celestial deity (UNCERTAIN ATTRIBUTION)  
  {
    id: 6,
    position: new THREE.Vector3(-0.2, 0.1, -0.9),
    name: '𐌋𐌖𐌔𐌋',
    deity_name: 'Lusal',
    section_type: 'sky',
    short_description: 'Possibly a celestial deity [SPECULATIVE]',
    long_description: 'Lusal appears in several inscriptions, possibly connected to celestial or luminous forces. Some scholars propose a link to the Indo-European root *leuk-, suggesting brightness. The position in the outer ring may support a reading connected with solar or astral observation. [UNCERTAIN: Indo-European etymology is speculative]',
    archaeological_notes: 'Attested also in votive contexts near Chiusi. Limited evidence for specific functions.'
  },

  // Section 7: Nethuns (Neptune) - Water deity (enhanced from YAML)
  {
    id: 7,
    position: new THREE.Vector3(-0.6, 0.1, -0.6),
    name: '𐌍𐌄𐌚',
    deity_name: 'Neθuns',
    roman_equivalent: 'Neptune',
    greek_equivalent: 'Poseidon',
    section_type: 'aquatic',
    short_description: 'Etruscan god of water and the sea.',
    long_description: 'Neθuns, appearing here as neθ, is the Etruscan god of fresh water, springs, and possibly the sea. He later corresponds to Neptune in the Roman pantheon and Poseidon in the Greek. While his marine functions were emphasized in Roman religion, Etruscan tradition appears to root him more firmly in sources of fresh and sacred water.',
    divination_meaning: 'Omens related to water, rain, floods, or purification.',
    archaeological_notes: 'Inscriptions found in Tarquinia and on votive altars.'
  },

  // Section 8: Catha - Solar/Lunar deity (enhanced from YAML)
  {
    id: 8,
    position: new THREE.Vector3(-0.8, 0.1, -0.2),
    name: '𐌂𐌀𐌚',
    deity_name: 'Catha',
    section_type: 'celestial',
    short_description: 'Liminal solar or lunar deity.',
    long_description: 'Catha is a mysterious figure in the Etruscan pantheon often interpreted as a solar or lunar deity associated with liminal phases like dawn or dusk. Frequently paired with Śuri in depictions and inscriptions, Catha symbolizes transitional illumination—important in divinatory contexts for signaling change or thresholds.',
    divination_meaning: 'Sign of transitions, thresholds, or changes in cycle.',
    archaeological_notes: 'Mentioned in votive texts from Pyrgi and associated with solar cult contexts.'
  },

  // Section 9: Fufluns - Enhanced with scholarly data (FIRST OF 2 OCCURRENCES)
  {
    id: 9,
    position: new THREE.Vector3(-0.9, 0.1, 0.2),
    name: '𐌅𐌖𐌅𐌋𐌖 / 𐌍𐌔',
    deity_name: 'Fufluns',
    roman_equivalent: 'Bacchus',
    greek_equivalent: 'Dionysus',
    section_type: 'chthonic/vital',
    short_description: 'God of vegetation, rebirth, and ecstatic rites [FIRST OF 2 OCCURRENCES]',
    long_description: 'Fufluns is the Etruscan equivalent of Dionysus, though his attributes also include rebirth, healing, and vegetation. His cult appears associated with vital force and regenerative power, including chthonic dimensions like return from death or fertility of the earth. [CROSS-REF: Also appears in Section 24 - vegetation/rebirth duality]',
    divination_meaning: 'Omens of renewal, fertility, or ecstatic transformation.',
    archaeological_notes: 'Widely represented in tomb paintings, bronze mirrors, and votive gifts.'
  },

  // Entries 10-16: Outer ring inscriptions (Updated to match scholarly format)
  {
    id: 10,
    position: new THREE.Vector3(-0.8, 0.1, 0.6),
    name: '𐌔𐌄𐌋𐌅𐌀',
    deity_name: 'Selvans',
    roman_equivalent: 'Silvanus',
    section_type: 'forest_boundary',
    short_description: 'Forest deity governing boundaries',
    long_description: 'Selvans is the forest deity, equivalent to the Roman Silvanus, governing boundaries between wild and civilized spaces. As guardian of forests and sacred groves, Selvans oversees the liminal spaces where divine and human worlds intersect.',
    divination_meaning: 'Forest boundaries, wild spaces, and natural transitions.',
    archaeological_notes: 'Widely attested in Etruscan inscriptions, especially at boundaries and sacred groves.'
  },
  {
    id: 11,
    position: new THREE.Vector3(-0.6, 0.1, 0.8),
    name: '𐌋𐌄𐌚𐌍𐌔',
    deity_name: 'Lethns',
    section_type: 'underworld_transition',
    short_description: 'Deity of underworld transitions',
    long_description: 'Lethns appears to be related to liminal states and underworld transitions, possibly connected to Lethe-like functions of memory and forgetfulness in death passage.',
    divination_meaning: 'Underworld transitions, memory passages, and liminal states.',
    archaeological_notes: 'Variant form appearing on the Piacenza Liver, likely related to underworld functions.'
  },
  {
    id: 12,
    position: new THREE.Vector3(-0.2, 0.1, 0.9),
    name: '𐌕𐌋𐌖𐌔𐌂𐌖',
    deity_name: 'Tluschva',
    section_type: 'ritual_sacred',
    short_description: 'Ritual deity of sacred offerings [FIRST OF 3 OCCURRENCES]',
    long_description: 'Tluschva is a ritual deity associated with sacred offerings and ceremonial space. This deity appears three times on the liver (Sections 12, 33, 40), emphasizing central importance in ritual practice and cyclical function.',
    divination_meaning: 'Sacred offerings, ritual space, and ceremonial divine presence.',
    archaeological_notes: 'Multiple appearances on the Piacenza Liver suggest central ritual importance.'
  },
  {
    id: 13,
    position: new THREE.Vector3(0.2, 0.1, 0.9),
    name: '𐌂𐌄𐌋𐌔',
    deity_name: 'Cels',
    section_type: 'earth_underworld',
    short_description: 'Earth or underworld deity',
    long_description: 'Cels is possibly an earth or underworld deity, governing chthonic forces and terrestrial divine power. The positioning suggests roles in grounding cosmic forces.',
    divination_meaning: 'Earth forces, chthonic power, and terrestrial divine influence.',
    archaeological_notes: 'Appears in the outer ring configuration, suggesting foundational cosmic role.'
  },
  {
    id: 14,
    position: new THREE.Vector3(0.6, 0.1, 0.8),
    name: '𐌂𐌖𐌋𐌀𐌋𐌐',
    deity_name: 'Culalp',
    section_type: 'protective_liminal',
    short_description: 'Protective deity of boundaries',
    long_description: 'Culalp appears to be a protective deity associated with boundaries and liminal spaces, possibly related to the Culsu deity family of protective spirits.',
    divination_meaning: 'Boundary protection, liminal guardianship, and protective divine intervention.',
    archaeological_notes: 'Possibly related to Culsu protective deity traditions in Etruscan religion.'
  },
  {
    id: 15,
    position: new THREE.Vector3(0.7, 0.1, 0.7),
    name: '𐌅𐌄𐌕𐌉𐌔𐌋',
    deity_name: 'Vetisl',
    section_type: 'transitional',
    short_description: 'Deity of transitions and change',
    long_description: 'Vetisl appears to be a deity governing transitions and change, positioned to oversee transformational processes within the cosmic framework.',
    divination_meaning: 'Transitions, change processes, and transformational divine guidance.',
    archaeological_notes: 'Unique to the Piacenza Liver, suggesting specialized divinatory function.'
  },
  {
    id: 16,
    position: new THREE.Vector3(0.75, 0.1, 0.4),
    name: '𐌂𐌉𐌋𐌄𐌍𐌔𐌋',
    deity_name: 'Cilensl',
    section_type: 'psychopomp_variant',
    short_description: 'Variant form of Cilens, psychopomp deity',
    long_description: 'Cilensl appears to be a variant form of Cilens, the psychopomp deity who guides souls between worlds. This extended form may indicate specific ritual or regional variation.',
    divination_meaning: 'Soul guidance, death transitions, and psychopomp functions.',
    archaeological_notes: 'Variant form of Cilens, suggesting regional or ritual specialization in psychopomp functions.'
  },

  // GROUP A - Rectangular "Table" of 8 Names (Sectors 17-24) - Solar and agricultural cycle
  {
    id: 17,
    position: new THREE.Vector3(0.5, 0.1, 0.4),
    name: '𐌐𐌖𐌋',
    deity_name: 'Pūl',
    section_type: 'solar_agricultural',
    group: 'Group A - Rectangular Table',
    short_description: 'Purification or ritual gatekeeping deity',
    long_description: 'Pūl (or Pulu) is possibly related to purification or ritual gatekeeping. Located in the rectangular "table" between the processus pyramidalis and vesica fellea on the right lobe, associated with the solar and agricultural cycle.',
    divination_meaning: 'Purification rites, ritual boundaries, and ceremonial gatekeeping.',
    archaeological_notes: 'Part of the 8-name rectangular table encoding core deities of the vegetative calendar, spring to autumn.'
  },
  {
    id: 18,
    position: new THREE.Vector3(0.6, 0.1, 0.0),
    name: '𐌋𐌄𐌚𐌍',
    deity_name: 'Lethans',
    section_type: 'chthonic',
    group: 'Group A - Rectangular Table',
    short_description: 'Chthonic or death-related deity',
    long_description: 'Lethans is a chthonic or death-related deity, implying boundary or seasonal liminality. This positioning suggests roles in seasonal transitions and underworld access.',
    divination_meaning: 'Seasonal boundaries, death transitions, and liminal states.',
    archaeological_notes: 'Part of the core vegetative calendar deities, emphasizing divine recurrence and temporal boundaries.'
  },
  {
    id: 19,
    position: new THREE.Vector3(0.4, 0.1, 0.2),
    name: '𐌋�� / 𐌔𐌋',
    deity_name: 'Lasa',
    section_type: 'protective',
    group: 'Group A - Rectangular Table',
    short_description: 'Minor protective deity linked to fate and transition',
    long_description: 'Lasa is a minor protective deity, often female, linked to fate and transition. These deities served as guardians of important life passages and cosmic boundaries.',
    divination_meaning: 'Protection during transitions, fate guidance, and feminine divine intervention.',
    archaeological_notes: 'Female protective spirits commonly found in Etruscan tomb paintings and mirrors, emphasizing transitional protection.'
  },
  {
    id: 20,
    position: new THREE.Vector3(0.3, 0.1, -0.4),
         name: '𐌕𐌉𐌍𐌔 / 𐌚𐌖𐌅',
     deity_name: 'Tinia θuf',
     roman_equivalent: 'Jupiter Tonans',
     section_type: 'thunderous',
     group: 'Group A - Rectangular Table',
     short_description: 'Tinia in thunderous aspect, powerful temporal force [DEBATED: Epithet vs distinct deity]',
     long_description: 'Tinia θuf represents Tinia in a thunderous aspect, a powerful temporal force governing storm cycles and divine temporal interventions. [SCHOLARLY DEBATE: Some scholars interpret θuf as a distinct functional manifestation rather than mere epithet]',
    divination_meaning: 'Thunder omens, divine temporal interventions, and powerful celestial manifestations.',
    archaeological_notes: 'Reinforces sky/fate function alongside other Tinia epithets in the rectangular table configuration.'
  },
  {
    id: 21,
    position: new THREE.Vector3(0.1, 0.1, -0.6),
    name: '𐌚𐌖𐌅𐌋 / 𐌚𐌀𐌔',
    deity_name: 'Thuflthaš',
    section_type: 'atmospheric',
    group: 'Group A - Rectangular Table',
    short_description: 'Deity linked to wind or storms',
    long_description: 'Thuflthaš is possibly a deity linked to wind or storms, supporting the thunder cycle and atmospheric divine forces within the vegetative calendar.',
    divination_meaning: 'Wind omens, storm patterns, and atmospheric divine interventions.',
    archaeological_notes: 'Supports the thunder cycle within the core deities of the vegetative calendar.'
  },
  {
    id: 22,
    position: new THREE.Vector3(-0.1, 0.1, -0.5),
         name: '𐌕𐌉𐌍𐌔𐌚 / 𐌍𐌄𐌚',
     deity_name: 'Tins Thuneθ',
     roman_equivalent: 'Jupiter',
     section_type: 'sky_fate',
     group: 'Group A - Rectangular Table',
     short_description: 'Another Tinia epithet reinforcing sky/fate function [DEBATED: Functional distinction unclear]',
     long_description: 'Tins Thuneθ represents another epithet of Tinia, reinforcing the sky/fate function and divine temporal authority within the rectangular table of agricultural deities. [SCHOLARLY DEBATE: Relationship to Tinia θuf and degree of functional distinction remains disputed]',
    divination_meaning: 'Divine fate determination, sky omens, and temporal divine authority.',
    archaeological_notes: 'Multiple Tinia epithets in the rectangular table emphasize the role of divine recurrence in the vegetative cycle.'
  },
  {
    id: 23,
    position: new THREE.Vector3(-0.3, 0.1, -0.3),
    name: '𐌂𐌀𐌚𐌀',
    deity_name: 'Catha',
    section_type: 'lunar_underworld',
    group: 'Group A - Rectangular Table',
    short_description: 'Moon or underworld goddess',
    long_description: 'Catha, likely the full form of Caθ, represents the moon or underworld goddess. This positioning emphasizes lunar cycles within the agricultural and seasonal framework.',
    divination_meaning: 'Lunar cycles, underworld access, and nocturnal divine forces.',
    archaeological_notes: 'Full form of the moon deity also appearing in the outer ring, emphasizing cyclical lunar importance.'
  },
  {
    id: 24,
    position: new THREE.Vector3(-0.5, 0.1, -0.1),
    name: '𐌅𐌖𐌅𐌋 / 𐌋𐌖𐌔',
    deity_name: 'Fufluns',
    roman_equivalent: 'Bacchus',
    greek_equivalent: 'Dionysus',
    section_type: 'vegetation_rebirth',
    group: 'Group A - Rectangular Table',
    short_description: 'Deity of rebirth and vegetation',
    long_description: 'Fufluns, deity of rebirth and vegetation (Dionysian type), appears both in the outer ring and rectangular table, emphasizing the central role of vegetation cycles and divine rebirth in the temporal framework.',
    divination_meaning: 'Vegetation cycles, rebirth omens, and renewal of life force.',
    archaeological_notes: 'Repetition across multiple clusters shows ritual centrality and cyclical function in the vegetative calendar.'
  },

  // GROUP B - Vesica Fellea (Gallbladder) (Sectors 25-28) - Chthonic container, seasonal quarters
  {
    id: 25,
    position: new THREE.Vector3(-0.4, 0.1, 0.1),
    name: '𐌕𐌖𐌍𐌚',
    deity_name: 'Turanθ',
    roman_equivalent: 'Venus',
    section_type: 'love_life',
    group: 'Group B - Vesica Fellea',
    short_description: 'Love and life goddess (Venus-like)',
    long_description: 'Turanθ is possibly a form of Turan, the love and life goddess (Venus-like). Located in the vesica fellea (gallbladder), seen as a chthonic container of life and death transitions, reflecting seasonal quarters.',
    divination_meaning: 'Love omens, life force transitions, and seasonal renewal through relationships.',
    archaeological_notes: 'Part of the seasonal quarters marking transition points across solstices and equinoxes.'
  },
  {
    id: 26,
    position: new THREE.Vector3(-0.6, 0.1, 0.3),
    name: '𐌌𐌀𐌓𐌉𐌔𐌋 / 𐌋𐌀𐌚',
    deity_name: 'Maris Llaθ',
    section_type: 'youth_fertility',
    group: 'Group B - Vesica Fellea',
    short_description: 'Youth deity tied to fertility [FIRST OF 3 MARIS OCCURRENCES]',
    long_description: 'Maris Llaθ represents Maris, an Etruscan youth deity, a hero figure tied to fertility. This placement in the gallbladder emphasizes roles in rebirth and underworld navigation. [CROSS-REF: Maris also appears in Sections 30 and 39 - cyclical youth/renewal theme]',
    divination_meaning: 'Youth renewal, fertility cycles, and heroic transitions.',
    archaeological_notes: 'Hero figure emphasizing transition points in the seasonal calendar, with roles in rebirth and death navigation.'
  },
  {
    id: 27,
    position: new THREE.Vector3(-0.1, 0.1, 0.4),
    name: '𐌋𐌄𐌕𐌀',
    deity_name: 'Leta/Letha',
    section_type: 'liminal',
    group: 'Group B - Vesica Fellea',
    short_description: 'Deity of forgetfulness or border states',
    long_description: 'Leta or Letha is possibly Lethe-like, a deity of forgetfulness or border states. This positioning suggests roles in memory, transition, and liminal consciousness during seasonal changes.',
    divination_meaning: 'Memory transitions, border crossings, and liminal consciousness states.',
    archaeological_notes: 'Positioned to mark transition points across solstices and equinoxes within the chthonic container function.'
  },
  {
    id: 28,
    position: new THREE.Vector3(0.1, 0.1, 0.6),
    name: '𐌍𐌄𐌚',
    deity_name: 'Nethuns',
    roman_equivalent: 'Neptune',
    section_type: 'water',
    group: 'Group B - Vesica Fellea',
    short_description: 'Water deity as seasonal life-force',
    long_description: 'Nethuns appears multiple times as seasonal life-force, emphasizing the role of water in seasonal transitions and life-death cycles within the gallbladder\'s chthonic container function.',
    divination_meaning: 'Water omens, seasonal life-force, and cyclical renewal through aquatic divine power.',
    archaeological_notes: 'Multiple appearances emphasize water\'s central role in seasonal transitions and underworld navigation.'
  },

  // GROUP C - Bisection Near Vesica (Sectors 29-30) - Liminal guardianship
  {
    id: 29,
    position: new THREE.Vector3(0.4, 0.1, 0.3),
    name: '𐌇𐌄𐌓𐌂',
    deity_name: 'Hercle',
    roman_equivalent: 'Hercules',
    section_type: 'heroic_solar',
    group: 'Group C - Bisection Near Vesica',
    short_description: 'Strength, boundaries, and solar heroism',
    long_description: 'Hercle (Hercules) is associated with strength, boundaries, and sometimes solar heroism. This positioning reinforces liminal guardianship between life and underworld.',
    divination_meaning: 'Heroic strength, boundary protection, and solar guardian functions.',
    archaeological_notes: 'Reinforces the liminal guardianship role between life and underworld domains.'
  },
  {
    id: 30,
    position: new THREE.Vector3(0.2, 0.1, 0.3),
    name: '𐌌𐌀𐌓',
    deity_name: 'Maris',
    section_type: 'youth_solar',
    group: 'Group C - Bisection Near Vesica',
    short_description: 'Youth, solar rejuvenation, and transition',
    long_description: 'Maris appears again, emphasizing youth, solar rejuvenation, and transition. This repetition reinforces the liminal guardianship and cyclical renewal themes.',
    divination_meaning: 'Youth renewal, solar rejuvenation, and transitional energy.',
    archaeological_notes: 'Repetition emphasizes youth, solar rejuvenation, and transition within the liminal guardianship framework.'
  },

  // GROUP D - Radiant Wheel on Left Lobe (Sectors 31-36) - Six gates of solar year
  {
    id: 31,
    position: new THREE.Vector3(0.0, 0.1, 0.2),
    name: '𐌔𐌄𐌋𐌅𐌀',
    deity_name: 'Selvans',
    section_type: 'threshold_guardian',
    group: 'Group D - Radiant Wheel',
    short_description: 'Guardian deity of thresholds',
    long_description: 'Selvans is a guardian deity of thresholds, reinforcing ritual demarcation. Part of the "sun wheel" encoding the six gates of the solar year in Enochic/Templum pattern.',
    divination_meaning: 'Threshold crossings, ritual boundaries, and temporal gate guardianship.',
    archaeological_notes: 'Part of the six celestial gates or months in a cosmological timewheel configuration.'
  },
  {
    id: 32,
    position: new THREE.Vector3(-0.2, 0.1, 0.2),
    name: '𐌋𐌄𐌚𐌀',
    deity_name: 'Letha',
    section_type: 'underworld_access',
    group: 'Group D - Radiant Wheel',
    short_description: 'Feminine counterpart to Lethe',
    long_description: 'Letha is possibly the feminine counterpart to Lethe, echoing underworld access within the radiant wheel of solar gates.',
    divination_meaning: 'Underworld access, feminine liminal power, and memory transitions.',
    archaeological_notes: 'Guardian deity of one of the six celestial gates in the cosmological timewheel.'
  },
  {
    id: 33,
    position: new THREE.Vector3(-0.1, 0.1, 0.0),
    name: '𐌕𐌋𐌖𐌔𐌂',
    deity_name: 'Tluschva',
    section_type: 'ritual_sacred',
    group: 'Group D - Radiant Wheel',
    short_description: 'Ritual deity of offerings or sacred space [SECOND OF 3 OCCURRENCES]',
    long_description: 'Tluschva is a ritual deity associated with offerings or sacred space, serving as guardian of one of the six celestial gates in the solar timewheel. [CROSS-REF: Also appears in Sections 12 and 40]',
    divination_meaning: 'Sacred offerings, ritual space consecration, and ceremonial divine presence.',
    archaeological_notes: 'Appears multiple times, showing ritual centrality and cyclical function in the temporal framework.'
  },

  {
    id: 34,
    position: new THREE.Vector3(0.1, 0.1, -0.1),
    name: '𐌋𐌖𐌔𐌋 / 𐌅𐌄𐌋𐌒',
    deity_name: 'Usil/Velχ',
    section_type: 'solar_fire',
    group: 'Group D - Radiant Wheel',
    short_description: 'Solar deity linked with fire/sky force',
    long_description: 'Usil/Velχ represents the solar deity Usil, possibly linked with Velχan, a fire/sky force. Part of the radiant wheel encoding the six gates of the solar year.',
    divination_meaning: 'Solar illumination, fire divine force, and celestial gate guardianship.',
    archaeological_notes: 'Guardian deity of one of the six celestial gates in the cosmological timewheel, emphasizing solar and fire elements.'
  },
  {
    id: 35,
    position: new THREE.Vector3(0.3, 0.1, -0.1),
    name: '𐌔𐌀𐌕𐌓 / 𐌄𐌔',
    deity_name: 'Satres/Satre',
    section_type: 'temporal_order',
    group: 'Group D - Radiant Wheel',
    short_description: 'Sky deity related to order and time',
    long_description: 'Satres or Satre is a sky deity, possibly a Saturnus-like figure, related to order and time. Serves as guardian of one of the six celestial gates in the solar timewheel.',
    divination_meaning: 'Temporal order, cosmic structure, and divine time management.',
    archaeological_notes: 'Guardian deity emphasizing order and time within the six celestial gates framework.'
  },
  {
    id: 36,
    position: new THREE.Vector3(0.0, 0.1, -0.2),
    name: '𐌂𐌉𐌋𐌄𐌍',
    deity_name: 'Cilens',
    section_type: 'psychopomp',
    group: 'Group D - Radiant Wheel',
    short_description: 'Underworld deity, psychopomp like Charon',
    long_description: 'Cilens is an underworld deity, a psychopomp like Charon, also appearing on the outer ring. Completes the six guardian deities of the celestial gates in the cosmological timewheel.',
    divination_meaning: 'Soul guidance, underworld transitions, and death passage assistance.',
    archaeological_notes: 'Appears on both outer ring and radiant wheel, emphasizing psychopomp function across multiple cosmic levels.'
  },

  // GROUP E - Axial Crossroads (Sectors 37-38) - Cardinal axes
  {
    id: 37,
    position: new THREE.Vector3(0.1, 0.1, -0.1),
    name: '𐌋𐌄𐌚𐌀𐌌',
    deity_name: 'Letham',
    section_type: 'death_axis',
    group: 'Group E - Axial Crossroads',
    short_description: 'Death-time dimension axis',
    long_description: 'Letham is possibly a line or axis associated with death-time dimension. This positioning suggests definition of the north-south and east-west cardinal axes, forming the orientation grid of the model (the templum).',
    divination_meaning: 'Death-time axis, temporal dimension crossing, and cardinal orientation.',
    archaeological_notes: 'Defines cardinal axes and temporal orientation within the templum framework. Known only from this liver inscription.'
  },
  {
    id: 38,
    position: new THREE.Vector3(0.3, 0.1, -0.1),
    name: '𐌌𐌄𐌕𐌋𐌖𐌌𐌚',
    deity_name: 'Metlumθ',
    section_type: 'central_axis',
    group: 'Group E - Axial Crossroads',
    short_description: 'Mid-line or central axis deity',
    long_description: 'Metlumθ represents the "mid-line" or central axis, likely the ritual or spatial orientation axis. Together with Letham, these define the cardinal directions and templum framework.',
    divination_meaning: 'Central axis orientation, ritual spatial alignment, and cosmic center point.',
    archaeological_notes: 'Central axis deity defining the ritual and spatial orientation grid of the liver model templum.'
  },

  // GROUP F - Upper-Central Pair (Sectors 39-40) - Shared Casella
  {
    id: 39,
    position: new THREE.Vector3(0.2, 0.1, 0.1),
    name: '𐌌𐌀𐌓',
    deity_name: 'Maris',
    section_type: 'seasonal_youth',
    group: 'Group F - Upper-Central Pair',
    short_description: 'Seasonal onset or cyclic return',
    long_description: 'Maris appears again in the upper-central shared casella, may relate to seasonal onset or cyclic return. Forms a symbolic crowning pair linking youth (renewal) and ritual repetition.',
    divination_meaning: 'Seasonal onset, cyclic renewal, and youth divine energy.',
    archaeological_notes: 'Symbolic crowning pair emphasizing annual renewal and ritual repetition cycles.'
  },
  {
    id: 40,
    position: new THREE.Vector3(0.4, 0.1, 0.1),
    name: '𐌕𐌋𐌖𐌔𐌂',
    deity_name: 'Tluschva',
    section_type: 'ritual_repetition',
    group: 'Group F - Upper-Central Pair',
    short_description: 'Ritual deity emphasizing annual rites [THIRD OF 3 OCCURRENCES]',
    long_description: 'Tluschva reappears in the upper-central position, emphasizing annual rites and ritual repetition. May reinforce the temporal cycle and ceremonial continuity. [CROSS-REF: Also appears in Sections 12 and 33 - demonstrates ritual primacy]',
    divination_meaning: 'Annual ritual cycles, ceremonial repetition, and temporal ritual continuity.',
    archaeological_notes: 'Reappearance reinforces ritual centrality and cyclical function in the temporal framework.'
  },
  
  // GROUP G - Back Inscriptions (Directional and cosmological anchors)
  {
    id: 41,
    position: new THREE.Vector3(-0.7, -0.2, 0.0),
    name: '𐌕𐌉𐌅𐌔',
    deity_name: 'Tivs',
    section_type: 'lunar_nocturnal',
    group: 'Group G - Back Inscriptions',
    short_description: 'The Moon - marks the lunar side',
    long_description: 'Tivs represents the lunar aspect of Etruscan cosmology, positioned on the underside of the liver model. Marks the nocturnal/infernal side (left lobe) and represents the nighttime or hidden celestial realm.',
    divination_meaning: 'Lunar cycles, nocturnal divine forces, and hidden cosmic knowledge.',
    archaeological_notes: 'Directional and cosmological anchor marking the lunar/nocturnal side of the liver model. Found on the underside lobe.'
  },

  {
    id: 42,
    position: new THREE.Vector3(0.7, -0.2, 0.0),
    name: '𐌖𐌔𐌉𐌋𐌔',
    deity_name: 'Usils',
    section_type: 'solar_diurnal',
    group: 'Group G - Back Inscriptions',
    short_description: 'The Sun - marks the solar side',
    long_description: 'Usils represents the solar aspect of Etruscan cosmology, positioned on the underside of the liver model. Marks the diurnal/celestial side (right lobe) and represents the solar journey through the underworld during night.',
    divination_meaning: 'Solar cycles, diurnal divine forces, and cosmic illumination.',
    archaeological_notes: 'Directional and cosmological anchor marking the solar/diurnal side of the liver model. Found on the underside lobe.'
  }
] 