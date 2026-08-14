<img src="./octans-logo.svg" alt="" width="72" height="72" align="left" hspace="12" />

# Octans UI

A Vue 3 component library — friendly, accessible, themeable UI primitives and application
shell components.

<br clear="left" />

[octans.dev](https://octans.dev) — live Storybook docs ·
[github.com/tarwin/octans-ui](https://github.com/tarwin/octans-ui) ·
[Issues](https://github.com/tarwin/octans-ui/issues)

## Install

```sh
pnpm add @octans/ui
```

`vue` is a peer dependency. `vue-router` is an optional peer — you only need it
if you use the components that render router links (`MaybeRouterLink`,
`UnstyledLink`, and anything that accepts a `to` prop).

### A note on the `vue-demi` build warning

pnpm may report an ignored build script on install:

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: vue-demi
```

This is safe to ignore. `vue-demi` arrives transitively via
`reka-ui` → `@floating-ui/vue`, which still supports Vue 2 alongside Vue 3. Its
postinstall only switches the package entry point to match the detected Vue
version, and the shipped default is already the Vue 3 build — so skipping it
changes nothing on Vue 3. Run `pnpm approve-builds` if you would rather the
warning went away.

It will disappear on its own once `reka-ui` moves to `@floating-ui/vue` v2,
which dropped `vue-demi`.

## Usage

```ts
import { createApp } from 'vue'
import Octans from '@octans/ui'
import '@octans/ui/style.css'

import App from './App.vue'

createApp(App).use(Octans).mount('#app')
```

Components can also be imported individually without installing the plugin:

```vue
<script setup lang="ts">
import { Button, Card } from '@octans/ui'
</script>

<template>
  <Card title="Hello">
    <Button primary>Click me</Button>
  </Card>
</template>
```

Installing the plugin additionally registers the `$ui` and `$t` globals, which
give you the imperative APIs (`$ui.toast`, `$ui.confirm`, `$ui.format`, …) from
inside templates.

Most components that manage overlays expect a `<UiProvider>` at the root of your
app, so tooltips can share a single delay group:

```vue
<template>
  <UiProvider>
    <RouterView />
  </UiProvider>
</template>
```

## Translations

Every user-facing string resolves through a small built-in dictionary. English
ships with the library and is always the fallback, so a missing key degrades to
readable English rather than a raw dotted key.

```ts
import { addTranslations, setTranslationLocale } from '@octans/ui'

addTranslations('fr', {
  'ui.modal.close': 'Fermer',
  'ui.modal.cancel': 'Annuler'
})
setTranslationLocale('fr')
```

Or supply them when installing the plugin:

```ts
app.use(Octans, {
  locale: 'fr',
  translations: { fr: { 'ui.modal.close': 'Fermer' } }
})
```

Strings support `{placeholder}` interpolation. Unknown placeholders are left
in place rather than rendering `undefined`, so gaps are visible.

## Icons

Icons resolve through [Iconify](https://iconify.design). **Every icon the
library uses internally is pre-bundled**, so components render offline with no
network request and no icon font to install.

Names you pass yourself resolve through `api.iconify.design` at runtime. That
needs no build step, but it is a round trip on first use and renders nothing at
all offline. To bundle exactly the icons your app uses, run this before a build
and commit the result:

```sh
npx octans-icons        # scans ./src, writes src/octansIcons.ts
```

```ts
import './octansIcons' // once, at startup
```

It finds Iconify names in your source, fetches only those, and generates a file
that registers them. Re-run it when you add an icon; `npx octans-icons --help`
lists the options. Names your code builds at runtime (`` `mdi:${name}` ``) can't
be seen by a source scan and keep resolving through the API.

To bundle a whole collection instead — simpler, but `@iconify-json/lucide` is
roughly 1.5 MB against a typical app's few kB of actual icons:

```ts
import { addCollection } from '@octans/ui'
import icons from '@iconify-json/lucide/icons.json'

addCollection(icons)
```

Font Awesome class strings (`fa fa-plus`) are still accepted for compatibility,
but the library no longer uses or ships Font Awesome — load it yourself if you
pass those names.

## Theming

Colours, radii and shadows are CSS custom properties, so themes swap at runtime:

```ts
import { setTheme, persistTheme } from '@octans/ui'

setTheme('dark') // 'light' | 'dark' | 'system'
persistTheme() // optional: remember the choice across reloads
```

To rebrand, generate a theme from seed colours — every ramp and semantic token
follows, dark mode included:

```ts
import { createTheme, applyCustomTheme } from '@octans/ui'

applyCustomTheme(createTheme({ name: 'Ocean', primary: '#0f9d8f' }))
```

Or override any semantic token directly:

```css
:root {
  --octans-primary: #0f9d8f;
  --octans-radius-field: 0; /* square controls */
}
```

See the **Design Tokens** and **Theme Builder** pages in Storybook for the full
token list and an interactive editor.

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow — the short
version:

```sh
pnpm install
pnpm dev            # Storybook on :6006
```

| Script            | Does                                             |
| ----------------- | ------------------------------------------------ |
| `pnpm dev`        | Storybook dev server                             |
| `pnpm build-lib`  | Build the ES + UMD bundles and type declarations |
| `pnpm type-check` | `vue-tsc --noEmit`                               |
| `pnpm lint`       | ESLint                                           |
| `pnpm format`     | Prettier                                         |
| `pnpm verify`     | lint + type-check + build                        |

## Conventions

### Import public components by directory

Especially when one public component imports another.

```ts
// ✅ Good
import { Button } from '@/components/Button'

// ❌ Unnecessarily longer
import { Button } from '@/components/Button/Button.vue'

// ❌ We can't easily search for '@/components/' to find references
import { Button } from '../Button'

// ❌ Creates a dependency on ALL components
import { Button } from '@/components/index.ts'
```

### Order SFC sections consistently

`<script>`, then `<template>`, then `<style>` — per the
[official Vue recommendation](https://vuejs.org/style-guide/rules-recommended.html#single-file-component-top-level-element-order).

### Name component types predictably

Each component exports an interface defining its public props, named
`<Component>Props`. Supporting types start with the component name and end in
`Type`:

```ts
export interface SelectProps {
  options: SelectOptionType[]
}

export interface SelectOptionType {
  value: string
  label: string
}
```

## License

[MIT](./LICENSE)
