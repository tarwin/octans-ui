import { create } from 'storybook/theming/create'

/**
 * Theming for Storybook's own chrome (sidebar, toolbar, docs), which is a
 * separate React app from the stories — none of the `--octans-*` tokens reach
 * it, so the palette is restated here as plain values.
 *
 * The colours come from the logo rather than from the library's default pine
 * theme. The logo is the brand; pine is just the theme that ships in the box,
 * and the whole point of the token system is that consumers replace it. Chrome
 * that followed the default theme would go stale the moment someone reads
 * these docs while thinking about their own palette.
 */

// Sampled from octans-logo.svg — the indigo the compass rose resolves to at
// small sizes, and the pale periwinkle of its inner arms.
const BRAND = '#5662d2'
const BRAND_LIGHT = '#c2c7ff'

const FONT =
  "system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Liberation Sans', Arial, sans-serif"
const FONT_MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"

// The wordmark ships as a light/dark pair. An <img>-referenced SVG cannot see
// the page it sits on, so the theme picks the file rather than the file
// adapting — see the comment in the SVG itself.
/** The repository — the target of the toolbar link in `manager.ts`. */
export const REPO_URL = 'https://github.com/tarwin/octans-ui'

const shared = {
  brandTitle: 'Octans UI',
  // The logo goes home, which is what clicking a logo does everywhere else —
  // and home is the landing page at the site root, with Storybook deployed
  // under `/storybook/`. GitHub is the toolbar link in `manager.ts`.
  //
  // Absolute, so it lands on the site root from anywhere inside the docs
  // rather than depending on how deep the current URL happens to be. The
  // trade-off is that it assumes Storybook is served from a domain root, which
  // octans.dev is; a GitHub Pages *project* site (`/octans-ui/storybook/`)
  // would need this to be `../` instead. In `storybook dev` there is no
  // landing page above it, so this just reloads the dev server root; harmless.
  brandUrl: '/',
  brandTarget: '_self',

  fontBase: FONT,
  fontCode: FONT_MONO,

  colorPrimary: BRAND,
  colorSecondary: BRAND
}

export const octansLight = create({
  ...shared,
  base: 'light',
  brandImage: './octans-logo-wordmark.svg',

  appBg: '#f7f8fb',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e3e6ed',
  appBorderRadius: 8,

  textColor: '#1f2430',
  textInverseColor: '#ffffff',
  textMutedColor: '#5d6577',

  barTextColor: '#5d6577',
  barSelectedColor: BRAND,
  barHoverColor: BRAND,
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#d5d9e3',
  inputTextColor: '#1f2430',
  inputBorderRadius: 4
})

export const octansDark = create({
  ...shared,
  base: 'dark',
  brandImage: './octans-logo-wordmark-dark.svg',

  appBg: '#14161c',
  appContentBg: '#1b1e26',
  appPreviewBg: '#1b1e26',
  appBorderColor: '#2c313d',
  appBorderRadius: 8,

  // The mid indigo disappears against the dark chrome, so the accent steps up
  // to the logo's pale arm colour — same hue, enough lightness to read.
  colorPrimary: BRAND_LIGHT,
  colorSecondary: BRAND_LIGHT,

  textColor: '#e6e9f0',
  textInverseColor: '#14161c',
  textMutedColor: '#9aa2b4',

  barTextColor: '#9aa2b4',
  barSelectedColor: BRAND_LIGHT,
  barHoverColor: BRAND_LIGHT,
  barBg: '#1b1e26',

  inputBg: '#14161c',
  inputBorder: '#2c313d',
  inputTextColor: '#e6e9f0',
  inputBorderRadius: 4
})
