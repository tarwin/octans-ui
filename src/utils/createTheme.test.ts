import { describe, expect, it } from 'vitest'
import {
  createTheme,
  DEFAULT_DARK_TEXT,
  labelForFill,
  ROLE_FILL_STEP
} from './createTheme'
import { importCustomTheme, exportCustomTheme } from './customTheme'
import { parseColor, relativeLuminance } from './color'
import { TOKEN_RAMP_BY_PREFIX } from './tokens'

const contrast = (aHex: string, bHex: string) => {
  const la = relativeLuminance(parseColor(aHex)!)
  const lb = relativeLuminance(parseColor(bHex)!)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

describe('createTheme', () => {
  it('generates the full primary ramp from one seed', () => {
    const theme = createTheme({ name: 'Ocean', primary: '#0f9d8f' })
    for (const step of TOKEN_RAMP_BY_PREFIX['primary'].steps) {
      expect(theme.tokens[`primary-${step}`]).toMatch(/^#[0-9a-f]{6}$/)
    }
    // The seed IS step 500 — the colour you picked appears in the theme.
    expect(theme.tokens['primary-500']).toBe('#0f9d8f')
  })

  it('leaves unseeded ramps out, so the theme stays sparse', () => {
    const theme = createTheme({ name: 'Ocean', primary: '#0f9d8f' })
    expect(
      Object.keys(theme.tokens).filter((t) => t.startsWith('error'))
    ).toEqual([])
  })

  it('keeps ramps ordered light to dark', () => {
    const theme = createTheme({ name: 'Ocean', primary: '#0f9d8f' })
    const steps = TOKEN_RAMP_BY_PREFIX['primary'].steps
    const luminances = steps.map((s) =>
      relativeLuminance(parseColor(theme.tokens[`primary-${s}`])!)
    )
    for (let i = 1; i < luminances.length; i++) {
      expect(luminances[i]).toBeLessThan(luminances[i - 1])
    }
  })

  it('picks white labels for a dark fill and dark for a pale one', () => {
    const dark = createTheme({ name: 'Deep', primary: '#1a2f66' })
    expect(dark.tokens['text-on-primary']).toBe('#ffffff')

    const pale = createTheme({ name: 'Lemon', warning: '#ffe66d' })
    // The warning FILL reads step 700, which sits far below a pale seed — the
    // measured colour decides, not the seed.
    const fill = pale.tokens['warning-700']
    const label = pale.tokens['text-on-warning']
    expect(contrast(label, fill)).toBeGreaterThan(4.5)
  })

  it("uses the seeded neutral's near-black for dark labels", () => {
    const theme = createTheme({
      name: 'Warm',
      neutral: '#8a8378',
      warning: '#ffd75e'
    })
    expect(theme.tokens['text-on-warning']).toBe(theme.tokens['neutral-950'])
  })

  it('maps radius presets onto the two knobs', () => {
    const theme = createTheme({ name: 'Square', radius: 'none' })
    expect(theme.tokens['radius-field']).toBe('0px')
    expect(theme.tokens['radius-box']).toBe('0px')

    const custom = createTheme({
      name: 'Custom',
      radius: { field: '5px', box: '10px' }
    })
    expect(custom.tokens['radius-field']).toBe('5px')
    expect(custom.tokens['radius-box']).toBe('10px')
  })

  it('produces only registered tokens, so the theme round-trips', () => {
    const theme = createTheme({
      name: 'Everything',
      neutral: '#7b8798',
      primary: '#0f9d8f',
      secondary: '#5b6b8c',
      tertiary: '#c25e9c',
      info: '#2478cc',
      success: '#16a06a',
      warning: '#e08a0b',
      error: '#dc3d3d',
      radius: 'large'
    })
    // `importCustomTheme` rejects unknown token names, so a clean round-trip
    // proves every generated token is real.
    const back = importCustomTheme(exportCustomTheme(theme))
    expect(back.tokens).toEqual(theme.tokens)
    expect(back.ramps).toEqual(theme.ramps)
  })

  it('stores the generating gradients for the Theme Builder', () => {
    const theme = createTheme({ name: 'Ocean', primary: '#0f9d8f' })
    expect(theme.ramps?.primary.stops).toHaveLength(3)
    expect(theme.ramps?.primary.stops[1].color).toBe('#0f9d8f')
  })

  it('throws on an unparseable seed instead of skipping it', () => {
    expect(() =>
      createTheme({ name: 'Broken', primary: 'not-a-colour' })
    ).toThrow(/primary/)
  })
})

describe('labelForFill', () => {
  // The Theme Builder re-runs this every time a fill is edited by hand, so it
  // is a contract now, not an implementation detail of the seed path.
  it('puts white on a dark fill and the theme near-black on a pale one', () => {
    expect(labelForFill('#101a4a')).toBe('#ffffff')
    expect(labelForFill('#ffe066')).toBe(DEFAULT_DARK_TEXT)
  })

  it('uses the near-black it is handed rather than a fixed one', () => {
    expect(labelForFill('#ffe066', '#2b1a05')).toBe('#2b1a05')
  })

  it('always returns the more legible of the two', () => {
    for (const fill of [
      '#101a4a',
      '#ffe066',
      '#7b8798',
      '#386657',
      '#e2e6ec'
    ]) {
      const label = labelForFill(fill)!
      const other = label === '#ffffff' ? DEFAULT_DARK_TEXT : '#ffffff'
      expect(contrast(label, fill)).toBeGreaterThanOrEqual(
        contrast(other, fill)
      )
    }
  })

  it('returns null for a fill it cannot read, so callers leave it alone', () => {
    expect(labelForFill('var(--octans-primary-500)')).toBeNull()
    expect(labelForFill('')).toBeNull()
  })

  it('agrees with what createTheme writes for a seeded role', () => {
    const theme = createTheme({ name: 'Lemon', primary: '#ffe066' })
    expect(theme.tokens['text-on-primary']).toBe(
      labelForFill(theme.tokens[`primary-${ROLE_FILL_STEP.primary}`])
    )
  })
})
