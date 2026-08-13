# Contributing to Octans UI

Thanks for helping! This document covers the workflow and the few house rules
that keep the library consistent.

## Getting set up

```sh
pnpm install
pnpm dev        # Storybook on http://localhost:6006
```

Storybook is the development environment: every component has a page under
**Components**, and the **Documentation** section holds the guides (Quick
Start, Design Tokens, the Theme Builder, and a Kitchen Sink of everything at
once).

## Before you open a PR

```sh
pnpm run verify
```

That runs lint, type-check, tests, the contrast audit, the icon-bundle check
and the library build — the same gauntlet CI runs. If it passes locally, CI
will almost certainly agree.

A few of those steps have rules worth knowing in advance:

### Design tokens

Components style themselves with the semantic `--octans-*` custom properties —
never with raw colours and never with the primitive ramp values directly.
Adding a token means touching three places, and a test fails if they drift:

1. `src/styles/tokens.scss` — define it in the light `:root` block **and** the
   dark mixin.
2. `src/utils/tokens.ts` — add it to the registry (the Theme Builder and the
   custom-theme machinery read this).
3. `scripts/check-contrast.mjs` — if the token is a text/surface pairing, add
   the pair so the WCAG AA audit covers it.

### Icons

Icons are Iconify names (`mdi:home`) served from bundles so everything works
offline. After adding or removing an icon anywhere in `src/`, regenerate them:

```sh
pnpm icons:bundle
```

`pnpm run verify` fails if the bundles are out of sync. Icons used only by
stories go into the Storybook bundle automatically — same command.

### Components

- Each component lives in `src/components/<Name>/` with its stories
  (`<Name>.stories.ts`) and tests (`<Name>.test.ts`) alongside it.
- New public components are exported from `src/components/all.ts` and need at
  least one story and a test.
- Component-scoped theming uses `--ui-*` custom properties with a fallback at
  the usage site, e.g. `var(--ui-nav-highlightColor, var(--octans-primary))`.
- Formatting is Prettier's job: `pnpm run format`. CI checks it.

## Commit / PR conventions

- Keep PRs focused — one component or one behaviour per PR reviews best.
- Include the "why" in the PR description; screenshots or a Storybook story
  for anything visual.
- Breaking API changes need a strong reason and a changelog entry
  (`src/stories/Changelog.mdx`).

## Reporting bugs

Use the issue templates. A minimal reproduction — ideally pointing at a
Storybook story and the steps from there — turns a maybe into a fix.
