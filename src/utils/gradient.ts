/**
 * Gradients: interpolation between colour stops.
 *
 * Two things live here. The first is `mixColors`, which blends two colours in a
 * chosen colour space — that choice is most of what separates a good gradient
 * from a muddy one. sRGB interpolation runs through the raw channel values, so
 * a blue-to-yellow blend dips through a dead grey in the middle and the
 * mid-tones of any coloured gradient lose saturation. OKLab is perceptually
 * uniform, so equal numeric steps look like equal visual steps, and OKLCh adds
 * to that by carrying hue and chroma separately, so a gradient keeps its colour
 * instead of desaturating on the way through.
 *
 * The second is the `Gradient` value itself — a list of stops plus the shape to
 * paint them in — with sampling and CSS output.
 *
 * Alpha is interpolated premultiplied, as CSS Color 4 specifies. Without that,
 * fading a colour out to `transparent` passes through the grey that
 * `transparent` literally is (`rgb(0 0 0 / 0)`), and you get the dark fringe
 * that gives naive gradient code away.
 */

import {
  ACHROMATIC,
  hslToRgb,
  oklabToRgb,
  parseColor,
  rgbToHsl,
  rgbToOklab,
  type Rgba
} from './color'

export type InterpolationSpace = 'oklch' | 'oklab' | 'srgb' | 'hsl'

export interface InterpolationSpaceOption {
  value: InterpolationSpace
  label: string
  /** One line, for a tooltip or helper text. */
  description: string
}

/** The offered interpolation spaces, best-first. */
export const INTERPOLATION_SPACES: InterpolationSpaceOption[] = [
  {
    value: 'oklch',
    label: 'OKLCh',
    description:
      'Perceptually even, and keeps chroma through the mid-tones. The best ' +
      'default for a coloured gradient.'
  },
  {
    value: 'oklab',
    label: 'OKLab',
    description:
      'Perceptually even. Mixes through Cartesian coordinates, so it takes ' +
      'the straight line between two hues rather than going round.'
  },
  {
    value: 'srgb',
    label: 'sRGB',
    description:
      'Plain channel blending. Mid-tones go muddy, but it is what a naive ' +
      'gradient does — useful for matching an existing palette.'
  },
  {
    value: 'hsl',
    label: 'HSL',
    description:
      'Blends hue, saturation and lightness. Keeps saturation up, but the ' +
      'steps are visually uneven because HSL lightness is not perceptual.'
  }
]

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Blends two hues the short way round the wheel — 350° to 10° goes through 0°,
 * not backwards through 180°.
 */
function lerpHue(a: number, b: number, t: number) {
  const d = ((((b - a) % 360) + 360 + 180) % 360) - 180
  return (a + d * t + 360) % 360
}

/**
 * Picks the hues to interpolate between, given each end's chroma.
 *
 * A grey endpoint has no hue of its own. Interpolating its nominal 0° would
 * send a white-to-blue gradient round through red and orange, which is the
 * classic OKLCh gradient bug — so a grey end borrows the other's hue and just
 * fades its chroma to nothing.
 */
function hueEnds(
  h1: number,
  c1: number,
  h2: number,
  c2: number,
  floor: number
) {
  const from = c1 < floor ? h2 : h1
  return [from, c2 < floor ? from : h2] as const
}

/**
 * One colour `t` of the way from `a` to `b`, interpolated in `space`.
 *
 * `t` is clamped, so callers do not have to guard against a gradient whose
 * samples run outside its endpoints.
 */
