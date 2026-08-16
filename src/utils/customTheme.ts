/**
 * Custom themes.
 *
 * A custom theme is a **sparse override** on top of one of the two built-in
 * themes: only the tokens you changed are stored. That matters — a full
 * snapshot would freeze every token at the moment it was captured, so later
 * library updates (a new token, a tweaked default) would silently not apply.
 *
 * Overrides are written as inline custom properties on `<html>`, which beats
 * the stylesheet by specificity without needing a build step. They can instead
 * be scoped to any element — custom properties inherit, so a subtree picks them
 * up while the rest of the page keeps the plain base theme. That is how the
 * Theme Builder previews a theme without restyling its own editor chrome.
 */

import { setTheme, type ThemeType } from './theme'
import { TOKEN_NAMES, TOKEN_RAMP_BY_PREFIX, tokenVar } from './tokens'
import { isGradient, type Gradient } from './gradient'

export interface CustomTheme {
  /** Unique identifier, also used as the storage key suffix. */
  id: string
  /** Human-readable name. */
  name: string
  /** Which built-in theme this is layered on top of. */
  base: ThemeType
  /** Sparse map of token name (no `--octans-` prefix) → value. */
  tokens: Record<string, string>
  /**
   * The gradient each ramp was generated from, keyed by ramp prefix
   * (`neutral`, `primary`, …).
   *
   * Purely editor state: `tokens` already holds every colour, so anything
   * applying a theme can ignore this entirely. It is stored because a gradient
   * is NOT recoverable from the steps it produced — a five-stop gradient and a
   * two-stop one can pass through the same dozen samples — so without it,
   * reopening a theme would offer you a ramp you could no longer edit as the
   * thing you built.
   */
  ramps?: Record<string, Gradient>
}

// Also read raw (key and shape) by .storybook/themeGlobal.ts, which cannot
// afford to import this module into the manager bundle.
const STORAGE_KEY = 'octans-custom-themes'
const ACTIVE_KEY = 'octans-active-custom-theme'
const STYLE_ID = 'octans-custom-theme'

function isBrowser() {
  return typeof document !== 'undefined'
}

function readStorage<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    // Corrupt JSON or disabled storage — a theme is not worth throwing over.
    return fallback
  }
}

function writeStorage(key: string, value: unknown) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Private browsing / quota — ignore.
  }
}

/** Every saved theme, newest last. */
export function listCustomThemes(): CustomTheme[] {
  const themes = readStorage<CustomTheme[]>(STORAGE_KEY, [])
  return Array.isArray(themes) ? themes : []
}

export function getCustomTheme(id: string): CustomTheme | undefined {
  return listCustomThemes().find((t) => t.id === id)
}

/** Creates or replaces a saved theme, matched by `id`. */
export function saveCustomTheme(theme: CustomTheme): CustomTheme[] {
  const themes = listCustomThemes()
  const index = themes.findIndex((t) => t.id === theme.id)
  if (index === -1) {
    themes.push(theme)
  } else {
    themes[index] = theme
  }
  writeStorage(STORAGE_KEY, themes)
  return themes
}

export function deleteCustomTheme(id: string): CustomTheme[] {
  const themes = listCustomThemes().filter((t) => t.id !== id)
  writeStorage(STORAGE_KEY, themes)
  if (getActiveCustomThemeId() === id) clearCustomTheme()
  return themes
}

export function getActiveCustomThemeId(): string | null {
  return readStorage<string | null>(ACTIVE_KEY, null)
}

/**
 * Applies a theme's overrides to the document, switching to its base theme
 * first so unset tokens resolve correctly.
 *
 * Pass `target` to scope the overrides to one subtree instead. The base theme
 * still switches document-wide — it is an attribute on `<html>`, not a set of
 * properties — so the rest of the page follows light/dark but keeps its
 * untouched token values.
 *
 * Scoped application is deliberately not remembered: `restoreCustomTheme()`
 * would have nowhere to put it on the next page load.
 */
export function applyCustomTheme(theme: CustomTheme, target?: HTMLElement) {
  setTheme(theme.base)
  if (!isBrowser()) return

  if (target) {
    applyScoped(theme, target)
    return
  }

  const root = document.documentElement
  clearCustomProperties(root)
  for (const [name, value] of Object.entries(theme.tokens)) {
    if (!value) continue
    root.style.setProperty(tokenVar(name), value)
  }
  writeStorage(ACTIVE_KEY, theme.id)
}

/**
 * Scoped application, which cannot be a straight copy of the sparse overrides.
 *
 * A semantic token is declared as `--octans-primary: var(--octans-primary-500)`
 * on `:root`. Custom properties are substituted where they are DECLARED, so
 * `--octans-primary` computes to a literal on `:root` and inherits as that
 * literal. Setting `--octans-primary-500` on a descendant therefore changes the
 * primitive and nothing else — the semantic tokens pointing at it were resolved
 * before the descendant existed. Rebranding by editing the primary ramp would
 * appear to do nothing at all.
 *
 * On `<html>` the problem does not arise, because the override and the
 * declaration land on the same element and the cascade re-substitutes.
 *
 * So: apply to `<html>` briefly, let the browser resolve the whole cascade
 * (which handles light/dark, media queries and specificity for free — far more
 * reliably than re-implementing substitution here), snapshot every token, put
 * `<html>` back, and write the snapshot to the target. No frame is yielded in
 * between, so nothing is painted in the intermediate state.
 *
 * The cost is that the target carries a full literal snapshot rather than
 * sparse overrides. That is presentation only — the saved theme stays sparse.
 */
