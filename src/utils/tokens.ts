/**
 * The design token registry.
 *
 * This is the machine-readable companion to `styles/tokens.scss` — it drives
 * the Theme Builder, and is exported so applications can build their own
 * theming UI without hardcoding a token list.
 *
 * Keep it in sync when adding a token. `tokens.test.ts` fails if the stylesheet
 * and this registry drift apart, so it cannot rot silently.
 */

export type TokenKind =
  | 'color'
  | 'shadow'
  | 'radius'
  | 'font'
  | 'length'
  | 'percent'
  | 'duration'
  | 'keyword'

export interface TokenDefinition {
  /** Token name without the `--octans-` prefix. */
  name: string
  kind: TokenKind
  /** What it's for. Shown in the Theme Builder. */
  description?: string
  /**
   * Set when the stylesheet computes this token from others (via `var()`
   * chains or `color-mix()`). A theming UI can hide these by default — they
   * follow the tokens they are derived from, and only need touching to break
   * the derivation on purpose.
   */
  derived?: boolean
}

export interface TokenGroup {
  title: string
  description?: string
  /** Primitives are the raw palette; components should only use semantic. */
  tier: 'primitive' | 'semantic'
  tokens: TokenDefinition[]
}

export interface TokenRamp {
  /** Token prefix. `neutral` covers `neutral-0`, `neutral-50`, and so on. */
  prefix: string
  /** Human label, for a theming UI. */
  title: string
  /**
   * The step numbers, ascending.
   *
   * They are positions, not indices — 500 sits halfway along a 0–1000 ramp
   * whether or not there is a step either side of it. A generator that treats
   * them as evenly spaced indices produces a ramp that no longer matches the
   * hand-authored one it replaced.
   */
  steps: number[]
}

/** The steps every six-step role ramp shares. */
const ROLE_STEPS = [50, 100, 300, 500, 600, 700]

/**
 * The primitive ramps, declared once so a theming UI can offer to generate a
 * whole ramp rather than twelve separate colour pickers. `TOKEN_GROUPS` below
 * is built from these, so the two cannot disagree about which steps exist.
 */
export const TOKEN_RAMPS: TokenRamp[] = [
  {
    prefix: 'neutral',
    title: 'Neutral',
    steps: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
  },
  {
    prefix: 'primary',
    title: 'Primary',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
  },
  { prefix: 'secondary', title: 'Secondary', steps: ROLE_STEPS },
  { prefix: 'tertiary', title: 'Tertiary', steps: ROLE_STEPS },
  { prefix: 'info', title: 'Info', steps: ROLE_STEPS },
  { prefix: 'success', title: 'Success', steps: ROLE_STEPS },
  { prefix: 'warning', title: 'Warning', steps: ROLE_STEPS },
  { prefix: 'error', title: 'Error', steps: ROLE_STEPS }
]

/** Lookup by prefix, e.g. `TOKEN_RAMP_BY_PREFIX['primary']`. */
export const TOKEN_RAMP_BY_PREFIX: Record<string, TokenRamp> =
  Object.fromEntries(TOKEN_RAMPS.map((r) => [r.prefix, r]))

const color = (name: string, description?: string): TokenDefinition => ({
  name,
  kind: 'color',
  description
})

const derived = (name: string, description?: string): TokenDefinition => ({
  name,
  kind: 'color',
  description,
  derived: true
})

const ramp = (prefix: string): TokenDefinition[] =>
  TOKEN_RAMP_BY_PREFIX[prefix].steps.map((step) => color(`${prefix}-${step}`))

/**
 * The four tokens every colour role exposes, plus its derived states. See
 * docs/color-system.md — fill, text-on-fill, soft surface, readable text.
 */
const role = (
  prefix: string,
  { states = false }: { states?: boolean } = {}
): TokenDefinition[] => [
  color(prefix, `The solid ${prefix} fill`),
  color(`text-on-${prefix}`, `Content sitting on the ${prefix} fill`),
  color(`${prefix}-surface`, `Soft ${prefix}-tinted background`),
  color(`text-${prefix}`, `Readable ${prefix} text, on plain or soft surfaces`),
  ...(states
    ? [
        derived(`${prefix}-hover`, 'Fill shaded toward state-mix'),
        derived(`${prefix}-active`)
      ]
    : [])
]

