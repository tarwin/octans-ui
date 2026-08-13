import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Calendar from './Calendar.vue'

/**
 * The time columns of a `type="datetime"` calendar.
 *
 * Both columns are gated on `minTime` / `maxTime`, and the minute column has to
 * consult the SELECTED HOUR to know whether a minute is in range — 30 is fine
 * at 09:30 and out of range at 17:30 when the day ends at 17:00. The trap is
 * that midnight is hour 0: any "do we have an hour?" test written as a
 * falsiness check reads a valid midnight as "no hour at all".
 */

function mountCalendar(props: Record<string, unknown> = {}) {
  return mount(Calendar, {
    props: { type: 'datetime', modelFormat: 'YYYY-MM-DD HH:mm', ...props }
  })
}

/** `[hourSelect, minuteSelect]` — the two `<select>`s in the time row. */
function timeSelects(wrapper: ReturnType<typeof mountCalendar>) {
  const selects = wrapper.findAll('select')
  expect(selects).toHaveLength(2)
  return selects
}

function disabledLabels(select: ReturnType<typeof timeSelects>[number]) {
  return select
    .findAll('option')
    .filter((option) => option.attributes('disabled') !== undefined)
    .map((option) => option.text())
}

describe('Calendar time columns', () => {
  it('leaves every minute selectable at midnight', () => {
    // The regression: hour 0 was treated as "no hour selected", the comparison
    // string collapsed to '', and '' sorts before '00:00' — so every minute
    // came back out of range. This is the calendar's DEFAULT state, since an
    // absent model value falls back to the start of today.
    const wrapper = mountCalendar({ modelValue: '2026-03-04 00:00' })
    const [, minutes] = timeSelects(wrapper)

    expect(disabledLabels(minutes)).toEqual([])
  })

  it('still disables minutes that fall outside the range', () => {
    // 09:00–09:30 leaves 31–59 out of range within the selected hour, which is
    // what proves the guard is doing real work rather than passing everything.
    const wrapper = mountCalendar({
      modelValue: '2026-03-04 09:00',
      minTime: '09:00',
      maxTime: '09:30'
    })
    const [, minutes] = timeSelects(wrapper)

    expect(disabledLabels(minutes)).toHaveLength(29)
    expect(disabledLabels(minutes)[0]).toBe('31')
  })

  it('applies a midnight lower bound to the minutes of hour 0', () => {
    // A bound inside hour 0 is where the empty-string fallback looked correct
    // by accident: everything really was disabled, just for the wrong reason.
    const wrapper = mountCalendar({
      modelValue: '2026-03-04 00:00',
      minTime: '00:15',
      maxTime: '23:59'
    })
    const [, minutes] = timeSelects(wrapper)

    expect(disabledLabels(minutes)).toHaveLength(15)
    expect(disabledLabels(minutes)).toContain('14')
    expect(disabledLabels(minutes)).not.toContain('15')
  })

  it('disables hours outside the range', () => {
    const wrapper = mountCalendar({
      modelValue: '2026-03-04 09:00',
      minTime: '09:00',
      maxTime: '17:00'
    })
    const [hours] = timeSelects(wrapper)

    expect(disabledLabels(hours)).toHaveLength(15)
    expect(disabledLabels(hours)).toContain('08')
    expect(disabledLabels(hours)).not.toContain('09')
    expect(disabledLabels(hours)).not.toContain('17')
    expect(disabledLabels(hours)).toContain('18')
  })

  it('emits the chosen minute against the selected hour', () => {
    const wrapper = mountCalendar({ modelValue: '2026-03-04 00:00' })
    const [, minutes] = timeSelects(wrapper)

    minutes.setValue('45')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
      '2026-03-04 00:45'
    ])
  })
})
