import { describe, expect, it } from 'vitest'
import {
  emptyValuePlaceholder,
  format,
  isNumericType,
  isSummableNumericType
} from './format'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const long = (ms: number) => format(ms, 'durationMs')
const short = (ms: number) => format(ms, 'durationShortMs')

describe('duration formatting', () => {
  it('names each unit it can show', () => {
    expect(long(10 * SECOND)).toBe('10 seconds')
    expect(long(5 * MINUTE)).toBe('5 minutes')
    expect(long(3 * HOUR)).toBe('3 hours')
    expect(long(2 * DAY)).toBe('2 days')
  })

  it('abbreviates in short form', () => {
    expect(short(10 * SECOND)).toBe('10s')
    expect(short(5 * MINUTE)).toBe('5m')
    expect(short(3 * HOUR)).toBe('3h')
    expect(short(2 * DAY)).toBe('2d')
  })

  it('combines the units it has', () => {
    expect(short(2 * DAY + 3 * HOUR + 4 * MINUTE + 5 * SECOND)).toBe(
      '2d 3h 4m 5s'
    )
  })

  it('drops units that are zero', () => {
    expect(short(2 * DAY + 5 * SECOND)).toBe('2d 5s')
  })

  it('shows durations of a month or more as days', () => {
    // Regression: this collapsed to days by dividing `milliseconds()` — the
    // 0-999 component rather than the total — so `days` was always 0. Every
    // other unit is zeroed on this path, so there was nothing left to print
    // and these all rendered as ''.
    expect(long(31 * DAY)).toBe('31 days')
    expect(long(45 * DAY)).toBe('45 days')
    expect(long(400 * DAY)).toBe('400 days')
    expect(short(45 * DAY)).toBe('45d')
    expect(short(400 * DAY)).toBe('400d')
  })

  it('shows only whole days past a month, not the remainder', () => {
    // Past a month the smaller units are deliberately discarded rather than
    // shown alongside — dayjs stops apportioning them dependably.
    expect(short(45 * DAY + 7 * HOUR + 30 * MINUTE)).toBe('45d')
  })

  it('falls back to a zero rather than an empty string in short form', () => {
    // A span too small to reach a second still has to render as something.
    // Zero is a real duration, not an absent one, so it is not the placeholder.
    expect(short(400)).toBe('0s')
    expect(short(0)).toBe('0s')
    // The long form has no such fallback and renders nothing at all.
    expect(long(400)).toBe('')
  })

  it('measures a duration between two dates in either order', () => {
    const pair = ['2026-01-01T00:00:00Z', '2026-02-15T00:00:00Z']
    expect(format(pair as never, 'durationShort')).toBe('45d')
    // Reversed, the same span — the formatter sorts the pair itself.
    expect(format([...pair].reverse() as never, 'durationShort')).toBe('45d')
  })
})

describe('format', () => {
  it('shows a placeholder for an empty value', () => {
    expect(format('', 'integer')).toBe(emptyValuePlaceholder)
    expect(format(null as never, 'integer')).toBe(emptyValuePlaceholder)
  })

  it('returns the value untouched with no formatter named', () => {
    expect(format(42, '')).toBe(42)
  })

  it('throws on a formatter that does not exist', () => {
    expect(() => format(42, 'nonesuch')).toThrow('Invalid formatter')
  })

  it('formats numbers by type', () => {
    expect(format(1234, 'integer', { locale: 'en-US' })).toBe('1,234')
    expect(format(1234.5, 'currency', { locale: 'en-US' })).toContain('1,234.5')
  })
})

describe('numeric type helpers', () => {
  it('knows which types are numeric', () => {
    expect(isNumericType('integer')).toBe(true)
    expect(isNumericType('dateShort')).toBe(false)
  })

  it('knows which numeric types may be summed', () => {
    // A percent column adds up to nonsense, so it is numeric but not summable.
    expect(isSummableNumericType('integer')).toBe(true)
    expect(isSummableNumericType('percent')).toBe(false)
  })
})
