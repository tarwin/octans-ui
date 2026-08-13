/**
 * Placeholder images for stories that need one.
 *
 * These are inline SVG data URIs, not photographs. That is deliberate:
 *
 *   - Nothing is hotlinked, so a published Storybook does not depend on some
 *     other site staying up, and the examples work offline.
 *   - No image licensing to reason about. The paintings they nod to are long
 *     out of copyright, but photographs *of* them frequently are not.
 *
 * Each plate is an abstract colour study in the palette of the work it names —
 * enough to fill a thumbnail and be visibly distinct from its neighbours. It is
 * not a reproduction and is not trying to be one.
 */

interface Plate {
  title: string
  artist: string
  year: number
  /** Background, then the three shapes, back to front. */
  colors: [string, string, string, string]
}

const PLATES: Plate[] = [
  {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: 1889,
    colors: ['#0b1d51', '#1b3a8a', '#f2c94c', '#8ab6e8']
  },
  {
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 1831,
    colors: ['#e8e0cc', '#1f4e79', '#5b9bd5', '#f7f3e8']
  },
  {
    title: 'Impression, Sunrise',
    artist: 'Claude Monet',
    year: 1872,
    colors: ['#6d7f96', '#93a3b5', '#e8703a', '#c9d3dd']
  },
  {
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: 1665,
    colors: ['#12100e', '#3a2f26', '#d9a441', '#2e5f8a']
  },
  {
    title: 'Composition with Red, Blue and Yellow',
    artist: 'Piet Mondrian',
    year: 1930,
    colors: ['#f4f2ec', '#d42b1f', '#1b46a8', '#f2c318']
  },
  {
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: 1906,
    colors: ['#1e3f34', '#3f7a5e', '#b8d8c0', '#e4a7c1']
  }
]

/**
 * Composed as a string rather than with the DOM so it works in any context, and
 * encoded rather than base64'd so the markup stays readable in dev tools.
 */
function toDataUri(plate: Plate): string {
  const [bg, a, b, c] = plate.colors
  // `width`/`height` are not optional here. Thumbnail sizes its image as a
  // percentage of a container that is itself sized by the image, so a source
  // with no intrinsic dimensions — which a viewBox alone does not provide —
  // resolves that circle at zero and renders nothing.
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320" role="img">`,
    `<rect width="320" height="320" fill="${bg}"/>`,
    `<circle cx="112" cy="120" r="86" fill="${a}"/>`,
    `<path d="M0 232q80-56 160 0t160-48v136H0Z" fill="${b}"/>`,
    `<circle cx="228" cy="88" r="42" fill="${c}"/>`,
    `</svg>`
  ].join('')
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export interface ArtPlate extends Plate {
  /** Ready to drop straight into an `<img src>`. */
  url: string
  /** `"The Starry Night, Vincent van Gogh (1889)"` */
  caption: string
}

export const artPlates: ArtPlate[] = PLATES.map((plate) => ({
  ...plate,
  url: toDataUri(plate),
  caption: `${plate.title}, ${plate.artist} (${plate.year})`
}))

/** Cycles, so a story can ask for as many as it likes without running out. */
export function artPlate(index: number): ArtPlate {
  return artPlates[index % artPlates.length]
}
