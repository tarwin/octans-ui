import { describe, expect, it } from 'vitest'
import { formatHex, parseColor, type Rgba } from './color'
import {
  createGradient,
  gradientCss,
  INTERPOLATION_SPACES,
  isGradient,
  mixColors,
  resolveStops,
  sampleGradient,
  type Gradient,
  type InterpolationSpace
} from './gradient'

const SPACES = INTERPOLATION_SPACES.map((s) => s.value)
const rgba = (value: string) => parseColor(value)!

describe('mixColors', () => {
  it.each(SPACES)('returns the endpoints exactly in %s', (space) => {
    const a = rgba('#ffffff')
    const b = rgba('#11151a')
    expect(formatHex(mixColors(a, b, 0, space))).toBe('#ffffff')
    expect(formatHex(mixColors(a, b, 1, space))).toBe('#11151a')
  })

  it.each(SPACES)('clamps t outside 0–1 in %s', (space) => {
    const a = rgba('#ff0000')
    const b = rgba('#0000ff')
    expect(formatHex(mixColors(a, b, -3, space))).toBe('#ff0000')
    expect(formatHex(mixColors(a, b, 4, space))).toBe('#0000ff')
  })

  it('round-trips through OKLab without drifting', () => {
    // A mix at t=0.5 of a colour with itself must come back unchanged: that
    // exercises the full sRGB → OKLab → sRGB path.
    for (const hex of ['#5f63e8', '#0b7a4b', '#f8f9fb', '#11151a']) {
      expect(formatHex(mixColors(rgba(hex), rgba(hex), 0.5, 'oklab'))).toBe(hex)
      expect(formatHex(mixColors(rgba(hex), rgba(hex), 0.5, 'oklch'))).toBe(hex)
    }
  })

  it('keeps chroma through the mid-tones in OKLCh', () => {
    // The point of offering OKLCh: sRGB blending of two saturated hues dips
    // through a desaturated middle, and OKLCh does not.
    const red = rgba('#e02020')
    const blue = rgba('#2040e0')
    const chroma = (c: Rgba) =>
      Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b)
    expect(chroma(mixColors(red, blue, 0.5, 'oklch'))).toBeGreaterThan(
      chroma(mixColors(red, blue, 0.5, 'srgb'))
    )
  })

  it('does not send a grey endpoint round the hue wheel', () => {
    // White has no hue, so its nominal 0° must not drag a white→blue gradient
    // through red and orange. Every sample should stay blue-dominant.
    const white = rgba('#ffffff')
    const blue = rgba('#1e40af')
    for (const t of [0.25, 0.5, 0.75]) {
      const c = mixColors(white, blue, t, 'oklch')
      expect(c.b).toBeGreaterThan(c.r)
      expect(c.b).toBeGreaterThan(c.g)
    }
  })

  it.each(SPACES)(
    'fades to transparent without a grey fringe in %s',
    (space) => {
      // `transparent` is literally rgb(0 0 0 / 0), so interpolating it
      // unpremultiplied darkens the colour as it fades. Premultiplied, the hue
      // holds all the way out — this is the bug that gives naive gradient code
      // away.
      const red = rgba('#ff0000')
      const gone = rgba('transparent')
      const half = mixColors(red, gone, 0.5, space)
      expect(half.a).toBeCloseTo(0.5, 5)
      expect(Math.round(half.r)).toBe(255)
      expect(Math.round(half.g)).toBe(0)
    }
  )

  it('survives both ends being fully transparent', () => {
    // Premultiplying by an alpha that ends at zero would divide by zero.
    const c = mixColors(rgba('transparent'), rgba('#ff000000'), 0.5, 'oklch')
    expect(c.a).toBe(0)
    expect(Number.isFinite(c.r)).toBe(true)
  })
})

describe('resolveStops', () => {
  it('sorts by position so stops can be authored in any order', () => {
    const stops = resolveStops([
      { color: '#000', position: 100 },
      { color: '#fff', position: 0 }
    ])!
    expect(stops.map((s) => s.position)).toEqual([0, 100])
    expect(formatHex(stops[0].color)).toBe('#ffffff')
  })

  it('fails the whole gradient if any one stop is unusable', () => {
    // Dropping the stop that failed would silently produce a different gradient
    // from the one that was asked for.
    expect(
      resolveStops([
        { color: '#fff', position: 0 },
        { color: 'rebeccapurple', position: 100 }
      ])
    ).toBeNull()
  })
})

