// Generates the synthetic story fixtures under src/data and src/styleguide.
//
// These files replace production data exported from a live account, which
// contained real customer email addresses and account identifiers. Nothing
// here is real: it is generated from a fixed seed so the output is stable
// across runs and diffs stay empty unless this script changes.
//
// The domain is a museum collection — artworks, exhibitions and venues. It is
// deliberately something everyone already understands, so a story reads as a
// demonstration of the component rather than of a business model. The artists
// and titles are real and long out of copyright; every identifier, date, price
// and person attached to them is invented.
//
// Regenerate with: node scripts/generate-fixtures.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// --- deterministic PRNG (mulberry32) ------------------------------------
let _seed = 0x5eed
function rng() {
  _seed |= 0
  _seed = (_seed + 0x6d2b79f5) | 0
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const int = (min, max) => Math.floor(rng() * (max - min + 1)) + min
const money = (min, max) => Math.round((rng() * (max - min) + min) * 100) / 100
const chance = (p) => rng() < p

function dateBetween(startYear, endYear) {
  const start = Date.UTC(startYear, 0, 1)
  const end = Date.UTC(endYear, 11, 31)
  const d = new Date(start + rng() * (end - start))
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

function hex(len) {
  let s = ''
  while (s.length < len) s += Math.floor(rng() * 16).toString(16)
  return s.slice(0, len)
}

// --- the catalogue -------------------------------------------------------
// Real works, correctly attributed — the tuples are never split apart, so a
// row never invents an attribution. Long enough that the largest fixture can
// hand every record a distinct work.
const WORKS = [
  ['Vincent van Gogh', 'The Starry Night', 1889, 'Oil on canvas'],
  ['Vincent van Gogh', 'Sunflowers', 1888, 'Oil on canvas'],
  ['Vincent van Gogh', 'The Bedroom', 1888, 'Oil on canvas'],
  ['Johannes Vermeer', 'Girl with a Pearl Earring', 1665, 'Oil on canvas'],
  ['Johannes Vermeer', 'The Milkmaid', 1658, 'Oil on canvas'],
  [
    'Katsushika Hokusai',
    'The Great Wave off Kanagawa',
    1831,
    'Woodblock print'
  ],
  ['Katsushika Hokusai', 'Fine Wind, Clear Morning', 1831, 'Woodblock print'],
  ['Claude Monet', 'Impression, Sunrise', 1872, 'Oil on canvas'],
  ['Claude Monet', 'Water Lilies', 1906, 'Oil on canvas'],
  ['Claude Monet', 'Rouen Cathedral, Full Sunlight', 1894, 'Oil on canvas'],
  ['Leonardo da Vinci', 'Mona Lisa', 1503, 'Oil on poplar panel'],
  ['Leonardo da Vinci', 'The Last Supper', 1498, 'Tempera on gesso'],
  ['Rembrandt van Rijn', 'The Night Watch', 1642, 'Oil on canvas'],
  [
    'Rembrandt van Rijn',
    'Self-Portrait with Two Circles',
    1665,
    'Oil on canvas'
  ],
  ['Sandro Botticelli', 'The Birth of Venus', 1485, 'Tempera on canvas'],
  ['Sandro Botticelli', 'Primavera', 1480, 'Tempera on panel'],
  ['Edvard Munch', 'The Scream', 1893, 'Tempera and crayon on cardboard'],
  ['Edvard Munch', 'The Dance of Life', 1900, 'Oil on canvas'],
  ['Gustav Klimt', 'The Kiss', 1908, 'Oil and gold leaf on canvas'],
  [
    'Gustav Klimt',
    'Portrait of Adele Bloch-Bauer I',
    1907,
    'Oil and gold on canvas'
  ],
  ['Georges Seurat', 'A Sunday on La Grande Jatte', 1886, 'Oil on canvas'],
  ['Georges Seurat', 'Bathers at Asnières', 1884, 'Oil on canvas'],
  ['Édouard Manet', 'A Bar at the Folies-Bergère', 1882, 'Oil on canvas'],
  ['Édouard Manet', 'Olympia', 1863, 'Oil on canvas'],
  ['Edgar Degas', 'The Dance Class', 1874, 'Oil on canvas'],
  ['Edgar Degas', 'L’Absinthe', 1876, 'Oil on canvas'],
  [
    'Pierre-Auguste Renoir',
    'Luncheon of the Boating Party',
    1881,
    'Oil on canvas'
  ],
  [
    'Pierre-Auguste Renoir',
    'Bal du moulin de la Galette',
    1876,
    'Oil on canvas'
  ],
  ['Paul Cézanne', 'The Card Players', 1895, 'Oil on canvas'],
  ['Paul Cézanne', 'Mont Sainte-Victoire', 1902, 'Oil on canvas'],
  ['Paul Gauguin', 'Where Do We Come From?', 1897, 'Oil on canvas'],
  ['Paul Gauguin', 'Vision After the Sermon', 1888, 'Oil on canvas'],
  ['Henri Matisse', 'The Dance', 1910, 'Oil on canvas'],
  ['Henri Matisse', 'The Red Studio', 1911, 'Oil on canvas'],
  [
    'Hieronymus Bosch',
    'The Garden of Earthly Delights',
    1505,
    'Oil on oak panel'
  ],
  ['Pieter Bruegel the Elder', 'The Hunters in the Snow', 1565, 'Oil on panel'],
  ['Pieter Bruegel the Elder', 'The Tower of Babel', 1563, 'Oil on panel'],
  ['Jan van Eyck', 'The Arnolfini Portrait', 1434, 'Oil on oak panel'],
  ['Albrecht Dürer', 'Young Hare', 1502, 'Watercolour and gouache'],
  ['Albrecht Dürer', 'Melencolia I', 1514, 'Engraving'],
  ['Caravaggio', 'The Calling of Saint Matthew', 1600, 'Oil on canvas'],
  ['Caravaggio', 'Supper at Emmaus', 1601, 'Oil on canvas'],
  ['Artemisia Gentileschi', 'Judith Slaying Holofernes', 1620, 'Oil on canvas'],
  [
    'Artemisia Gentileschi',
    'Self-Portrait as the Allegory of Painting',
    1639,
    'Oil on canvas'
  ],
  ['Diego Velázquez', 'Las Meninas', 1656, 'Oil on canvas'],
  ['Diego Velázquez', 'The Rokeby Venus', 1651, 'Oil on canvas'],
  ['Francisco Goya', 'The Third of May 1808', 1814, 'Oil on canvas'],
  [
    'Francisco Goya',
    'Saturn Devouring His Son',
    1823,
    'Mixed media on plaster'
  ],
  ['J. M. W. Turner', 'The Fighting Temeraire', 1839, 'Oil on canvas'],
  ['J. M. W. Turner', 'Rain, Steam and Speed', 1844, 'Oil on canvas'],
  ['John Constable', 'The Hay Wain', 1821, 'Oil on canvas'],
  [
    'Caspar David Friedrich',
    'Wanderer above the Sea of Fog',
    1818,
    'Oil on canvas'
  ],
  ['Eugène Delacroix', 'Liberty Leading the People', 1830, 'Oil on canvas'],
  ['Jacques-Louis David', 'The Death of Marat', 1793, 'Oil on canvas'],
  ['Théodore Géricault', 'The Raft of the Medusa', 1819, 'Oil on canvas'],
  [
    'Utagawa Hiroshige',
    'Sudden Shower over Shin-Ōhashi',
    1857,
    'Woodblock print'
  ],
  ['Utagawa Hiroshige', 'Plum Park in Kameido', 1857, 'Woodblock print'],
  ['Mary Cassatt', 'The Child’s Bath', 1893, 'Oil on canvas'],
  ['Mary Cassatt', 'The Boating Party', 1894, 'Oil on canvas'],
  ['Berthe Morisot', 'The Cradle', 1872, 'Oil on canvas'],
  ['Hilma af Klint', 'The Ten Largest, No. 7', 1907, 'Tempera on paper'],
  ['Wassily Kandinsky', 'Composition VII', 1913, 'Oil on canvas'],
  ['Wassily Kandinsky', 'Yellow-Red-Blue', 1925, 'Oil on canvas'],
  [
    'Piet Mondrian',
    'Composition with Red, Blue and Yellow',
    1930,
    'Oil on canvas'
  ],
  ['Kazimir Malevich', 'Black Square', 1915, 'Oil on linen'],
  ['Egon Schiele', 'Seated Woman with Bent Knee', 1917, 'Gouache and crayon'],
  ['Henri Rousseau', 'The Sleeping Gypsy', 1897, 'Oil on canvas'],
  ['Henri Rousseau', 'The Dream', 1910, 'Oil on canvas'],
  ['James McNeill Whistler', 'Whistler’s Mother', 1871, 'Oil on canvas'],
  ['Grant Wood', 'American Gothic', 1930, 'Oil on beaverboard'],
  ['Winslow Homer', 'The Gulf Stream', 1899, 'Oil on canvas'],
  [
    'Katsushika Ōi',
    'Night Scene in the Yoshiwara',
    1850,
    'Ink and colour on silk'
  ],
  ['Rosa Bonheur', 'The Horse Fair', 1855, 'Oil on canvas'],
  [
    'Élisabeth Vigée Le Brun',
    'Self-Portrait in a Straw Hat',
    1782,
    'Oil on canvas'
  ],
  [
    'Jean-Auguste-Dominique Ingres',
    'La Grande Odalisque',
    1814,
    'Oil on canvas'
  ],
  ['Gustave Courbet', 'The Artist’s Studio', 1855, 'Oil on canvas'],
  ['Camille Pissarro', 'Boulevard Montmartre at Night', 1897, 'Oil on canvas'],
  [
    'Alfred Sisley',
    'The Bridge at Villeneuve-la-Garenne',
    1872,
    'Oil on canvas'
  ],
  ['Suzuki Harunobu', 'Girl Viewing Plum Blossoms', 1765, 'Woodblock print'],
  ['Ogata Kōrin', 'Red and White Plum Blossoms', 1715, 'Ink and gold on paper']
]

/** Cycles the catalogue so every record gets a distinct work where possible. */
function workAt(i) {
  const [artist, title, year, medium] = WORKS[i % WORKS.length]
  return { artist, title, year, medium }
}

// --- synthetic people ----------------------------------------------------
// Curators and registrars. Deliberately invented; the domain is always
// example.org so nothing can resolve to a real mailbox.
const FIRST = [
  'ada',
  'bo',
  'cleo',
  'dara',
  'eli',
  'fern',
  'gus',
  'hana',
  'iris',
  'jae',
  'kit',
  'lior',
  'mira',
  'nils',
  'ola',
  'pip',
  'quin',
  'rune',
  'sana',
  'tao',
  'uma',
  'vero',
  'wren',
  'xena',
  'yuki',
  'zane'
]
const LAST = [
  'ashby',
  'blume',
  'cardoso',
  'dunn',
  'ekhart',
  'farrow',
  'gale',
  'hollis',
  'ives',
  'jarrah',
  'koval',
  'lindqvist',
  'moreau',
  'nakata',
  'oduya',
  'pereira',
  'quill',
  'rosendahl',
  'sato',
  'tellier',
  'ustinov',
  'vance',
  'whitlock',
  'ximenes',
  'yarrow',
  'zeller'
]

function email() {
  const sep = pick(['.', '_', ''])
  const suffix = chance(0.3) ? String(int(1, 99)) : ''
  return `${pick(FIRST)}${sep}${pick(LAST)}${suffix}@example.org`
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY']
const ACQUISITION_METHODS = [
  'BEQUEST',
  'PURCHASE',
  'GIFT',
  'TRANSFER',
  'COMMISSION',
  'LONG-LOAN',
  'EXCHANGE'
]
const CONDITION_NOTES = [
  'Surface cleaned; varnish left in place.',
  'Frame is a later replacement.',
  'Light foxing along the lower edge.',
  'Requires low-lux display, 50 lux maximum.',
  'Condition report filed with the registrar.',
  null,
  null,
  null
]

// --- artworks ------------------------------------------------------------
// Used by the DataTable and Filters stories.
function generateArtworks(count = 80) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const work = workAt(i)
    const currency = pick(CURRENCIES)
    const valuation = money(20000, 900000)
    const isInsured = chance(0.55)
    const premium = isInsured ? money(200, Math.min(valuation * 0.03, 9000)) : 0
    rows.push({
      id: 100000 + i * 7 + int(0, 6),
      collectionId: 1000 + int(0, 3),
      catalogNumber: `INV-${String(int(100000, 999999))}`,
      title: work.title,
      artist: work.artist,
      year: work.year,
      medium: work.medium,
      curatorEmail: email(),
      acquiredDate: dateBetween(2023, 2025),
      currency,
      valuation,
      acquisitionMethod: chance(0.75) ? pick(ACQUISITION_METHODS) : null,
      insurancePremium: premium,
      accessionKey: hex(32),
      conservationCost: chance(0.3) ? money(500, 12000) : null,
      valuationLocalCurrency: valuation,
      insurancePremiumLocalCurrency: premium,
      galleryId: 4000 + int(0, 5),
      notes: pick(CONDITION_NOTES)
    })
  }
  return rows
}

// --- works ---------------------------------------------------------------
// The pool an exhibition draws from. Same catalogue, a lighter record.
const FRAMING = ['Unframed', 'Gilt frame', 'Museum box', 'Perspex mount']
function generateWorks(count = 120) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const work = workAt(i)
    const currency = pick(['$', '€', '£'])
    rows.push({
      id: 10000 + i,
      displayText: work.title,
      artist: work.artist,
      year: work.year,
      medium: work.medium,
      valueSymbol: currency,
      catalogNumber: `CAT-${String(work.year)}-${hex(4).toUpperCase()}`,
      framing: pick(FRAMING),
      loanFee: chance(0.4) ? int(500, 25000) : -1,
      timesExhibited: int(0, 40),
      status: pick([
        'active',
        'active',
        'active',
        'in-conservation',
        'retired'
      ]),
      updatedOn: dateBetween(2023, 2024),
      insuredValue: chance(0.5) ? int(20000, 250000) : 0,
      onDisplay: chance(0.6)
    })
  }
  return rows
}

