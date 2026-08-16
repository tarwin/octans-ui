import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CONTRAST_PAIRS, pairsForToken } from './contrastPairs'

describe('CONTRAST_PAIRS', () => {
  // The table is the shared contract between `pnpm run check:contrast` and the
  // Theme Builder's badges. A typo in a token name does not throw in either —
  // the script reports the pair as unresolved and the badge silently skips it,
  // so a rule would stop being enforced without anyone noticing.
  it('only names tokens that tokens.scss actually declares', () => {
    const css = readFileSync(resolve('src/styles/tokens.scss'), 'utf8')
    const declared = new Set(
      [...css.matchAll(/--octans-([a-z0-9-]+):/g)].map((m) => m[1])
    )
    const referenced = new Set(CONTRAST_PAIRS.flatMap((p) => [p.fg, p.bg]))
    const missing = [...referenced].filter((name) => !declared.has(name))
    expect(missing).toEqual([])
  })

  it('asks for a sane ratio on every pair', () => {
    for (const pair of CONTRAST_PAIRS) {
      expect(pair.min).toBeGreaterThan(1)
      expect(pair.min).toBeLessThanOrEqual(21)
      expect(pair.label).not.toBe('')
    }
  })

  it('has no duplicate fg/bg rows', () => {
    const keys = CONTRAST_PAIRS.map((p) => `${p.fg}|${p.bg}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('finds every pair a token is the foreground of', () => {
    const found = pairsForToken('text-on-primary')
    expect(found.length).toBeGreaterThan(1)
    expect(found.every((p) => p.fg === 'text-on-primary')).toBe(true)
    expect(found.map((p) => p.bg)).toContain('primary')
    expect(pairsForToken('not-a-token')).toEqual([])
  })
})
