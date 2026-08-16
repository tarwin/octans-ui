import { describe, expect, it } from 'vitest'
import {
  COLOR_FORMATS,
  detectFormat,
  flatten,
  formatColor,
  contrastRatio,
  formatHex,
  hsvToRgb,
  parseColor,
  prefersDarkText,
  relativeLuminance,
  rgbToHsl,
  rgbToHsv,
  rgbToOklch,
  type ColorFormat
} from './color'

const FORMATS = COLOR_FORMATS.map((f) => f.value)

/** Rounded channels, for comparing against literal expectations. */
function channels(value: string) {
  const c = parseColor(value)!
  return [Math.round(c.r), Math.round(c.g), Math.round(c.b), c.a]
}

describe('parseColor', () => {
  it('reads every length of hex', () => {
    expect(channels('#ff0080')).toEqual([255, 0, 128, 1])
    expect(channels('#F08')).toEqual([255, 0, 136, 1])
    expect(channels('#f08a')).toEqual([255, 0, 136, 170 / 255])
    expect(channels('#ff008080')).toEqual([255, 0, 128, 128 / 255])
  })

  it('rejects hex lengths that are typos rather than colours', () => {
    // Five and seven digits are always a mistake — there is no reading of them
    // that is more likely right than wrong.
    expect(parseColor('#ff008')).toBeNull()
    expect(parseColor('#ff00808')).toBeNull()
  })

  it('reads rgb() in both the legacy and modern syntaxes', () => {
    expect(channels('rgb(12, 34, 56)')).toEqual([12, 34, 56, 1])
    expect(channels('rgba(12, 34, 56, 0.5)')).toEqual([12, 34, 56, 0.5])
    expect(channels('rgb(12 34 56 / 50%)')).toEqual([12, 34, 56, 0.5])
    expect(channels('rgb(100% 0% 50%)')).toEqual([255, 0, 128, 1])
  })

  it('reads hsl(), oklab() and oklch()', () => {
    expect(channels('hsl(0 100% 50%)')).toEqual([255, 0, 0, 1])
    expect(channels('hsl(120, 100%, 50%)')).toEqual([0, 255, 0, 1])
    // Pure white has no chroma, so every form of it must agree exactly.
    expect(channels('oklab(1 0 0)')).toEqual([255, 255, 255, 1])
    expect(channels('oklch(100% 0 0)')).toEqual([255, 255, 255, 1])
    expect(channels('oklch(0% 0 0 / 0.25)')).toEqual([0, 0, 0, 0.25])
  })

  it('reads transparent as transparent black, the way CSS does', () => {
    expect(channels('transparent')).toEqual([0, 0, 0, 0])
  })

  it('clamps a colour outside sRGB rather than emitting impossible channels', () => {
    // OKLCh can describe far more than sRGB holds. The honest options are to
    // clamp or to gamut-map, and clamping is what a browser does when it has to
    // produce a legacy rgb() value.
    const [r, g, b] = channels('oklch(70% 0.4 140)')
    for (const channel of [r, g, b]) {
      expect(channel).toBeGreaterThanOrEqual(0)
      expect(channel).toBeLessThanOrEqual(255)
    }
  })

  it('refuses what it cannot resolve, rather than guessing', () => {
    // Substituting black here would silently produce a wrong colour, which is
    // harder to notice than no colour at all.
    expect(parseColor('rebeccapurple')).toBeNull()
    expect(parseColor('color-mix(in srgb, red, blue)')).toBeNull()
    expect(parseColor('var(--octans-accent)')).toBeNull()
    expect(parseColor('')).toBeNull()
    expect(parseColor('rgb(1, 2)')).toBeNull()
    expect(parseColor('rgb(a, b, c)')).toBeNull()
  })
})

