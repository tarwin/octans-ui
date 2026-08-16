/**
 * The token pairs whose contrast actually matters, with the ratio each owes.
 *
 * One list, two consumers: `scripts/check-contrast.mjs` audits the built-in
 * palette with it at build time, and the Theme Builder measures a theme being
 * edited against it live. Keeping them on the same table is the point — a pair
 * the script guards but the Builder never shows is a rule a custom theme can
 * break in silence.
 *
 * The script is plain `.mjs` and imports this `.ts` directly: Node strips the
 * types on the way in (the engines field already requires Node 24, where that
 * is on by default). So keep this file to types the stripper can simply
 * delete — no enums, no namespaces, no `const enum`.
 *
 * On the thresholds:
 *
 *   4.5  body text (WCAG 1.4.3).
 *   3.0  UI components and graphical objects needed to understand the
 *        interface (WCAG 1.4.11) — input outlines, focus rings.
 *
 * A plain divider is decorative and carries NO WCAG requirement, so `border`
 * gets a loose sanity floor instead: enough to be visible, not so much that
 * every table row grows a heavy rule. Don't "fix" a border failure by
 * darkening it past what the design wants — check which of the two cases it
 * actually is first.
 */

export interface ContrastPair {
  /** Token read as the foreground. */
  fg: string
  /** Token it sits on. */
  bg: string
  /** What the pair is, for messages. */
  label: string
  /** The ratio it has to clear. */
  min: number
}

