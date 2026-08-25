import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { DatePicker } from '../DatePicker'
import { FileInput } from '../FileInput'
import { Labelled } from './index'
import { RangeSlider } from '../RangeSlider'
import { Select } from '../Select'
import { TextField } from '../TextField'
import { TimePicker } from '../TimePicker'
import { ToggleSwitch } from '../ToggleSwitch'

/**
 * `Labelled` has drawn a required state for a long time; nothing could reach
 * it, because not one of the controls that wrap `Labelled` forwarded the prop.
 * These tests are the wiring, control by control, so it cannot come loose
 * again one component at a time.
 */
const CONTROLS: { name: string; component: any }[] = [
  { name: 'TextField', component: TextField },
  { name: 'Select', component: Select },
  { name: 'DatePicker', component: DatePicker },
  { name: 'TimePicker', component: TimePicker },
  { name: 'RangeSlider', component: RangeSlider },
  { name: 'ToggleSwitch', component: ToggleSwitch }
]

describe('Labelled required', () => {
  it('draws the indicator beside the label', () => {
    const wrapper = mount(Labelled, {
      props: { label: 'Email', required: true }
    })
    expect(wrapper.text()).toBe('Email*')
  })

  it('draws nothing without the prop', () => {
    const wrapper = mount(Labelled, { props: { label: 'Email' } })
    expect(wrapper.text()).toBe('Email')
  })

  it('hides the asterisk from assistive tech', () => {
    // The indicator is a sighted convention; `aria-required` on the control is
    // what a screen reader is told. Announcing both says it twice.
    const wrapper = mount(Labelled, {
      props: { label: 'Email', required: true }
    })
    expect(wrapper.find('span').attributes('aria-hidden')).toBe('true')
  })
})

describe.each(CONTROLS)('$name', ({ component }) => {
  it('forwards `required` to the label', () => {
    const wrapper = mount(component, {
      props: { label: 'Field', required: true }
    })
    expect(wrapper.text()).toContain('Field*')
  })

  it('says nothing about being required without the prop', () => {
    const wrapper = mount(component, { props: { label: 'Field' } })
    expect(wrapper.text()).not.toContain('*')
    expect(wrapper.html()).not.toContain('aria-required')
  })
})

describe.each(CONTROLS)('$name aria', ({ component }) => {
  it('marks the control itself required', () => {
    const wrapper = mount(component, {
      props: { label: 'Field', required: true }
    })
    expect(wrapper.html()).toContain('aria-required="true"')
  })
})

describe('FileInput', () => {
  it('forwards `required` to the label', () => {
    const wrapper = mount(FileInput, {
      props: { label: 'Attachment', required: true }
    })
    expect(wrapper.text()).toContain('Attachment*')
  })

  // Deliberately no `aria-required`: the file input is visually hidden and so
  // is not in the accessibility tree, and the drop zone is a region rather
  // than a control that could carry it.
  it('does not put aria-required on a hidden input', () => {
    const wrapper = mount(FileInput, {
      props: { label: 'Attachment', required: true }
    })
    expect(wrapper.html()).not.toContain('aria-required')
  })
})