// --- exhibitions ---------------------------------------------------------
const EXHIBITION_PREFIX = [
  'Light and Colour',
  'The Printed Line',
  'Portraits of the Age',
  'After Impressionism',
  'Northern Renaissance',
  'Landscape and Weather',
  'Women of the Salon',
  'Ink and Woodblock',
  'The Modern Eye',
  'Still Life Reconsidered'
]
const EXHIBITION_REGION = ['AU', 'US', 'UK', 'DE', 'FR', 'IT', 'ES', 'JP']
function generateExhibitions(count = 120) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const numWorks = chance(0.6) ? int(1, 5) : 0
    rows.push({
      id: 15000 + i,
      name: `${pick(EXHIBITION_PREFIX)} ${pick(EXHIBITION_REGION)}`,
      type: pick(['permanent', 'touring', 'featured', 'archive']),
      status: pick(['active', 'active', 'active', 'draft', 'planned']),
      membersOnly: chance(0.2),
      photographyAllowed: chance(0.1),
      audioGuide: chance(0.1),
      loanDays: chance(0.3) ? int(1, 30) : 0,
      tag: chance(0.3) ? pick(['seasonal', 'touring', 'always-on']) : null,
      numWorks,
      workIds: numWorks
        ? Array.from({ length: numWorks }, () => 10000 + int(0, 119))
        : null,
      venueId: chance(0.5) ? 11000 + int(0, 12) : -1,
      venueName: null,
      updatedOn: dateBetween(2023, 2025)
    })
  }
  return rows
}