function applyScoped(theme: CustomTheme, target: HTMLElement) {
  const root = document.documentElement
  const restore = TOKEN_NAMES.map(
    (name) => [name, root.style.getPropertyValue(tokenVar(name))] as const
  )

  for (const [name, value] of Object.entries(theme.tokens)) {
    if (!value) continue
    root.style.setProperty(tokenVar(name), value)
  }

  const computed = getComputedStyle(root)
  const resolved = TOKEN_NAMES.map(
    (name) => [name, computed.getPropertyValue(tokenVar(name)).trim()] as const
  )

  for (const [name, value] of restore) {
    if (value) root.style.setProperty(tokenVar(name), value)
    else root.style.removeProperty(tokenVar(name))
  }

  for (const [name, value] of resolved) {
    if (value) target.style.setProperty(tokenVar(name), value)
    else target.style.removeProperty(tokenVar(name))
  }
}

/**
 * Removes any custom overrides, returning to the plain base theme. Pass the
 * same `target` that was given to `applyCustomTheme` to clear a scoped theme.
 */
export function clearCustomTheme(target?: HTMLElement) {
  if (isBrowser()) {
    clearCustomProperties(target ?? document.documentElement)
    if (!target) document.getElementById(STYLE_ID)?.remove()
  }
  if (!target) writeStorage(ACTIVE_KEY, null)
}

function clearCustomProperties(root: HTMLElement) {
  for (const name of TOKEN_NAMES) {
    root.style.removeProperty(tokenVar(name))
  }
}

/**
 * Re-applies whichever custom theme was last active. Call once at startup, the
 * same way you'd call `persistTheme()`.
 */
export function restoreCustomTheme(): CustomTheme | undefined {
  const id = getActiveCustomThemeId()
  if (!id) return undefined
  const theme = getCustomTheme(id)
  if (theme) applyCustomTheme(theme)
  return theme
}

/**
 * The value a token currently resolves to, as the browser computes it —
 * including inherited and overridden values. Used to seed the editor with real
 * starting values rather than blanks.
 */
export function getResolvedTokenValue(name: string, from?: Element): string {
  if (!isBrowser()) return ''
  // `from` matters for a token defined through others: `--octans-primary` is
  // `var(--octans-primary-500)`, so it only reads back as the overridden
  // colour when resolved on the element the overrides are set on. Defaults to
  // the document, which is where an applied theme lives.
  return getComputedStyle(from ?? document.documentElement)
    .getPropertyValue(tokenVar(name))
    .trim()
}

export function exportCustomTheme(theme: CustomTheme): string {
  // An empty `ramps` is noise in an exported file — the field is optional, so
  // leaving it out says the same thing more quietly.
  const { ramps, ...rest } = theme
  const payload = ramps && Object.keys(ramps).length ? { ...rest, ramps } : rest
  return JSON.stringify(payload, null, 2)
}

export class ThemeImportError extends Error {}

/**
 * Parses and validates a theme JSON string.
 *
 * Deliberately strict: unknown token names are rejected rather than silently
 * dropped, because a typo would otherwise look like it applied and simply do
 * nothing.
 */
export function importCustomTheme(json: string): CustomTheme {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    throw new ThemeImportError(`Not valid JSON: ${(error as Error).message}`)
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ThemeImportError('Expected a JSON object')
  }

  const raw = parsed as Record<string, unknown>
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name : null
  if (!name) throw new ThemeImportError('Missing "name"')

  const base =
    raw.base === 'dark' ? 'dark' : raw.base === 'light' ? 'light' : null
  if (!base) throw new ThemeImportError('"base" must be "light" or "dark"')

  if (
    !raw.tokens ||
    typeof raw.tokens !== 'object' ||
    Array.isArray(raw.tokens)
  ) {
    throw new ThemeImportError('"tokens" must be an object')
  }

  const known = new Set(TOKEN_NAMES)
  const tokens: Record<string, string> = {}
  const unknown: string[] = []
  for (const [key, value] of Object.entries(raw.tokens as object)) {
    const cleaned = key.replace(/^--octans-/, '')
    if (!known.has(cleaned)) {
      unknown.push(key)
      continue
    }
    if (typeof value === 'string') tokens[cleaned] = value
  }
  if (unknown.length) {
    throw new ThemeImportError(
      `Unknown token${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}`
    )
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : createThemeId(name),
    name,
    base,
    tokens,
    ...(raw.ramps === undefined ? {} : { ramps: importRamps(raw.ramps) })
  }
}

/**
 * Validates the optional `ramps` block.
 *
 * As strict as the tokens above, and for the same reason: a ramp keyed to a
 * prefix that does not exist, or holding a gradient we only half understand,
 * would sit in the editor doing nothing until someone pressed Regenerate and
 * got colours nobody chose.
 */
function importRamps(value: unknown): Record<string, Gradient> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ThemeImportError('"ramps" must be an object')
  }

  const ramps: Record<string, Gradient> = {}
  for (const [prefix, gradient] of Object.entries(value)) {
    if (!TOKEN_RAMP_BY_PREFIX[prefix]) {
      throw new ThemeImportError(`Unknown ramp: ${prefix}`)
    }
    if (!isGradient(gradient)) {
      throw new ThemeImportError(`Invalid gradient for ramp: ${prefix}`)
    }
    ramps[prefix] = gradient
  }
  return ramps
}

/** Slug + short suffix, so two themes named the same don't collide. */
export function createThemeId(name: string) {
  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'theme'
  // Not crypto — just needs to be unlikely to repeat within one browser.
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${slug}-${suffix}`
}
