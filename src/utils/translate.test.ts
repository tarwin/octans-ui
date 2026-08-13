import { beforeEach, describe, expect, it } from 'vitest'
import {
  translate as t,
  addTranslations,
  setTranslations,
  setTranslationLocale,
  getTranslationLocale,
  getAvailableLocales
} from './translate'

describe('translate', () => {
  beforeEach(() => {
    setTranslationLocale('en')
  })

  it('resolves a bundled English string', () => {
    expect(t('ui.modal.close')).toBe('Close')
  })

  it('returns the key when there is no translation', () => {
    // Deliberate: a miss should be visible and greppable, not empty.
    expect(t('ui.nope.missing')).toBe('ui.nope.missing')
  })

  it('leaves unknown placeholders in place rather than rendering undefined', () => {
    expect(t('ui.fileInput.mustBeLessThan', { wrong: 1 })).toBe(
      'Must be less than {size}'
    )
  })

  it('coerces non-string placeholder values', () => {
    expect(t('ui.lang.countMoreItems', { count: 0 })).toBe('0 more')
  })

  it('falls back to English for a key missing from the active locale', () => {
    addTranslations('fr', { 'ui.modal.close': 'Fermer' })
    setTranslationLocale('fr')
    expect(t('ui.modal.close')).toBe('Fermer')
    expect(t('ui.modal.cancel')).toBe('Cancel')
  })

  it('falls back to English for an entirely unknown locale', () => {
    setTranslationLocale('xx-YY')
    expect(t('ui.modal.close')).toBe('Close')
  })

  it('tracks the active locale', () => {
    setTranslationLocale('de')
    expect(getTranslationLocale()).toBe('de')
  })

  it('setTranslations replaces rather than merges', () => {
    addTranslations('it', {
      'ui.modal.close': 'Chiudi',
      'ui.lang.view': 'Vedi'
    })
    setTranslations('it', { 'ui.modal.close': 'Chiudi!' })
    setTranslationLocale('it')
    expect(t('ui.modal.close')).toBe('Chiudi!')
    // Replaced, so this now falls through to English.
    expect(t('ui.lang.view')).toBe('View')
  })

  it('lists registered locales', () => {
    expect(getAvailableLocales()).toContain('en')
  })
})
