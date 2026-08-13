import en from '@/i18n/en.json'

export type TranslationDictionary = Record<string, string>

/**
 * Registered dictionaries, keyed by locale. English ships with the library and
 * is always the fallback, so a missing key in another locale degrades to
 * readable English rather than a raw dotted key.
 */
const dictionaries: Record<string, TranslationDictionary> = {
  en: en as TranslationDictionary
}

let currentLocale = 'en'

/** Matches `{name}` placeholders. */
const PLACEHOLDER = /\{(\w+)\}/g

/**
 * Replaces every registered string for `locale`.
 *
 * ```ts
 * setTranslations('fr', { 'ui.modal.close': 'Fermer' })
 * ```
 */
export function setTranslations(
  locale: string,
  dictionary: TranslationDictionary
) {
  dictionaries[locale] = { ...dictionary }
}

/** Merges `dictionary` into whatever is already registered for `locale`. */
export function addTranslations(
  locale: string,
  dictionary: TranslationDictionary
) {
  dictionaries[locale] = { ...dictionaries[locale], ...dictionary }
}

/**
 * Switches the active locale. Unknown locales are still accepted — lookups
 * simply fall through to English until a dictionary is registered for them.
 */
export function setTranslationLocale(locale: string) {
  currentLocale = locale
}

export function getTranslationLocale() {
  return currentLocale
}

export function getAvailableLocales() {
  return Object.keys(dictionaries)
}

/**
 * Looks up `key` in the active locale, falling back to English and finally to
 * the key itself, then interpolates any `{placeholder}` values from `args`.
 *
 * Returning the key on a miss is deliberate: a missing translation shows up as
 * a visible, greppable string instead of an empty element.
 */
export function translate(key: string, args?: Record<string, any>): string {
  const template =
    dictionaries[currentLocale]?.[key] ?? dictionaries.en?.[key] ?? key

  if (!args) {
    return template
  }

  return template.replace(PLACEHOLDER, (match, name) =>
    // Leave unknown placeholders untouched so the gap is visible rather than
    // silently rendering "undefined".
    name in args ? String(args[name]) : match
  )
}

export const $t = translate
