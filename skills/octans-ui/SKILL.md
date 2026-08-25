---
name: octans-ui
description: Build interfaces with the @octans/ui Vue 3 component library — setup, the design-token system, theming, the $ui global helpers, and the inheritance traps that make components look broken in dark mode. Use when writing or reviewing Vue code that imports from @octans/ui, when styling against --octans-* tokens, or when building a custom theme.
license: MIT
compatibility: Any agent supporting the Agent Skills standard. Requires a Vue 3.5+ project with @octans/ui installed. Optional peer, vue-router, only for MaybeRouterLink and Navigation.
---

# Octans UI

An opinionated Vue 3 component library: ~77 accessible, themeable components
plus the application shell pieces (nav, frame, sheets, toasts). Docs live at
<https://octans.dev>, source at <https://github.com/tarwin/octans-ui>.

## Setup

Two things are required — the stylesheet, and a `UiProvider` at the app root.
A full-page app needs a third: the reset.

```ts
// main.ts
import { createApp } from 'vue'
import UI from '@octans/ui'
import '@octans/ui/style.css'
// Only when Octans owns the whole page — see below.
import '@octans/ui/reset.css'
import App from './App.vue'

createApp(App).use(UI).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { UiProvider } from '@octans/ui'
</script>

<template>
  <UiProvider>
    <!-- your app -->
  </UiProvider>
</template>
```

`UiProvider` supplies the context tooltips, popovers and the global overlays
rely on. Without it, anything using `Tooltip` throws on mount.

`.use(UI)` is optional — it registers every component globally, which pulls
them all into the bundle. Prefer named imports and skip the plugin:

```vue
<script setup lang="ts">
import { Button, Card, CardSection } from '@octans/ui'
</script>
```

The stylesheet and `UiProvider` are needed either way. The plugin also installs
the `$ui` global; without it, import `toast`, `confirmModal`, `promptModal`,
`loader`, `saveBar` and `progress` by name instead.

### `reset.css` — when Octans owns the page

`style.css` deliberately resets nothing outside `.UIElement`. That keeps the
library safe to drop into a page it doesn't own, and it is the wrong default
for an app where Octans IS the UI: everything the app renders itself — the
shell, the layout wrappers, the nav — falls back to browser defaults. Serif
text, the user agent's 8px body margin, `content-box` sizing, and a body with
no height that grows past the viewport into a second scrollbar.

`@octans/ui/reset.css` is that missing layer, and nothing more. Import it after
`style.css` — it reads the tokens. **Symptoms it fixes**: app-authored markup
in a serif face, a gap around the whole shell, a second scrollbar, and
app-authored text at 16px beside 14px Octans components.

Skip it when Octans is one widget on someone else's page.

## Design tokens

Three tiers, described in full in `docs/color-system.md`:

1. **Seeds** — `createTheme({ primary: '#…' })` generates everything below.
2. **Primitives** — `--octans-primary-500`, `--octans-neutral-800`, the raw
   ramps. **Components must never use these directly.**
3. **Semantic** — `--octans-surface`, `--octans-text-subdued`,
   `--octans-border`. This is the public, themeable API.

**When styling anything, reach for a semantic token.** Every non-neutral role
(primary, secondary, tertiary, info, success, warning, error) exposes the same
four:

| Token                     | Meaning                                       |
| ------------------------- | --------------------------------------------- |
| `--octans-<role>`         | the solid fill                                |
| `--octans-text-on-<role>` | content sitting on that fill                  |
| `--octans-<role>-surface` | soft tinted background                        |
| `--octans-text-<role>`    | readable text in that hue, on a plain surface |

Never hard-code a colour. A literal like `rgba(0, 0, 0, 0.54)` looks fine in
light mode and is invisible in dark.

Two rules that are easy to get wrong:

- Use `--octans-text-<role>` for coloured **text**, and `--octans-<role>` only
  as a **fill**. Fills are chosen to sit behind white text, so they are too
  dark to read as text on a dark surface.
- A colour must never be defined only inside a media query or a
  `[data-octans-theme]` block, or it disappears in the other theme.

Fills do **not** flip between light and dark — only surfaces, borders and the
`text-<role>` tokens do. That is why `--octans-text-on-<role>` is defined once.

## Theming

```ts
import { setTheme, persistTheme } from '@octans/ui'

setTheme('dark') // 'light' | 'dark' | 'system'
persistTheme() // remember the choice in localStorage
```

To rebrand from a seed colour — every ramp and semantic token follows, dark
mode included:

```ts
import { createTheme, applyCustomTheme } from '@octans/ui'

applyCustomTheme(createTheme({ name: 'Violet', primary: '#7b5cff' }))
```

`createTheme` measures each generated fill and picks a legible
`text-on-<role>` automatically. If you set a fill **by hand**, set its label to
match — white on a dark fill, near-black on a pale one.

Or override tokens in CSS, which survives library updates better than
rewriting semantic tokens one by one:

```css
:root {
  --octans-primary-500: #7b5cff;
  --octans-primary-600: #6a48f0;
}
```

Three knobs that are not colours:

```css
:root {
  /* The font for everything, components and app markup alike. */
  --octans-font: 'Inter', system-ui, sans-serif;
  --octans-font-mono: 'JetBrains Mono', monospace;

  /* Every `Icon`'s vertical alignment. `0` is the default. Set it to
     `-0.125em` for icons that sit inline with running text. */
  --octans-icon-valign: -0.125em;
}
```

