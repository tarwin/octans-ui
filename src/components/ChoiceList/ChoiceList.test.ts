import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ChoiceList } from './index'

// No `content` / `revealedContent` — it is optional, which is the point of
// the last test in this file.
const OPTIONS = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' }
]

describe('ChoiceList', () => {
  it('renders one control per option', () => {
    const wrapper = mount(ChoiceList, {
      props: { label: 'Pick', options: OPTIONS, modelValue: 'one' }
    })
    expect(wrapper.findAll('input')).toHaveLength(2)
  })

  // Options usually arrive from a fetch, so the first render often has none.
  // That should be an empty list, not a TypeError.
  it('renders its label and nothing else when options are missing', () => {
    const wrapper = mount(ChoiceList, { props: { label: 'Pick' } })
    expect(wrapper.text()).toContain('Pick')
    expect(wrapper.findAll('input')).toHaveLength(0)
  })

  it('adds to the selection in multiple mode', async () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, multiple: true, modelValue: ['one'] }
    })
    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['one', 'two']])
  })

  // An unset array model is a normal starting state — the first click should
  // seed it rather than throw on `undefined.slice`.
  it('starts a selection from an unset model in multiple mode', async () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, multiple: true }
    })
    await wrapper.findAll('input')[0].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['one']])
  })
})

describe('ChoiceList grouping', () => {
  // Radios that don't share a name are not a group: each becomes its own tab
  // stop and the arrow keys move between none of them. The list looked and
  // behaved correctly in every other respect, which is why it went unnoticed.
  it('gives its radios a shared generated name', () => {
    const names = mount(ChoiceList, { props: { options: OPTIONS } })
      .findAll('input')
      .map((input) => input.attributes('name'))
    expect(new Set(names).size).toBe(1)
    expect(names[0]).toBeTruthy()
  })

  it('uses a supplied name instead', () => {
    const names = mount(ChoiceList, {
      props: { options: OPTIONS, name: 'plan' }
    })
      .findAll('input')
      .map((input) => input.attributes('name'))
    expect(names).toEqual(['plan', 'plan'])
  })

  // `disabled` is documented as "disable all the options" and did so only in
  // multiple mode — the radios were handed the per-choice flag alone.
  it('disables every radio, not only the ones marked disabled', () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, disabled: true }
    })
    expect(
      wrapper.findAll('input').every((input) => input.element.disabled)
    ).toBe(true)
  })
})

describe('ChoiceList segmented appearance', () => {
  it('renders a segmented control over the same radios', async () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, appearance: 'segmented', modelValue: 'one' }
    })
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
    expect(wrapper.findAll('input')).toHaveLength(2)

    // The model and the events are the appearance's business to leave alone.
    await wrapper.findAll('input')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['two'])
  })

  it('names the group after the visible label rather than repeating it', () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, appearance: 'segmented', label: 'Plan' }
    })
    expect(wrapper.text()).toContain('Plan')
    expect(wrapper.get('[role="radiogroup"]').attributes('aria-label')).toBe(
      'Plan'
    )
  })

  it('turns per-choice help text into a tooltip', () => {
    const wrapper = mount(ChoiceList, {
      props: {
        appearance: 'segmented',
        options: [{ label: 'One', value: 'one', helpText: 'The first one' }]
      }
    })
    expect(
      wrapper.get('.SegmentedControl-segment').attributes('data-ui-tooltip')
    ).toBe('The first one')
  })

  it('reveals the selected choice’s content under the whole row', async () => {
    const wrapper = mount(ChoiceList, {
      props: {
        appearance: 'segmented',
        options: [
          { label: 'One', value: 'one', revealedContent: 'Follow-up' },
          { label: 'Two', value: 'two' }
        ],
        modelValue: 'two'
      }
    })
    expect(wrapper.find('.ChoiceList-revealed').exists()).toBe(false)

    await wrapper.setProps({ modelValue: 'one' })
    expect(wrapper.get('.ChoiceList-revealed').text()).toBe('Follow-up')
  })

  // A segmented control is a radio group; it cannot show two answers at once.
  // Silently dropping the second one would be worse than saying so.
  it('falls back to checkboxes and warns when asked for multiple', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(ChoiceList, {
      props: {
        options: OPTIONS,
        appearance: 'segmented',
        multiple: true,
        modelValue: ['one']
      }
    })
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(false)
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2)
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })
})

describe('ChoiceList revealed content', () => {
  const revealing = [
    { label: 'One', value: 'one', revealedContent: 'Only while One is picked' },
    { label: 'Two', value: 'two' }
  ]

  it('shows it only while its choice is selected', async () => {
    const wrapper = mount(ChoiceList, {
      props: { options: revealing, modelValue: 'two' }
    })
    expect(wrapper.text()).not.toContain('Only while One is picked')

    await wrapper.setProps({ modelValue: 'one' })
    expect(wrapper.text()).toContain('Only while One is picked')
  })

  // Every selected choice used to render an empty wrapper div for content it
  // did not have.
  it('renders no wrapper when there is nothing to reveal', () => {
    const wrapper = mount(ChoiceList, {
      props: { options: OPTIONS, modelValue: 'one' }
    })
    expect(wrapper.html()).not.toMatch(/_Content_/)
  })
})