export const TOKEN_GROUPS: TokenGroup[] = [
  {
    title: 'Neutral ramp',
    tier: 'primitive',
    description:
      'Greys. Semantic surface, text and border tokens draw on these.',
    tokens: ramp('neutral')
  },
  {
    title: 'Primary ramp',
    tier: 'primitive',
    description:
      'The brand colour. Redefining this ramp rebrands the whole library, ' +
      'because the semantic primary tokens point at it.',
    tokens: ramp('primary')
  },
  {
    title: 'Secondary ramp',
    tier: 'primitive',
    description: 'The second brand colour — a quiet cousin of the primary.',
    tokens: ramp('secondary')
  },
  {
    title: 'Tertiary ramp',
    tier: 'primitive',
    description: 'The third brand colour — contrast and variety.',
    tokens: ramp('tertiary')
  },
  {
    title: 'Status ramps',
    tier: 'primitive',
    tokens: [
      ...ramp('info'),
      ...ramp('success'),
      ...ramp('warning'),
      ...ramp('error')
    ]
  },
  {
    title: 'Surfaces',
    tier: 'semantic',
    tokens: [
      color('surface', 'Cards, panels, the default background'),
      derived('surface-raised', 'Menus, popovers, modals — above the surface'),
      color('surface-sunken', 'Table headers, wells, code blocks'),
      color('surface-neutral', 'Neutral chips on a surface — Badge, Tag'),
      color('surface-app', 'The application background behind cards'),
      derived('surface-hover', 'Hover wash over a surface'),
      derived(
        'surface-selected',
        "Selected rows and items — the primary's soft tint"
      ),
      derived('surface-disabled', 'Disabled controls'),
      derived(
        'surface-control',
        'Fill of neutral controls — default buttons, the Select control'
      ),
      color('surface-tooltip', 'Tooltip body'),
      color('surface-nav', 'The app bar (GlobalNav) — its own chrome'),
      color('overlay', 'Scrim behind modals'),
      color('scrim', 'Veil over a region that is loading')
    ]
  },
  {
    title: 'Text',
    tier: 'semantic',
    tokens: [
      color('text', 'Body text'),
      color('text-subdued', 'Secondary text, help text, captions'),
      color('text-disabled', 'Disabled labels'),
      color('text-on-tooltip', 'Text inside a tooltip'),
      color('text-on-nav', 'Text on the app bar'),
      derived('text-link', 'Links — primary-coloured text'),
      derived('text-link-hover')
    ]
  },
  {
    title: 'Borders',
    tier: 'semantic',
    tokens: [
      color('border', 'Default dividers and outlines'),
      color('border-strong', 'Heavier dividers — decorative'),
      color(
        'table-header-border',
        'Rule under a DataTable or ResourceList header. Defaults to the ' +
          'row-rule weight; set to border-strong for a heavier bar'
      ),
      color(
        'border-input',
        'Control outlines — deliberately soft; set to neutral-500 for ' +
          'strict WCAG 1.4.11'
      ),
      color('border-error'),
      color('border-focus', 'Focus outline colour')
    ]
  },
  {
    title: 'Primary role',
    tier: 'semantic',
    description:
      'Primary actions, active states, selection, links. Hover/active are ' +
      'derived from the fill via --octans-state-mix.',
    tokens: [
      ...role('primary', { states: true }),
      color('focus-ring', 'Focus ring on inputs and buttons'),
      color(
        'state-mix',
        'What hover/active fills shade toward — black in both themes, so ' +
          'pressed fills never pull away from their own labels'
      )
    ]
  },
  {
    title: 'Secondary role',
    tier: 'semantic',
    description:
      'The second brand colour. The secondary Button renders its SOFT form ' +
      '(secondary-surface + text-secondary), keeping it quieter than the primary.',
    tokens: role('secondary', { states: true })
  },
  {
    title: 'Tertiary role',
    tier: 'semantic',
    tokens: role('tertiary', { states: true })
  },
  {
    title: 'Status roles',
    tier: 'semantic',
    description:
      'Fills sit behind text-on-<role>, so they stay dark enough for white ' +
      'text in both themes. Use text-<role> for coloured text.',
    tokens: [
      ...role('info'),
      ...role('success'),
      ...role('warning'),
      ...role('error', { states: true }),
      color(
        'tint-info',
        'What a status tint (Badge, Banner) mixes from. Follows the fill'
      ),
      color('tint-success', 'Follows the success fill'),
      color(
        'tint-warning',
        'The true amber, NOT the warning fill — that is the deep 700 step, ' +
          'chosen to carry white text, and dilutes to beige'
      ),
      color('tint-error', 'Follows the error fill')
    ]
  },
  {
    title: 'Miscellaneous',
    tier: 'semantic',
    tokens: [
      derived('skeleton', 'Placeholder blocks in loading states'),
      color('scrollbar-thumb'),
      derived('scrollbar-thumb-hover'),
      color(
        'toggle-knob',
        'ToggleSwitch knob. Stays light in dark mode, so it does not follow the theme'
      ),
      color(
        'toggle-knob-icon',
        'Unchecked icon on the ToggleSwitch knob. Fixed for the same reason'
      ),
      color(
        'rating',
        'Filled stars in a Rating. Brighter than the warning fill, which is deep enough to carry white text'
      )
    ]
  },
  {
    title: 'Elevation',
    tier: 'semantic',
    description:
      'Redefined per theme — a black shadow is invisible on a dark surface.',
    tokens: [
      { name: 'shadow-sm', kind: 'shadow' },
      { name: 'shadow-md', kind: 'shadow' },
      { name: 'shadow-lg', kind: 'shadow' },
      {
        name: 'shadow-control',
        kind: 'shadow',
        description: 'The hairline under a resting button or input'
      },
      {
        name: 'shadow-overflow',
        kind: 'color',
        description:
          'Edge fade on a ScrollPane with more content off screen. A colour, ' +
          'since it is one end of a gradient rather than a box-shadow'
      }
    ]
  },
  {
    title: 'Radii',
    tier: 'semantic',
    description:
      'Role-named: field rounds hand-sized controls, box rounds containers. ' +
      'Two knobs make a theme — 0/0 is square, 8/16 is soft.',
    tokens: [
      {
        name: 'radius-field',
        kind: 'radius',
        description: 'Buttons, inputs, checkboxes, swatches'
      },
      {
        name: 'radius-box',
        kind: 'radius',
        description: 'Cards, popovers, modals, tooltips'
      },
      {
        name: 'radius-full',
        kind: 'radius',
        description: 'Pills and round buttons'
      }
    ]
  },
  {
    title: 'Badge & Banner',
    tier: 'semantic',
    description:
      'How strongly a status Badge or Banner tints itself with its role ' +
      'colour. Two dials rather than one, because a badge is a small object ' +
      'that has to hold its own against the card it sits on and a banner is a ' +
      'large panel where the same strength stops being a background. The four ' +
      'surfaces under each are DERIVED from that component\u2019s dial \u2014 move the ' +
      'dial and all four follow; set one directly only to make a single ' +
      'status sit apart.',
    tokens: [
      {
        name: 'badge-surface-strength',
        kind: 'percent',
        description: 'How much role colour a status Badge mixes in'
      },
      {
        name: 'banner-surface-strength',
        kind: 'percent',
        description: 'How much role colour a status Banner mixes in'
      },
      {
        name: 'badge-ink',
        kind: 'color',
        description:
          'Forces one label colour on every status Badge. Unset = each ' +
          'status keeps its own text colour'
      },
      {
        name: 'banner-ink',
        kind: 'color',
        description:
          'Forces one label colour on every status Banner. Unset = each ' +
          'status keeps its own text colour'
      },
      {
        name: 'badge-info-surface',
        kind: 'color',
        description: 'Derived from the Badge dial'
      },
      {
        name: 'badge-success-surface',
        kind: 'color',
        description: 'Derived from the Badge dial'
      },
      {
        name: 'badge-warning-surface',
        kind: 'color',
        description: 'Derived from the Badge dial'
      },
      {
        name: 'badge-error-surface',
        kind: 'color',
        description: 'Derived from the Badge dial'
      },
      {
        name: 'banner-info-surface',
        kind: 'color',
        description: 'Derived from the Banner dial'
      },
      {
        name: 'banner-success-surface',
        kind: 'color',
        description: 'Derived from the Banner dial'
      },
      {
        name: 'banner-warning-surface',
        kind: 'color',
        description: 'Derived from the Banner dial'
      },
      {
        name: 'banner-error-surface',
        kind: 'color',
        description: 'Derived from the Banner dial'
      }
    ]
  },
  {
    title: 'Tabs',
    tier: 'semantic',
    description:
      'The mark under the selected tab — the one part of a component that ' +
      'lives in the theme, so a product can carry the choice rather than set ' +
      'it in code. The defaults draw an underline; a rounded bar sitting on ' +
      'the divider is the same mark with different numbers (5px / rounded / ' +
      'offset -2px / gap 8px).',
    tokens: [
      {
        name: 'tabs-indicator-height',
        kind: 'length',
        description: 'Thickness of the mark'
      },
      {
        name: 'tabs-indicator-radius',
        kind: 'radius',
        description: 'Rounding of the mark — 0 is a square rule'
      },
      {
        name: 'tabs-indicator-offset',
        kind: 'length',
        description: 'Vertical shift; negative drops it onto the divider'
      },
      {
        name: 'tabs-label-gap',
        kind: 'length',
        description: 'Space between the label and the mark'
      }
    ]
  },
  {
    title: 'Sheet',
    tier: 'semantic',
    description:
      'How big a Sheet is and how fast it moves. In the theme rather than the ' +
      'global stylesheet for the same reason as the Tabs indicator: how wide ' +
      'a product\u2019s sheets are, and whether they glide or snap, is a decision ' +
      'worth carrying rather than repeating at every call site. The size and ' +
      'the two durations are read by Sheet from the computed style \u2014 it ' +
      'slides by a transform it computes itself, so the numbers have to reach ' +
      'it as numbers \u2014 and are re-read each time a sheet opens.',
    tokens: [
      {
        name: 'sheet-size',
        kind: 'length',
        description:
          'Default width of a left/right sheet, height of a top/bottom one'
      },
      {
        name: 'sheet-padding',
        kind: 'length',
        description: 'Gutter that `<Sheet padded>` puts around its content'
      },
      {
        name: 'sheet-in-duration',
        kind: 'duration',
        description: 'Default open animation; 0ms opens instantly'
      },
      {
        name: 'sheet-out-duration',
        kind: 'duration',
        description: 'Default close animation; 0ms closes instantly'
      },
      {
        name: 'sheet-footer-align',
        kind: 'keyword',
        description:
          'How the footer slot lays its row out \u2014 any justify-content value'
      },
      {
        name: 'sheet-footer-gap',
        kind: 'length',
        description: 'Space between items in a sheet footer'
      }
    ]
  },
  {
    title: 'Icons',
    tier: 'semantic',
    description:
      'Two knobs an app sets once instead of passing props at every call ' +
      'site. Both defaults are what the library has always drawn, so setting ' +
      'either is opt-in and cannot silently move existing icons.',
    tokens: [
      {
        name: 'icon-size',
        kind: 'length',
        description:
          'Size of an Icon with no `size` prop. 1em follows the surrounding font'
      },
      {
        name: 'icon-valign',
        kind: 'length',
        description:
          'Vertical alignment of every Icon; -0.125em suits icons inline with text'
      }
    ]
  },
  {
    title: 'Typography',
    tier: 'semantic',
    tokens: [
      { name: 'font', kind: 'font' },
      { name: 'font-mono', kind: 'font' }
    ]
  }
]

/** Every token name, flattened. */
export const TOKEN_NAMES: string[] = TOKEN_GROUPS.flatMap((g) =>
  g.tokens.map((t) => t.name)
)

/** Lookup by name, e.g. `TOKEN_BY_NAME['surface-sunken']`. */
export const TOKEN_BY_NAME: Record<string, TokenDefinition> =
  Object.fromEntries(
    TOKEN_GROUPS.flatMap((g) => g.tokens).map((t) => [t.name, t])
  )

/** `surface-sunken` → `--octans-surface-sunken` */
export function tokenVar(name: string) {
  return `--octans-${name}`
}
