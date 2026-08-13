import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { SegmentedControl } from './index'

const OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' }
]

const control = (props = {}, options = {}) =>
  mount(SegmentedControl, { props: { options: OPTIONS, ...props }, ...options })

describe('SegmentedControl', () => {
  it('renders one radio per option', () => {
    const wrapper = control()
    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(3)
    expect(inputs.every((input) => input.attributes('type') === 'radio')).toBe(
      true
    )
    expect(wrapper.text()).toContain('Week')
  })

  // Options usually arrive from a fetch, so the first render often has none.
  it('renders an empty control rather than throwing without options', () => {
    const wrapper = mount(SegmentedControl)
    expect(wrapper.findAll('input')).toHaveLength(0)
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
  })

  it('checks the segment matching the model', () => {
    const wrapper = control({ modelValue: 'week' })
    const checked = wrapper
      .findAll('input')
      .map((input) => input.element.checked)
    expect(checked).toEqual([false, true, false])
  })

  // A value matching nothing is an empty state, not an error — a filter that
  // has been cleared, say.
  it('leaves every segment unselected when the model matches none', () => {
    const wrapper = control({ modelValue: 'year' })
    expect(
      wrapper.findAll('input').some((input) => input.element.checked)
    ).toBe(false)
  })

  it('emits the value and the whole option when a segment is picked', async () => {
    const wrapper = control({ modelValue: 'day' })
    await wrapper.findAll('input')[2].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['month'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['month', OPTIONS[2]])
  })

  // The visible selection is painted from the model; the announced one is read
  // off the radio. Nothing bound means the model can't follow the click, so the
  // radio is put back rather than letting a screen reader announce one segment
  // while the eye sees another.
  it('refuses to move when nothing is bound to it', async () => {
    const wrapper = control({ modelValue: 'day' })
    await wrapper.findAll('input')[1].setValue(true)
    await wrapper.vm.$nextTick()
    expect(
      wrapper.findAll('input').map((input) => input.element.checked)
    ).toEqual([true, false, false])
    expect(wrapper.get('.SegmentedControl-selected').text()).toBe('Day')
  })

  it('says nothing when the selected segment is picked again', async () => {
    const wrapper = control({ modelValue: 'day' })
    await wrapper.findAll('input')[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})

describe('grouping', () => {
  // The load-bearing detail of the whole component. Radios that don't share a
  // name aren't a group: every segment becomes its own tab stop and the arrow
  // keys do nothing.
  it('gives the radios a shared generated name', () => {
    const names = control()
      .findAll('input')
      .map((input) => input.attributes('name'))
    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBeTruthy()
  })

  it('gives two controls on one page different names', () => {
    // Mounted together on purpose: `useId` counts per app instance, so two
    // separate `mount()` calls are two apps and would both start at 1 —
    // passing this test while proving nothing about a real page.
    const wrapper = mount({
      components: { SegmentedControl },
      data: () => ({ options: OPTIONS }),
      template: `<div>
        <SegmentedControl :options="options" />
        <SegmentedControl :options="options" />
      </div>`
    })
    const names = wrapper
      .findAll('input')
      .map((input) => input.attributes('name'))
    expect(names).toHaveLength(6)
    expect(new Set(names).size).toBe(2)
  })

  // Only worth setting to submit with a plain HTML form, but then it must win.
  it('uses a supplied name instead', () => {
    const names = control({ name: 'range' })
      .findAll('input')
      .map((input) => input.attributes('name'))
    expect(names).toEqual(['range', 'range', 'range'])
  })
})

describe('accessibility', () => {
  it('is a radiogroup and says which way it runs', () => {
    expect(
      control().get('[role="radiogroup"]').attributes('aria-orientation')
    ).toBe('horizontal')
    expect(
      control({ vertical: true })
        .get('[role="radiogroup"]')
        .attributes('aria-orientation')
    ).toBe('vertical')
  })

  it('names the group from the visible label, or from ariaLabel without one', () => {
    expect(
      control({ label: 'Range' })
        .get('[role="radiogroup"]')
        .attributes('aria-label')
    ).toBe('Range')
    expect(
      control({ ariaLabel: 'View' })
        .get('[role="radiogroup"]')
        .attributes('aria-label')
    ).toBe('View')
  })

  // An icon is a picture to a screen reader, so an icon-only segment has no
  // name at all unless its tooltip stands in for one.
  // The message alone leaves the reader to work out which control it is about,
  // which is why every other field in the library marks itself too.
  it('marks the control itself when there is an error, not just the message', () => {
    const clean = control()
    expect(clean.get('[role="radiogroup"]').attributes('aria-invalid')).toBe(
      undefined
    )

    const wrapper = control({ error: 'Pick one' })
    const group = wrapper.get('[role="radiogroup"]')
    expect(group.attributes('aria-invalid')).toBe('true')
    expect(group.classes().some((c) => c.includes('error'))).toBe(true)
    expect(wrapper.text()).toContain('Pick one')
  })

  it('names an icon-only segment from its tooltip', () => {
    const wrapper = control({
      options: [
        { value: 'grid', icon: 'mdi:image', tooltip: 'Grid' },
        { value: 'list', label: 'List', tooltip: 'Show as a list' }
      ]
    })
    const inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('aria-label')).toBe('Grid')
    // The one with a label already has a name — the label. Repeating the
    // tooltip over the top would replace "List" with "Show as a list".
    expect(inputs[1].attributes('aria-label')).toBeUndefined()
  })
})

describe('disabled and readonly', () => {
  it('disables every radio when the control is disabled', () => {
    const wrapper = control({ disabled: true })
    expect(
      wrapper
        .findAll('input')
        .every((input) => input.attributes('disabled') !== undefined)
    ).toBe(true)
  })

  it('disables one segment on its own', () => {
    const wrapper = control({
      options: [
        { label: 'Day', value: 'day' },
        { label: 'Week', value: 'week', disabled: true }
      ]
    })
    const inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('disabled')).toBeUndefined()
    expect(inputs[1].attributes('disabled')).toBeDefined()
  })

  it('refuses to change while readonly, and puts the DOM back', async () => {
    // The browser moves the checkmark before the handler runs and nothing
    // re-renders to move it back, so a readonly control would show the wrong
    // segment selected until something else happened to it.
    const wrapper = control({ modelValue: 'day', readonly: true })
    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(
      wrapper.findAll('input').map((input) => input.element.checked)
    ).toEqual([true, false, false])
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-readonly')).toBe(
      'true'
    )
  })
})

