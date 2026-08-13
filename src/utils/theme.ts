/**
 * Light/dark theme control.
 *
 * Themes are driven by a `data-octans-theme` attribute on `<html>`:
 *
 *   - `'light'` / `'dark'` — an explicit choice, which always wins.
 *   - `'system'` — remove the attribute and let `prefers-color-scheme` decide.
 *
 * The token stylesheet is written so that all three work without JavaScript;
 * these helpers only set the attribute.
 */

export type ThemeType = 'light' | 'dark'
export type ThemePreferenceType = ThemeType | 'system'

const ATTRIBUTE = 'data-octans-theme'
const STORAGE_KEY = 'octans-theme'

const listeners = new Set<(theme: ThemeType) => void>()
let preference: ThemePreferenceType = 'system'
let mediaQuery: MediaQueryList | null = null

function isBrowser() {
  return typeof document !== 'undefined'
}

function getMediaQuery() {
  if (!isBrowser() || typeof window.matchMedia !== 'function') return null
  if (!mediaQuery) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      // Only matters while following the system.
      if (preference === 'system') notify()
    })
  }
  return mediaQuery
}

function notify() {
  const theme = getResolvedTheme()
  for (const fn of listeners) fn(theme)
}

/** The preference as set — may be `'system'`. */
export function getThemePreference(): ThemePreferenceType {
  return preference
}

/**
 * The theme actually in effect. Resolves `'system'` against
 * `prefers-color-scheme`, defaulting to light where that can't be determined.
 */
export function getResolvedTheme(): ThemeType {
  if (preference !== 'system') return preference
  return getMediaQuery()?.matches ? 'dark' : 'light'
}

/**
 * Sets the theme. Pass `'system'` to follow the operating system.
 *
 * ```ts
 * setTheme('dark')
 * setTheme('system')
 * ```
 */
export function setTheme(next: ThemePreferenceType) {
  preference = next
  if (isBrowser()) {
    if (next === 'system') {
      document.documentElement.removeAttribute(ATTRIBUTE)
    } else {
      document.documentElement.setAttribute(ATTRIBUTE, next)
    }
  }
  notify()
}

/** Flips between light and dark, resolving `'system'` first. */
export function toggleTheme(): ThemeType {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Subscribes to theme changes — including system changes while the preference
 * is `'system'`. Returns an unsubscribe function.
 */
export function onThemeChange(fn: (theme: ThemeType) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Restores a previously persisted preference and starts saving future changes
 * to `localStorage`. Entirely optional — call it once at startup if you want
 * the choice to survive a reload.
 */
export function persistTheme(storageKey = STORAGE_KEY) {
  if (!isBrowser()) return
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      setTheme(saved)
    }
  } catch {
    // Private browsing / disabled storage — a theme is not worth throwing over.
  }
  onThemeChange(() => {
    try {
      window.localStorage.setItem(storageKey, preference)
    } catch {
      // As above.
    }
  })
}
