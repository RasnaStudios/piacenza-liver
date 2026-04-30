import { liverGods } from "../scene/LiverData"

export interface BibEntry {
  shortRef: string
  authors: string
  year: number | string
  title: string
  venue?: string
  pages?: string
  url?: string
}

export const scholarshipEntries: BibEntry[] = [
  {
    shortRef: "Pallottino 1956",
    authors: "Pallottino, M.",
    year: 1956,
    title: "Deorum sedes",
    venue:
      "Studi in onore di Aristide Calderini e Roberto Paribeni III (Milano)",
    pages: "223–234",
    url: "https://archive.org/details/studi-in-onore-di-aristide-calderini-e-roberto-paribeni-vol-iii",
  },
  {
    shortRef: "Colonna 1976-77",
    authors: "Colonna, G.",
    year: "1976–77",
    title: "La dea etrusca Cel e i santuari del Trasimeno",
    venue: "Rivista Storica dell'Antichità VI–VII",
    pages: "45–62",
    url: "https://www.jstor.org/stable/24652437",
  },
  {
    shortRef: "Maggiani 1982",
    authors: "Maggiani, A.",
    year: 1982,
    title: "Qualche osservazione sul fegato di Piacenza",
    venue: "Studi Etruschi L",
    pages: "53–88",
    url: "https://www.studietruschi.org/wp-content/uploads/2021/06/SE50_04.pdf",
  },
  {
    shortRef: "Torelli 1986",
    authors: "Torelli, M.",
    year: 1986,
    title: "La religione",
    venue:
      "Rasenna. Storia e civiltà degli Etruschi, ed. G. Pugliese Carratelli (Milano: Libri Scheiwiller)",
    pages: "159–237",
    url: "https://www.treccani.it/enciclopedia/scienza-greco-romana-religione-societa-e-scienza_%28Storia-della-Scienza%29/",
  },
  {
    shortRef: "van der Meer 1987",
    authors: "van der Meer, L. B.",
    year: 1987,
    title: "The Bronze Liver of Piacenza. Analysis of a Polytheistic Structure",
    venue:
      "Dutch Monographs on Ancient History and Archaeology 2 (Amsterdam: J. C. Gieben; repr. Leiden: Brill, 2022)",
    url: "https://brill.com/display/title/13520",
  },
  {
    shortRef: "Buranelli 1989",
    authors: "Buranelli, F. (ed.)",
    year: 1989,
    title: "La raccolta Giacinto Guglielmi",
    venue:
      "Catalogo della mostra, Palazzi Apostolici Vaticani, Stanze di S. Pio V (Roma: Quasar)",
    pages: "72–77, no. 196",
    url: "https://openlibrary.org/books/OL1797581M/La_Raccolta_Giacinto_Guglielmi",
  },
  {
    shortRef: "Colonna 1991",
    authors: "Colonna, G.",
    year: 1991,
    title: "A proposito degli dei del fegato di Piacenza",
    venue: "Studi Etruschi LIX (1993)",
    pages: "123–139",
    url: "https://www.studietruschi.org/wp-content/uploads/2021/06/SE59_09.pdf",
  },
  {
    shortRef: "Rix 1991",
    authors: "Rix, H. (ed.)",
    year: 1991,
    title: "Etruskische Texte. Editio minor",
    venue: "Tübingen: Gunter Narr",
    url: "https://search.worldcat.org/title/etruskische-texte-editio-minor/oclc/25049167",
  },
  {
    shortRef: "Capdeville 1992",
    authors: "Capdeville, G.",
    year: 1992,
    title: "Le tre Manubie di Tinia",
    venue: "Studi Etruschi LVIII (1993)",
    pages: "155–170",
    url: "https://www.studietruschi.net/en/articolo/le-tre-manubie-di-tinia/7754",
  },
  {
    shortRef: "Maggiani 2005",
    authors: "Maggiani, A.",
    year: 2005,
    title: "Divination. La divinazione in Etruria",
    venue: "Thesaurus Cultus et Rituum Antiquorum (ThesCRA) III",
    pages: "52–78",
    url: "https://www.studietruschi.org/adriano-maggiani-divinazione-la-divinazione-in-etruria-pp-52-78",
  },
  {
    shortRef: "Bonfante 2006",
    authors: "Bonfante, L.",
    year: 2006,
    title: "Etruscan Inscriptions and Etruscan Religion",
    venue:
      "The Religion of the Etruscans, ed. N. T. de Grummond and E. Simon (Austin: University of Texas Press)",
    pages: "9–26",
    url: "https://archive.org/details/religion-of-etruscans/page/53/mode/2up",
  },
  {
    shortRef: "de Grummond 2006",
    authors: "de Grummond, N. T.",
    year: 2006,
    title: "Etruscan Myth, Sacred History, and Legend",
    venue:
      "Philadelphia: University of Pennsylvania Museum of Archaeology and Anthropology",
    url: "https://www.penn.museum/sites/etruscan-myth/",
  },
  {
    shortRef: "Simon 2006",
    authors: "Simon, E.",
    year: 2006,
    title: "Gods in Harmony: The Etruscan Pantheon",
    venue:
      "The Religion of the Etruscans, ed. N. T. de Grummond and E. Simon (Austin: University of Texas Press)",
    pages: "45–65",
    url: "https://archive.org/details/religion-of-etruscans/page/53/mode/2up",
  },
  {
    shortRef: "de Grummond 2008",
    authors: "de Grummond, N. T.",
    year: 2008,
    title: "Moon Over Pyrgi: Catha, an Etruscan Lunar Goddess?",
    venue: "American Journal of Archaeology 112.3",
    pages: "419–428",
    url: "https://ajaonline.org/article/241/",
  },
  {
    shortRef: "Maggiani 2009",
    authors: "Maggiani, A.",
    year: 2009,
    title: "Deorum sedes: divinazione etrusca o dottrina augurale romana?",
    venue: "Annali della Fondazione per il Museo Claudio Faina XVI",
    pages: "221–237",
    url: "https://www.studietruschi.org/adriano-maggiani-deorum-sedes-divinazione-etrusca-o-dottrina-augurale-romana-pp-221-237",
  },
  {
    shortRef: "Stevens 2009",
    authors: "Stevens, N. L. C.",
    year: 2009,
    title: "A New Reconstruction of the Etruscan Heaven",
    venue: "American Journal of Archaeology 113.2",
    pages: "153–164",
    url: "https://www.journals.uchicago.edu/doi/abs/10.3764/aja.113.2.153",
  },
  {
    shortRef: "Maggiani 2011",
    authors: "Maggiani, A.",
    year: 2011,
    title: "Tluschva, divinità ctonie",
    venue:
      "Corollari. Studi di antichità etrusche e italiche in omaggio all'opera di Giovanni Colonna, ed. D. F. Maras (Pisa–Roma)",
    pages: "138–149",
    url: "https://iris.unive.it/handle/10278/28866",
  },
  {
    shortRef: "van der Meer 2009",
    authors: "van der Meer, L. B.",
    year: 2009,
    title: "On the enigmatic deity Lur in the Liber linteus Zagrabiensis (LL)",
    venue:
      "Votives, Places and Rituals in Etruscan Religion: Studies in Honor of Jean MacIntosh Turfa, ed. M. Becker & M. Gleba (Leiden–Boston: Brill)",
    pages: "217–228",
    url: "https://brill.com/display/book/edcoll/9789047426783/Bej.9789004168732.i-279_018.xml",
  },
  {
    shortRef: "van der Meer 2011",
    authors: "van der Meer, L. B.",
    year: 2011,
    title: "Etrusco ritu. Case Studies in Etruscan Ritual Behaviour",
    venue: "Louvain–Walpole, MA: Peeters",
    url: "https://www.peeters-leuven.be/detail.php?nr=8786&search=van%20der%20meer",
  },
  {
    shortRef: "Colonna 2012",
    authors: "Colonna, G.",
    year: 2012,
    title:
      "I santuari comunitari e il culto delle divinità catactonie in Etruria",
    venue: "Annali della Fondazione per il Museo Claudio Faina XIX",
    pages: "203–226",
    url: "https://www.fondazionefaina.it/it/pubblicazioni/annali/AnnFaina_XIX",
  },
  {
    shortRef: "Potts & Smith 2021",
    authors: "Potts, C. R. & Smith, C. J.",
    year: 2021,
    title: "The Etruscans: Setting New Agendas",
    venue: "Journal of Archaeological Research 30",
    pages: "597–644",
    url: "https://link.springer.com/article/10.1007/s10814-021-09169-x",
  },
  {
    shortRef: "Stopponi 2012",
    authors: "Stopponi, S.",
    year: 2012,
    title: "Il Fanum Voltumnae: dalle divinità Tluschva a San Pietro",
    venue: "Annali della Fondazione per il Museo Claudio Faina XIX",
    pages: "7–75",
    url: "https://www.academia.edu/29963416/Il_Fanum_Voltumnae_dalle_divinit%C3%A0_Tluschva_a_San_Pietro",
  },
  {
    shortRef: "Gottarelli 2013",
    authors: "Gottarelli, A.",
    year: 2013,
    title:
      "Contemplatio. Templum solare e culti di fondazione. Sulla regola aritmogeometrica del rito di fondazione della città etrusco-italica tra VI e IV secolo a.C.",
    venue: "Bologna: Te.m.p.l.a.",
    url: "https://cris.unibo.it/handle/11585/199462",
  },
  {
    shortRef: "Krauskopf 2013",
    authors: "Krauskopf, I.",
    year: 2013,
    title: "Gods and Demons in the Etruscan Pantheon",
    venue: "The Etruscan World, ed. J. M. Turfa (London–New York: Routledge)",
    pages: "513–538",
    url: "https://archiv.ub.uni-heidelberg.de/propylaeumdok/5345/1/Krauskopf_Gods_and_Demons_2013.pdf",
  },
  {
    shortRef: "de Grummond 2014",
    authors: "de Grummond, N. T.",
    year: 2014,
    title: "The cult of Lur: prophecy and human sacrifice?",
    venue: "Mediterranea XI",
    pages: "141–171",
    url: "https://www.researchgate.net/publication/378766141",
  },
  {
    shortRef: "Gottarelli 2017",
    authors: "Gottarelli, A.",
    year: 2017,
    title: "Cosmogonica. Il fegato di Tiāmat e la soglia misterica del tempo",
    venue: "Bologna: Te.m.p.l.a.",
    url: "https://cris.unibo.it/handle/11585/595432",
  },
  {
    shortRef: "Maras 2017",
    authors: "Maras, D. F.",
    year: 2017,
    title: "Religion",
    venue: "Etruscology, ed. A. Naso (Berlin–Boston: De Gruyter)",
    pages: "277–316",
    url: "https://doi.org/10.1515/9781934078495-018",
  },
  {
    shortRef: "Gottarelli 2018",
    authors: "Gottarelli, A.",
    year: 2018,
    title:
      "Padānu. Un'ombra tra le mani del tempo. La decifrazione funzionale del fegato etrusco di Piacenza",
    venue: "Bologna: Te.m.p.l.a.",
    url: "https://cris.unibo.it/handle/11585/626277",
  },
  {
    shortRef: "Moore 2018",
    authors: "Moore, D.",
    year: 2018,
    title: "The Etruscan Goddess Catha",
    venue: "Etruscan and Italic Studies 21.1–2",
    pages: "58–77",
    url: "https://www.degruyterbrill.com/document/doi/10.1515/etst-2017-0030/html",
  },
  {
    shortRef: "Pernigotti 2018",
    authors: "Pernigotti, A. P.",
    year: 2018,
    title:
      "Moto diurno e moto annuo: riflessioni sul sistema cosmico degli Etruschi",
    venue: "Studi Etruschi LXXXI (2019)",
    pages: "183–199",
    url: "https://www.studietruschi.org/antonio-paolo-pernigotti-moto-diurno-e-moto-annuo-riflessioni-sul-sistema-cosmico-degli-etruschi-pp-183-199",
  },
  {
    shortRef: "Sannibale 2018",
    authors: "Sannibale, M.",
    year: 2018,
    title:
      "Il crescente lunare con dedica a Tiur già collezione Borgia (CII 2610 bis)",
    venue: "Studi Etruschi LXXXI (2019)",
    pages: "253–264",
    url: "https://www.studietruschi.org/wp-content/uploads/2021/06/SE81_13.pdf",
  },
  {
    shortRef: "Amann 2019",
    authors: "Amann, P.",
    year: 2019,
    title: "Women and Votive Inscriptions in Etruscan Epigraphy",
    venue: "Etruscan Studies 22.1–2",
    pages: "39–64",
    url: "https://doi.org/10.1515/etst-2019-0003",
  },
]

