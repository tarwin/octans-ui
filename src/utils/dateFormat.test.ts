import { afterEach, describe, expect, it } from 'vitest'
import { format } from './format'
import { setDateFormat } from './date'

afterEach(() => setDateFormat(undefined))

describe('dateNumeral', () => {
  const day = '2024-05-06 12:00:00'

  it('uses the locale until told otherwise', () => {
    expect(format(day, 'dateNumeral')).toBe('05/06/2024')
  })

  it('follows setDateFormat', () => {
    setDateFormat('DD/MM/YYYY')
    expect(format(day, 'dateNumeral')).toBe('06/05/2024')
  })

  it('takes an override through its context', () => {
    setDateFormat('DD/MM/YYYY')
    expect(format(day, 'dateNumeral', { dateFormat: 'YYYY-MM-DD' })).toBe(
      '2024-05-06'
    )
  })

  it('leaves the worded formats to the locale', () => {
    setDateFormat('DD/MM/YYYY')
    expect(format(day, 'dateLong')).toBe('May 6, 2024')
  })
})
