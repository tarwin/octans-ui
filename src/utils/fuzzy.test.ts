import { describe, expect, it } from 'vitest'
import { fuzzyFilter, fuzzyMatch, fuzzyScore } from './fuzzy'

describe('fuzzyScore', () => {
  it('matches a scattered subsequence', () => {
    expect(fuzzyScore('gwp', 'Girl with a Pearl Earring')).not.toBeNull()
    expect(fuzzyScore('strnght', 'The Starry Night')).not.toBeNull()
  })

  it('rejects characters that are out of order', () => {
    expect(fuzzyScore('pwg', 'Girl with a Pearl Earring')).toBeNull()
  })

  it('rejects characters that are absent', () => {
    expect(fuzzyScore('zebra', 'The Starry Night')).toBeNull()
  })

  it('is case-insensitive', () => {
    expect(fuzzyScore('STARRY', 'The Starry Night')).not.toBeNull()
  })

  it('treats an empty query as matching everything', () => {
    expect(fuzzyScore('', 'anything')).toBe(0)
  })

  it('scores a contiguous run above a scattered one', () => {
    const contiguous = fuzzyScore('star', 'Starry')!
    const scattered = fuzzyScore('star', 'Sunset at Arles')!
    expect(contiguous).toBeGreaterThan(scattered)
  })

  it('rewards matching at a word boundary', () => {
    const boundary = fuzzyScore('wave', 'The Great Wave')!
    const mid = fuzzyScore('wave', 'Microwaves')!
    expect(boundary).toBeGreaterThan(mid)
  })
})

describe('fuzzyMatch', () => {
  it('reports match without the score', () => {
    expect(fuzzyMatch('vg', 'Vincent van Gogh')).toBe(true)
    expect(fuzzyMatch('xq', 'Vincent van Gogh')).toBe(false)
  })
})

describe('fuzzyFilter', () => {
  const works = [
    { label: 'Water Lilies', description: 'Claude Monet' },
    { label: 'The Starry Night', description: 'Vincent van Gogh' },
    { label: 'Impression, Sunrise', description: 'Claude Monet' }
  ]
  const text = (w: (typeof works)[number]) => [w.label, w.description]

  it('drops non-matches and orders the rest by score', () => {
    const result = fuzzyFilter('starry', works, text)
    expect(result.map((w) => w.label)).toEqual(['The Starry Night'])
  })

  it('matches on any of the strings returned by getText', () => {
    const result = fuzzyFilter('monet', works, text)
    expect(result.map((w) => w.label)).toEqual([
      'Water Lilies',
      'Impression, Sunrise'
    ])
  })

  it('returns the input untouched for an empty query', () => {
    expect(fuzzyFilter('   ', works, text)).toBe(works)
  })

  it('keeps the original order for equal scores', () => {
    // Both match "monet" identically on their description, so the tie-break is
    // the order they came in.
    const result = fuzzyFilter('claude', works, text)
    expect(result.map((w) => w.label)).toEqual([
      'Water Lilies',
      'Impression, Sunrise'
    ])
  })

  it('ignores missing text without matching on it', () => {
    const sparse = [{ label: 'Untitled', description: undefined }]
    expect(
      fuzzyFilter('untld', sparse, (w) => [w.label, w.description])
    ).toEqual(sparse)
    expect(fuzzyFilter('zzz', sparse, (w) => [w.label, w.description])).toEqual(
      []
    )
  })
})
