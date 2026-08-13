/**
 * Colour values: parsing, formatting and conversion.
 *
 * Everything here works on one shape — `Rgba`, with channels in 0–255 and
 * alpha in 0–1 — and converts in and out of it. That keeps the conversions to
 * a hub-and-spoke set rather than a mesh, and means a colour picker only ever
 * holds one representation.
 *
 * Channels are kept as floats internally and only rounded when formatted.
 * Rounding on every conversion is what makes a picker drift: drag the hue
 * slider back and forth and the colour slowly changes under you.
 *
 * Deliberately NOT supported: named colours (`rebeccapurple`), `var()`,
 * `color-mix()` and `color()`. Resolving those needs either a large table or a
 * live document, and guessing is worse than refusing — a silently wrong colour
 * is much harder to notice than a colour that plainly did not apply. Callers
 * get `null` and can fall back to a text field.
 */

export interface Rgba {
  /** 0–255. */
  r: number
  /** 0–255. */
  g: number
  /** 0–255. */
  b: number
  /** 0–1. */
  a: number
}

/** How a colour is written out. Parsing accepts all of these regardless. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

export interface ColorFormatOption {
  value: ColorFormat
  label: string
  /** One line, for a tooltip or helper text. */
  description: string
}

export const COLOR_FORMATS: ColorFormatOption[] = [
  {
    value: 'hex',
    label: 'Hex',
    description:
      'The most portable form. Gains a fourth pair of digits when the ' +
      'colour is not fully opaque.'
  },
  {
    value: 'rgb',
    label: 'RGB',
    description: 'Plain sRGB channels, in the modern space-separated syntax.'
  },
  {
    value: 'hsl',
    label: 'HSL',
    description:
      'Hue, saturation and lightness. Easy to read, but its lightness is not ' +
      'perceptual — two colours at the same L can look very different.'
  },
  {
    value: 'oklch',
    label: 'OKLCh',
    description:
      'Perceptual lightness, chroma and hue. The best form for describing a ' +
      'colour you intend to vary, but it can express colours outside sRGB.'
  }
]

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n))

/** Rounds to `places` decimals and drops any trailing zeroes. */
function round(n: number, places: number) {
  return Number(n.toFixed(places))
}

// --- parsing --------------------------------------------------------------

/** `1`, `50%`, `.5` → 0–1. Returns `NaN` for anything else. */
function parseAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1
  const v = raw.trim()
  if (!v) return 1
  const n = parseFloat(v)
  if (Number.isNaN(n)) return NaN
  return clamp(v.endsWith('%') ? n / 100 : n, 0, 1)
}

/** `128`, `50%` → 0–255. */
function parseChannel(raw: string): number {
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return NaN
  return clamp(raw.trim().endsWith('%') ? (n / 100) * 255 : n, 0, 255)
}

/**
 * Splits the inside of a colour function into its arguments.
 *
 * Handles both the legacy comma form and the modern space form, and treats the
 * slash before alpha as a separator either way — so `rgb(1,2,3)`,
 * `rgb(1 2 3 / 50%)` and `rgba(1, 2, 3, 0.5)` all come back as four parts.
 */
