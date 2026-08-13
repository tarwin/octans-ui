import { beforeEach, describe, expect, it } from 'vitest'
import {
  applyCustomTheme,
  clearCustomTheme,
  createThemeId,
  deleteCustomTheme,
  exportCustomTheme,
  getActiveCustomThemeId,
  getCustomTheme,
  importCustomTheme,
  listCustomThemes,
  restoreCustomTheme,
  saveCustomTheme,
  ThemeImportError,
  type CustomTheme
} from './customTheme'
import { tokenVar } from './tokens'
import { createGradient } from './gradient'

const theme = (over: Partial<CustomTheme> = {}): CustomTheme => ({
  id: 'test-theme',
  name: 'Test theme',
  base: 'light',
  tokens: { primary: '#ff0000', 'surface-app': '#eeeeee' },
  ...over
})

describe('custom themes', () => {
  beforeEach(() => {
    window.localStorage.clear()
    clearCustomTheme()
    document.documentElement.removeAttribute('data-octans-theme')
  })

  describe('storage', () => {
    it('saves and reads back', () => {
      saveCustomTheme(theme())
      expect(listCustomThemes()).toHaveLength(1)
      expect(getCustomTheme('test-theme')?.name).toBe('Test theme')
    })

    it('replaces an existing theme with the same id rather than duplicating', () => {
      saveCustomTheme(theme())
      saveCustomTheme(theme({ name: 'Renamed' }))
      const all = listCustomThemes()
      expect(all).toHaveLength(1)
      expect(all[0].name).toBe('Renamed')
    })

    it('deletes', () => {
      saveCustomTheme(theme())
      deleteCustomTheme('test-theme')
      expect(listCustomThemes()).toEqual([])
    })

    it('survives corrupt storage without throwing', () => {
      window.localStorage.setItem('octans-custom-themes', '{ not json')
      expect(() => listCustomThemes()).not.toThrow()
      expect(listCustomThemes()).toEqual([])
    })
  })

  describe('applying', () => {
    it('sets the base theme and the overridden custom properties', () => {
      applyCustomTheme(theme({ base: 'dark' }))
      const root = document.documentElement
      expect(root.getAttribute('data-octans-theme')).toBe('dark')
      expect(root.style.getPropertyValue(tokenVar('primary'))).toBe('#ff0000')
      expect(root.style.getPropertyValue(tokenVar('surface-app'))).toBe(
        '#eeeeee'
      )
    })

    it('does not set properties for tokens it does not override', () => {
      applyCustomTheme(theme())
      expect(
        document.documentElement.style.getPropertyValue(tokenVar('text'))
      ).toBe('')
    })

    it('clears previous overrides when applying another theme', () => {
      applyCustomTheme(theme())
      applyCustomTheme(theme({ id: 'other', tokens: { text: '#111111' } }))
      const root = document.documentElement
      expect(root.style.getPropertyValue(tokenVar('primary'))).toBe('')
      expect(root.style.getPropertyValue(tokenVar('text'))).toBe('#111111')
    })

    it('clearCustomTheme removes every override', () => {
      applyCustomTheme(theme())
      clearCustomTheme()
      expect(
        document.documentElement.style.getPropertyValue(tokenVar('primary'))
      ).toBe('')
      expect(getActiveCustomThemeId()).toBeNull()
    })

    it('restores the last active theme', () => {
      saveCustomTheme(theme())
      applyCustomTheme(theme())
      clearCustomTheme()
      // Simulate a reload: the id is gone, so re-point it and restore.
      applyCustomTheme(theme())
      const restored = restoreCustomTheme()
      expect(restored?.id).toBe('test-theme')
      expect(
        document.documentElement.style.getPropertyValue(tokenVar('primary'))
      ).toBe('#ff0000')
    })

    it('deleting the active theme clears it from the document', () => {
      saveCustomTheme(theme())
      applyCustomTheme(theme())
      deleteCustomTheme('test-theme')
      expect(
        document.documentElement.style.getPropertyValue(tokenVar('primary'))
      ).toBe('')
    })
  })

  describe('import / export', () => {
    it('round-trips', () => {
      const original = theme()
      const parsed = importCustomTheme(exportCustomTheme(original))
      expect(parsed).toEqual(original)
    })

    it('strips the --octans- prefix from token keys', () => {
      const parsed = importCustomTheme(
        JSON.stringify({
          name: 'X',
          base: 'light',
          tokens: { '--octans-primary': '#fff' }
        })
      )
      expect(parsed.tokens).toEqual({ primary: '#fff' })
    })

    it('generates an id when one is absent', () => {
      const parsed = importCustomTheme(
        JSON.stringify({ name: 'My Theme', base: 'light', tokens: {} })
      )
      expect(parsed.id).toMatch(/^my-theme-/)
    })

    it('rejects invalid JSON', () => {
      expect(() => importCustomTheme('{ nope')).toThrow(ThemeImportError)
    })

    it('rejects a missing name', () => {
      expect(() =>
        importCustomTheme(JSON.stringify({ base: 'light', tokens: {} }))
      ).toThrow(/name/)
    })

    it('rejects an invalid base', () => {
      expect(() =>
        importCustomTheme(
          JSON.stringify({ name: 'X', base: 'blue', tokens: {} })
        )
      ).toThrow(/base/)
    })

    it('rejects unknown token names rather than dropping them silently', () => {
      // A typo should be loud — silently ignoring it looks like it applied.
      expect(() =>
        importCustomTheme(
          JSON.stringify({
            name: 'X',
            base: 'light',
            tokens: { surfce: '#fff' }
          })
        )
      ).toThrow(/Unknown token/)
    })

    it('rejects a non-object tokens field', () => {
      expect(() =>
        importCustomTheme(
          JSON.stringify({ name: 'X', base: 'light', tokens: [] })
        )
      ).toThrow(/tokens/)
    })
  })

  describe('ramps', () => {
    const gradient = createGradient({
      stops: [
        { color: '#ffffff', position: 0 },
        { color: '#111111', position: 100 }
      ]
    })

    it('round-trips a ramp gradient', () => {
      // The gradient is not recoverable from the steps it produced, so losing
      // it would mean reopening a theme you can no longer edit as what it was.
      const original = { ...theme(), ramps: { neutral: gradient } }
      expect(importCustomTheme(exportCustomTheme(original))).toEqual(original)
    })

    it('leaves the field out entirely when there are no ramps', () => {
      // An empty object is noise in a hand-edited file, and the field is
      // optional anyway.
      const json = exportCustomTheme({ ...theme(), ramps: {} })
      expect(JSON.parse(json)).not.toHaveProperty('ramps')
      expect(importCustomTheme(json).ramps).toBeUndefined()
    })

    it('rejects a ramp prefix that does not exist', () => {
      expect(() =>
        importCustomTheme(
          JSON.stringify({
            name: 'X',
            base: 'light',
            tokens: {},
            ramps: { neutrl: gradient }
          })
        )
      ).toThrow(/Unknown ramp/)
    })

    it('rejects a gradient it only half understands', () => {
      // Half-understanding it would leave a control that does nothing until
      // someone pressed Regenerate and got colours nobody chose.
      expect(() =>
        importCustomTheme(
          JSON.stringify({
            name: 'X',
            base: 'light',
            tokens: {},
            ramps: { neutral: { ...gradient, space: 'cielab' } }
          })
        )
      ).toThrow(/Invalid gradient/)
    })

    it('rejects a non-object ramps field', () => {
      expect(() =>
        importCustomTheme(
          JSON.stringify({ name: 'X', base: 'light', tokens: {}, ramps: [] })
        )
      ).toThrow(/ramps/)
    })
  })

  describe('createThemeId', () => {
    it('slugs the name and adds a suffix', () => {
      expect(createThemeId('My Great Theme')).toMatch(
        /^my-great-theme-[a-z0-9]{5}$/
      )
    })

    it('falls back for a name with no usable characters', () => {
      expect(createThemeId('!!!')).toMatch(/^theme-/)
    })

    it('does not collide for the same name', () => {
      expect(createThemeId('a')).not.toBe(createThemeId('a'))
    })
  })
})
