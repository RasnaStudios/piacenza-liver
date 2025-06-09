import * as THREE from 'three'

// Piacenza Liver section data - merging original positions with enhanced YAML data
// Authentic Etruscan inscriptions with proper deity information where available

export const liverSections = [
  // Section 1: Tinia (Jupiter) - Supreme sky deity (enhanced from YAML)
  {
    id: 1,
    position: new THREE.Vector3(0.8, 0.1, 0.6),
    name: 'tin/cil/en',
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
    name: 'tin/θvf',
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
    name: 'tins/θne',
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
    name: 'uni/mae',
    deity_name: 'Uni',
    roman_equivalent: 'Juno',
    greek_equivalent: 'Hera',
    section_type: 'sky',
    short_description: 'Principal goddess and consort of Tinia.',
    long_description: 'Uni, often aligned with the Roman Juno and the Greek Hera, is the consort of Tinia and presides over marriage, fertility, and social harmony. In Etruscan religion, Uni also held a strong civic role, often appearing in triads alongside Tinia and Menrva. The epithet /mae possibly indicates a maternal or generative attribute.',
    divination_meaning: 'Omens related to protection of the community, fertility, and civic stability.',
    archaeological_notes: 'Associated with inscriptions in sanctuaries and votive deposits, especially in Volsinii and Gravisca.'
  },

  // Section 5: Tecvm - Underworld deity (enhanced from YAML)
  {
    id: 5,
    position: new THREE.Vector3(0.2, 0.1, -0.9),
    name: 'tec/vm',
    deity_name: 'Tecvm',
    section_type: 'infernal',
    short_description: 'Possibly an underworld deity.',
    long_description: 'The deity Tecvm is attested only on the Piacenza Liver and has not been securely identified in other Etruscan sources. Its position among other deities of the infernal sphere suggests a chthonic role, possibly connected with ancestral or liminal functions in the cosmological mapping.',
    archaeological_notes: 'Only known occurrence on the Piacenza Liver.'
  },

  // Section 6: Lusal - Celestial deity (enhanced from YAML)
  {
    id: 6,
    position: new THREE.Vector3(-0.2, 0.1, -0.9),
    name: 'lvsl',
    deity_name: 'Lusal',
    section_type: 'sky',
    short_description: 'Possibly a celestial deity.',
    long_description: 'Lusal appears in several inscriptions, possibly connected to celestial or luminous forces. Some scholars propose a link to the Indo-European root *leuk-, suggesting brightness. The position in the outer ring may support a reading connected with solar or astral observation.',
    archaeological_notes: 'Attested also in votive contexts near Chiusi.'
  },

  // Section 7: Nethuns (Neptune) - Water deity (enhanced from YAML)
  {
    id: 7,
    position: new THREE.Vector3(-0.6, 0.1, -0.6),
    name: 'neθ',
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
    name: 'caθa',
    deity_name: 'Catha',
    section_type: 'celestial',
    short_description: 'Liminal solar or lunar deity.',
    long_description: 'Catha is a mysterious figure in the Etruscan pantheon often interpreted as a solar or lunar deity associated with liminal phases like dawn or dusk. Frequently paired with Śuri in depictions and inscriptions, Catha symbolizes transitional illumination—important in divinatory contexts for signaling change or thresholds.',
    divination_meaning: 'Sign of transitions, thresholds, or changes in cycle.',
    archaeological_notes: 'Mentioned in votive texts from Pyrgi and associated with solar cult contexts.'
  },

  // Section 9: Fufluns - Keep original position but use enhanced YAML data
  {
    id: 9,
    position: new THREE.Vector3(-0.9, 0.1, 0.2),
    name: 'fuflu/ns',
    deity_name: 'Fufluns',
    roman_equivalent: 'Bacchus',
    greek_equivalent: 'Dionysus',
    section_type: 'chthonic/vital',
    short_description: 'God of vegetation, rebirth, and ecstatic rites.',
    long_description: 'Fufluns is the Etruscan equivalent of Dionysus, though his attributes also include rebirth, healing, and vegetation. His cult appears associated with vital force and regenerative power, including chthonic dimensions like return from death or fertility of the earth.',
    divination_meaning: 'Omens of renewal, fertility, or ecstatic transformation.',
    archaeological_notes: 'Widely represented in tomb paintings, bronze mirrors, and votive gifts.'
  },

  // Restore original entries that weren't in YAML
  { id: 10, position: new THREE.Vector3(-0.8, 0.1, 0.6), name: 'selva', description: 'Etruscan inscription - Selvans', docFile: 'SELVANS.md' },
  { id: 11, position: new THREE.Vector3(-0.6, 0.1, 0.8), name: 'leθns', description: 'Etruscan inscription - Lethns', docFile: 'NETHUNS.md' },
  { id: 12, position: new THREE.Vector3(-0.2, 0.1, 0.9), name: 'tluscv', description: 'Etruscan inscription - Tlusc', docFile: 'SETHLANS.md' },
  { id: 13, position: new THREE.Vector3(0.2, 0.1, 0.9), name: 'cels', description: 'Etruscan inscription - Cels', docFile: 'TURAN.md' },
  { id: 14, position: new THREE.Vector3(0.6, 0.1, 0.8), name: 'cvlalp', description: 'Etruscan inscription - Culalp', docFile: 'CULSU.md' },
  { id: 15, position: new THREE.Vector3(0.7, 0.1, 0.7), name: 'vetisl', description: 'Etruscan inscription - Vetisl', docFile: 'TURAN.md' },
  { id: 16, position: new THREE.Vector3(0.75, 0.1, 0.4), name: 'cilensl', description: 'Etruscan inscription - Cilensl', docFile: 'TIN.md' },

  // Inner sectors (unique inscriptions only)
  { id: 17, position: new THREE.Vector3(0.5, 0.1, 0.4), name: 'pul', description: 'Etruscan inscription - Pul', docFile: 'TIN.md' },
  { id: 18, position: new THREE.Vector3(0.6, 0.1, 0.0), name: 'leθn', description: 'Etruscan inscription - Lethns', docFile: 'NETHUNS.md' },
  { id: 19, position: new THREE.Vector3(0.4, 0.1, 0.2), name: 'la/sl', description: 'Etruscan inscription - Lasl', docFile: 'LARAN.md' },
  { id: 20, position: new THREE.Vector3(0.3, 0.1, -0.4), name: 'θufl/θas', description: 'Etruscan inscription - Tufltha', docFile: 'FUFLUNS.md' },
  { id: 21, position: new THREE.Vector3(0.1, 0.1, -0.6), name: 'tinsθ/neθ', description: 'Etruscan inscription - Tinia-Nethuns', docFile: 'TIN.md' },
  { id: 22, position: new THREE.Vector3(-0.1, 0.1, -0.5), name: 'caθa', description: 'Etruscan inscription - Catha', docFile: 'CATH.md' },
  { id: 23, position: new THREE.Vector3(-0.3, 0.1, -0.3), name: 'fuf/lus', description: 'Etruscan inscription - Fufluns', docFile: 'FUFLUNS.md' },
  { id: 24, position: new THREE.Vector3(-0.5, 0.1, -0.1), name: 'tvnθ', description: 'Etruscan inscription - Tunth', docFile: 'TURAN.md' },
  { id: 25, position: new THREE.Vector3(-0.4, 0.1, 0.1), name: 'marisl/laθ', description: 'Etruscan inscription - Marisl Lath', docFile: 'LARAN.md' },
  { id: 26, position: new THREE.Vector3(-0.6, 0.1, 0.3), name: 'leta', description: 'Etruscan inscription - Leta', docFile: 'NETHUNS.md' },
  { id: 27, position: new THREE.Vector3(-0.1, 0.1, 0.4), name: 'herc', description: 'Etruscan inscription - Hercle', docFile: 'LARAN.md' },
  { id: 28, position: new THREE.Vector3(0.1, 0.1, 0.6), name: 'mar', description: 'Etruscan inscription - Mars', docFile: 'LARAN.md' },
  { id: 29, position: new THREE.Vector3(0.4, 0.1, 0.3), name: 'leθa', description: 'Etruscan inscription - Letha', docFile: 'NETHUNS.md' },
  { id: 30, position: new THREE.Vector3(0.2, 0.1, 0.3), name: 'tlusc', description: 'Etruscan inscription - Tlusc', docFile: 'SETHLANS.md' },
  { id: 31, position: new THREE.Vector3(0.0, 0.1, 0.2), name: 'lvsl/velϰ', description: 'Etruscan inscription - Lusl Velch', docFile: 'CULSU.md' },
  { id: 32, position: new THREE.Vector3(-0.2, 0.1, 0.2), name: 'satr/es', description: 'Etruscan inscription - Satres', docFile: 'SETHLANS.md' },
  { id: 33, position: new THREE.Vector3(-0.1, 0.1, 0.0), name: 'cilen', description: 'Etruscan inscription - Cilen', docFile: 'TIN.md' },

  // Section 34: Letham - Enhanced from YAML
  {
    id: 34,
    position: new THREE.Vector3(0.1, 0.1, -0.1),
    name: 'leθam',
    deity_name: 'Leθam',
    section_type: 'infernal',
    short_description: 'Possibly an ancestral or underworld spirit.',
    long_description: 'Leθam is otherwise unattested in known Etruscan texts, but its placement within the infernal quadrant of the liver model suggests a connection with the chthonic realm or spirits of the dead. Its proximity to more defined underworld figures supports a hypothesis of ancestral invocation.',
    archaeological_notes: 'Known only from this liver inscription.'
  },

  { id: 35, position: new THREE.Vector3(0.3, 0.1, -0.1), name: 'metlvmθ', description: 'Etruscan inscription - Metlumth', docFile: 'MENRVA.md' },
  
  // Special lobe inscriptions (Sun and Moon) - positioned underneath the liver
  {
    id: 36,
    position: new THREE.Vector3(-0.7, -0.2, 0.0),
    name: 'tivs',
    deity_name: 'Tivs',
    section_type: 'celestial',
    short_description: 'Moon deity (on underside lobe)',
    long_description: 'Tivs represents the lunar aspect of Etruscan cosmology, positioned on the underside of the liver model to represent the nighttime or hidden celestial realm.',
    divination_meaning: 'Omens related to night, cycles, and hidden knowledge.',
    archaeological_notes: 'Found on the underside lobe of the Piacenza Liver.'
  },

  {
    id: 37,
    position: new THREE.Vector3(0.7, -0.2, 0.0),
    name: 'usils',
    deity_name: 'Usils',
    section_type: 'celestial',
    short_description: 'Sun deity (on underside lobe)',
    long_description: 'Usils represents the solar aspect of Etruscan cosmology, positioned on the underside of the liver model to represent the solar journey through the underworld during night.',
    divination_meaning: 'Omens related to daylight, solar cycles, and illumination.',
    archaeological_notes: 'Found on the underside lobe of the Piacenza Liver.'
  }
] 