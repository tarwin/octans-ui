# The Octans color system

_Design doc, written 2026-08-10 after reviewing Material 3 (color system +
color roles), daisyUI colors, and Ant Design's palette spec. This documents the
system as reworked that night; the "was" notes describe the previous design so
the diff makes sense._

## What each reference system got right

- **Material 3** — roles, not colors. Every fill has an `on-` pairing, every
  role has a "container" (soft tint) variant. Themes are generated from a
  handful of source colors; the roles are derived. Its weakness for a library
  like this is sheer size (~40 roles × 13-tone palettes).
- **daisyUI** — the whole theme is ~16 named colors (`primary`,
  `primary-content`, `base-100/200/300`, four status colors…). Small enough to
  write by hand in one screen. Its weakness: no ramps, so components can't
  reach for a lighter/darker step when they legitimately need one.
- **Ant Design** — one seed color generates a 10-step palette
  algorithmically. You pick one color; the system does the rest.

Octans already had two of the three tiers (primitive ramps + semantic tokens).
What it lacked was the **small front door**: to make a theme you faced ~90
tokens. The rework keeps the tiers and adds derivation, so the number of
decisions a theme author makes drops to roughly daisyUI's, without losing
per-token control.

## The three tiers

```
seeds  ──generate──▶  primitive ramps  ──reference──▶  semantic tokens  ──▶ components
(≤8 colors)           (--octans-primary-500…)          (--octans-primary,
                                                        --octans-text-error…)
```

1. **Seeds** (JS only, optional): `createTheme({ primary: '#0f9d8f' })`
   generates every ramp below via the gradient machinery that already powered
   the Theme Builder. You set between 1 and 8 colors; everything follows,
   including dark mode — because dark mode only re-points semantic tokens at
   different steps of the *same* ramps.
2. **Primitive ramps** (CSS custom properties): the raw palette. Components
   never use these directly.
3. **Semantic tokens**: what things mean. Components use only these. Most are
   now *derived by default* (via `var()` chains and `color-mix()`), so they
   follow the ramps automatically but remain individually overridable.

## Color roles

Eight roles. Three brand, four status, one neutral family.

| Role        | Ramp steps                        | Default hue                     |
| ----------- | --------------------------------- | ------------------------------- |
| `primary`   | 50–900 (10)                       | Pine `#386657` (was "accent", originally indigo) |
| `secondary` | 50, 100, 300, 500, 600, 700       | Burnt orange `#ba4f1a` (new)    |
| `tertiary`  | 50, 100, 300, 500, 600, 700       | Leaf green `#85b87a` (new; pale, so its label is dark) |
| `info`      | 50, 100, 300, 500, 600, 700       | Blue (new ramp — was aliased to accent/indigo) |
| `success`   | 50, 100, 300, 500, 600, 700       | Green (unchanged)               |
| `warning`   | 50, 100, 300, 500, 600, 700       | Amber (unchanged)               |
| `error`     | 50, 100, 300, 500, 600, 700       | Red (was "critical")            |
| `neutral`   | 0, 50–950 (12)                    | Cool grey (unchanged)           |

Every non-neutral role exposes the **same four semantic tokens**, following
the naming pattern the status colors already used:

| Token                     | Meaning                                            | Example use                     |
| ------------------------- | -------------------------------------------------- | ------------------------------- |
| `--octans-<role>`         | The solid fill                                     | Primary button, badge fill      |
| `--octans-text-on-<role>` | Content sitting on that fill                       | Button label                    |
| `--octans-<role>-surface` | Soft tinted background ("container" in M3)         | Banner body, selected row       |
| `--octans-text-<role>`    | Readable text in that hue — on plain surfaces *and* on `<role>-surface` | Inline error text, banner text |

Plus two derived states that themes normally never touch:

- `--octans-<role>-hover` / `--octans-<role>-active` — derived with
  `color-mix()` from the fill and `--octans-state-mix` (black in light,
  white in dark). Override only if you want a hue shift on hover rather than a
  shade shift.

### Renames

- `accent` → `primary` everywhere (ramp and semantics). "Accent" was Polaris
  vocabulary; primary/secondary/tertiary is what M3, daisyUI, Ant and Tailwind
  users expect.
- `critical` → `error` (ramp, semantics, and component `status` props).
  daisyUI, Ant and M3 all say error.
- `--octans-secondary` **changed meaning.** It was the quiet neutral button
  fill; it is now the secondary brand color. The secondary Button variant now
  renders `secondary-surface` + `text-secondary` — visually almost identical
  to the old neutral fill (the default secondary hue is a whisper-saturated
  slate-indigo) but it now follows the theme.