describe('formatColor', () => {
  it.each(FORMATS)('round-trips a colour through %s', (format: ColorFormat) => {
    const original = parseColor('#5f63e8')!
    const round = parseColor(formatColor(original, format))!
    // HSL and OKLCh are written with finite precision, so allow a channel of
    // drift rather than demanding an exact match.
    expect(Math.abs(round.r - original.r)).toBeLessThanOrEqual(1)
    expect(Math.abs(round.g - original.g)).toBeLessThanOrEqual(1)
    expect(Math.abs(round.b - original.b)).toBeLessThanOrEqual(1)
  })

  it('omits alpha when the colour is opaque', () => {
    // Nobody wants #5f63e8ff back when they typed #5f63e8.
    const opaque = parseColor('#5f63e8')!
    expect(formatColor(opaque, 'hex')).toBe('#5f63e8')
    expect(formatColor(opaque, 'rgb')).toBe('rgb(95 99 232)')
  })

  it('includes alpha when there is any', () => {
    const half = parseColor('#5f63e880')!
    expect(formatColor(half, 'hex')).toBe('#5f63e880')
    expect(formatColor(half, 'rgb')).toBe('rgb(95 99 232 / 0.502)')
  })

  it('writes an opaque colour when alpha is switched off', () => {
    // A picker in "no alpha" mode must not let a transparent value leak out.
    const half = parseColor('#5f63e880')!
    expect(formatColor(half, 'hex', false)).toBe('#5f63e8')
    expect(formatColor(half, 'rgb', false)).toBe('rgb(95 99 232)')
  })

  it('formatHex ignores alpha entirely', () => {
    expect(formatHex(parseColor('#5f63e880')!)).toBe('#5f63e8')
  })
})

describe('detectFormat', () => {
  it('reports how a value was written, so an editor can keep using it', () => {
    expect(detectFormat('#fff')).toBe('hex')
    expect(detectFormat('rgba(1,2,3,0.5)')).toBe('rgb')
    expect(detectFormat('hsl(1 2% 3%)')).toBe('hsl')
    expect(detectFormat('oklab(1 0 0)')).toBe('oklch')
    expect(detectFormat('rebeccapurple')).toBeNull()
  })
})

describe('conversions', () => {
  it('puts the pure hue in the top-right corner of an HSV square', () => {
    // This is why the picker uses HSV and not HSL: saturation 1, value 1 is the
    // vivid corner. The same point in HSL is a middling pink.
    expect(rgbToHsv(parseColor('#ff0000')!)).toEqual([0, 1, 1])
    const [r, g, b] = Object.values(hsvToRgb(240, 1, 1))
    expect([r, g, b].map(Math.round)).toEqual([0, 0, 255])
  })

  it('reports no hue for a grey, in both HSL and OKLCh', () => {
    // A grey's hue is meaningless noise, and letting it read as 0° is what
    // sends a white-to-blue gradient round through red.
    const grey = parseColor('#808080')!
    expect(rgbToHsl(grey)[1]).toBe(0)
    expect(rgbToOklch(grey)[1]).toBeLessThan(1e-4)
    expect(rgbToOklch(grey)[2]).toBe(0)
  })

  it('survives the hue wraparound at both ends of the wheel', () => {
    for (const hue of [0, 359.9, 360, 720, -30]) {
      const rgb = hsvToRgb(hue, 1, 1)
      for (const channel of [rgb.r, rgb.g, rgb.b]) {
        expect(channel).toBeGreaterThanOrEqual(0)
        expect(channel).toBeLessThanOrEqual(255)
      }
    }
  })
})

describe('luminance', () => {
  it('runs from black to white', () => {
    expect(relativeLuminance(parseColor('#000')!)).toBeCloseTo(0, 5)
    expect(relativeLuminance(parseColor('#fff')!)).toBeCloseTo(1, 5)
  })

  it('picks the text colour that will actually read', () => {
    expect(prefersDarkText(parseColor('#ffe066')!)).toBe(true)
    expect(prefersDarkText(parseColor('#1e40af')!)).toBe(false)
  })

  it('measures contrast between the WCAG extremes', () => {
    const white = parseColor('#fff')!
    const black = parseColor('#000')!
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5)
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
  })

  it('measures the same either way round', () => {
    const a = parseColor('#386657')!
    const b = parseColor('#ffe066')!
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10)
  })
})

describe('flatten', () => {
  it('composites alpha over a backdrop', () => {
    const half = parseColor('#000000')!
    half.a = 0.5
    const over = flatten(half, parseColor('#ffffff')!)
    expect(Math.round(over.r)).toBe(128)
    expect(over.a).toBe(1)
  })
})
