import { describe, expect, it } from 'vitest'
import {
  formatTimezoneId,
  getTimezoneCountry,
  getTimezoneName,
  getTimezoneOffset,
  getTimezoneOptions,
  getTimezoneRegion,
  guessTimezone,
  isValidTimezone,
  listTimezones,
  loadTimezoneCountries
} from './timezone'

describe('timezone helpers', () => {
  describe('listTimezones', () => {
    it('returns a realistic number of zones', () => {
      const zones = listTimezones()
      // ~418 on a current runtime; the fallback list is 25. Either way this
      // guards against an empty picker.
      expect(zones.length).toBeGreaterThan(20)
      expect(zones).toContain('Australia/Sydney')
      expect(zones).toContain('Europe/Paris')
    })
  })

  describe('formatTimezoneId', () => {
    it('puts the city first and drops underscores', () => {
      expect(formatTimezoneId('Australia/Sydney')).toBe('Sydney, Australia')
      expect(formatTimezoneId('America/New_York')).toBe('New York, America')
    })

    it('handles three-segment ids', () => {
      expect(formatTimezoneId('America/Argentina/Buenos_Aires')).toBe(
        'Buenos Aires, Argentina, America'
      )
    })

    it('handles a single-segment id', () => {
      expect(formatTimezoneId('UTC')).toBe('UTC')
    })
  })

  describe('getTimezoneRegion', () => {
    it('returns the leading segment', () => {
      expect(getTimezoneRegion('Australia/Sydney')).toBe('Australia')
      expect(getTimezoneRegion('UTC')).toBe('UTC')
    })
  })

  describe('names and offsets', () => {
    it('produces a human name, not the raw id', () => {
      const name = getTimezoneName('Asia/Kolkata', 'en')
      expect(name).toMatch(/India/)
      expect(name).not.toContain('/')
    })

    it('produces a GMT-relative offset', () => {
      expect(getTimezoneOffset('Asia/Kolkata', 'en')).toMatch(/GMT\+5:30/)
    })

    it('returns empty rather than throwing for an invalid zone', () => {
      expect(getTimezoneName('Not/AZone')).toBe('')
      expect(getTimezoneOffset('Not/AZone')).toBe('')
    })
  })

  describe('isValidTimezone', () => {
    it('accepts real zones and rejects nonsense', () => {
      expect(isValidTimezone('Europe/London')).toBe(true)
      expect(isValidTimezone('Middle/Earth')).toBe(false)
      expect(isValidTimezone('')).toBe(false)
    })
  })

  describe('guessTimezone', () => {
    it('returns a zone the runtime accepts', () => {
      const zone = guessTimezone()
      expect(zone).toBeTruthy()
      expect(isValidTimezone(zone)).toBe(true)
    })
  })

  describe('getTimezoneOptions', () => {
    it('builds label, description and region for every zone', () => {
      const options = getTimezoneOptions('en')
      const sydney = options.find((o) => o.value === 'Australia/Sydney')
      expect(sydney).toBeDefined()
      expect(sydney!.label).toBe('Sydney, Australia')
      expect(sydney!.region).toBe('Australia')
      expect(sydney!.description).toMatch(/GMT\+1[01]/)
    })

    it('has no duplicate values', () => {
      const values = getTimezoneOptions().map((o) => o.value)
      expect(new Set(values).size).toBe(values.length)
    })
  })

  describe('country mapping', () => {
    it('maps a zone to its country code', async () => {
      expect(await getTimezoneCountry('Australia/Sydney')).toBe('AU')
      expect(await getTimezoneCountry('Europe/Paris')).toBe('FR')
    })

    it('returns undefined for an unmapped zone', async () => {
      expect(await getTimezoneCountry('Not/AZone')).toBeUndefined()
    })

    it('builds a localised, sorted country list', async () => {
      const countries = await loadTimezoneCountries('en')
      expect(countries.length).toBeGreaterThan(100)

      const au = countries.find((c) => c.value === 'AU')
      expect(au?.label).toBe('Australia')
      expect(au?.zones).toContain('Australia/Sydney')

      const labels = countries.map((c) => c.label)
      expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)))
    })

    it('localises country names', async () => {
      const countries = await loadTimezoneCountries('fr')
      expect(countries.find((c) => c.value === 'DE')?.label).toBe('Allemagne')
    })

    it('only lists zones this runtime recognises', async () => {
      // The generated map comes from a tzdb snapshot and can name zones an
      // older engine has never heard of; those must not reach the picker.
      const known = new Set(listTimezones())
      const countries = await loadTimezoneCountries('en')
      for (const country of countries) {
        for (const zone of country.zones) {
          expect(known.has(zone)).toBe(true)
        }
      }
    })
  })
})
