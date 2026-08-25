import { afterEach, describe, expect, it, vi } from 'vitest'
import { format } from './format'
import { getTimezone, inTimezone, setTimezone } from './date'

/**
 * The display time zone: what "now" means and what zone a date renders in.
 *
 * The fixture is deliberately an instant late in a UTC day — 2024-03-15T02:00Z
 * is still the 14th in Los Angeles — so a formatter that quietly ignores the
 * zone prints a different DATE, not just a different clock time. A test using
 * midday would pass either way.
 */
const LATE_UTC = '2024-03-15T02:00:00Z'

afterEach(() => setTimezone(null))

describe('setTimezone', () => {
  it('is unset by default, meaning the viewer’s own clock', () => {
    expect(getTimezone()).toBeUndefined()
  })

  it('rejects a zone the runtime does not know, loudly and once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setTimezone('Mars/Olympus_Mons')
    // Caught HERE, where the name is — not thrown later from inside a
    // formatter, halfway through a render.
    expect(warn).toHaveBeenCalledOnce()
    expect(getTimezone()).toBeUndefined()
    warn.mockRestore()
  })

  it('clears back to the viewer clock', () => {
    setTimezone('America/Los_Angeles')
    expect(getTimezone()).toBe('America/Los_Angeles')
    setTimezone(null)
    expect(getTimezone()).toBeUndefined()
  })
})

describe('date formatting follows the display zone', () => {
  it('renders the day the zone is actually on', () => {
    setTimezone('America/Los_Angeles')
    expect(format(LATE_UTC, 'dateNumeral')).toBe('03/14/2024')

    setTimezone('Australia/Sydney')
    expect(format(LATE_UTC, 'dateNumeral')).toBe('03/15/2024')
  })

  it('lets a per-call zone override the global one', () => {
    setTimezone('Australia/Sydney')
    expect(format(LATE_UTC, 'dateNumeral', { timezone: 'UTC' })).toBe(
      '03/15/2024'
    )
    expect(
      format(LATE_UTC, 'dateNumeral', { timezone: 'America/Los_Angeles' })
    ).toBe('03/14/2024')
  })

  it('moves the clock as well as the date', () => {
    setTimezone('UTC')
    expect(format(LATE_UTC, 'dateTimeShort')).toContain('2:00 AM')
    setTimezone('America/Los_Angeles')
    expect(format(LATE_UTC, 'dateTimeShort')).toContain('7:00 PM')
  })
})

describe('inTimezone', () => {
  it('falls back rather than throwing on a bad zone', () => {
    // A date in the wrong zone is a bug; a component that throws while
    // rendering is an outage. These are not the same size of problem.
    expect(() => inTimezone(LATE_UTC, 'Nowhere/Nothing')).not.toThrow()
    expect(inTimezone(LATE_UTC, 'Nowhere/Nothing').isValid()).toBe(true)
  })

  it('reads "now" in the zone when given no value', () => {
    const sydney = inTimezone(undefined, 'Australia/Sydney')
    const la = inTimezone(undefined, 'America/Los_Angeles')
    // Same instant, different wall clocks.
    expect(sydney.valueOf()).toBe(la.valueOf())
    expect(sydney.format('Z')).not.toBe(la.format('Z'))
  })
})
