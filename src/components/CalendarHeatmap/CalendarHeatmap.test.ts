import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { CalendarHeatmap } from './index'

const SERIES = [{ key: 'commits', label: 'Commits', colors: ['#eee', '#333'] }]

function mountMap(props: Record<string, unknown> = {}) {
  return mount(CalendarHeatmap, {
    props: {
      data: [{ date: '2026-06-30', value: 5 }],
      series: SERIES,
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      ...props
    }
  })
}

// `data` and `series` are the point of the component, but they routinely
// arrive one tick after the first render. Missing them draws an empty grid
// rather than throwing.
describe('CalendarHeatmap without data', () => {
  it('renders an empty grid when neither data nor series is given', () => {
    const wrapper = mount(CalendarHeatmap)
    expect(wrapper.find('[style*="--hm-cell"]').exists()).toBe(true)
  })

  it('still draws the requested range with no data', () => {
    const wrapper = mount(CalendarHeatmap, {
      props: { series: SERIES, startDate: '2026-06-01', endDate: '2026-06-30' }
    })
    expect(wrapper.find('[style*="--hm-cell"]').exists()).toBe(true)
  })

  it('drops the legend when there are no series to toggle', () => {
    const wrapper = mount(CalendarHeatmap, { props: { data: [] } })
    expect(wrapper.find('button').exists()).toBe(false)
  })
})

/**
 * The contiguous-hover box model is expressed entirely in CSS, which jsdom does
 * not lay out — so these assert on the class that carries it. The measurements
 * themselves were verified in a real browser: hit boxes tile with a 0px gap,
 * the painted cell stays at `cellSize`, and the labels and separator overlay
 * land on the painted grid rather than the hit grid.
 */
describe('CalendarHeatmap contiguous hover', () => {
  const contiguousClass = (w: ReturnType<typeof mountMap>) =>
    /CalendarHeatmap__contiguous/.test(w.html())

  it('is on by default', () => {
    expect(contiguousClass(mountMap())).toBe(true)
  })

  it('can be turned off', () => {
    expect(contiguousClass(mountMap({ contiguousHover: false }))).toBe(false)
  })

  // With no gap there is nothing to bridge, and the transparent-border box
  // model would only complicate the common solid-grid case.
  it('is skipped when there is no gap to fill', () => {
    expect(contiguousClass(mountMap({ cellGap: 0 }))).toBe(false)
  })

  it('drives the cell metrics off the same custom properties either way', () => {
    for (const contiguousHover of [true, false]) {
      const style = mountMap({
        contiguousHover,
        cellSize: 14,
        cellGap: 8,
        cellRadius: 3
      })
        // `Labelled` wraps the map and also carries `UIElement`, so target the
        // element by the custom properties themselves.
        .find('[style*="--hm-cell"]')
        .attributes('style')
      expect(style).toContain('--hm-cell: 14px')
      expect(style).toContain('--hm-gap: 8px')
      expect(style).toContain('--hm-radius: 3px')
    }
  })
})
