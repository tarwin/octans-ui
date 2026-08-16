import { type Preview, setup } from '@storybook/vue3-vite'
import { vueRouter } from 'storybook-vue3-router'
import uiProviderDecorator from '../src/styleguide/uiProviderDecorator'
import { setLocale as setDateLocale } from '../src/utils/date'
import { setTranslationLocale } from '../src/utils/translate'
import { setTheme, type ThemePreferenceType } from '../src/utils/theme'
import {
  applyCustomTheme,
  clearCustomTheme,
  getCustomTheme,
  listCustomThemes
} from '../src/utils/customTheme'
import UI from '../src/lib'
// Icons that only stories and fixtures use. The library bundles the ones it
// renders itself; these are registered here instead so they stay offline and
// instant in Storybook without adding ~10 kB to what consumers download.
import './storyIconBundle'

// Languages offered in the toolbar switcher. Only `en` ships with a dictionary
// today — the others exercise the fallback path (missing keys resolve to
// English) and the DayJS locales in utils/date, which do cover all eight.
const LOCALES = [
  { value: 'en', title: 'English', right: '🇬🇧' },
  { value: 'fr', title: 'Français', right: '🇫🇷' },
  { value: 'de', title: 'Deutsch', right: '🇩🇪' },
  { value: 'es', title: 'Español', right: '🇪🇸' },
  { value: 'it', title: 'Italiano', right: '🇮🇹' },
  { value: 'pt', title: 'Português', right: '🇵🇹' },
  { value: 'nl', title: 'Nederlands', right: '🇳🇱' },
  { value: 'ja', title: '日本語', right: '🇯🇵' }
]

setup((app) => {
  // Install the $ui global so stories exercise the plugin API the way consuming
  // apps do (e.g. the ToastManager Template$Ui story).
  app.use(UI, {})
})

import '../src/styles/global.scss'

// Themes saved in the Theme Builder join the toolbar, so any story can be
// viewed in them. The list is read once when Storybook boots — after saving a
// new theme, reload to see it appear here.
const CUSTOM_THEMES = listCustomThemes().map((theme) => ({
  value: `custom:${theme.id}`,
  title: theme.name,
  icon: 'paintbrush'
}))

const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Language for the UI examples',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: LOCALES,
        dynamicTitle: true
      }
    },
    theme: {
      description: 'Light / dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
          ...CUSTOM_THEMES
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    locale: 'en',
    theme: 'light'
  },
  decorators: [
    // Apps are expected to mount a UiProvider at their root, so every story
    // should render inside one too — otherwise anything using Tooltip blows up
    // with a missing-TooltipProvider injection error.
    uiProviderDecorator,
    vueRouter(),
    (story, context) => {
      const { locale, theme } = context.globals

      // These side effects live in the decorator BODY, not the component's
      // setup(): on a toolbar change Storybook re-runs the decorator chain but
      // patches the mounted component, so setup() never fires again and
      // anything applied there would only take effect on the next story.
      //
      // Translations are bundled, so switching locale is synchronous — no need
      // to gate rendering on a fetch the way the old remote dictionary
      // required.
      setTranslationLocale(locale)
      setDateLocale(locale)
      // Sets `data-octans-theme` on <html>; the token stylesheet does the
      // rest, so no remount is needed for the theme to take effect. A saved
      // custom theme applies its base the same way, then lays its sparse
      // overrides on top as inline custom properties.
      if (typeof theme === 'string' && theme.startsWith('custom:')) {
        const saved = getCustomTheme(theme.slice('custom:'.length))
        if (saved) {
          applyCustomTheme(saved)
        } else {
          // Deleted since Storybook booted — fall back to plain light.
          clearCustomTheme()
          setTheme('light')
        }
      } else {
        clearCustomTheme()
        setTheme(theme as ThemePreferenceType)
      }
      // What the story canvas stands in for. Most components live INSIDE a
      // card, so the default is the card surface — previewing a button on the
      // grey app background misstates its borders and tonal fills. Stories for
      // shell-level components opt out per-file:
      //
      //   parameters: { surface: 'app' }   // Page, Card, Layout, GlobalNav —
      //                                    // things that sit on the shell
      //   parameters: { surface: 'none' }  // AppFrame — paints its own world
      const surface = (context.parameters.surface ?? 'surface') as
        'surface' | 'app' | 'none'
      const canvasStyle =
        surface === 'none'
          ? 'color: var(--octans-text)'
          : `background: var(--octans-${
              surface === 'app' ? 'surface-app' : 'surface'
            }); color: var(--octans-text); padding: 16px`
      return {
        components: { story },
        setup() {
          return { locale, canvasStyle }
        },
        // :key forces a remount so $t()/translate() re-evaluate on change
        // `color` as well as `background`: plenty of stories hand bare text to
        // a component, and bare text with no colour of its own stays the
        // browser default black — invisible once the canvas goes dark.
        template: `
          <div class="UIElement" :style="canvasStyle">
            <story :key="locale" />
          </div>
        `
      }
    }
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    // Deliberately no `docs.theme` here. Docs pages inherit the manager's
    // theme through the channel, so they follow the toolbar for free —
    // whereas a value set here would be read once at startup and pin them to
    // whatever the theme was at load.
    options: {
      // The addons panel (Controls / Actions / Interactions) stays shut unless
      // it is asked for. This is a component library's documentation before it
      // is a development harness: most visitors are reading the docs, and a
      // panel that opens itself on every story crowds the canvas — which is
      // the thing they came to look at.
      //
      // Asserted on every story rather than left to the manager's own default,
      // because it remembers the panel as sticky state: without this, opening
      // it once to poke at some controls would leave it open everywhere, for
      // the rest of the session and the next one. The toolbar toggle still
      // works whenever you do want it.
      showPanel: false,
      // Two roots: the guides and tools you read, then the components you
      // look up. Without the split, ~70 component entries bury the docs in
      // one long alphabetical list.
      //
      // The nested arrays order the pages WITHIN a root — reading order, not
      // alphabetical, so Quick Start is first and the Changelog sits at the
      // foot of that group rather than below every component. The component
      // categories run outside-in (app shell first, plumbing last); the
      // components inside each stay alphabetical (`method` covers them).
      storySort: {
        method: 'alphabetical',
        order: [
          'Documentation',
          [
            'Quick Start',
            'Design Tokens',
            'Theme Builder',
            'Global UI ($ui)',
            'Translations',
            'Kitchen Sink',
            'Changelog'
          ],
          'Components',
          [
            'Layout',
            'Navigation',
            'Actions',
            'Forms',
            'Data Display',
            'Typography',
            'Feedback',
            'Overlays',
            'Utilities'
          ]
        ]
      }
    }
  }
}

export default preview
