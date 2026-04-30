import * as THREE from "three"

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

export interface DeityParallelSlot {
  tradition: ParallelTradition
  status: ParallelStatus
}

export interface LiverGod {
  id: string
  name: string
  readingStatus: ReadingStatus
  identificationStatus: IdentificationStatus
  etruscanScript?: string
  transcription?: string
  sources: string[]
  parallelSlots?: DeityParallelSlot[]
}

export type ReadingStatus = "clear" | "debated" | "unclear"

export type IdentificationStatus =
  | "secure"
  | "probable"
  | "debated"
  | "unresolved"

export type ParallelStatus = "secure" | "proposed" | "superseded"

export type ParallelTradition = "roman" | "greek"

export interface LiverGroup {
  id: string
  positions: number[]
  color: string
}

export interface Inscription {
  id: number
  etruscanText: string
  transcription: string
  gods: Array<{ id: string; form: string; readingStatus?: ReadingStatus }>
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  description?: string
  readingStatus?: ReadingStatus
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

// INDIVIDUAL GODS: Deity information (descriptions and parallels are in locale files)
export const liverGods: Record<string, LiverGod> = {
  tinia: {
    id: "tinia",
    name: "Tinia",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Capdeville 1992",
      "Stevens 2009",
      "Pernigotti 2018",
      "Gottarelli 2018",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  cilens: {
    id: "cilens",
    name: "Cilens",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Colonna 2012",
      "Pernigotti 2018",
      "Gottarelli 2018",
    ],
  },
  thufltha: {
    id: "thufltha",
    name: "Thufltha",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Amann 2019",
    ],
    parallelSlots: [
      { tradition: "roman", status: "proposed" },
      { tradition: "greek", status: "proposed" },
    ],
  },
  nethuns: {
    id: "nethuns",
    name: "Nethuns",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "Colonna 1991",
      "van der Meer 1987",
      "Krauskopf 2013",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  uni: {
    id: "uni",
    name: "Uni",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Krauskopf 2013",
      "Maras 2017",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  mae: {
    id: "mae",
    name: "Mae",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Maras 2017",
    ],
  },
  tecvm: {
    id: "tecvm",
    name: "Tecum",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: [
      "Colonna 1976-77",
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
    ],
  },
  lusal: {
    id: "lusal",
    name: "Lusal",
    readingStatus: "debated",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "Colonna 1991",
      "van der Meer 2009",
      "de Grummond 2014",
    ],
  },
  catha: {
    id: "catha",
    name: "Catha",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "Colonna 1991",
      "de Grummond 2008",
      "Krauskopf 2013",
      "Maras 2017",
      "Moore 2018",
    ],
  },
  fufluns: {
    id: "fufluns",
    name: "Fufluns",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Krauskopf 2013",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  selvans: {
    id: "selvans",
    name: "Selvans",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: ["Maggiani 1982", "Colonna 1991", "van der Meer 1987"],
    parallelSlots: [{ tradition: "roman", status: "secure" }],
  },
  tluscva: {
    id: "tluscva",
    name: "Tluscva",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Maggiani 2011",
      "Colonna 2012",
      "Stopponi 2012",
      "Maras 2017",
    ],
  },
  cels: {
    id: "cels",
    name: "Cels",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: ["Colonna 1976-77", "Maggiani 1982", "Krauskopf 2013"],
    parallelSlots: [
      { tradition: "roman", status: "proposed" },
      { tradition: "greek", status: "proposed" },
    ],
  },
  culsans: {
    id: "culsans",
    name: "Culsans",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: ["Maggiani 1982", "Colonna 1991", "Krauskopf 2013"],
    parallelSlots: [{ tradition: "roman", status: "secure" }],
  },
  alpans: {
    id: "alpans",
    name: "Alpans",
    readingStatus: "clear",
    identificationStatus: "probable",
    sources: ["Maggiani 1982", "Colonna 1991", "Krauskopf 2013"],
  },
  vetis: {
    id: "vetis",
    name: "Vetis",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Colonna 2012",
      "Maras 2017",
      "Pernigotti 2018",
    ],
    parallelSlots: [{ tradition: "roman", status: "proposed" }],
  },
  pul: {
    id: "pul",
    name: "Pul",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: ["Maggiani 1982", "Colonna 1991", "van der Meer 1987"],
  },
  lasl: {
    id: "lasl",
    name: "Lasl",
    readingStatus: "clear",
    identificationStatus: "probable",
    sources: ["Maggiani 1982", "Colonna 1991", "Krauskopf 2013"],
    parallelSlots: [{ tradition: "roman", status: "superseded" }],
  },
  maris: {
    id: "maris",
    name: "Maris",
    readingStatus: "clear",
    identificationStatus: "debated",
    transcription: "mar",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Simon 2006",
      "Krauskopf 2013",
      "Maras 2017",
    ],
  },
  laran: {
    id: "laran",
    name: "Laran",
    readingStatus: "debated",
    identificationStatus: "secure",
    transcription: "lar",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Krauskopf 2013",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  tvnth: {
    id: "tvnth",
    name: "Tvnth",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: ["Maggiani 1982", "van der Meer 1987", "Maras 2017"],
  },
  hercle: {
    id: "hercle",
    name: "Hercle",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Krauskopf 2013",
    ],
    parallelSlots: [
      { tradition: "roman", status: "secure" },
      { tradition: "greek", status: "secure" },
    ],
  },
  metlvmth: {
    id: "metlvmth",
    name: "Metlvmth",
    readingStatus: "clear",
    identificationStatus: "unresolved",
    sources: ["Maggiani 1982", "Colonna 1991", "van der Meer 1987"],
  },
  letham: {
    id: "letham",
    name: "Lethams",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "Colonna 1991",
      "van der Meer 1987",
      "Gottarelli 2018",
    ],
  },
  velch: {
    id: "velch",
    name: "Velch",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: ["Maggiani 1982", "Colonna 1991"],
    parallelSlots: [{ tradition: "roman", status: "proposed" }],
  },
  satres: {
    id: "satres",
    name: "Satres",
    readingStatus: "clear",
    identificationStatus: "debated",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Colonna 1991",
      "Krauskopf 2013",
    ],
    parallelSlots: [{ tradition: "roman", status: "superseded" }],
  },
  usil: {
    id: "usil",
    name: "Usil",
    readingStatus: "clear",
    identificationStatus: "secure",
    sources: [
      "Maggiani 1982",
      "van der Meer 1987",
      "Krauskopf 2013",
      "Maras 2017",
    ],
  },
  tiur: {
    id: "tiur",
    name: "Tiur",
    readingStatus: "clear",
    identificationStatus: "probable",
    sources: ["Maggiani 1982", "Sannibale 2018", "Krauskopf 2013"],
  },
}

