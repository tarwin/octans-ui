/**
 * Reads the toolbar's Theme control into the one of two themes the Storybook
 * chrome can wear.
 *
 * The control's values match the library's own theme preference: `light`,
 * `dark`, and `system` — where `system` defers to the OS, exactly as
 * `setTheme('system')` does for the components. Saved Theme Builder themes
 * appear as `custom:<id>`, and the chrome wears the theme's **base**: a
 * light-based custom theme keeps light chrome, a dark-based one dark. Docs
 * pages need no equivalent: they inherit whatever the chrome is wearing.
 */
export function resolveThemeGlobal(theme: unknown): 'light' | 'dark' {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'

  if (typeof theme === 'string' && theme.startsWith('custom:')) {
    const base = customThemeBase(theme.slice('custom:'.length))
    // No base means the theme was deleted; the preview falls back to plain
    // light in that case, so the chrome follows it there.
    return base ?? 'light'
  }

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

/**
 * The `base` of a saved custom theme, read straight from localStorage.
 *
 * Deliberately NOT imported from `src/utils/customTheme` — that would drag the
 * token registry and gradient math into the manager's React bundle for the
 * sake of one string field. The storage shape is `CustomTheme[]` under this
 * key; both are owned by `src/utils/customTheme.ts`.
 */
function customThemeBase(id: string): 'light' | 'dark' | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = window.localStorage.getItem('octans-custom-themes')
    const themes: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(themes)) return undefined
    const theme = themes.find(
      (t): t is { id: string; base?: unknown } =>
        !!t && typeof t === 'object' && (t as { id?: unknown }).id === id
    )
    if (!theme) return undefined
    return theme.base === 'dark' ? 'dark' : 'light'
  } catch {
    // Corrupt JSON or disabled storage — wear light rather than throw.
    return undefined
  }
}