function args(inner: string): string[] {
  return inner
    .split(/[,\s/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Matches `name(...)`, returning the name and the arguments. */
function fn(value: string): { name: string; parts: string[] } | null {
  const m = value.match(/^([a-z]+)\(([^)]*)\)$/i)
  return m ? { name: m[1].toLowerCase(), parts: args(m[2]) } : null
}

/**
 * Parses any colour form this module understands into `Rgba`.
 *
 * Accepts `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`,
 * `hsla()`, `oklab()`, `oklch()` and the keyword `transparent`. Returns `null`
 * for anything else — see the note at the top of the file.
 *
 * Colours outside sRGB (which `oklch()` can easily express) are clamped into
 * gamut on the way in, since the whole module works in sRGB.
 */
export function parseColor(value: string): Rgba | null {
  const v = value.trim().toLowerCase()
  if (!v) return null

  if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }

  const hex = v.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    const d = hex[1]
    const pair = (i: number) =>
      d.length <= 4
        ? parseInt(d[i] + d[i], 16)
        : parseInt(d.slice(i * 2, i * 2 + 2), 16)
    if (d.length === 3 || d.length === 4) {
      return {
        r: pair(0),
        g: pair(1),
        b: pair(2),
        a: d.length === 4 ? pair(3) / 255 : 1
      }
    }
    if (d.length === 6 || d.length === 8) {
      return {
        r: pair(0),
        g: pair(1),
        b: pair(2),
        a: d.length === 8 ? pair(3) / 255 : 1
      }
    }
    // 5 or 7 digits is a typo, not a colour.
    return null
  }

  const f = fn(v)
  if (!f || f.parts.length < 3) return null
  const [p0, p1, p2, p3] = f.parts
  const a = parseAlpha(p3)
  if (Number.isNaN(a)) return null

  switch (f.name) {
    case 'rgb':
    case 'rgba': {
      const r = parseChannel(p0)
      const g = parseChannel(p1)
      const b = parseChannel(p2)
      if ([r, g, b].some(Number.isNaN)) return null
      return { r, g, b, a }
    }

    case 'hsl':
    case 'hsla': {
      const h = parseFloat(p0)
      const s = parseFloat(p1)
      const l = parseFloat(p2)
      if ([h, s, l].some(Number.isNaN)) return null
      return {
        ...hslToRgb(h, clamp(s, 0, 100) / 100, clamp(l, 0, 100) / 100),
        a
      }
    }

    case 'oklab': {
      const L = parsePerceptualLightness(p0)
      const A = parseFloat(p1)
      const B = parseFloat(p2)
      if ([L, A, B].some(Number.isNaN)) return null
      return { ...oklabToRgb(L, A, B), a }
    }

    case 'oklch': {
      const L = parsePerceptualLightness(p0)
      const C = parseFloat(p1)
      const H = parseFloat(p2)
      if ([L, C, H].some(Number.isNaN)) return null
      const rad = (H * Math.PI) / 180
      return { ...oklabToRgb(L, Math.cos(rad) * C, Math.sin(rad) * C), a }
    }

    default:
      return null
  }
}

/** OKLab/OKLCh lightness is 0–1, but CSS also allows `62.3%`. */
function parsePerceptualLightness(raw: string) {
  const n = parseFloat(raw)
  return raw.trim().endsWith('%') ? n / 100 : n
}

// --- formatting -----------------------------------------------------------

/** `{ r: 255, g: 0, b: 128 }` → `#ff0080`. Alpha is ignored. */
export function formatHex(c: Rgba): string {
  return (
    '#' +
    [c.r, c.g, c.b]
      .map((n) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0'))
      .join('')
  )
}

/**
 * Writes a colour out in the given format.
 *
 * `alpha` controls whether transparency may be expressed at all: with it off
 * the colour is written opaque, which is what a picker in "no alpha" mode
 * needs so that a stray transparent value cannot leak into the output.
 * Otherwise alpha is only included when it is actually below 1 — nobody wants
 * `#5f63e8ff` back when they typed `#5f63e8`.
 */
export function formatColor(
  c: Rgba,
  format: ColorFormat = 'hex',
  alpha = true
): string {
  const a = alpha ? clamp(c.a, 0, 1) : 1
  const opaque = a >= 1

  switch (format) {
    case 'hex': {
      const base = formatHex(c)
      if (opaque) return base
      return (
        base +
        clamp(Math.round(a * 255), 0, 255)
          .toString(16)
          .padStart(2, '0')
      )
    }

    case 'rgb': {
      const [r, g, b] = [c.r, c.g, c.b].map((n) => clamp(Math.round(n), 0, 255))
      return opaque
        ? `rgb(${r} ${g} ${b})`
        : `rgb(${r} ${g} ${b} / ${round(a, 3)})`
    }

    case 'hsl': {
      const [h, s, l] = rgbToHsl(c)
      const body = `${round(h, 1)} ${round(s * 100, 1)}% ${round(l * 100, 1)}%`
      return opaque ? `hsl(${body})` : `hsl(${body} / ${round(a, 3)})`
    }

    case 'oklch': {
      const [L, C, H] = rgbToOklch(c)
      const body = `${round(L * 100, 1)}% ${round(C, 4)} ${round(H, 1)}`
      return opaque ? `oklch(${body})` : `oklch(${body} / ${round(a, 3)})`
    }
  }
}

/**
 * The format a string was written in, so an editor can keep using it rather
 * than rewriting the user's value into its own preferred form. Returns `null`
 * for anything unparseable.
 */
export function detectFormat(value: string): ColorFormat | null {
  const v = value.trim().toLowerCase()
  if (/^#[0-9a-f]{3,8}$/.test(v) || v === 'transparent') return 'hex'
  const f = fn(v)
  if (!f) return null
  if (f.name === 'rgb' || f.name === 'rgba') return 'rgb'
  if (f.name === 'hsl' || f.name === 'hsla') return 'hsl'
  if (f.name === 'oklch' || f.name === 'oklab') return 'oklch'
  return null
}

// --- sRGB ↔ HSL / HSV -----------------------------------------------------

/** Returns `[hue 0–360, saturation 0–1, lightness 0–1]`. */
export function rgbToHsl({ r, g, b }: Rgba): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min

  if (d === 0) return [0, 0, l]

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4

  return [(h * 60 + 360) % 360, s, l]
}

/** `h` in degrees, `s` and `l` in 0–1. Alpha is left to the caller. */
export function hslToRgb(h: number, s: number, l: number): Omit<Rgba, 'a'> {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = (((h % 360) + 360) % 360) / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = l - c / 2

  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x]

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

/**
 * Returns `[hue 0–360, saturation 0–1, value 0–1]`.
 *
 * HSV rather than HSL because it is what a picker's square is: x is saturation
 * and y is value, so the top-right corner is the pure hue. The same square in
 * HSL would put the pure hue in the middle of the right edge and waste half the
 * area on colours the user rarely wants.
 */
export function rgbToHsv({ r, g, b }: Rgba): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const d = max - Math.min(rn, gn, bn)

  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h = (h * 60 + 360) % 360
  }

  return [h, max === 0 ? 0 : d / max, max]
}

