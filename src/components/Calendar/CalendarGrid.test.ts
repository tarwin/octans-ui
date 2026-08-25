import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Calendar from './Calendar.vue'

/**
 * The month grid: which days are reachable, which day the week opens on, and
 * which days carry a marker.
 *
 * March 2024 is the fixture throughout. It starts on a Friday, which is what
 * makes the week-start assertions mean something — a month starting on Sunday
 * would look identical under every setting.
 */
function mountMonth(props: Record<string, unknown> = {}) {
  return mount(Calendar, {
    props: {
      type: 'date',
      modelFormat: 'YYYY-MM-DD',
      modelValue: '2024-03-15',
      ...props
    }
  })
}

/** The seven weekday headings, in the order they are drawn. */
function headers(wrapper: ReturnType<typeof mountMonth>) {
  return wrapper.findAll('[class*="CellHeader"]').map((cell) => cell.text())
}

function disabledLabels(wrapper: ReturnType<typeof mountMonth>) {
  return wrapper.findAll('[class*="Cell__disabled"]').map((node) => node.text())
}

describe('Calendar minDate / maxDate', () => {
  it('disables days before minDate', () => {
    const wrapper = mountMonth({ minDate: '2024-03-10' })
    const disabled = disabledLabels(wrapper)
    expect(disabled).toContain('9')
    expect(disabled).not.toContain('10')
    expect(disabled).not.toContain('11')
  })

  it('treats maxDate as inclusive to the end of the day', () => {
    // A bare `dayjs('2024-03-20')` is midnight, so a naive `isAfter` would
    // disable the 20th itself — the one day the caller definitely meant.
    const wrapper = mountMonth({ maxDate: '2024-03-20' })
    const disabled = disabledLabels(wrapper)
    expect(disabled).not.toContain('20')
    expect(disabled).toContain('21')
  })

  it('applies alongside disableDate rather than instead of it', () => {
    const wrapper = mountMonth({
      minDate: '2024-03-10',
      disableDate: (d: { date: () => number }) => d.date() === 15
    })
    const disabled = disabledLabels(wrapper)
    expect(disabled).toContain('9')
    expect(disabled).toContain('15')
  })

  it('keeps a month reachable when only part of it is in range', () => {
    // Judged at the cell's own granularity: a `minDate` mid-March must not
    // hide March in the month view, or the days after it cannot be reached.
    const wrapper = mountMonth({ type: 'month', minDate: '2024-03-15' })
    const disabled = disabledLabels(wrapper)
    expect(disabled).toContain('Feb')
    expect(disabled).not.toContain('Mar')
  })
})

describe('Calendar weekStartsOn', () => {
  it('follows the locale by default', () => {
    // The default locale is en, so Sunday leads.
    expect(headers(mountMonth())[0]).toBe('Sun')
  })

  it('takes the override', () => {
    expect(headers(mountMonth({ weekStartsOn: 1 }))[0]).toBe('Mon')
    expect(headers(mountMonth({ weekStartsOn: 6 }))[0]).toBe('Sat')
  })

  it('moves the grid with the headings, not just the labels', () => {
    // March 2024 opens on a Friday. Sunday-first shows five leading February
    // days; Monday-first shows four.
    const sunday = mountMonth().findAll('[class*="Cell__otherPeriod"]')
    const monday = mountMonth({ weekStartsOn: 1 }).findAll(
      '[class*="Cell__otherPeriod"]'
    )
    expect(sunday[0].text()).toBe('25')
    expect(monday[0].text()).toBe('26')
  })
})

describe('Calendar markers', () => {
  it('draws a dot on the day it names', () => {
    const wrapper = mountMonth({
      markers: [{ date: '2024-03-12', tooltip: 'Deadline' }]
    })
    const marked = wrapper.findAll('[class*="Markers"]')
    expect(marked).toHaveLength(1)
    expect(marked[0].element.parentElement?.textContent).toContain('12')
  })

  it('joins several tooltips on one day', () => {
    const wrapper = mountMonth({
      markers: [
        { date: '2024-03-12', tooltip: 'Deadline' },
        { date: '2024-03-12', tooltip: 'Review' }
      ]
    })
    const day = wrapper
      .findAll('[title]')
      .find((node) => node.attributes('title')?.includes('Deadline'))
    expect(day?.attributes('title')).toBe('Deadline, Review')
  })

  it('caps the dots so a busy day stays countable', () => {
    const wrapper = mountMonth({
      markers: Array.from({ length: 6 }, () => ({ date: '2024-03-12' }))
    })
    expect(wrapper.findAll('[class*="Marker_"]').length).toBe(3)
  })

  it('leaves the leading and trailing days of other months unmarked', () => {
    const wrapper = mountMonth({ markers: [{ date: '2024-02-25' }] })
    expect(wrapper.findAll('[class*="Markers"]')).toHaveLength(0)
  })
})
