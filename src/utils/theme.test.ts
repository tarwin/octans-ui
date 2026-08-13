import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  setTheme,
  toggleTheme,
  getResolvedTheme,
  getThemePreference,
  onThemeChange
} from './theme'

const ATTR = 'data-octans-theme'

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(ATTR)
    setTheme('system')
  })

  it('sets the attribute for an explicit theme', () => {
    setTheme('dark')
    expect(document.documentElement.getAttribute(ATTR)).toBe('dark')
    setTheme('light')
    expect(document.documentElement.getAttribute(ATTR)).toBe('light')
  })

  it('removes the attribute for system, so the media query applies', () => {
    setTheme('dark')
    setTheme('system')
    expect(document.documentElement.hasAttribute(ATTR)).toBe(false)
  })

  it('reports the preference separately from the resolved theme', () => {
    setTheme('system')
    expect(getThemePreference()).toBe('system')
    expect(['light', 'dark']).toContain(getResolvedTheme())
  })

  it('resolves an explicit preference directly', () => {
    setTheme('dark')
    expect(getResolvedTheme()).toBe('dark')
  })

  it('toggles between light and dark', () => {
    setTheme('light')
    expect(toggleTheme()).toBe('dark')
    expect(toggleTheme()).toBe('light')
  })

  it('notifies subscribers and can unsubscribe', () => {
    const seen: string[] = []
    const off = onThemeChange((theme) => seen.push(theme))
    setTheme('dark')
    setTheme('light')
    off()
    setTheme('dark')
    expect(seen).toEqual(['dark', 'light'])
  })

  it('does not throw when matchMedia is unavailable', () => {
    const original = window.matchMedia
    // @ts-expect-error deliberately removing it to simulate older environments
    delete window.matchMedia
    expect(() => setTheme('system')).not.toThrow()
    expect(() => getResolvedTheme()).not.toThrow()
    window.matchMedia = original
  })

  it('does not throw when localStorage is unavailable', async () => {
    const spy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('denied')
      })
    const { persistTheme } = await import('./theme')
    expect(() => persistTheme()).not.toThrow()
    expect(() => setTheme('dark')).not.toThrow()
    spy.mockRestore()
  })
})