/** `h` in degrees, `s` and `v` in 0–1. */
export function hsvToRgb(h: number, s: number, v: number): Omit<Rgba, 'a'> {
  const hp = (((h % 360) + 360) % 360) / 60
  const c = v * s
  const x = c * (1 - Math.abs((hp % 2) - 1))
  const m = v - c

  const [r, g, b] =
    hp < 1
      ? [c, x, 0]
      : hp < 2
        ? [x, c, 0]
        : hp < 3
          ? [0, c, x]
          : hp < 4
            ? [0, x, c]
            : hp < 5
              ? [x, 0, c]
              : [c, 0, x]

  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

// --- sRGB ↔ OKLab / OKLCh -------------------------------------------------
// Björn Ottosson's OKLab. The transfer function is the real sRGB one, not a
// plain gamma 2.2 — that shortcut is common and it visibly shifts the darkest
// end of a ramp.

export function toLinear(c: number) {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function fromLinear(c: number) {
  const s = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  return clamp(s * 255, 0, 255)
}

/** Returns `[L 0–1, a, b]`. */
export function rgbToOklab({ r, g, b }: Rgba): [number, number, number] {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ]
}

/**
 * OKLab back to sRGB, clamped into gamut.
 *
 * OKLab describes far more colours than sRGB holds, so an out-of-gamut result
 * has to go somewhere. Clamping each channel is what a browser effectively does
 * when it has to produce a legacy `rgb()` output, so a colour generated here
 * matches what CSS would have shown. Proper gamut mapping (reducing chroma
 * until the colour fits) would be more faithful but would no longer agree with
 * the browser.
 */
export function oklabToRgb(L: number, A: number, B: number): Omit<Rgba, 'a'> {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3

  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  }
}

/** Returns `[L 0–1, chroma, hue in degrees]`. */
export function rgbToOklch(c: Rgba): [number, number, number] {
  const [L, a, b] = rgbToOklab(c)
  const chroma = Math.hypot(a, b)
  const hue =
    chroma < ACHROMATIC ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
  return [L, chroma, hue]
}

/** Below this a colour is grey, and its hue is meaningless noise. */
export const ACHROMATIC = 1e-4

// --- luminance ------------------------------------------------------------

/**
 * WCAG relative luminance, 0–1. Alpha is ignored — a colour has to be composited
 * against something before its contrast means anything.
 */
export function relativeLuminance({ r, g, b }: Rgba): number {
  const [lr, lg, lb] = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
}

/**
 * Whether black text reads better than white on this colour. Used to keep a
 * swatch's own label legible whatever colour it is showing.
 */
export function prefersDarkText(c: Rgba): boolean {
  return relativeLuminance(c) > 0.4
}

/** Composites a colour over an opaque backdrop, so its alpha can be seen. */
export function flatten(c: Rgba, backdrop: Rgba): Rgba {
  const a = clamp(c.a, 0, 1)
  return {
    r: c.r * a + backdrop.r * (1 - a),
    g: c.g * a + backdrop.g * (1 - a),
    b: c.b * a + backdrop.b * (1 - a),
    a: 1
  }
}