const ENTRY_BY_REF: Record<string, BibEntry> = Object.fromEntries(
  scholarshipEntries.map((e) => [e.shortRef, e]),
)

export function sourceIdFromShortRef(shortRef: string): string {
  return shortRef
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

function bibYearNum(year: BibEntry["year"] | undefined): number {
  if (year === undefined) return 0
  return typeof year === "number" ? year : Number.parseInt(`${year}`, 10) || 0
}

/** Full bibliography sorted oldest first. */
export const bibliographyEntries: BibEntry[] = [...scholarshipEntries].sort(
  (a, b) => {
    const ay = bibYearNum(a.year)
    const by = bibYearNum(b.year)
    if (ay !== by) return ay - by
    return a.shortRef.localeCompare(b.shortRef)
  },
)

/** Per-deity sources, sorted newest first for relevance. */
export function getDeitySources(deityId: string): string[] {
  const refs = liverGods[deityId]?.sources ?? []
  return [...refs].sort((a, b) => {
    const ay = bibYearNum(ENTRY_BY_REF[a]?.year)
    const by = bibYearNum(ENTRY_BY_REF[b]?.year)
    if (ay !== by) return by - ay
    return a.localeCompare(b)
  })
}

export function getSourceUrl(shortRef: string): string | undefined {
  return ENTRY_BY_REF[shortRef]?.url
}