export const CONTRAST_PAIRS: ContrastPair[] = [
  { fg: 'text', bg: 'surface', label: 'body text on surface', min: 4.5 },
  {
    fg: 'text',
    bg: 'surface-app',
    label: 'body text on app background',
    min: 4.5
  },
  {
    fg: 'text',
    bg: 'surface-raised',
    label: 'body text on raised surface',
    min: 4.5
  },
  {
    fg: 'text-subdued',
    bg: 'surface',
    label: 'subdued text on surface',
    min: 4.5
  },
  {
    fg: 'text-subdued',
    bg: 'surface-app',
    label: 'subdued text on app background',
    min: 4.5
  },
  { fg: 'text-link', bg: 'surface', label: 'link on surface', min: 4.5 },

  // Coloured text on the plain surface, and on its own role's soft surface —
  // the Banner / InlineError / Badge patterns.
  {
    fg: 'text-primary',
    bg: 'surface',
    label: 'primary text on surface',
    min: 4.5
  },
  {
    fg: 'text-secondary',
    bg: 'surface',
    label: 'secondary text on surface',
    min: 4.5
  },
  {
    fg: 'text-tertiary',
    bg: 'surface',
    label: 'tertiary text on surface',
    min: 4.5
  },
  { fg: 'text-info', bg: 'surface', label: 'info text on surface', min: 4.5 },
  {
    fg: 'text-success',
    bg: 'surface',
    label: 'success text on surface',
    min: 4.5
  },
  {
    fg: 'text-warning',
    bg: 'surface',
    label: 'warning text on surface',
    min: 4.5
  },
  { fg: 'text-error', bg: 'surface', label: 'error text on surface', min: 4.5 },
  {
    fg: 'text-info',
    bg: 'info-surface',
    label: 'info text on info surface',
    min: 4.5
  },
  {
    fg: 'text-success',
    bg: 'success-surface',
    label: 'success text on success surface',
    min: 4.5
  },
  {
    fg: 'text-warning',
    bg: 'warning-surface',
    label: 'warning text on warning surface',
    min: 4.5
  },
  {
    fg: 'text-error',
    bg: 'error-surface',
    label: 'error text on error surface',
    min: 4.5
  },
  {
    fg: 'text-secondary',
    bg: 'secondary-surface',
    label: 'secondary button label',
    min: 4.5
  },
  {
    fg: 'text-tertiary',
    bg: 'tertiary-surface',
    label: 'tertiary text on tertiary surface',
    min: 4.5
  },

  // Labels on solid fills.
  {
    fg: 'text-on-primary',
    bg: 'primary',
    label: 'label on primary fill',
    min: 4.5
  },
  {
    fg: 'text-on-secondary',
    bg: 'secondary',
    label: 'label on secondary fill',
    min: 4.5
  },
  {
    fg: 'text-on-tertiary',
    bg: 'tertiary',
    label: 'label on tertiary fill',
    min: 4.5
  },
  { fg: 'text-on-info', bg: 'info', label: 'label on info fill', min: 4.5 },
  {
    fg: 'text-on-success',
    bg: 'success',
    label: 'label on success fill',
    min: 4.5
  },
  {
    fg: 'text-on-warning',
    bg: 'warning',
    label: 'label on warning fill',
    min: 4.5
  },
  { fg: 'text-on-error', bg: 'error', label: 'label on error fill', min: 4.5 },
  // Hovered/pressed fills keep their labels too. Actives sit further from the
  // fill than hovers, so checking the two ends covers the hover between them.
  {
    fg: 'text-on-primary',
    bg: 'primary-active',
    label: 'label on pressed primary',
    min: 4.5
  },
  {
    fg: 'text-on-error',
    bg: 'error-active',
    label: 'label on pressed error',
    min: 4.5
  },

  // Alpha is dropped when parsing, so this measures the tooltip fill at full
  // opacity. That is the honest direction to be wrong in: the real, partly
  // transparent tooltip sits over lighter content in light mode, which only
  // reduces contrast against its own light text.
  {
    fg: 'text-on-tooltip',
    bg: 'surface-tooltip',
    label: 'tooltip text on tooltip',
    min: 4.5
  },
  {
    fg: 'text-on-nav',
    bg: 'surface-nav',
    label: 'nav text on the app bar',
    min: 4.5
  },
  {
    fg: 'border',
    bg: 'surface',
    label: 'divider against surface (decorative)',
    min: 1.25
  },
  // `border-strong` is the heavier of the two decorative borders — table and
  // list dividers, the heatmap's month separator, swatch outlines. No WCAG
  // requirement applies, so it gets a visibility floor like `border` rather
  // than the 3:1 owed by controls. It used to carry input outlines too, which
  // is what made its softness an accepted exception; those moved to
  // `border-input` below and the exception went with them.
  {
    fg: 'border-strong',
    bg: 'surface',
    label: 'strong divider against surface',
    min: 1.6
  },
  // Control outlines are held to a 2:1 visibility floor, not WCAG 1.4.11's
  // 3:1 — a DELIBERATE softening (see the border block in tokens.scss): a
  // field is rarely identified by its outline alone, and the focus ring below
  // keeps the hard 3:1. Every control resolves through this one token, so a
  // strict theme restores AA by setting `--octans-border-input:
  // var(--octans-neutral-500)` and nothing else.
  {
    fg: 'border-input',
    bg: 'surface',
    label: 'control outline against surface',
    min: 2.0
  },
  {
    fg: 'focus-ring',
    bg: 'surface',
    label: 'focus ring against surface',
    min: 3.0
  },
  // The primary FILL as a colour on the surface — toggle tracks, tab
  // underlines, progress fills. A 2.5 floor, not 3:1: the deep pine 500 sits
  // at ~2.5 on the dark surface, and each of those indicators carries a second
  // cue (the knob, the label, the track). Anything using primary as TEXT must
  // go through `text-primary`, which dark re-points at the pale 300 — Tabs
  // was the offender that made this distinction load-bearing.
  {
    fg: 'primary',
    bg: 'surface',
    label: 'primary against surface',
    min: 2.5
  },
  // The toggle knob stays light in dark mode, so anything drawn on it is
  // measured against the knob rather than the surface. Pointing either of
  // these at a theme-reactive token is exactly the mistake this row catches.
  {
    fg: 'toggle-knob-icon',
    bg: 'toggle-knob',
    label: 'toggle icon on knob',
    min: 3.0
  },
  {
    fg: 'primary',
    bg: 'toggle-knob',
    label: 'checked toggle icon on knob',
    min: 3.0
  }
]

/** Every pair a given token is the foreground of. */
export function pairsForToken(name: string): ContrastPair[] {
  return CONTRAST_PAIRS.filter((p) => p.fg === name)
}