describe('sampleGradient', () => {
  const three = createGradient({
    space: 'srgb',
    stops: [
      { color: '#000000', position: 0 },
      { color: '#ff0000', position: 50 },
      { color: '#ffffff', position: 100 }
    ]
  })

  it('lands on each stop exactly at its own position', () => {
    expect(formatHex(sampleGradient(three, 0)!)).toBe('#000000')
    expect(formatHex(sampleGradient(three, 0.5)!)).toBe('#ff0000')
    expect(formatHex(sampleGradient(three, 1)!)).toBe('#ffffff')
  })

  it('interpolates within the segment the sample falls in', () => {
    // A quarter of the way along is halfway through the FIRST segment, not a
    // quarter of the way from the first stop to the last.
    expect(formatHex(sampleGradient(three, 0.25)!)).toBe('#800000')
  })

  it('holds the end colours outside the outermost stops', () => {
    const inset = createGradient({
      space: 'srgb',
      stops: [
        { color: '#ff0000', position: 25 },
        { color: '#0000ff', position: 75 }
      ]
    })
    expect(formatHex(sampleGradient(inset, 0)!)).toBe('#ff0000')
    expect(formatHex(sampleGradient(inset, 0.1)!)).toBe('#ff0000')
    expect(formatHex(sampleGradient(inset, 1)!)).toBe('#0000ff')
  })

  it('keeps a hard stop hard', () => {
    // Two stops at the same position mean an abrupt change, and there is no
    // width to interpolate across.
    const hard = createGradient({
      space: 'srgb',
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#ff0000', position: 50 },
        { color: '#0000ff', position: 50 },
        { color: '#0000ff', position: 100 }
      ]
    })
    expect(formatHex(sampleGradient(hard, 0.499)!)).toBe('#ff0000')
    expect(formatHex(sampleGradient(hard, 0.5)!)).toBe('#0000ff')
  })

  it('returns null rather than guessing at an unusable stop', () => {
    expect(
      sampleGradient(
        createGradient({ stops: [{ color: 'nope', position: 0 }] }),
        0
      )
    ).toBeNull()
  })
})

describe('gradientCss', () => {
  const g = createGradient({ angle: 45 })

  it('emits the right CSS function for each type', () => {
    expect(gradientCss(g)).toContain('linear-gradient(45deg,')
    expect(gradientCss({ ...g, type: 'radial' })).toContain(
      'radial-gradient(circle at 50% 50%,'
    )
    expect(gradientCss({ ...g, type: 'conic' })).toContain(
      'conic-gradient(from 45deg at 50% 50%,'
    )
  })

  it('bakes its own samples rather than trusting the browser to interpolate', () => {
    // The preview must not be able to disagree with the values it previews, and
    // `in oklch` silently falls back to sRGB where it is unsupported.
    expect(gradientCss(g)).not.toContain('in oklch')
    const stopCount = gradientCss(g).split('rgb(').length - 1
    expect(stopCount).toBeGreaterThan(2)
  })

  it('emits every authored stop at its exact position', () => {
    // Sampling alone would blur a hard stop across a sample's width.
    const css = gradientCss({
      ...g,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: '#00ff00', position: 30 },
        { color: '#00ff00', position: 30 },
        { color: '#0000ff', position: 100 }
      ]
    })
    expect(css).toContain('rgb(0 255 0) 30%')
  })

  it('carries alpha through to the CSS', () => {
    const css = gradientCss({
      ...g,
      stops: [
        { color: '#ff0000', position: 0 },
        { color: 'transparent', position: 100 }
      ]
    })
    expect(css).toContain('/ 0')
  })

  it('degrades to none rather than emitting broken CSS', () => {
    expect(gradientCss({ ...g, stops: [{ color: 'nope', position: 0 }] })).toBe(
      'none'
    )
  })
})

describe('isGradient', () => {
  const valid: Gradient = createGradient()

  it('accepts a well-formed gradient', () => {
    expect(isGradient(valid)).toBe(true)
  })

  it.each([
    ['not an object', 'linear'],
    ['null', null],
    ['an unknown type', { ...valid, type: 'spiral' }],
    ['an unknown space', { ...valid, space: 'cielab' }],
    ['a non-numeric angle', { ...valid, angle: '45deg' }],
    ['fewer than two stops', { ...valid, stops: [valid.stops[0]] }],
    [
      'a position outside 0–100',
      { ...valid, stops: [valid.stops[0], { color: '#000', position: 140 }] }
    ],
    [
      'a non-string colour',
      { ...valid, stops: [valid.stops[0], { color: 0x000000, position: 100 }] }
    ]
  ])('rejects %s', (_label, value) => {
    // Strict rather than forgiving: a half-understood gradient would regenerate
    // a ramp into colours nobody chose.
    expect(isGradient(value)).toBe(false)
  })

  it('does not require the stops to be sorted', () => {
    expect(
      isGradient({
        ...valid,
        stops: [
          { color: '#000', position: 100 },
          { color: '#fff', position: 0 }
        ]
      })
    ).toBe(true)
  })
})

describe('interpolation space metadata', () => {
  it('offers OKLCh first, because it is the one to reach for', () => {
    expect(INTERPOLATION_SPACES[0].value).toBe('oklch')
  })

  it('describes every space it offers', () => {
    for (const space of INTERPOLATION_SPACES) {
      expect(space.label).toBeTruthy()
      expect(space.description).toBeTruthy()
    }
  })

  it('covers exactly the spaces mixColors implements', () => {
    // A space in the list that mixColors does not handle would fall through its
    // switch and return undefined.
    for (const space of SPACES as InterpolationSpace[]) {
      expect(mixColors(rgba('#fff'), rgba('#000'), 0.5, space)).toBeTruthy()
    }
  })
})
