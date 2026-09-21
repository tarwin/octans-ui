import { describe, expect, it } from 'vitest'
import { pageItems, type PageItem } from './pageItems'

/** `1 … 8 9 10 … 20` style rendering, for readable assertions. */
const strip = (items: PageItem[]) =>
  items.map((i) => (i.type === 'page' ? String(i.page) : '…')).join(' ')

describe('pageItems', () => {
  it('fills the same number of slots whichever page is current', () => {
    for (const slots of [5, 6, 7, 9, 11]) {
      for (let current = 1; current <= 40; current++) {
        expect(pageItems(current, 40, slots)).toHaveLength(slots)
      }
    }
  })

  it('keeps the current page centred with an odd slot count', () => {
    expect(strip(pageItems(1, 20, 11))).toBe('1 2 3 4 5 6 7 8 9 … 20')
    expect(strip(pageItems(10, 20, 11))).toBe('1 … 7 8 9 10 11 12 13 … 20')
    expect(strip(pageItems(20, 20, 11))).toBe('1 … 12 13 14 15 16 17 18 19 20')
    expect(strip(pageItems(10, 20, 7))).toBe('1 … 9 10 11 … 20')
  })

  it('shows every page when they all fit', () => {
    expect(strip(pageItems(3, 7, 11))).toBe('1 2 3 4 5 6 7')
    expect(strip(pageItems(1, 1, 11))).toBe('1')
  })

  it('points each ellipsis at the nearest page it hides', () => {
    const items = pageItems(10, 20, 7)
    expect(items[1]).toEqual({ type: 'gap', to: 8 })
    expect(items[5]).toEqual({ type: 'gap', to: 12 })
  })

  it('never drops below the five slots both ellipses need', () => {
    expect(strip(pageItems(10, 20, 3))).toBe('1 … 10 … 20')
  })

  it('is empty with no pages or no slots', () => {
    expect(pageItems(1, 0, 11)).toEqual([])
    expect(pageItems(1, 20, 0)).toEqual([])
  })
})
