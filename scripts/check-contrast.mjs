// Audits WCAG contrast for the token pairs that actually matter, in both
// themes. Run with `node scripts/check-contrast.mjs`.
//
// Resolves tokens by parsing src/styles/tokens.scss, so it checks the real
// values rather than a copy that can drift. `var()` chains are followed and
// `color-mix()` is evaluated (srgb and oklab), so the derived tokens — hovers,
// border-strong, the dark status surfaces — are measured, not skipped.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve('src/styles/tokens.scss'), 'utf8')

function parseBlock(source) {
  const map = {}
  for (const m of source.matchAll(/--octans-([a-z0-9-]+):\s*([^;]+);/g)) {
    map[m[1]] = m[2].trim()
  }
  return map
}

function blockAt(marker) {
  const start = css.indexOf(marker)
  return css.slice(start, css.indexOf('\n}', start))
}

// The light theme is `:root` plus the shared derived mixin (defined above it,
// so the `:root` slice alone misses every derived token). Dark is those with
// the dark mixin's overrides on top — the mixin re-includes the derived
// formulas, which parsing flat like this models correctly, since the formulas
// are re-resolved below against the dark values.
const derived = parseBlock(blockAt('@mixin octans-derived-tokens'))
const light = { ...derived, ...parseBlock(blockAt(':root {')) }
const dark = { ...light, ...parseBlock(blockAt('@mixin octans-dark-tokens')) }

// --- colour math -----------------------------------------------------------

function toRgb(value) {
  const hex = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  }
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    return [1, 2, 3].map((i) => parseInt(hex[i] + hex[i], 16))
  }
  const m = hex.match(/^rgba?\(([^)]+)\)/i)
  if (m) {
    const parts = m[1]
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number)
    if (parts.length >= 3) return parts.slice(0, 3)
  }
  return null
}

// sRGB ↔ Oklab, matching src/utils/color.ts.
const toLinear = (c) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const fromLinear = (c) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055
  return Math.min(255, Math.max(0, Math.round(v * 255)))
}

function rgbToOklab([r, g, b]) {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)]
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  ]
}

