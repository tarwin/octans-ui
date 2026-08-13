/**
 * The front door of the theming system: a whole theme from a handful of seed
 * colours.
 *
 * `createTheme({ name: 'Ocean', primary: '#0f9d8f' })` returns a `CustomTheme`
 * whose tokens redefine the primary RAMP — every semantic token that points at
 * the ramp follows, in both light and dark, because dark mode only re-points
 * semantic tokens at different steps of the same ramps. Apply it with
 * `applyCustomTheme`, persist it with `saveCustomTheme`, or hand-edit it in
 * the Theme Builder afterwards (the generating gradients ride along in
 * `ramps`, so the Builder can offer the ramp you built rather than frozen
 * steps).
 *
 * What it deliberately does NOT do: rewrite semantic tokens one by one. A
 * sparse ramp override survives library updates — a new semantic token added
 * later still finds your colours, because it reads the ramps you set.
 */

import { parseColor, relativeLuminance, type Rgba } from './color'
import { rampColors, seedGradient } from './colorRamp'
import { createThemeId, type CustomTheme } from './customTheme'
import type { ThemeType } from './theme'
import { TOKEN_RAMP_BY_PREFIX } from './tokens'
import type { Gradient } from './gradient'

/** The ramp prefixes a seed can be given for, in display order. */
export const THEME_SEED_ROLES = [
  'neutral',
  'primary',
  'secondary',
  'tertiary',
  'info',
  'success',
  'warning',
  'error'
] as const

export type ThemeSeedRoleType = (typeof THEME_SEED_ROLES)[number]

/**
 * The ramp step each role's semantic FILL token points at (see tokens.scss).
 * `createTheme` measures the generated colour at this step to pick a legible
 * `text-on-<role>`.
 */
const FILL_STEP: Record<Exclude<ThemeSeedRoleType, 'neutral'>, number> = {
  primary: 500,
  secondary: 500,
  tertiary: 500,
  info: 600,
  success: 600,
  warning: 700,
  error: 600
}

export type ThemeRadiusPresetType = 'none' | 'small' | 'medium' | 'large'

/** `field` rounds controls, `box` rounds containers — see tokens.scss. */
const RADIUS_PRESETS: Record<
  ThemeRadiusPresetType,
  { field: string; box: string }
> = {
  none: { field: '0px', box: '0px' },
  small: { field: '2px', box: '4px' },
  medium: { field: '4px', box: '8px' },
  large: { field: '8px', box: '16px' }
}

export interface CreateThemeOptions {
  /** Human-readable name, shown in the Theme Builder. */
  name: string
  /** Storage id. Generated from the name when omitted. */
  id?: string
  /**
   * Which built-in theme to layer on. `'light'` unless stated — but note the
   * ramps generated here feed BOTH themes; `base` only picks the starting
   * point for anything you did not seed.
   */
  base?: ThemeType
  /** Tints every grey — surfaces, text and borders follow. */
  neutral?: string
  /** The brand colour. The single highest-leverage seed. */
  primary?: string
  secondary?: string
  tertiary?: string
  info?: string
  success?: string
  warning?: string
  error?: string
  /**
   * Corner rounding, as a preset or explicit `{ field, box }` lengths.
   * `medium` is the built-in default (4px controls / 8px containers).
   */
  radius?: ThemeRadiusPresetType | { field: string; box: string }
}

/**
 * Generates a sparse `CustomTheme` from seed colours.
 *
 * Each seed becomes a full ramp via `seedGradient` — the seed itself lands
 * exactly on step 500. `text-on-<role>` is chosen by measuring the generated
 * fill: white unless the fill is light enough to want dark text.
 *
 * Throws on an unparseable seed rather than skipping it — a silently missing
 * ramp looks like the theme applied and did nothing.
 *
 * One honest limitation: a very light seed (a pastel) generates a light upper
 * half, and the `text-<role>` tokens that point at steps 600–700 can land
 * under WCAG's 4.5:1 for text. `pnpm run check:contrast` guards the built-in
 * palette only; check generated themes with the Theme Builder's preview.
 */
export function createTheme(options: CreateThemeOptions): CustomTheme {
  const tokens: Record<string, string> = {}
  const ramps: Record<string, Gradient> = {}

  // Generated up front (or defaulted) so `text-on-<role>` can point at the
  // theme's own near-black when a pale fill wants dark text.
  const neutralRamp = options.neutral
    ? generateRamp('neutral', options.neutral)
    : null
  const darkText = neutralRamp?.colors[950] ?? '#11151a'

  for (const role of THEME_SEED_ROLES) {
    const seed = options[role]
    if (!seed) continue

    const ramp = role === 'neutral' ? neutralRamp! : generateRamp(role, seed)
    ramps[role] = ramp.gradient
    for (const [step, value] of Object.entries(ramp.colors)) {
      tokens[`${role}-${step}`] = value
    }

    if (role !== 'neutral') {
      const fill = parseColor(ramp.colors[FILL_STEP[role]])
      if (fill) tokens[`text-on-${role}`] = pickLabel(fill, darkText)
    }
  }

  if (options.radius) {
    const { field, box } =
      typeof options.radius === 'string'
        ? RADIUS_PRESETS[options.radius]
        : options.radius
    tokens['radius-field'] = field
    tokens['radius-box'] = box
  }

  return {
    id: options.id ?? createThemeId(options.name),
    name: options.name,
    base: options.base ?? 'light',
    tokens,
    ...(Object.keys(ramps).length ? { ramps } : {})
  }
}

/**
 * White if it clears WCAG's 4.5:1 on the fill — the house style for labels on
 * fills — otherwise whichever of white and the theme's near-black measures
 * stronger. Measured, not guessed by lightness: on a mid-tone fill the two can
 * sit either side of the threshold by a whisker.
 */
function pickLabel(fill: Rgba, darkText: string): string {
  const fillLum = relativeLuminance(fill)
  const ratio = (a: number, b: number) =>
    (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
  const white = ratio(1, fillLum)
  if (white >= 4.5) return '#ffffff'
  const darkLum = relativeLuminance(
    parseColor(darkText) ?? { r: 17, g: 21, b: 26, a: 1 }
  )
  return ratio(darkLum, fillLum) > white ? darkText : '#ffffff'
}

function generateRamp(role: ThemeSeedRoleType, seed: string) {
  const gradient = seedGradient(seed)
  if (!gradient) {
    throw new Error(`createTheme: cannot parse ${role} seed ${seed}`)
  }
  // `rampColors` normalises steps between min and max, but seed ramps live on
  // the canonical 0–1000 domain — anchor both ends so `700` samples at 70%
  // whether or not the ramp declares steps beyond it.
  const steps = TOKEN_RAMP_BY_PREFIX[role].steps
  const domain = [...new Set([0, ...steps, 1000])]
  const colors = rampColors(gradient, domain)
  if (!colors) {
    throw new Error(`createTheme: cannot generate a ${role} ramp from ${seed}`)
  }
  const declared: Record<number, string> = {}
  for (const step of steps) declared[step] = colors[step]
  return { gradient, colors: declared }
}