export function mixColors(
  a: Rgba,
  b: Rgba,
  t: number,
  space: InterpolationSpace = 'oklch'
): Rgba {
  const k = clamp(t, 0, 1)
  if (k <= 0) return { ...a }
  if (k >= 1) return { ...b }

  const alpha = lerp(a.a, b.a, k)
  // Premultiplying by an alpha that ends up at zero would divide by zero on the
  // way back out, and the result is invisible anyway — blend straight.
  const wa = alpha <= 0 ? 1 : a.a
  const wb = alpha <= 0 ? 1 : b.a
  const out = alpha <= 0 ? 1 : alpha
  /** Premultiply, blend, un-premultiply. */
  const blend = (x: number, y: number) => lerp(x * wa, y * wb, k) / out

  switch (space) {
    case 'srgb':
      return {
        r: blend(a.r, b.r),
        g: blend(a.g, b.g),
        b: blend(a.b, b.b),
        a: alpha
      }

    case 'oklab': {
      const [L1, A1, B1] = rgbToOklab(a)
      const [L2, A2, B2] = rgbToOklab(b)
      return {
        ...oklabToRgb(blend(L1, L2), blend(A1, A2), blend(B1, B2)),
        a: alpha
      }
    }

    case 'oklch': {
      const [L1, A1, B1] = rgbToOklab(a)
      const [L2, A2, B2] = rgbToOklab(b)
      const c1 = Math.hypot(A1, B1)
      const c2 = Math.hypot(A2, B2)
      const [h1, h2] = hueEnds(
        (Math.atan2(B1, A1) * 180) / Math.PI,
        c1,
        (Math.atan2(B2, A2) * 180) / Math.PI,
        c2,
        ACHROMATIC
      )
      // Hue is an angle, so it is interpolated directly rather than
      // premultiplied — premultiplying an angle is meaningless.
      const H = (lerpHue(h1, h2, k) * Math.PI) / 180
      const L = blend(L1, L2)
      const C = blend(c1, c2)
      return { ...oklabToRgb(L, Math.cos(H) * C, Math.sin(H) * C), a: alpha }
    }

    case 'hsl': {
      const [h1, s1, l1] = rgbToHsl(a)
      const [h2, s2, l2] = rgbToHsl(b)
      const [from, to] = hueEnds(h1, s1, h2, s2, 1e-6)
      return {
        ...hslToRgb(lerpHue(from, to, k), blend(s1, s2), blend(l1, l2)),
        a: alpha
      }
    }
  }
}

// --- the gradient value ---------------------------------------------------

export type GradientType = 'linear' | 'radial' | 'conic'

export interface GradientTypeOption {
  value: GradientType
  label: string
  description: string
}

export const GRADIENT_TYPES: GradientTypeOption[] = [
  {
    value: 'linear',
    label: 'Linear',
    description: 'Runs along a straight line at the given angle.'
  },
  {
    value: 'radial',
    label: 'Radial',
    description: 'Runs outward from the centre. The angle has no effect.'
  },
  {
    value: 'conic',
    label: 'Conic',
    description:
      'Sweeps around the centre, starting at the given angle. Put the same ' +
      'colour at 0% and 100% or the wrap will show as a seam.'
  }
]

export interface GradientStop {
  /** Any colour `parseColor` understands. */
  color: string
  /** Where along the gradient it sits, 0–100. */
  position: number
}

export interface Gradient {
  type: GradientType
  /** Degrees. Used by `linear` and `conic`; ignored by `radial`. */
  angle: number
  /** At least two, in any order — sampling and CSS output sort them. */
  stops: GradientStop[]
  space: InterpolationSpace
}

/** A sensible two-stop gradient, as a starting point for an editor. */
export function createGradient(partial: Partial<Gradient> = {}): Gradient {
  return {
    type: 'linear',
    angle: 90,
    space: 'oklch',
    stops: [
      { color: '#ffffff', position: 0 },
      { color: '#000000', position: 100 }
    ],
    ...partial
  }
}

interface ResolvedStop {
  color: Rgba
  position: number
}

/**
 * Parses and sorts the stops, or returns `null` if any colour is unusable.
 *
 * All-or-nothing on purpose: dropping the one stop that failed would silently
 * produce a different gradient from the one that was asked for.
 */
export function resolveStops(stops: GradientStop[]): ResolvedStop[] | null {
  if (!stops || stops.length < 1) return null
  const out: ResolvedStop[] = []
  for (const stop of stops) {
    const color = parseColor(stop.color)
    if (!color) return null
    out.push({ color, position: clamp(stop.position, 0, 100) })
  }
  // A stable sort keeps two stops at the same position in author order, which
  // is what decides which side of a hard stop each one paints.
  return out.sort((x, y) => x.position - y.position)
}

/**
 * The colour at `t` (0–1) along the gradient, or `null` if a stop is unusable.
 *
 * Only the stops and the interpolation space matter here — `type` and `angle`
 * describe how the gradient is *painted*, which is a separate question from
 * what colour sits at a given fraction of the way along it. That is why a ramp
 * can be generated from a conic gradient and still make sense.
 */
