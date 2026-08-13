/**
 * Turning a gradient into a colour ramp.
 *
 * A ramp (`neutral-0` … `neutral-950`, `primary-50` … `primary-900`) is a set of
 * numbered steps across a range of lightness. Hand-picking a dozen of those and
 * keeping them even is fiddly, so this samples them off a gradient instead —
 * see `./gradient` for the interpolation itself and why the colour space
 * matters so much.
 *
 * The one idea that belongs here rather than there: a ramp's step numbers are
 * POSITIONS, not indices.
 */

import {
  formatColor,
  parseColor,
  rgbToOklch,
  oklabToRgb,
  type ColorFormat,
  type Rgba
} from './color'
import {
  createGradient,
  sampleGradient,
  type Gradient
} from './gradient'

export interface RampStepPosition {
  /** The step's number, e.g. `200`. */
  step: number
  /** Where it samples the gradient, 0–1. */
  t: number
}

/**
 * Maps step numbers onto positions along a gradient.
 *
 * The numbers are spread across 0–1 by VALUE, not by index: on a `[0, 50, 100,
 * 200, … 950]` ramp the gap from 500 to 600 is a tenth of the gap from 100 to
 * 300, and the generated colours honour that. That is what makes a generated
 * ramp line up with a hand-authored one, where the number has always meant "how
 * far along". A generator that spaced these evenly would put `500` at 6/11 and
 * quietly stop matching the ramp it replaced.
 *
 * Exported because a caller may want the mapping without the colours — to label
 * a step with where it sits, or to check a ramp lines up with an existing one.
 */
export function stepPositions(steps: number[]): RampStepPosition[] {
  if (!steps.length) return []
  const lo = Math.min(...steps)
  const hi = Math.max(...steps)
  const span = hi - lo
  // A one-step ramp, or one whose numbers are all the same, has no span to
  // divide by. Pin it to the start rather than dividing by zero.
  return steps.map((step) => ({ step, t: span === 0 ? 0 : (step - lo) / span }))
}

/**
 * Samples a gradient at each step, returning `{ [step]: '#rrggbb' }`.
 *
 * The lowest and highest steps land exactly on whatever the gradient holds at
 * its two ends. Returns `null` if any stop is not a colour that can be parsed,
 * or if there are no steps — a caller should treat that as "not a ramp" rather
 * than substituting black, since a silently wrong ramp is much harder to notice
 * than one that plainly did not generate.
 */
export function rampColors(
  gradient: Gradient,
  steps: number[],
  format: ColorFormat = 'hex'
): Record<number, string> | null {
  if (!steps.length) return null

  const out: Record<number, string> = {}
  for (const { step, t } of stepPositions(steps)) {
    const color = sampleGradient(gradient, t)
    if (!color) return null
    out[step] = formatColor(color, format)
  }
  return out
}

// --- seeding a ramp from one colour ----------------------------------------
//
// Ant Design's palette insight: a designer picks ONE colour, and the ten steps
// around it are derived. The derivation here rides the gradient machinery
// above — a seed becomes a three-stop oklch gradient (pale tint → seed → deep
// shade), and the ramp is sampled off it. Returning a `Gradient` rather than
// the finished steps means the Theme Builder can hand the result straight to
// its existing ramp editor, and a curious user can drag the stops afterwards.

/**
 * The gradient's domain is the step NUMBERS, mapped onto 0–1000. That anchors
 * every ramp to the same scale regardless of which steps it declares: `700`
 * samples at 70% whether the ramp ends there (status ramps) or runs on to 950
 * (neutral). Without this, a six-step ramp's `700` would sit at the gradient's
 * dark end and come out near black.
 */
const RAMP_DOMAIN = 1000

/** Lightness (oklch) at the very top of the domain — a near-white tint. */
const RAMP_LIGHT_L = 0.99
/** Lightness at the very bottom — a deep, still-hued shade. */
const RAMP_DARK_L = 0.16

/**
 * Chroma at the pale end, capped hard. The cap matters more than the ratio: an
 * oklch colour at L≈0.99 can only hold a whisper of chroma inside sRGB, and
 * asking for more gets gamut-clipped channel by channel — which ROTATES the
 * hue (an indigo tint comes back cyan). Hand-authored 50-steps sit at C≈0.02.
 */
const RAMP_LIGHT_CHROMA_MAX = 0.02
const RAMP_LIGHT_CHROMA_RATIO = 0.25
/** And at the dark end, where over-saturation reads as neon. */
const RAMP_DARK_CHROMA_MAX = 0.11
const RAMP_DARK_CHROMA_RATIO = 0.55

/**
 * Builds the three-stop gradient a seed colour implies.
 *
 * The seed always sits at the domain's midpoint — step 500 — exactly as Ant
 * Design's generator pins the seed to its palette slot. The colour you picked
 * IS `<role>-500`, whatever its lightness; a pastel seed simply yields a pale
 * upper half. Predictability beats cleverness here: "your colour is 500" is a
 * rule a theme author can hold in their head.
 *
 * Returns `null` for an unparseable seed.
 */
export function seedGradient(seed: string | Rgba): Gradient | null {
  const rgba = typeof seed === 'string' ? parseColor(seed) : seed
  if (!rgba) return null

  const [, C, H] = rgbToOklch({ ...rgba, a: 1 })
  const rad = (H * Math.PI) / 180

  const at = (l: number, c: number): string => {
    const { r, g, b } = oklabToRgb(l, Math.cos(rad) * c, Math.sin(rad) * c)
    return formatColor({ r, g, b, a: 1 }, 'hex')
  }

  return createGradient({
    space: 'oklch',
    stops: [
      {
        color: at(
          RAMP_LIGHT_L,
          Math.min(C * RAMP_LIGHT_CHROMA_RATIO, RAMP_LIGHT_CHROMA_MAX)
        ),
        position: 0
      },
      { color: formatColor({ ...rgba, a: 1 }, 'hex'), position: 50 },
      {
        color: at(
          RAMP_DARK_L,
          Math.min(C * RAMP_DARK_CHROMA_RATIO, RAMP_DARK_CHROMA_MAX)
        ),
        position: 100
      }
    ]
  })
}

/**
 * The whole derivation in one call: seed in, `{ step: '#rrggbb' }` out.
 *
 * Steps sample the gradient at `step / 1000` — see `RAMP_DOMAIN`. Returns
 * `null` if the seed cannot be parsed.
 */
export function seedRampColors(
  seed: string | Rgba,
  steps: number[],
  format: ColorFormat = 'hex'
): Record<number, string> | null {
  const gradient = seedGradient(seed)
  if (!gradient || !steps.length) return null

  const out: Record<number, string> = {}
  for (const step of steps) {
    const color = sampleGradient(gradient, step / RAMP_DOMAIN)
    if (!color) return null
    out[step] = formatColor(color, format)
  }
  return out
}
