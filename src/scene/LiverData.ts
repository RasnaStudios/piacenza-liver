import * as THREE from "three"

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

export interface LiverGod {
  id: string
  name: string
  etruscanScript?: string
  transcription?: string
}

export interface LiverGroup {
  id: string
  positions: number[]
  color: string
}

export interface Inscription {
  id: number
  etruscanText: string
  transcription: string
  gods: Array<{ id: string; form: string }>
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  description?: string
}

// ================================================================================================
// PIACENZA LIVER DATA
// ================================================================================================
//
// Based on scholarly transcription showing that inscriptions contain multiple deities
// Structure: Groups → Individual Gods → Inscriptions (1-2 gods per inscription)
//
// ================================================================================================

// GROUPS: Cosmological zones with colors (names and descriptions are in locale files)
export const liverGroups = {
  sky: {
    id: "sky",
    positions: [1, 2, 3, 4],
    color: "#8ad8ff",
  },
  water: {
    id: "water",
    positions: [5, 6, 7, 8],
    color: "#2be5d0",
  },
  earth: {
    id: "earth",
    positions: [9, 10, 11, 12],
    color: "#ffb76b",
  },
  underworld: {
    id: "underworld",
    positions: [13, 14, 15, 16],
    color: "#c4d84f",
  },
  pars_familiaris: {
    id: "pars_familiaris",
    positions: [17, 18, 19, 20, 21, 22, 23, 24],
    color: "#ff6b7c",
  },
  gall_bladder: {
    id: "gall_bladder",
    positions: [25, 26, 27, 28],
    color: "#ffd27f",
  },
  central_section: {
    id: "central_section",
    positions: [29, 30, 37, 38, 39, 40],
    color: "#ffe18a",
  },
  pars_hostilis: {
    id: "pars_hostilis",
    positions: [31, 32, 33, 34, 35, 36],
    color: "#d3a6ff",
  },
  back: {
    id: "back",
    positions: [41, 42],
    color: "#cfd3d8",
  },
}

// INDIVIDUAL GODS: Deity information (descriptions and equivalents are in locale files)
export const liverGods = {
  tinia: {
    id: "tinia",
    name: "Tinia",
  },
  cilens: {
    id: "cilens",
    name: "Cilens",
  },
  thufltha: {
    id: "thufltha",
    name: "Thufltha",
  },
  nethuns: {
    id: "nethuns",
    name: "Nethuns",
  },
  uni: {
    id: "uni",
    name: "Uni",
  },
  mae: {
    id: "mae",
    name: "Mae",
  },
  tecvm: {
    id: "tecvm",
    name: "Tecum",
  },
  lusal: {
    id: "lusal",
    name: "Lusal",
  },
  catha: {
    id: "catha",
    name: "Catha",
  },
  fufluns: {
    id: "fufluns",
    name: "Fufluns",
  },
  selvans: {
    id: "selvans",
    name: "Selvans",
  },
  tluscva: {
    id: "tluscva",
    name: "Tluscva",
  },
  cels: {
    id: "cels",
    name: "Cels",
  },
  culsans: {
    id: "culsans",
    name: "Culsans",
  },
  alpans: {
    id: "alpans",
    name: "Alpans",
  },
  vetis: {
    id: "vetis",
    name: "Vetis",
  },
  pul: {
    id: "pul",
    name: "Pul",
  },
  lasl: {
    id: "lasl",
    name: "Lasl",
  },
  maris: {
    id: "maris",
    name: "Maris",
    transcription: "mar",
  },
  laran: {
    id: "laran",
    name: "Laran",
    transcription: "lar",
  },
  tvnth: {
    id: "tvnth",
    name: "Tvnth",
  },
  hercle: {
    id: "hercle",
    name: "Hercle",
  },
  metlvmth: {
    id: "metlvmth",
    name: "Metlvmth",
  },
  marutl: {
    id: "marutl",
    name: "Marutl",
  },
  letham: {
    id: "letham",
    name: "Letham",
  },
  velch: {
    id: "velch",
    name: "Velch",
  },
  satres: {
    id: "satres",
    name: "Satres",
  },
  usil: {
    id: "usil",
    name: "Usil",
  },
  tiur: {
    id: "tiur",
    name: "Tiur",
  },
}