// --- venues --------------------------------------------------------------
const VENUE_NAMES = [
  'Main Hall',
  'West Wing',
  'Print Room',
  'Sculpture Court',
  'Long Gallery',
  'Rotunda',
  'Study Room',
  'Atrium',
  'Lower Level',
  'Reading Room',
  'Garden Pavilion',
  'North Annexe',
  'Project Space'
]
function generateVenues() {
  return VENUE_NAMES.map((name, i) => {
    const created = dateBetween(2023, 2024)
    const updated = dateBetween(2024, 2025)
    const draftId = 22000 + i * 3
    const published = chance(0.75)
    return {
      id: 11000 + i,
      collectionId: 1000,
      name: `EN - ${name}`,
      type: pick(['Permanent', 'Temporary', 'Off-site']),
      draftId,
      draftUpdatedOn: updated,
      publishedId: published ? draftId : null,
      publishedOn: published ? updated : null,
      status: published ? 'active' : 'draft',
      createdBy: 2000 + int(0, 9),
      createdOn: created,
      updatedBy: 2000 + int(0, 9),
      updatedOn: updated
    }
  })
}

// --- write ---------------------------------------------------------------
const outputs = [
  ['src/styleguide/artworks.json', generateArtworks()],
  ['src/data/works.json', generateWorks()],
  ['src/data/exhibitions.json', generateExhibitions()],
  ['src/data/venues.json', generateVenues()]
]

for (const [relPath, data] of outputs) {
  const full = resolve(root, relPath)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n')
  console.log(`wrote ${relPath} (${data.length} records)`)
}
