import { describe, expect, it } from 'vitest'
import { overflowTabs } from './layout'

const WIDTHS = [80, 140, 100, 60, 80] // 460 in all
const menu = (labelled: boolean) => (labelled ? 120 : 70)

describe('overflowTabs', () => {
  it('keeps every tab while they all fit, reserving nothing for a menu', () => {
    expect(overflowTabs(WIDTHS, 460, 0, menu)).toEqual([
      false,
      false,
      false,
      false,
      false
    ])
  })

  it('moves the first tab that does not fit, and every tab after it', () => {
    // 70 for the menu, then 80 + 140 + 100 = 320 fit within 400; 60 would not.
    expect(overflowTabs(WIDTHS, 400, 0, menu)).toEqual([
      false,
      false,
      false,
      true,
      true
    ])
  })

  it('reserves the wider button when the selected tab is in the menu', () => {
    // Unlabelled the first three fit (70 + 320 = 390), but the selected tab is
    // the fourth, so the button shows it: 120 + 80 + 140 = 340, and the third
    // tab (100) no longer fits either.
    expect(overflowTabs(WIDTHS, 400, 3, menu)).toEqual([
      false,
      false,
      true,
      true,
      true
    ])
  })

  it('moves everything into the menu when not even the first tab fits', () => {
    expect(overflowTabs(WIDTHS, 100, 0, menu)).toEqual([
      true,
      true,
      true,
      true,
      true
    ])
  })

  it('is empty for no tabs', () => {
    expect(overflowTabs([], 400, -1, menu)).toEqual([])
  })
})
