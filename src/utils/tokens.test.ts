import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  TOKEN_GROUPS,
  TOKEN_NAMES,
  TOKEN_BY_NAME,
  TOKEN_RAMPS,
  tokenVar
} from './tokens'

// Resolved from the project root, not `import.meta.url` — under the jsdom
// environment that is an http URL, not a file one.
const stylesheet = readFileSync(
  resolve(process.cwd(), 'src/styles/tokens.scss'),
  'utf8'
)

/**
 * Token names actually defined for the light theme: the `:root` block plus the
 * `octans-derived-tokens` mixin it includes, which is defined ABOVE `:root` in
 * the file (Sass requires a mixin before its `@include`), so slicing from
 * `:root` alone would miss every derived token.
 */
function declaredTokens(): string[] {
  const derivedStart = stylesheet.indexOf('@mixin octans-derived-tokens')
  const derived = stylesheet.slice(
    derivedStart,
    stylesheet.indexOf('\n}', derivedStart)
  )
  const root = stylesheet.slice(stylesheet.indexOf(':root {'))
  return [
    ...new Set(
      [...(derived + root).matchAll(/--octans-([a-z0-9-]+)\s*:/g)].map(
        (m) => m[1]
      )
    )
  ]
}

/** Token names overridden in the dark mixin. */
function darkTokens(): string[] {
  const start = stylesheet.indexOf('@mixin octans-dark-tokens')
  const block = stylesheet.slice(start, stylesheet.indexOf('\n}', start))
  return [
    ...new Set(
      [...block.matchAll(/--octans-([a-z0-9-]+)\s*:/g)].map((m) => m[1])
    )
  ]
}

describe('token registry', () => {
  it('matches the stylesheet exactly', () => {
    // Guards the registry against drifting from tokens.scss — it drives the
    // Theme Builder, so a missing entry means an uneditable token.
    expect([...TOKEN_NAMES].sort()).toEqual([...declaredTokens()].sort())
  })

  it('has no duplicate names', () => {
    expect(new Set(TOKEN_NAMES).size).toBe(TOKEN_NAMES.length)
  })

  it('every dark override corresponds to a registered token', () => {
    for (const name of darkTokens()) {
      expect(TOKEN_NAMES).toContain(name)
    }
  })

  it('only semantic tokens are overridden for dark', () => {
    // Primitives are the shared palette; overriding one per-theme would mean
    // the two themes silently stop drawing from the same colours.
    const primitives = new Set(
      TOKEN_GROUPS.filter((g) => g.tier === 'primitive').flatMap((g) =>
        g.tokens.map((t) => t.name)
      )
    )
    expect(darkTokens().filter((n) => primitives.has(n))).toEqual([])
  })

  it('builds the custom property name', () => {
    expect(tokenVar('surface-sunken')).toBe('--octans-surface-sunken')
  })

  it('every ramp step is a registered token', () => {
    // The ramp generator writes `${prefix}-${step}`, so a step number that is
    // not in the registry would write a custom property nothing reads.
    for (const { prefix, steps } of TOKEN_RAMPS) {
      for (const step of steps) {
        expect(TOKEN_NAMES).toContain(`${prefix}-${step}`)
      }
    }
  })

  it('ramp steps are ascending', () => {
    // Steps are positions along the ramp, and the generator takes the first
    // and last as its endpoints.
    for (const { prefix, steps } of TOKEN_RAMPS) {
      expect(`${prefix}: ${steps}`).toBe(
        `${prefix}: ${[...steps].sort((a, b) => a - b)}`
      )
    }
  })

  it('indexes every token by name', () => {
    expect(Object.keys(TOKEN_BY_NAME).length).toBe(TOKEN_NAMES.length)
    expect(TOKEN_BY_NAME['surface'].kind).toBe('color')
    expect(TOKEN_BY_NAME['shadow-md'].kind).toBe('shadow')
  })
})