export function sampleGradient(gradient: Gradient, t: number): Rgba | null {
  const stops = resolveStops(gradient.stops)
  if (!stops) return null
  return sampleResolved(stops, t, gradient.space)
}

function sampleResolved(
  stops: ResolvedStop[],
  t: number,
  space: InterpolationSpace
): Rgba {
  const p = clamp(t, 0, 1) * 100
  if (p <= stops[0].position) return { ...stops[0].color }
  const last = stops[stops.length - 1]
  if (p >= last.position) return { ...last.color }

  // The bracketing pair is the LAST stop at or before `p` and the FIRST one
  // after it. Taking the last rather than the first is what makes a hard stop
  // hard: where several stops share a position, the one that wins from there on
  // is the last of them, exactly as CSS renders it.
  let from = stops[0]
  let i = 1
  for (; i < stops.length && stops[i].position <= p; i++) from = stops[i]
  const to = stops[i]

  // `to.position > p >= from.position`, so the width is always positive here —
  // the zero-width case was consumed by the scan above.
  return mixColors(
    from.color,
    to.color,
    (p - from.position) / (to.position - from.position),
    space
  )
}

/**
 * The gradient as a CSS `*-gradient()` value.
 *
 * The stops are baked out as our own samples rather than handed to the browser
 * as two endpoints and an `in oklch` hint. Two reasons: the result is then
 * identical to what `sampleGradient` produces, so a preview cannot disagree
 * with the values it is previewing; and it renders the same in browsers that do
 * not support interpolation hints, instead of silently falling back to sRGB and
 * looking muddy.
 *
 * Real stop positions are always emitted exactly, so a hard stop (two stops at
 * the same position) stays hard rather than being blurred across a sample.
 */
export function gradientCss(gradient: Gradient, resolution = 32): string {
  const stops = resolveStops(gradient.stops)
  if (!stops || !stops.length) return 'none'

  const parts: string[] = []
  const push = (c: Rgba, position: number) =>
    parts.push(`rgb(${cssChannels(c)}) ${Number(position.toFixed(2))}%`)

  for (let i = 0; i < stops.length; i++) {
    push(stops[i].color, stops[i].position)

    const next = stops[i + 1]
    if (!next) break
    const width = next.position - stops[i].position
    if (width <= 0) continue

    // Sample density follows segment width so a wide segment is not rendered
    // more coarsely than a narrow one.
    const count = Math.round((width / 100) * resolution)
    for (let j = 1; j <= count; j++) {
      const position = stops[i].position + (width * j) / (count + 1)
      push(sampleResolved(stops, position / 100, gradient.space), position)
    }
  }

  const body = parts.join(', ')
  switch (gradient.type) {
    case 'radial':
      return `radial-gradient(circle at 50% 50%, ${body})`
    case 'conic':
      return `conic-gradient(from ${gradient.angle}deg at 50% 50%, ${body})`
    default:
      return `linear-gradient(${gradient.angle}deg, ${body})`
  }
}

function cssChannels(c: Rgba) {
  const [r, g, b] = [c.r, c.g, c.b].map((n) => clamp(Math.round(n), 0, 255))
  return c.a >= 1
    ? `${r} ${g} ${b}`
    : `${r} ${g} ${b} / ${Number(c.a.toFixed(3))}`
}

/**
 * Validates an unknown value as a `Gradient`.
 *
 * Used when importing a saved theme, where the JSON is whatever someone pasted
 * in. Strict rather than forgiving: a gradient that is half-understood would
 * regenerate a ramp into colours nobody chose.
 */
export function isGradient(value: unknown): value is Gradient {
  if (!value || typeof value !== 'object') return false
  const g = value as Partial<Gradient>
  if (g.type !== 'linear' && g.type !== 'radial' && g.type !== 'conic') {
    return false
  }
  if (typeof g.angle !== 'number' || !Number.isFinite(g.angle)) return false
  if (!INTERPOLATION_SPACES.some((s) => s.value === g.space)) return false
  if (!Array.isArray(g.stops) || g.stops.length < 2) return false
  return g.stops.every(
    (stop) =>
      stop &&
      typeof stop === 'object' &&
      typeof stop.color === 'string' &&
      typeof stop.position === 'number' &&
      Number.isFinite(stop.position) &&
      stop.position >= 0 &&
      stop.position <= 100
  )
}
