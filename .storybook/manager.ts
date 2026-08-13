import { createElement } from 'react'
import { addons, types } from 'storybook/manager-api'
import { IconButton } from 'storybook/internal/components'
import { GithubIcon } from '@storybook/icons'
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events'
import { octansDark, octansLight, REPO_URL } from './theme'
import { resolveThemeGlobal } from './themeGlobal'

/**
 * Storybook's chrome (sidebar, toolbar, docs) is a separate React app with its
 * own theme, so it does not inherit the `--octans-*` tokens the stories use.
 * This keeps it in step with the toolbar's Theme control: switch to Dark and
 * the whole window follows, not just the story canvas.
 *
 * `setConfig` is safe to call repeatedly — it emits SET_CONFIG on the channel
 * and the manager re-reads it — which is what makes this reactive rather than
 * a one-shot choice at load.
 */
function applyTheme(theme: unknown) {
  addons.setConfig({
    theme: resolveThemeGlobal(theme) === 'dark' ? octansDark : octansLight
  })
}

// Paints the first frame, before the preview has connected and there is any
// toolbar value to read. Matched to `initialGlobals.theme` in preview.ts so
// the common case does not flash the wrong theme; a session that restores
// Dark corrects itself as soon as the sync below runs.
addons.setConfig({
  theme: octansLight,
  sidebar: {
    // Renders "Documentation" and "Components" as section headings rather
    // than as two more folders to expand — the split is the point, and the
    // component list should stay one click away.
    showRoots: true
  }
})

// Subscribing through `register` rather than at module scope is load-bearing:
// this file is evaluated before the manager wires up its channel, so a
// listener attached to `addons.getChannel()` here would sit on a channel that
// is replaced moments later and never hear a thing.
addons.register('octans/theme-sync', (api) => {
  // The event payload, NOT `api.getGlobals()`: these handlers run before the
  // manager's own globals store has been updated, so asking the API returns
  // the value we are in the middle of replacing — the theme would lag one
  // toggle behind for as long as you kept clicking.
  const sync = (payload?: { globals?: Record<string, unknown> }) =>
    applyTheme(payload?.globals?.theme ?? api.getGlobals()?.theme)

  // Catches the value restored from the URL or session on a fresh load, which
  // pre-dates any toolbar interaction.
  sync()
  api.on(SET_GLOBALS, sync)
  api.on(GLOBALS_UPDATED, sync)
})

/**
 * A GitHub link at the right-hand end of the preview toolbar, next to the
 * fullscreen and open-in-new-tab controls. The sidebar wordmark already links
 * to the repo, but it reads as a logo rather than as a link — this is the
 * conventional spot people look for source.
 *
 * `TOOLEXTRA` is the right-aligned toolbar group; plain `TOOL` would put it on
 * the left with the Theme and Language controls, which are story *settings*.
 *
 * No `match`, so it stays put on docs pages too — tools that pass one are
 * usually filtered to `viewMode === 'story'`, and this is not story-specific.
 *
 * `react` and `@storybook/icons` are imported without being dependencies on
 * purpose: the manager builder maps both to globals off its own prebundled
 * copies (see `globalsNameReferenceMap` in storybook/dist/manager/globals.js),
 * so they are never resolved from node_modules. Written with `createElement`
 * rather than JSX to keep this file plain `.ts` — the alternative is a `.tsx`
 * manager entry, which is more build surface than one element is worth.
 */
addons.register('octans/github-link', () => {
  addons.add('octans/github-link', {
    type: types.TOOLEXTRA,
    title: 'GitHub',
    render: () =>
      createElement(
        IconButton,
        {
          // Emotion's polymorphic `as` — a real anchor, so middle-click,
          // cmd-click and "copy link address" all behave, which an
          // onClick + window.open would quietly break.
          as: 'a',
          // Matches the fullscreen / open-in-new-tab buttons beside it. The
          // default is `outline`, which draws a filled box and makes this look
          // like the one pressed control on the bar.
          variant: 'ghost',
          href: REPO_URL,
          target: '_blank',
          rel: 'noreferrer noopener',
          title: 'View Octans UI on GitHub',
          'aria-label': 'View Octans UI on GitHub'
        },
        createElement(GithubIcon)
      )
  })
})