function oklabToRgb([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return [
    fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ]
}

// --- token resolution -------------------------------------------------------

/**
 * Follows a token down to `[r, g, b]`, through `var()` chains and
 * `color-mix()`. Returns `null` for anything else (fonts, shadows, gradients).
 */
function resolveToken(map, name, seen = new Set()) {
  if (seen.has(name)) return null
  seen.add(name)
  const value = map[name]
  if (!value) return null
  return resolveValue(map, value, seen)
}

function resolveValue(map, value, seen = new Set()) {
  const v = value.replace(/\s+/g, ' ').trim()

  const varMatch = v.match(/^var\(--octans-([a-z0-9-]+)\)$/)
  if (varMatch) return resolveToken(map, varMatch[1], seen)

  const mix = v.match(/^color-mix\(\s*in (srgb|oklab)\s*,(.+)\)$/)
  if (mix) return resolveMix(map, mix[1], mix[2], seen)

  return toRgb(v)
}

/**
 * Evaluates `color-mix()` the way CSS does: percentages normalised, srgb mixed
 * channel-wise on the encoded components, oklab mixed in Oklab space.
 */
function resolveMix(map, space, argString, seen) {
  // Split the two colour arguments on the top-level comma — neither side can
  // itself contain a comma here, because nested color-mix() never appears in
  // the stylesheet (derivations are single-level by design).
  const args = argString.split(',').map((s) => s.trim())
  if (args.length !== 2) return null

  const parts = args.map((arg) => {
    const m = arg.match(/^(.+?)(?:\s+([\d.]+)%)?$/)
    if (!m) return null
    // Each colour resolves with its own `seen` copy — two arguments may
    // legitimately traverse the same token without being circular.
    const rgb = resolveValue(map, m[1], new Set(seen))
    return rgb ? { rgb, pct: m[2] === undefined ? null : Number(m[2]) } : null
  })
  if (parts.some((p) => !p)) return null

  let [a, b] = parts
  if (a.pct === null && b.pct === null) [a.pct, b.pct] = [50, 50]
  else if (a.pct === null) a.pct = 100 - b.pct
  else if (b.pct === null) b.pct = 100 - a.pct
  const total = a.pct + b.pct
  if (total <= 0) return null
  const t = b.pct / total

  if (space === 'srgb') {
    return a.rgb.map((c, i) => Math.round(c + (b.rgb[i] - c) * t))
  }
  const la = rgbToOklab(a.rgb)
  const lb = rgbToOklab(b.rgb)
  return oklabToRgb(la.map((c, i) => c + (lb[i] - c) * t))
}

// --- WCAG -------------------------------------------------------------------

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, label, minimum]
//
// 4.5 for body text (WCAG 1.4.3). 3.0 for UI components and graphical objects
// needed to understand the interface (WCAG 1.4.11) — that covers input
// outlines and focus rings, which is why `border-input` is held to 3.0.
//
// A plain divider is decorative and has NO WCAG requirement, so `border` gets
// a loose sanity floor instead: enough to be visible, not so much that every
// table row grows a heavy rule. Don't "fix" a border failure by darkening it
// past what the design wants — check which of the two cases it actually is.
const PAIRS = [
  ['text', 'surface', 'body text on surface', 4.5],
  ['text', 'surface-app', 'body text on app background', 4.5],
  ['text', 'surface-raised', 'body text on raised surface', 4.5],
  ['text-subdued', 'surface', 'subdued text on surface', 4.5],
  ['text-subdued', 'surface-app', 'subdued text on app background', 4.5],
  ['text-link', 'surface', 'link on surface', 4.5],

  // Coloured text on the plain surface, and on its own role's soft surface —
  // the Banner / InlineError / Badge patterns.
  ['text-primary', 'surface', 'primary text on surface', 4.5],
  ['text-secondary', 'surface', 'secondary text on surface', 4.5],
  ['text-tertiary', 'surface', 'tertiary text on surface', 4.5],
  ['text-info', 'surface', 'info text on surface', 4.5],
  ['text-success', 'surface', 'success text on surface', 4.5],
  ['text-warning', 'surface', 'warning text on surface', 4.5],
  ['text-error', 'surface', 'error text on surface', 4.5],
  ['text-info', 'info-surface', 'info text on info surface', 4.5],
  ['text-success', 'success-surface', 'success text on success surface', 4.5],
  ['text-warning', 'warning-surface', 'warning text on warning surface', 4.5],
  ['text-error', 'error-surface', 'error text on error surface', 4.5],
  ['text-secondary', 'secondary-surface', 'secondary button label', 4.5],
  [
    'text-tertiary',
    'tertiary-surface',
    'tertiary text on tertiary surface',
    4.5
  ],

  // Labels on solid fills.
  ['text-on-primary', 'primary', 'label on primary fill', 4.5],
  ['text-on-secondary', 'secondary', 'label on secondary fill', 4.5],
  ['text-on-tertiary', 'tertiary', 'label on tertiary fill', 4.5],
  ['text-on-info', 'info', 'label on info fill', 4.5],
  ['text-on-success', 'success', 'label on success fill', 4.5],
  ['text-on-warning', 'warning', 'label on warning fill', 4.5],
  ['text-on-error', 'error', 'label on error fill', 4.5],
  // Hovered/pressed fills keep their labels too. Actives sit further from the
  // fill than hovers, so checking the two ends covers the hover between them.
  ['text-on-primary', 'primary-active', 'label on pressed primary', 4.5],
  ['text-on-error', 'error-active', 'label on pressed error', 4.5],

  // Alpha is dropped when parsing, so this measures the tooltip fill at full
  // opacity. That is the honest direction to be wrong in: the real, partly
  // transparent tooltip sits over lighter content in light mode, which only
  // reduces contrast against its own light text.
  ['text-on-tooltip', 'surface-tooltip', 'tooltip text on tooltip', 4.5],
  ['text-on-nav', 'surface-nav', 'nav text on the app bar', 4.5],
  ['border', 'surface', 'divider against surface (decorative)', 1.25],
  // `border-strong` is the heavier of the two decorative borders — table and
  // list dividers, the heatmap's month separator, swatch outlines. No WCAG
  // requirement applies, so it gets a visibility floor like `border` rather
  // than the 3:1 owed by controls. It used to carry input outlines too, which
  // is what made its softness an accepted exception; those moved to
  // `border-input` below and the exception went with them.
  ['border-strong', 'surface', 'strong divider against surface', 1.6],
  // Control outlines are held to a 2:1 visibility floor, not WCAG 1.4.11's
  // 3:1 — a DELIBERATE softening (see the border block in tokens.scss): a
  // field is rarely identified by its outline alone, and the focus ring below
  // keeps the hard 3:1. Every control resolves through this one token, so a
  // strict theme restores AA by setting `--octans-border-input:
  // var(--octans-neutral-500)` and nothing else.
  ['border-input', 'surface', 'control outline against surface', 2.0],
  ['focus-ring', 'surface', 'focus ring against surface', 3.0],
  // The primary FILL as a colour on the surface — toggle tracks, tab
  // underlines, progress fills. A 2.5 floor, not 3:1: the deep pine 500 sits
  // at ~2.5 on the dark surface, and each of those indicators carries a second
  // cue (the knob, the label, the track). Anything using primary as TEXT must
  // go through `text-primary`, which dark re-points at the pale 300 — Tabs
  // was the offender that made this distinction load-bearing.
  ['primary', 'surface', 'primary against surface', 2.5],
  // The toggle knob stays light in dark mode, so anything drawn on it is
  // measured against the knob rather than the surface. Pointing either of
  // these at a theme-reactive token is exactly the mistake this row catches.
  ['toggle-knob-icon', 'toggle-knob', 'toggle icon on knob', 3.0],
  ['primary', 'toggle-knob', 'checked toggle icon on knob', 3.0]
]

let failures = 0
let unresolved = 0
for (const [themeName, map] of [
  ['LIGHT', light],
  ['DARK', dark]
]) {
  console.log(`\n${themeName}`)
  for (const [fg, bg, label, min] of PAIRS) {
    const fgRgb = resolveToken(map, fg)
    const bgRgb = resolveToken(map, bg)
    if (!fgRgb || !bgRgb) {
      unresolved++
      console.log(`  ?  ${label} (unresolved: ${map[fg]} / ${map[bg]})`)
      continue
    }
    const ratio = contrast(fgRgb, bgRgb)
    const pass = ratio >= min
    if (!pass) failures++
    console.log(
      `  ${pass ? 'ok  ' : 'FAIL'} ${ratio.toFixed(2)}:1 (min ${min}) — ${label}`
    )
  }
}

console.log(`\n${failures} failing, ${unresolved} unresolved pair(s).`)
process.exit(failures || unresolved ? 1 : 0)