export interface ResolvedDeityParallel {
  tradition: ParallelTradition
  name: string
  status: ParallelStatus
}

export type ParallelLocaleTranslator = (
  key: string,
  options?: { returnObjects?: boolean; defaultValue?: unknown },
) => unknown

export function resolveDeityParallels(
  t: ParallelLocaleTranslator,
  deityId: string,
): ResolvedDeityParallel[] {
  const slots = liverGods[deityId]?.parallelSlots
  if (!slots?.length) return []

  const raw = t(`deities.${deityId}.parallelNames`, {
    returnObjects: true,
    defaultValue: {},
  })
  const names =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, string>)
      : {}

  return slots
    .map((slot) => ({
      tradition: slot.tradition,
      status: slot.status,
      name: names[slot.tradition] ?? "",
    }))
    .filter((row) => row.name.length > 0)
}

// INSCRIPTIONS: All 42 liver sections with their gods and descriptions
export const liverInscriptions: Inscription[] = [
  {
    id: 1,
    etruscanText: "𐌕𐌉𐌍 / 𐌂𐌉𐌋 / 𐌄𐌍",
    transcription: "tin / cil / en",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍" },
      { id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍" },
    ],
    cameraPosition: new THREE.Vector3(-1.846, 1.496, 0.683),
    cameraTarget: new THREE.Vector3(-1.736, 0.0, 0.715),
  },
  {
    id: 2,
    etruscanText: "𐌕𐌉𐌍 / 𐌏𐌅𐌚",
    transcription: "tin / θvf",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍" },
      { id: "thufltha", form: "𐌏𐌅𐌚" },
    ],
    cameraPosition: new THREE.Vector3(-1.889, 1, 0.307),
    cameraTarget: new THREE.Vector3(-1.874, 0, 0.307),
  },
  {
    id: 3,
    etruscanText: "𐌕𐌉𐌍𐌔 / 𐌏𐌍𐌄",
    transcription: "tins / θne",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔𐌏" },
      { id: "nethuns", form: "𐌍𐌄" },
    ],
    cameraPosition: new THREE.Vector3(-1.819, 1.5, -0.096),
    cameraTarget: new THREE.Vector3(-1.856, 0.0, -0.085),
  },
  {
    id: 4,
    etruscanText: "𐌖𐌍𐌉 / 𐌡𐌀𐌄",
    transcription: "uni / mae",
    gods: [
      { id: "uni", form: "𐌖𐌍𐌉" },
      { id: "mae", form: "𐌡𐌀𐌄" },
    ],
    cameraPosition: new THREE.Vector3(-1.689, 1.497, -0.391),
    cameraTarget: new THREE.Vector3(-1.752, 0.0, -0.452),
  },
  {
    id: 5,
    etruscanText: "𐌕𐌄𐌂 / 𐌅𐌡",
    transcription: "tec / vm",
    gods: [{ id: "tecvm", form: "𐌕𐌄𐌂𐌅𐌡" }],
    cameraPosition: new THREE.Vector3(-1.412, 1.491, -0.734),
    cameraTarget: new THREE.Vector3(-1.554, -0.001, -0.783),
  },
  {
    id: 6,
    etruscanText: "𐌋𐌅𐌔𐌀𐌋",
    transcription: "lvsal",
    gods: [{ id: "lusal", form: "𐌋𐌅𐌔𐌀𐌋", readingStatus: "debated" }],
    cameraPosition: new THREE.Vector3(-1.287, 1.493, -1.101),
    cameraTarget: new THREE.Vector3(-1.178, -0.003, -1.096),
  },
  {
    id: 7,
    etruscanText: "𐌍𐌄𐌏",
    transcription: "neθ",
    gods: [{ id: "nethuns", form: "𐌍𐌄𐌏" }],
    cameraPosition: new THREE.Vector3(-0.5, 1.391, -1.775),
    cameraTarget: new THREE.Vector3(-0.611, -0.002, -1.229),
  },
  {
    id: 8,
    etruscanText: "𐌂𐌀𐌏",
    transcription: "caθ",
    gods: [{ id: "catha", form: "𐌂𐌀𐌏" }],
    cameraPosition: new THREE.Vector3(0.238, 1.367, -1.254),
    cameraTarget: new THREE.Vector3(-0.167, -0.056, -1.008),
  },
  {
    id: 9,
    etruscanText: "𐌚𐌖𐌚𐌋𐌖 / 𐌍𐌔",
    transcription: "fuflu / ns",
    gods: [{ id: "fufluns", form: "𐌚𐌖𐌚𐌋𐌖𐌍𐌔" }],
    cameraPosition: new THREE.Vector3(0.205, 0.996, -0.946),
    cameraTarget: new THREE.Vector3(0.237, -0.002, -0.914),
  },
  {
    id: 10,
    etruscanText: "𐌔𐌄𐌋𐌅𐌀",
    transcription: "selva",
    gods: [{ id: "selvans", form: "𐌔𐌄𐌋𐌅𐌀" }],
    cameraPosition: new THREE.Vector3(0.871, 1.491, -1.252),
    cameraTarget: new THREE.Vector3(0.908, -0.003, -1.124),
  },
  {
    id: 11,
    etruscanText: "𐌋𐌄𐌏𐌍𐌔",
    transcription: "leθns",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌍𐌔" }],
    cameraPosition: new THREE.Vector3(1.709, 1.496, -0.989),
    cameraTarget: new THREE.Vector3(1.622, 0.0, -1.049),
  },
  {
    id: 12,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂𐌅",
    transcription: "tluscv",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂𐌅" }],
    cameraPosition: new THREE.Vector3(1.817, 1.455, -0.184),
    cameraTarget: new THREE.Vector3(2.079, 0.0, -0.439),
  },
  {
    id: 13,
    etruscanText: "𐌂𐌄𐌋𐌔",
    transcription: "cels",
    gods: [{ id: "cels", form: "𐌂𐌄𐌋𐌔", readingStatus: "unclear" }],
    cameraPosition: new THREE.Vector3(1.693, 1.491, 0.383),
    cameraTarget: new THREE.Vector3(1.787, -0.002, 0.276),
  },
  {
    id: 14,
    etruscanText: "𐌂𐌅𐌋 / 𐌀𐌋𐌐",
    transcription: "cvl / alp",
    gods: [
      { id: "culsans", form: "𐌂𐌅𐌋" },
      { id: "alpans", form: "𐌀𐌋𐌐" },
    ],
    cameraPosition: new THREE.Vector3(1.194, 1.485, 0.898),
    cameraTarget: new THREE.Vector3(1.169, 0.0, 0.69),
  },
  {
    id: 15,
    etruscanText: "𐌅𐌄𐌕𐌉𐌔𐌋",
    transcription: "vetisl",
    gods: [{ id: "vetis", form: "𐌅𐌄𐌕𐌉𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(0.408, 1.488, 1.129),
    cameraTarget: new THREE.Vector3(0.387, 0.0, 0.943),
  },
  {
    id: 16,
    etruscanText: "𐌂𐌉𐌋𐌄𐌍𐌔𐌋",
    transcription: "cilensl",
    gods: [{ id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(-0.869, 1.5, 1.095),
    cameraTarget: new THREE.Vector3(-0.881, 0.0, 1.083),
  },
  {
    id: 17,
    etruscanText: "𐌐𐌖𐌋",
    transcription: "pul",
    gods: [{ id: "pul", form: "𐌐𐌖𐌋" }],
    cameraPosition: new THREE.Vector3(-1.148, 1.483, -1.119),
    cameraTarget: new THREE.Vector3(-1.078, 0.0, -0.907),
    readingStatus: "debated",
  },
  {
    id: 18,
    etruscanText: "𐌋𐌄𐌏𐌍",
    transcription: "leθn",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌍" }],
    cameraPosition: new THREE.Vector3(-1.226, 1.461, -0.992),
    cameraTarget: new THREE.Vector3(-1.194, -0.003, -0.665),
  },
  {
    id: 19,
    etruscanText: "𐌋𐌀 / 𐌔𐌋",
    transcription: "la / sl",
    gods: [{ id: "lasl", form: "𐌋𐌀𐌔𐌋" }],
    cameraPosition: new THREE.Vector3(-1.008, 1, -0.436),
    cameraTarget: new THREE.Vector3(-1.008, 0, -0.459),
  },
  {
    id: 20,
    etruscanText: "𐌕𐌉𐌍𐌔 / 𐌏𐌅𐌚",
    transcription: "tins / θvf",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔" },
      { id: "thufltha", form: "𐌏𐌅𐌚" },
    ],
    cameraPosition: new THREE.Vector3(-1.351, 0.999, -0.406),
    cameraTarget: new THREE.Vector3(-1.359, 0, -0.413),
  },
  {
    id: 21,
    etruscanText: "𐌏𐌖𐌚𐌋 / 𐌏𐌀𐌔",
    transcription: "θufl / θas",
    gods: [{ id: "thufltha", form: "𐌏𐌖𐌚𐌋𐌏𐌀𐌔" }],
    cameraPosition: new THREE.Vector3(-1.4, 1.501, -0.117),
    cameraTarget: new THREE.Vector3(-1.408, 0.001, -0.132),
  },
  {
    id: 22,
    etruscanText: "𐌕𐌉𐌍𐌔𐌏 / 𐌍𐌄𐌏",
    transcription: "tinsθ/neθ",
    gods: [
      { id: "tinia", form: "𐌕𐌉𐌍𐌔𐌏" },
      { id: "nethuns", form: "𐌍𐌄𐌏" },
    ],
    cameraPosition: new THREE.Vector3(-1.432, 1.5, 0.028),
    cameraTarget: new THREE.Vector3(-1.434, 0.004, 0.141),
  },
  {
    id: 23,
    etruscanText: "𐌂𐌀𐌏𐌀",
    transcription: "caθa",
    gods: [{ id: "catha", form: "𐌂𐌀𐌏𐌀" }],
    cameraPosition: new THREE.Vector3(-0.906, 1.501, 0.014),
    cameraTarget: new THREE.Vector3(-0.909, 0.004, 0.108),
  },
  {
    id: 24,
    etruscanText: "𐌚𐌖𐌚𐌋𐌖𐌔",
    transcription: "fuf/lus",
    gods: [{ id: "fufluns", form: "𐌚𐌖𐌚𐌋𐌖𐌔" }],
    cameraPosition: new THREE.Vector3(-1.046, 1.428, -0.618),
    cameraTarget: new THREE.Vector3(-0.94, 0.0, -0.172),
  },
  {
    id: 25,
    etruscanText: "𐌕𐌅𐌖𐌏",
    transcription: "tvnθ",
    gods: [{ id: "tvnth", form: "𐌕𐌅𐌖𐌏", readingStatus: "unclear" }],
    cameraPosition: new THREE.Vector3(-0.783, 1.886, -1.291),
    cameraTarget: new THREE.Vector3(-0.691, 0.398, -1.126),
  },
  {
    id: 26,
    etruscanText: "𐌡𐌀𐌓𐌉𐌔𐌋 / 𐌋𐌀𐌏",
    transcription: "marisl/laθ",
    gods: [
      { id: "maris", form: "𐌡𐌀𐌓𐌉𐌔𐌋" },
      { id: "laran", form: "𐌋𐌀𐌏", readingStatus: "debated" },
    ],
    cameraPosition: new THREE.Vector3(-0.601, 2.019, -0.737),
    cameraTarget: new THREE.Vector3(-0.597, 0.519, -0.701),
  },
  {
    id: 27,
    etruscanText: "𐌋𐌄𐌕𐌀",
    transcription: "leta",
    gods: [{ id: "letham", form: "𐌋𐌄𐌕𐌀" }],
    cameraPosition: new THREE.Vector3(-0.594, 1.903, -0.459),
    cameraTarget: new THREE.Vector3(-0.594, 0.405, -0.376),
  },
  {
    id: 28,
    etruscanText: "𐌍𐌄𐌏",
    transcription: "neθ",
    gods: [{ id: "nethuns", form: "𐌍𐌄𐌏" }],
    cameraPosition: new THREE.Vector3(-0.476, 1.698, 0.277),
    cameraTarget: new THREE.Vector3(-0.6, 0.219, 0.058),
  },
  {
    id: 29,
    etruscanText: "𐌇𐌄𐌓𐌂",
    transcription: "herc",
    gods: [{ id: "hercle", form: "𐌇𐌄𐌓𐌂" }],
    cameraPosition: new THREE.Vector3(0.212, 1.408, -0.23),
    cameraTarget: new THREE.Vector3(-0.254, 0.002, -0.464),
  },
  {
    id: 30,
    etruscanText: "𐌡𐌀𐌓",
    transcription: "mar",
    gods: [{ id: "maris", form: "𐌡𐌀𐌓" }],
    cameraPosition: new THREE.Vector3(0.017, 1.449, 0.446),
    cameraTarget: new THREE.Vector3(-0.293, 0.006, 0.179),
  },
  {
    id: 31,
    etruscanText: "𐌔𐌄𐌋𐌅𐌀",
    transcription: "selva",
    gods: [{ id: "selvans", form: "𐌔𐌄𐌋𐌅𐌀" }],
    cameraPosition: new THREE.Vector3(1.142, 1.485, -0.53),
    cameraTarget: new THREE.Vector3(1.137, 0.0, -0.738),
  },
  {
    id: 32,
    etruscanText: "𐌋𐌄𐌏𐌀",
    transcription: "leθa",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌀" }],
    cameraPosition: new THREE.Vector3(1.57, 1.491, -0.598),
    cameraTarget: new THREE.Vector3(1.629, -0.005, -0.513),
  },
  {
    id: 33,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂",
    transcription: "tlusc",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂" }],
    cameraPosition: new THREE.Vector3(1.604, 1.467, -0.305),
    cameraTarget: new THREE.Vector3(1.536, -0.001, -0.006),
  },
  {
    id: 34,
    etruscanText: "𐌋𐌅𐌔𐌋 / 𐌅𐌄𐌋𐌗",
    transcription: "lvsl/velϰ",
    gods: [
      { id: "lusal", form: "𐌋𐌅𐌔𐌋" },
      { id: "velch", form: "𐌅𐌄𐌋𐌗" },
    ],
    cameraPosition: new THREE.Vector3(0.916, 1.498, 0.385),
    cameraTarget: new THREE.Vector3(0.983, 0.0, 0.356),
  },
  {
    id: 35,
    etruscanText: "𐌔𐌀𐌕𐌓 / 𐌄𐌔",
    transcription: "satr/es",
    gods: [{ id: "satres", form: "𐌔𐌀𐌕𐌓𐌄𐌔" }],
    cameraPosition: new THREE.Vector3(0.493, 1.503, -0.026),
    cameraTarget: new THREE.Vector3(0.502, 0.004, -0.075),
  },
  {
    id: 36,
    etruscanText: "𐌂𐌉𐌋𐌄𐌍",
    transcription: "cilen",
    gods: [{ id: "cilens", form: "𐌂𐌉𐌋𐌄𐌍" }],
    cameraPosition: new THREE.Vector3(0.799, 1.483, -0.567),
    cameraTarget: new THREE.Vector3(0.572, 0.0, -0.586),
  },
  {
    id: 37,
    etruscanText: "𐌋𐌄𐌏𐌀𐌡",
    transcription: "leθam",
    gods: [{ id: "letham", form: "𐌋𐌄𐌏𐌀𐌡" }],
    cameraPosition: new THREE.Vector3(0.21, 1.488, 0.252),
    cameraTarget: new THREE.Vector3(0.114, 0.006, 0.039),
  },
  {
    id: 38,
    etruscanText: "𐌡𐌄𐌕𐌋𐌅𐌡𐌏",
    transcription: "metlvmθ",
    gods: [{ id: "metlvmth", form: "𐌡𐌄𐌕𐌋𐌅𐌡𐌏" }],
    cameraPosition: new THREE.Vector3(0.271, 1, 0.761),
    cameraTarget: new THREE.Vector3(0.287, 0, 0.742),
  },
  {
    id: 39,
    etruscanText: "𐌡𐌀𐌓",
    transcription: "mar",
    gods: [{ id: "maris", form: "𐌡𐌀𐌓" }],
    cameraPosition: new THREE.Vector3(-0.471, 1.48, 0.991),
    cameraTarget: new THREE.Vector3(-0.504, -0.003, 0.765),
  },
  {
    id: 40,
    etruscanText: "𐌕𐌋𐌖𐌔𐌂",
    transcription: "tlusc",
    gods: [{ id: "tluscva", form: "𐌕𐌋𐌖𐌔𐌂" }],
    cameraPosition: new THREE.Vector3(-0.637, 1.468, 0.997),
    cameraTarget: new THREE.Vector3(-0.806, 0.0, 0.738),
  },
  {
    id: 41,
    etruscanText: "𐌕𐌉𐌅𐌓",
    transcription: "tivr",
    gods: [{ id: "tiur", form: "𐌕𐌉𐌅𐌓" }],
    description: "The Moon as cosmic foundation",
    cameraPosition: new THREE.Vector3(0.56, -1.917, -1.091),
    cameraTarget: new THREE.Vector3(0.476, -0.763, -0.917),
  },
  {
    id: 42,
    etruscanText: "𐌖𐌔𐌉𐌋𐌔",
    transcription: "usils",
    gods: [{ id: "usil", form: "𐌖𐌔𐌉𐌋𐌔" }],
    description: "The Sun as cosmic foundation",
    cameraPosition: new THREE.Vector3(0.149, -1.734, -1.067),
    cameraTarget: new THREE.Vector3(0.125, -0.576, -0.903),
  },
]

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

// Type definition for god entries in inscriptions
export type GodEntry =
  | string
  | { id: string; form: string; readingStatus?: ReadingStatus }

// Helper function to extract god ID from god entry
function getGodId(godEntry: GodEntry): string {
  return typeof godEntry === "string" ? godEntry : godEntry.id
}

// Helper function to extract form from god entry
function getGodForm(godEntry: GodEntry): string | null {
  return typeof godEntry === "string" ? null : godEntry.form
}

function getGodReadingStatus(godEntry: GodEntry): ReadingStatus | undefined {
  return typeof godEntry === "string" ? undefined : godEntry.readingStatus
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

export function getGodReadingStatusInInscription(
  godId: string,
  inscriptionId: number,
): ReadingStatus | undefined {
  const inscription = liverInscriptions.find(
    (insc) => insc.id === inscriptionId,
  )

  if (!inscription) return undefined

  const godEntry = inscription.gods.find((god) => getGodId(god) === godId)
  if (!godEntry) return undefined

  return (
    getGodReadingStatus(godEntry) ||
    (inscription.gods.length === 1 ? inscription.readingStatus : undefined)
  )
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