describe('styling hooks', () => {
  // Hashed module names cannot be written in a consumer's stylesheet — the
  // same reason `Divider` exposes `Divider-label`.
  it('marks each segment and the selected one with unhashed classes', () => {
    const wrapper = control({ modelValue: 'week' })
    expect(wrapper.findAll('.SegmentedControl-segment')).toHaveLength(3)
    const selected = wrapper.findAll('.SegmentedControl-selected')
    expect(selected).toHaveLength(1)
    expect(selected[0].text()).toBe('Week')
  })

  it('maps each size to a class', () => {
    // Only `small` and `large` have rules — medium is what the base already
    // says. Vitest's stubbed CSS modules hand back a name for every key
    // regardless, so there is nothing to assert about medium here.
    for (const [size, name] of [
      ['small', 'sizeSmall'],
      ['large', 'sizeLarge']
    ] as const) {
      const group = control({ size }).get('[role="radiogroup"]')
      expect(group.classes().some((c) => c.includes(name))).toBe(true)
    }
  })

  it('hangs a tooltip off the segment, on a side', () => {
    // The global tooltip CSS positions nothing without a side, which drops the
    // bubble at its static position — over the segment it describes.
    const wrapper = control({
      options: [
        { label: 'Day', value: 'day', tooltip: 'One day at a time' },
        { label: 'Week', value: 'week' }
      ]
    })
    const segments = wrapper.findAll('.SegmentedControl-segment')
    expect(segments[0].attributes('data-ui-tooltip')).toBe('One day at a time')
    expect(segments[0].attributes('data-ui-tooltip-position')).toBe('top')
    // Nothing to position for a segment with no tooltip.
    expect(segments[1].attributes('data-ui-tooltip-position')).toBeUndefined()

    expect(
      control({
        tooltipPosition: 'right',
        options: [{ label: 'Day', value: 'day', tooltip: 'Daily' }]
      })
        .get('.SegmentedControl-segment')
        .attributes('data-ui-tooltip-position')
    ).toBe('right')
  })
})

describe('option slot', () => {
  it('replaces a segment’s contents, and is told which one it is', () => {
    const wrapper = control(
      { modelValue: 'week' },
      {
        slots: {
          option: ({ option, selected }: any) =>
            h('b', `${option.label}${selected ? '!' : ''}`)
        }
      }
    )
    expect(wrapper.findAll('b').map((b) => b.text())).toEqual([
      'Day',
      'Week!',
      'Month'
    ])
  })
})