`--octans-font` is the one to set. `--ui-font` still exists and still works —
`--octans-font` resolves through it — but every token in the public API is
spelled `--octans-*`, and that is the name the baseline reads.

## Traps

These are the mistakes that actually happen. Most produce black text on a dark
surface, which passes review in light mode and fails in dark.

**Form controls inherit neither `color` nor `font`.** A `<button>`, `<input>`,
`<select>` or `<textarea>` starts from the user agent's `buttontext` and Arial,
whatever the surrounding theme says. Any control you style needs both stated:

```scss
.MyButton {
  font: inherit; // put it first, so a later font-size still wins
  color: var(--octans-text);

  // An authored `color` also opts out of the UA's dimming of a disabled
  // control, so a control that can be disabled needs this too.
  &:disabled {
    color: var(--octans-text-disabled);
  }
}
```

**Teleported content inherits nothing.** Anything portalled to `<body>` — a
popover, a modal, a sheet — lands outside the tree it was written in and picks
up the host page's defaults. Put `UIElement` on the root of teleported content;
that class carries the text colour, font and box-sizing baseline.

**`color-scheme` covers what CSS cannot reach.** The native `<option>` list a
`<select>` opens, scrollbars, and the internals of `input[type=date|time]` take
their palette from `color-scheme`, which the token layer sets per theme. Don't
fight it with per-control CSS.

**Icons are SVG via Iconify**, drawn in `currentColor`, so they follow whatever
`color` resolves to — which is why a black icon usually means a control that
never got told its colour.

**Reaching through a wrapper a component rendered itself.** Neither `vue-tsc`
nor the build catches this: the CSS just silently stops applying. Some
components put an element of their own around your slot content — `Tooltip`
wraps its trigger in a `<span>`, `Popover` (and so `ActionList`, `DatePicker`,
`TimePicker`, `ColorSelector`) wraps everything in a `<div>`. That element
belongs to the LIBRARY's template, so Vue never stamps your component's
scoped-style attribute on it, and any selector that reached through it stops
matching:

```scss
/* in your component, <style scoped> */
.Nav {
  & > span:first-of-type {
    margin-right: 16px;
  } /* never matches once that span is Tooltip's */
  &.sDisabled > span {
    display: none;
  } /* same — the control stays visible */
}
```

Style an element you render yourself. Put `gap` on the flex container rather
than margins on its children, and reach for `:deep()` only deliberately.

## Global helpers

Available as `$ui.*` in templates when the plugin is installed, or as named
imports:

```ts
import { toast, confirmModal, promptModal, loader, saveBar } from '@octans/ui'

toast.success('Saved')
if (await confirmModal({ title: 'Delete this?' })) {
  /* … */
}
loader.show()
```

## Internationalisation

Components translate through `$t`. Register dictionaries at install time or
later:

```ts
import { addTranslations, setTranslationLocale } from '@octans/ui'
```

Dates have two knobs, both set once at start-up and both global:

```ts
import { setLocale, setTimezone } from '@octans/ui'

setLocale('fr') // formats, month names, and the day the week starts on
setTimezone('America/Los_Angeles') // what "now" is, and what zone dates render in
```

`setTimezone` is for an app that must show ONE zone to everybody — an
operations console pinned to head-office time — rather than each viewer's own
clock, which is the default. It affects display only; it never reinterprets a
stored value. `Formatter`, `Calendar` and `DatePicker` each take a `timezone`
prop to override it for one instance.

## Components

Layout and shell: `AppFrame` `Page` `Layout` `Card` `Stack` `Divider`
`FormLayout` `ScrollPane` `Splitter` `Sticky` `TextContainer` `FooterHelp`
`PageActions`

Navigation: `GlobalNav` `Navigation` `Tabs` `Link` `Pagination`
`MaybeRouterLink` `UnstyledLink`

Actions: `Button` `ButtonGroup` `ActionList`

Forms: `TextField` `Select` `Checkbox` `RadioButton` `ChoiceList` `Choice`
`ToggleSwitch` `SegmentedControl` `RangeSlider` `Rating` `OtpInput` `FileInput`
`DatePicker` `TimePicker` `TimezonePicker` `Calendar` `ColorPicker`
`ColorSelector` `GradientPicker` `Labelled` `InlineError` `NavField` `Filters`
`PreventAutoComplete`

Data display: `DataTable` `ResourceList` `List` `Badge` `Tag` `Thumbnail`
`StatGroup` `CalendarHeatmap` `Formatter` `SyntaxHighlighter`

Typography: `Heading` `TextStyle` `Caption` `LineClamper` `KeyboardKey`

Feedback: `Banner` `Spinner` `ProgressBar` `LoadingBar` `LoaderOverlay`
`SkeletonBodyText` `SkeletonCard` `SkeletonDisplayText` `SkeletonPage`
`SaveBar` `ToastManager`

Overlays: `Modal` `ModalSection` `Sheet` `Popover` `Tooltip`

`Popover` was called `Popper` until 1.2. The old name still works as a
deprecated alias — it wraps reka-ui's Popover primitives and never had
anything to do with popper.js.

Utilities: `Icon` `EventDelegator` `MaybeMountingPortal` `UiProvider`
`SaveBarController`

## Looking things up

- Props and live examples: <https://octans.dev/storybook/> — every component
  has its own page, and the Kitchen Sink shows one example of each.
- Plain-markdown docs an agent can fetch: <https://octans.dev/llms.txt>
- Token reference: `docs/color-system.md` in the repo.

Storybook is a single-page app, so fetching a `?path=…` URL returns the shell
rather than the page content. Use `llms.txt` when you need the text.
