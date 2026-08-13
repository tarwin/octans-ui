import './styles/global.scss'
import * as components from './components/all'
import kebabCase from 'lodash-es/kebabCase'
import { progress } from './components/LoadingBar'
import { loader } from './components/LoaderOverlay'
import { saveBar } from './components/SaveBar'
import { toast } from './components/ToastManager'
import { format } from './utils/format'
import { setLocale } from './utils/date'
import {
  setTheme,
  toggleTheme,
  getResolvedTheme,
  getThemePreference,
  onThemeChange,
  persistTheme
} from './utils/theme'
import {
  translate,
  setTranslations,
  addTranslations,
  setTranslationLocale,
  getTranslationLocale,
  getAvailableLocales,
  type TranslationDictionary
} from './utils/translate'
import {
  alertModal,
  genericModal,
  confirmModal,
  promptModal
} from './components/Modal'

interface PluginOptions {
  prefix?: string
  /** Extra dictionaries to register at install time, keyed by locale. */
  translations?: Record<string, TranslationDictionary>
  /** Locale to activate at install time. Defaults to `'en'`. */
  locale?: string
}

// for some reason, referring to Vue type breaks things when used outside
const install = (app: any, options?: PluginOptions) => {
  // Components that need translations expose `$t` themselves, so the library
  // works without being installed. Registering it globally too means app
  // templates can use `$t` for their own strings.
  app.config.globalProperties.$t = translate
  if (options?.translations) {
    for (const [locale, dictionary] of Object.entries(options.translations)) {
      addTranslations(locale, dictionary)
    }
  }
  if (options?.locale) {
    setTranslationLocale(options.locale)
    setLocale(options.locale)
  }
  // Register every component globally. This mainly exists for the UMD/CDN
  // build, where a plain HTML page has no way to import components. It costs
  // bundler users nothing extra, since the plugin object already references
  // all of them.
  for (const [name, exported] of Object.entries(components)) {
    if (!isRegisterableComponent(name, exported)) continue
    app.component(
      options?.prefix ? kebabCase(`${options.prefix}-${name}`) : name,
      exported as any
    )
  }
  app.config.globalProperties.$ui = UI
}

/**
 * The component barrel also exports helper functions (`alertModal`, `toast`)
 * and plain values, which must not be registered as components.
 *
 * Components are PascalCase by convention and compile to objects carrying a
 * `render`/`setup`/`__file`; helpers are camelCase. Requiring both rules out
 * the helpers without hand-maintaining a list.
 */
function isRegisterableComponent(name: string, value: unknown): boolean {
  if (!/^[A-Z]/.test(name)) return false
  if (typeof value === 'function') return true
  return (
    typeof value === 'object' &&
    value !== null &&
    ('render' in value || 'setup' in value || '__file' in value)
  )
}

export * from './components/all'
// So consumers can bundle their own Iconify collections offline instead of
// letting them resolve through api.iconify.design at runtime.
export { addCollection, addIcon } from '@iconify/vue'
export {
  translate,
  $t,
  setTranslations,
  addTranslations,
  setTranslationLocale,
  getTranslationLocale,
  getAvailableLocales,
  type TranslationDictionary
} from './utils/translate'
export {
  setTheme,
  toggleTheme,
  getResolvedTheme,
  getThemePreference,
  onThemeChange,
  persistTheme,
  type ThemeType,
  type ThemePreferenceType
} from './utils/theme'
export {
  listCustomThemes,
  getCustomTheme,
  saveCustomTheme,
  deleteCustomTheme,
  applyCustomTheme,
  clearCustomTheme,
  restoreCustomTheme,
  getActiveCustomThemeId,
  getResolvedTokenValue,
  exportCustomTheme,
  importCustomTheme,
  createThemeId,
  ThemeImportError,
  type CustomTheme
} from './utils/customTheme'
export {
  createTheme,
  THEME_SEED_ROLES,
  type CreateThemeOptions,
  type ThemeSeedRoleType,
  type ThemeRadiusPresetType
} from './utils/createTheme'
export {
  listTimezones,
  guessTimezone,
  isValidTimezone,
  getTimezoneName,
  getTimezoneOffset,
  getTimezoneOptions,
  getTimezoneRegion,
  formatTimezoneId,
  loadTimezoneCountries,
  getTimezoneCountry,
  type TimezoneOptionType,
  type TimezoneCountryType
} from './utils/timezone'
export { fuzzyScore, fuzzyMatch, fuzzyFilter } from './utils/fuzzy'
export {
  TOKEN_GROUPS,
  TOKEN_NAMES,
  TOKEN_BY_NAME,
  TOKEN_RAMPS,
  TOKEN_RAMP_BY_PREFIX,
  tokenVar,
  type TokenGroup,
  type TokenDefinition,
  type TokenKind,
  type TokenRamp
} from './utils/tokens'
export {
  COLOR_FORMATS,
  parseColor,
  formatColor,
  formatHex,
  detectFormat,
  rgbToHsl,
  hslToRgb,
  rgbToHsv,
  hsvToRgb,
  rgbToOklab,
  oklabToRgb,
  rgbToOklch,
  relativeLuminance,
  prefersDarkText,
  flatten,
  type Rgba,
  type ColorFormat,
  type ColorFormatOption
} from './utils/color'
export {
  INTERPOLATION_SPACES,
  GRADIENT_TYPES,
  mixColors,
  createGradient,
  resolveStops,
  sampleGradient,
  gradientCss,
  isGradient,
  type InterpolationSpace,
  type InterpolationSpaceOption,
  type Gradient,
  type GradientStop,
  type GradientType,
  type GradientTypeOption
} from './utils/gradient'
export {
  rampColors,
  stepPositions,
  type RampStepPosition
} from './utils/colorRamp'
import './globalExtensions'

const UI = {
  // version: VERSION,
  components,
  install,
  format,
  setLocale,
  translate,
  t: translate,
  setTranslations,
  addTranslations,
  setTranslationLocale,
  getTranslationLocale,
  getAvailableLocales,
  setTheme,
  toggleTheme,
  getResolvedTheme,
  getThemePreference,
  onThemeChange,
  persistTheme,
  toast,
  modal: genericModal,
  alert: alertModal,
  confirm: confirmModal,
  prompt: promptModal,
  progress,
  loader,
  saveBar
}

export default UI
