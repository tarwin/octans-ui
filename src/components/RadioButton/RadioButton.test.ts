import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RadioButton from './RadioButton.vue'

const checkedOf = (props: Record<string, unknown>) =>
  mount(RadioButton, { props }).find('input').element.checked

describe('checked state', () => {
  it('is checked when the model value matches its true value', () => {
    expect(checkedOf({ modelValue: 'a', trueValue: 'a' })).toBe(true)
  })

  it('is not checked when they differ', () => {
    expect(checkedOf({ modelValue: 'b', trueValue: 'a' })).toBe(false)
    expect(checkedOf({ modelValue: null, trueValue: 'a' })).toBe(false)
  })

  it('is not checked when bound to nothing at all', () => {
    // Regression: `trueValue` has no default, so this compared
    // `undefined === undefined` and every unbound radio drew itself filled in.
    // Three of the stories were rendering checked for exactly this reason.
    expect(checkedOf({ label: 'No minimum' })).toBe(false)
    expect(checkedOf({ modelValue: undefined, trueValue: undefined })).toBe(
      false
    )
  })

  it('is checked when told to be, with no binding', () => {
    // The deliberate way to draw a filled-in radio that is not driven by a
    // model - what the disabled and readonly stories want.
    expect(checkedOf({ checked: true })).toBe(true)
  })
})

describe('selection', () => {
  it('reports its true value on both events', () => {
    // `update:modelValue` drives v-model; `change` is what ChoiceList listens
    // to. Both carry the value this radio stands for, not the input's state.
    const wrapper = mount(RadioButton, {
      props: { modelValue: null, trueValue: 'minimum' }
    })
    wrapper.find('input').trigger('change')
    expect(wrapper.emitted('update:modelValue')).toEqual([['minimum']])
    expect(wrapper.emitted('change')).toEqual([['minimum']])
  })
})

describe('revealed content', () => {
  const mountWithSlot = (props: Record<string, unknown>) =>
    mount(RadioButton, {
      props,
      slots: { default: '<p>revealed</p>' }
    })

  it('shows the default slot while selected', () => {
    expect(mountWithSlot({ modelValue: 'a', trueValue: 'a' }).text()).toContain(
      'revealed'
    )
  })

  it('hides it while not selected', () => {
    expect(
      mountWithSlot({ modelValue: 'b', trueValue: 'a' }).text()
    ).not.toContain('revealed')
  })
})