- `info` is now a real blue ramp instead of an alias for the accent. This
  separates "informational" from "selected/branded", which were
  indistinguishable before.
- Component `status` props follow the same vocabulary: in Banner, Badge and
  ProgressBar, `warning` now means the amber state and `error` the red one
  (previously Polaris-style `attention`/`warning`). `attention` remains
  accepted as an alias of `warning`.

### Derivations (what shrank)

These tokens still exist (components use them; you can override them) but are
now computed instead of hand-set per theme:

- `<role>-hover`, `<role>-active` — `color-mix` toward `--octans-state-mix`.
- `--octans-surface-hover` — 5% text over surface. Works in both themes; was
  two hand-picked greys.
- `--octans-surface-selected` — alias of `--octans-primary-surface`.
- `--octans-surface-disabled`, `--octans-skeleton` — mixes of text over
  surface.
- `--octans-text-link` — alias of `--octans-text-primary`; hover derived.
- `--octans-scrollbar-thumb-hover` — derived.
- `--octans-border` / `--octans-border-strong` — now reference the neutral
  ramp (they were detached literals, so editing the ramp didn't reach them).
- `--octans-border-subdued` — **removed** (2 uses, folded into `border`).

The dark theme override block shrank accordingly: it now mostly re-points
surfaces/text/borders and flips `--octans-state-mix`; states, hovers and
selection follow on their own.

## Radii

The old scale (`sm`/`md`/`lg`/`full`) failed in practice: `lg` had zero uses
and 46 hardcoded `3px` values had grown beside `sm` (which was also 3px).
Nobody could say what `md` was *for*. Replaced with **role-named radii**
(daisyUI's `--radius-field`/`--radius-box` insight):

| Token                   | Default | Used by                                        |
| ----------------------- | ------- | ---------------------------------------------- |
| `--octans-radius-field` | 4px     | Buttons, inputs, checkboxes, swatches — anything hand-sized |
| `--octans-radius-box`   | 8px     | Cards, popovers, modals, tooltips, nav items — containers |
| `--octans-radius-full`  | 9999px  | Pills, round buttons, knobs                    |

Two knobs make a theme: `field` and `box`. Set both to 0 for square, raise
them for soft. The hardcoded values were swept onto the tokens, so the knobs
now actually reach everything.

## Layout

- **`Page` gains real size presets**: `narrow` (720px), `default` (1100px),
  `wide` (1400px), `fullWidth`. Widths are tokens
  (`--octans-page-width-narrow` …) so apps can retune them. Previously
  `narrow` and default were both 1100px and only `fullWidth` did anything.
- **Container queries**: `Page` is now a `@container` (`inline-size`), and its
  action-collapse breakpoint queries the page's own width rather than the
  viewport — so a page inside `AppFrame` (nav eating 240px) collapses at the
  right content width, not the wrong screen width. `Layout` already worked by
  flex-basis wrapping, which is container-driven by nature; its min-widths and
  the gutter are now tokens.
- The `--ui-page-*` property family is renamed `--octans-page-*` (one token
  family, one prefix). `--ui-font`/`--ui-monospace-font` keep working as the
  input the font tokens read.

## Theming in practice

Full rebrand, one line:

```ts
import { createTheme, applyCustomTheme } from '@octans/ui'

applyCustomTheme(createTheme({ name: 'Ramune', primary: '#2f8fde' }))
```

More opinionated:

```ts
createTheme({
  name: 'Ramune',
  primary: '#2f8fde',
  secondary: '#5b6b8c',
  tertiary: '#c25e9c',
  neutral: '#7b8798',   // tints every grey
  radius: 'large'       // field 8px / box 16px
})
```

CSS-only theming still works at either lower tier:

```css
:root {
  /* retune one ramp — every semantic token that references it follows */
  --octans-primary-500: #0f9d8f;
  /* or override one semantic decision */
  --octans-surface-selected: #fff7e6;
}
```

## Contrast guarantees

`scripts/check-contrast.mjs` keeps enforcing the pairs that matter (text 4.5:1,
UI components 3:1 per WCAG 1.4.11) against the real stylesheet, now including
the secondary/tertiary/info roles. `createTheme` additionally picks each
`text-on-<role>` by measured contrast (white or near-black, whichever clears),
and documents that hand-picked seeds with mid lightness can still need a manual
`text-<role>` override.