// INSCRIPTIONS: All 42 liver sections with their gods and descriptions
export const liverInscriptions = [
  {
    id: 1,
    etruscanText: "𐌕𐌉𐌍 / 𐌂𐌉𐌋 / 𐌄𐌍",
    transcription: "tin / cil / en",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍" },
      { id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍" },
    ],
    cameraPosition: new THREE.Vector3(-2.04, 0.364, -1.975),
    cameraTarget: new THREE.Vector3(-1.884, 0.545, 0.514),
  },
  {
    id: 2,
    etruscanText: "𐌕𐌉𐌍 / 𐌏𐌅𐌚",
    transcription: "tin / θvf",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍" },
      { id: "thufltha", form: "𐌏𐌅𐌚" },
    ],
    cameraPosition: new THREE.Vector3(-2.054, -0.101, -1.981),
    cameraTarget: new THREE.Vector3(-2.035, 0.059, 0.514),
  },
  {
    id: 3,
    etruscanText: "𐌕𐌉𐌍𐌔 / 𐌏𐌍𐌄",
    transcription: "tins / θne",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔𐌏" },
      { id: "nethuns", form: "𐌍𐌄" },
    ],
    cameraPosition: new THREE.Vector3(-2.0, -0.433, -2.002),
    cameraTarget: new THREE.Vector3(-2.02, -0.375, 0.514),
  },
  {
    id: 4,
    etruscanText: "𐌖𐌍𐌉 / 𐌡𐌀𐌄",
    transcription: "uni / mae",
    gods: [
      { id: "uni", form: "𐌖𐌍𐌉" },
      { id: "mae", form: "𐌡𐌀𐌄" },
    ],
    cameraPosition: new THREE.Vector3(-1.772, -0.843, -1.982),
    cameraTarget: new THREE.Vector3(-1.901, -0.806, 0.514),
  },
  {
    id: 5,
    etruscanText: "𐌕𐌄𐌂 / 𐌅𐌡",
    transcription: "tec / vm",
    gods: [{ id: "tecvm", form: "𐌕𐌄𐌂𐌅𐌡" }],
    cameraPosition: new THREE.Vector3(-1.534, -1.158, -1.983),
    cameraTarget: new THREE.Vector3(-1.66, -1.178, 0.514),
  },
  {
    id: 6,
    etruscanText: "𐌋𐌅𐌔𐌀𐌋",
    transcription: "lvsal",
    gods: [{ id: "lusal", form: "𐌋𐌅𐌔𐌀𐌋" }],
    cameraPosition: new THREE.Vector3(-1.323, -1.449, -1.984),
    cameraTarget: new THREE.Vector3(-1.306, -1.484, 0.516),
  },
  {
    id: 7,
    etruscanText: "𐌍𐌄𐌏",
    transcription: "neθ",
    gods: [{ id: "nethuns", form: "𐌍𐌄𐌏" }],
    cameraPosition: new THREE.Vector3(-0.543, -2.521, -1.771),
    cameraTarget: new THREE.Vector3(-0.704, -1.598, 0.547),
  },
  {
    id: 8,
    etruscanText: "𐌂𐌀𐌏",
    transcription: "caθ",
    gods: [{ id: "catha", form: "𐌂𐌀𐌏" }],
    cameraPosition: new THREE.Vector3(0.322, -1.877, -1.842),
    cameraTarget: new THREE.Vector3(-0.159, -1.377, 0.56),
  },
  {
    id: 9,
    etruscanText: "𐌚𐌖𐌚𐌋𐌖 / 𐌍𐌔",
    transcription: "fuflu / ns",
    gods: [{ id: "fufluns", form: "𐌚𐌖𐌚𐌋𐌖𐌍𐌔" }],
    cameraPosition: new THREE.Vector3(0.273, -1.526, -1.975),
    cameraTarget: new THREE.Vector3(0.36, -1.305, 0.514),
  },
  {
    id: 10,
    etruscanText: "𐌔𐌄𐌋𐌅𐌀",
    transcription: "selva",
    gods: [{ id: "selvans", form: "𐌔𐌄𐌋𐌅𐌀" }],
    cameraPosition: new THREE.Vector3(1.106, -1.289, -1.98),
    cameraTarget: new THREE.Vector3(1.085, -1.464, 0.514),
  },
  {
    id: 11,
    etruscanText: "𐌋𐌄𐌏𐌍𐌔",
    transcription: "leθns",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌍𐌔" }],
    cameraPosition: new THREE.Vector3(1.911, -1.282, -1.982),
    cameraTarget: new THREE.Vector3(1.821, -1.308, 0.517),
  },
  {
    id: 12,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂𐌅",
    transcription: "tluscv",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂𐌅" }],
    cameraPosition: new THREE.Vector3(2.099, -0.358, -1.967),
    cameraTarget: new THREE.Vector3(2.321, -0.577, 0.514),
  },
  {
    id: 13,
    etruscanText: "𐌂𐌄𐌋𐌔",
    transcription: "cels",
    gods: [{ id: "cels", form: "𐌂𐌄𐌋𐌔" }],
    cameraPosition: new THREE.Vector3(1.713, -0.007, -1.965),
    cameraTarget: new THREE.Vector3(1.985, 0.182, 0.513),
  },
  {
    id: 14,
    etruscanText: "𐌂𐌅𐌋 / 𐌀𐌋𐌐",
    transcription: "cvl / alp",
    gods: [
      { id: "culsans", form: "𐌂𐌅𐌋" },
      { id: "alpans", form: "𐌀𐌋𐌐" },
    ],
    cameraPosition: new THREE.Vector3(1.18, 0.483, -1.972),
    cameraTarget: new THREE.Vector3(1.301, 0.636, 0.52),
  },
  {
    id: 15,
    etruscanText: "𐌅𐌄𐌕𐌉𐌔𐌋",
    transcription: "vetisl",
    gods: [{ id: "vetis", form: "𐌅𐌄𐌕𐌉𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(0.473, 1.033, -1.978),
    cameraTarget: new THREE.Vector3(0.459, 0.893, 0.518),
  },
  {
    id: 16,
    etruscanText: "𐌂𐌉𐌋𐌄𐌍𐌔𐌋",
    transcription: "cilensl",
    gods: [{ id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(-0.995, 0.687, -1.949),
    cameraTarget: new THREE.Vector3(-1.1, 1.1, 0.514),
  },
  {
    id: 17,
    etruscanText: "𐌐𐌖𐌋",
    transcription: "pul",
    gods: [{ id: "pul", form: "𐌐𐌖𐌋" }],
    cameraPosition: new THREE.Vector3(-1.193, -1.65, -1.376),
    cameraTarget: new THREE.Vector3(-1.259, -1.267, 0.51),
  },
  {
    id: 18,
    etruscanText: "𐌋𐌄𐌏𐌍",
    transcription: "leθn",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌍" }],
    cameraPosition: new THREE.Vector3(-1.311, -1.008, -1.394),
    cameraTarget: new THREE.Vector3(-1.325, -1.048, 0.527),
  },
  {
    id: 19,
    etruscanText: "𐌋𐌀 / 𐌔𐌋",
    transcription: "la / sl",
    gods: [{ id: "lasl", form: "𐌋𐌀𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(-1.169, -0.8, -1.388),
    cameraTarget: new THREE.Vector3(-1.172, -0.811, 0.533),
  },
  {
    id: 20,
    etruscanText: "𐌕𐌉𐌍𐌔 / 𐌏𐌅𐌚",
    transcription: "tins / θvf",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔" },
      { id: "thufltha", form: "𐌏𐌅𐌚" },
    ],
    cameraPosition: new THREE.Vector3(-1.51, -0.776, -1.388),
    cameraTarget: new THREE.Vector3(-1.512, -0.771, 0.533),
  },
  {
    id: 21,
    etruscanText: "𐌏𐌖𐌚𐌋 / 𐌏𐌀𐌔",
    transcription: "θufl / θas",
    gods: [{ id: "thufltha", form: "𐌏𐌖𐌚𐌋𐌏𐌀𐌔" }],
    cameraPosition: new THREE.Vector3(-1.575, -0.452, -1.389),
    cameraTarget: new THREE.Vector3(-1.577, -0.447, 0.532),
  },
  {
    id: 22,
    etruscanText: "𐌕𐌉𐌍𐌔𐌏 / 𐌍𐌄𐌏",
    transcription: "tinsθ/neθ",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔𐌏" },
      { id: "nethuns", form: "𐌍𐌄𐌏" },
    ],
    cameraPosition: new THREE.Vector3(-1.571, -0.127, -1.39),
    cameraTarget: new THREE.Vector3(-1.573, -0.122, 0.531),
  },
  {
    id: 23,
    etruscanText: "𐌂𐌀𐌏𐌀",
    transcription: "caθa",
    gods: [{ id: "catha", form: "𐌂𐌀𐌏𐌀" }],
    cameraPosition: new THREE.Vector3(-1.054, -0.178, -1.389),
    cameraTarget: new THREE.Vector3(-1.056, -0.173, 0.532),
  },
  {
    id: 24,
    etruscanText: "𐌚𐌖𐌚𐌋𐌖𐌔",
    transcription: "fuf/lus",
    gods: [{ id: "fufluns", form: "𐌚𐌖𐌚𐌋𐌖𐌔" }],
    cameraPosition: new THREE.Vector3(-1.08, -0.487, -1.389),
    cameraTarget: new THREE.Vector3(-1.082, -0.482, 0.532),
  },
  {
    id: 25,
    etruscanText: "𐌕𐌅𐌖𐌏",
    transcription: "tvnθ",
    gods: [{ id: "tvnth", form: "𐌕𐌅𐌖𐌏" }],
    cameraPosition: new THREE.Vector3(-0.723, -2.103, -1.134),
    cameraTarget: new THREE.Vector3(-0.702, -1.492, 0.236),
  },
  {
    id: 26,
    etruscanText: "𐌡𐌀𐌓𐌉𐌔𐌋 / 𐌋𐌀𐌏",
    transcription: "marisl/laθ",
    gods: [
      { id: "maris", form: "𐌡𐌀𐌓𐌉𐌔𐌋" },
      { id: "laran", form: "𐌋𐌀𐌏" },
    ],
    cameraPosition: new THREE.Vector3(-0.715, -1.397, -1.447),
    cameraTarget: new THREE.Vector3(-0.711, -1.192, 0.039),
  },
  {
    id: 27,
    etruscanText: "𐌋𐌄𐌕𐌀",
    transcription: "leta",
    gods: [{ id: "letham", form: "𐌋𐌄𐌕𐌀" }],
    cameraPosition: new THREE.Vector3(-0.696, -1.133, -1.42),
    cameraTarget: new THREE.Vector3(-0.706, -0.901, 0.062),
  },
  {
    id: 28,
    etruscanText: "𐌍𐌄𐌏",
    transcription: "neθ",
    gods: [{ id: "nethuns", form: "𐌍𐌄𐌏" }],
    cameraPosition: new THREE.Vector3(-0.67, -0.273, -1.224),
    cameraTarget: new THREE.Vector3(-0.683, -0.379, 0.272),
  },
  {
    id: 29,
    etruscanText: "𐌇𐌄𐌓𐌂",
    transcription: "herc",
    gods: [{ id: "hercle", form: "𐌇𐌄𐌓𐌂" }],
    cameraPosition: new THREE.Vector3(-0.048, -0.735, -1.652),
    cameraTarget: new THREE.Vector3(-0.199, -0.897, 0.518),
  },
  {
    id: 30,
    etruscanText: "𐌡𐌀𐌓",
    transcription: "mar",
    gods: [{ id: "maris", form: "𐌡𐌀𐌓" }],
    cameraPosition: new THREE.Vector3(-0.17, -0.064, -1.609),
    cameraTarget: new THREE.Vector3(-0.247, -0.222, 0.514),
  },
  {
    id: 31,
    etruscanText: "𐌔𐌄𐌋𐌅𐌀",
    transcription: "selva",
    gods: [{ id: "selvans", form: "𐌔𐌄𐌋𐌅𐌀" }],
    cameraPosition: new THREE.Vector3(1.014, -0.823, -1.53),
    cameraTarget: new THREE.Vector3(1.282, -0.93, 0.517),
  },
  {
    id: 32,
    etruscanText: "𐌋𐌄𐌏𐌀",
    transcription: "leθa",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌀" }],
    cameraPosition: new THREE.Vector3(1.628, -0.638, -1.56),
    cameraTarget: new THREE.Vector3(1.703, -0.626, 0.517),
  },
  {
    id: 33,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂",
    transcription: "tlusc",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂" }],
    cameraPosition: new THREE.Vector3(1.719, -0.141, -1.562),
    cameraTarget: new THREE.Vector3(1.649, -0.126, 0.517),
  },
  {
    id: 34,
    etruscanText: "𐌋𐌅𐌔𐌋 / 𐌅𐌄𐌋𐌗",
    transcription: "lvsl/velϰ",
    gods: [
      { id: "lusal", form: "𐌋𐌅𐌔𐌋" },
      { id: "velch", form: "𐌅𐌄𐌋𐌗" },
    ],
    cameraPosition: new THREE.Vector3(0.94, 0.217, -1.538),
    cameraTarget: new THREE.Vector3(1.078, 0.233, 0.517),
  },
  {
    id: 35,
    etruscanText: "𐌔𐌀𐌕𐌓 / 𐌄𐌔",
    transcription: "satr/es",
    gods: [{ id: "satres", form: "𐌔𐌀𐌕𐌓𐌄𐌔" }],
    cameraPosition: new THREE.Vector3(0.577, -0.392, -1.507),
    cameraTarget: new THREE.Vector3(0.61, -0.348, 0.517),
  },
  {
    id: 36,
    etruscanText: "𐌂𐌉𐌋𐌄𐌍",
    transcription: "cilen",
    gods: [{ id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍" }],
    cameraPosition: new THREE.Vector3(0.838, -1.04, -1.603),
    cameraTarget: new THREE.Vector3(0.623, -0.891, 0.517),
  },
  {
    id: 37,
    etruscanText: "𐌋𐌄𐌏𐌀𐌡",
    transcription: "leθam",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌀𐌡" }],
    cameraPosition: new THREE.Vector3(0.231, -0.182, -1.603),
    cameraTarget: new THREE.Vector3(0.107, -0.323, 0.517),
  },
  {
    id: 38,
    etruscanText: "𐌡𐌄𐌕𐌋𐌅𐌡𐌏",
    transcription: "metlvmθ",
    gods: [{ id: "metlvmth", form: "𐌡𐌄𐌕𐌋𐌅𐌡𐌏" }],
    cameraPosition: new THREE.Vector3(0.2, 0.865, -1.556),
    cameraTarget: new THREE.Vector3(0.179, 0.593, 0.517),
  },
  {
    id: 39,
    etruscanText: "𐌡𐌀𐌓",
    transcription: "mar",
    gods: [{ id: "maris", form: "𐌡𐌀𐌓" }],
    cameraPosition: new THREE.Vector3(-0.682, 0.847, -1.556),
    cameraTarget: new THREE.Vector3(-0.718, 0.62, 0.517),
  },
  {
    id: 40,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂",
    transcription: "tlusc",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂" }],
    cameraPosition: new THREE.Vector3(-0.783, 0.551, -1.588),
    cameraTarget: new THREE.Vector3(-0.9, 0.376, 0.517),
  },
  {
    id: 41,
    etruscanText: "𐌕𐌉𐌅𐌓",
    transcription: "tivr",
    gods: [{ id: "tiur", form: "𐌕𐌉𐌅𐌓" }],
    description: "The Moon as cosmic foundation",
    cameraPosition: new THREE.Vector3(0.686, -1.099, 2.485),
    cameraTarget: new THREE.Vector3(0.5, -1.0, 1.0),
  },
  {
    id: 42,
    etruscanText: "𐌖𐌔𐌉𐌋𐌔",
    transcription: "usils",
    gods: [{ id: "usil", form: "𐌖𐌔𐌉𐌋𐌔" }],
    description: "The Sun as cosmic foundation",
    cameraPosition: new THREE.Vector3(0.226, -1.058, 2.463),
    cameraTarget: new THREE.Vector3(-0.1, -1.0, 1.0),
  },
]

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

// Type definition for god entries in inscriptions
export type GodEntry = string | { id: string; form: string }

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
