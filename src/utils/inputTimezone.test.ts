import { afterEach, describe, expect, it, vi } from 'vitest'
import { format } from './format'
import {
  dayjs,
  getInputTimezone,
  inTimezone,
  setInputTimezone,
  setTimezone
} from './date'

/**
 * The INPUT time zone: what a date string that names no zone of its own is
 * taken to mean.
 *
 * Every assertion here pins BOTH zones, because the thing under test is that
 * the viewer's clock stops leaking into the answer — a test that left either
 * one to the runner would pass in CI and fail on a laptop, or worse, the other
 * way round.
 */
const MYSQL = '2024-03-15 02:00:00'

afterEach(() => {
  setInputTimezone(null)
  setTimezone(null)
})

describe('setInputTimezone', () => {
  it('is unset by default, meaning the viewer’s own clock', () => {
    expect(getInputTimezone()).toBeUndefined()
  })

  it('rejects a zone the runtime does not know, loudly and once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setInputTimezone('Mars/Olympus_Mons')
    expect(warn).toHaveBeenCalledOnce()
    expect(getInputTimezone()).toBeUndefined()
    warn.mockRestore()
  })

  it('clears back to the viewer clock', () => {
    setInputTimezone('UTC')
    expect(getInputTimezone()).toBe('UTC')
    setInputTimezone(null)
    expect(getInputTimezone()).toBeUndefined()
  })

  it('changes nothing until it is set', () => {
    // The old behaviour, asserted against dayjs itself rather than a literal
    // so the test says the same thing in every zone CI might run in.
    expect(inTimezone(MYSQL).valueOf()).toBe(dayjs(MYSQL).valueOf())
  })
})

describe('a naive string is read in the input zone', () => {
  it('is the instant that zone says it is', () => {
    setInputTimezone('UTC')
    setTimezone('UTC')
    expect(format(MYSQL, 'dateTimeShort')).toContain('2:00 AM')

    // Same stored string, read as Sydney wall clock instead: eleven hours
    // earlier as an instant, so UTC is still on the previous day.
    setInputTimezone('Australia/Sydney')
    expect(format(MYSQL, 'dateTimeShort')).toContain('Mar 14, 2024 3:00 PM')
  })

  it('crosses the date line the display zone puts it on', () => {
    setInputTimezone('UTC')
    setTimezone('America/Los_Angeles')
    expect(format(MYSQL, 'dateNumeral')).toBe('03/14/2024')
    setTimezone('Australia/Sydney')
    expect(format(MYSQL, 'dateNumeral')).toBe('03/15/2024')
  })

  it('reads the `T` form the same as the space form', () => {
    setInputTimezone('UTC')
    setTimezone('UTC')
    expect(format('2024-03-15T02:00:00', 'dateIso')).toBe(
      format(MYSQL, 'dateIso')
    )
  })

  it('lets a per-call zone override the global one', () => {
    setInputTimezone('UTC')
    setTimezone('UTC')
    expect(
      format(MYSQL, 'dateTimeShort', { inputTimezone: 'Australia/Sydney' })
    ).toContain('Mar 14, 2024 3:00 PM')
  })
})

describe('values that already name an instant are left alone', () => {
  const EXPECTED = '2024-03-15T02:00:00.000Z'

  it.each([
    { name: 'a Z-suffixed string', value: '2024-03-15T02:00:00Z' },
    { name: 'a lowercase z', value: '2024-03-15t02:00:00z' },
    { name: 'an offset string', value: '2024-03-15T07:00:00+05:00' },
    { name: 'an offset without a colon', value: '2024-03-15T07:00:00+0500' },
    { name: 'an epoch number', value: 1710468000000 },
    { name: 'a Date', value: new Date('2024-03-15T02:00:00Z') }
  ])('ignores the input zone for $name', ({ value }) => {
    // A wildly wrong input zone would move any of these by half a day if it
    // were applied. The point is that it is not: these are instants already.
    setInputTimezone('Pacific/Kiritimati')
    expect(inTimezone(value as never).toISOString()).toBe(EXPECTED)
  })
})

describe('a bare calendar date stays floating', () => {
  // A `DATE` column, a birthday, a due date: a day, not a moment. Pinning it
  // to one zone and rendering it in another is what moves a date of birth to
  // the day before.
  const BIRTHDAY = '2024-03-15'

  it.each([
    { input: undefined, display: undefined },
    { input: 'UTC', display: 'America/Los_Angeles' },
    { input: 'Australia/Sydney', display: 'America/Los_Angeles' },
    { input: 'America/Los_Angeles', display: 'Australia/Sydney' },
    { input: 'UTC', display: 'Pacific/Kiritimati' }
  ])('reads as the 15th with input $input and display $display', (zones) => {
    setInputTimezone(zones.input ?? null)
    setTimezone(zones.display ?? null)
    expect(format(BIRTHDAY, 'dateNumeral')).toBe('03/15/2024')
  })

  it('reports itself as the ISO date, not an instant', () => {
    // `Formatter` shows this in the `title`, so a UTC timestamp built from
    // local midnight would have the tooltip disagreeing with the date beside
    // it.
    setInputTimezone('UTC')
    setTimezone('Australia/Sydney')
    expect(format(BIRTHDAY, 'dateIso')).toBe('2024-03-15')
  })

  it('still moves a date that carries a time', () => {
    // Guarding the guard: the floating rule must key off the SHAPE of the
    // string, not merely off midnight, or every `00:00:00` row would opt out
    // of the zone handling by accident.
    setInputTimezone('UTC')
    setTimezone('America/Los_Angeles')
    expect(format('2024-03-15 00:00:00', 'dateNumeral')).toBe('03/14/2024')
  })
})

describe('durations span the right amount of time', () => {
  // 2024-04-07 is the morning Sydney puts its clocks back, so this pair is
  // eight hours apart on the wall and nine hours apart in fact. Read against
  // any clock that does not shift where Sydney does, it comes out as eight.
  const ACROSS_DST = ['2024-04-06 20:00:00', '2024-04-07 04:00:00']

  it('counts the hour a daylight-saving change adds', () => {
    setInputTimezone('Australia/Sydney')
    expect(format(ACROSS_DST as never, 'duration')).toBe('9 hours')
    expect(format(ACROSS_DST as never, 'durationShort')).toBe('9h')
  })

  it('counts plain hours in a zone that does not shift', () => {
    setInputTimezone('UTC')
    expect(format(ACROSS_DST as never, 'duration')).toBe('8 hours')
  })

  it('does not care which end is given first', () => {
    setInputTimezone('UTC')
    expect(format([...ACROSS_DST].reverse() as never, 'duration')).toBe(
      '8 hours'
    )
  })
})
