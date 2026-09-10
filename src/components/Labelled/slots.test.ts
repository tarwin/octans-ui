import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { CalendarHeatmap } from '../CalendarHeatmap'
import { Checkbox } from '../Checkbox'
import { Choice } from '../Choice'
import { ColorSelector } from '../ColorSelector'
import { DatePicker } from '../DatePicker'
import { FileInput } from '../FileInput'
import { Labelled } from './index'
import { NavField } from '../NavField'
import { OtpInput } from '../OtpInput'
import { RadioButton } from '../RadioButton'
import { RangeSlider } from '../RangeSlider'
import { Rating } from '../Rating'
import { SegmentedControl } from '../SegmentedControl'
import { Select } from '../Select'
import { TextField } from '../TextField'
import { TimePicker } from '../TimePicker'
import { ToggleSwitch } from '../ToggleSwitch'

/**
 * Label and help text used to be prop-only, so a field that needed a control
 * beside its label or a link inside its help text had nowhere to put it —
 * and writing `<template #help-text>` anyway failed SILENTLY, because an
 * unrecognised slot renders as nothing at all. That is the failure these
 * tests exist to prevent, which is why every wrapper is listed rather than
 * the one or two that prompted the change.
 */
const CONTROLS: { name: string; component: any; props?: object }[] = [
  { name: 'TextField', component: TextField },
  { name: 'Select', component: Select },
  { name: 'DatePicker', component: DatePicker },
  { name: 'TimePicker', component: TimePicker },
  { name: 'RangeSlider', component: RangeSlider },
  { name: 'ToggleSwitch', component: ToggleSwitch },
  { name: 'FileInput', component: FileInput },
  { name: 'ColorSelector', component: ColorSelector },
  { name: 'CalendarHeatmap', component: CalendarHeatmap },
  { name: 'SegmentedControl', component: SegmentedControl },
  { name: 'OtpInput', component: OtpInput },
  { name: 'NavField', component: NavField },
  { name: 'Rating', component: Rating }
]

describe.each(CONTROLS)('$name slot forwarding', ({ component, props }) => {
  it('renders the help text slot', () => {
    const wrapper = mount(component, {
      props: { label: 'Field', ...props },
      slots: { helpText: '<a href="/docs">Read the docs</a>' }
    })
    expect(wrapper.html()).toContain('Read the docs')
  })

  it('still renders the help text PROP when no slot is passed', () => {
    // The forwarders are wrapped in `v-if`. Without that guard the slot would
    // always exist as far as `Labelled` is concerned — it decides between slot
    // and prop by mere existence — and every prop-using caller would lose its
    // help text the day the slot was added.
    const wrapper = mount(component, {
      props: { label: 'Field', helpText: 'Prop guidance', ...props }
    })
    expect(wrapper.text()).toContain('Prop guidance')
  })

  it('lets the label slot replace the label', () => {
    const wrapper = mount(component, {
      props: { label: 'Field', ...props },
      slots: {
        label: '<div class="custom">Field <button>Edit</button></div>'
      }
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('Edit')
  })
})

describe('Labelled help text', () => {
  it('styles slot content as help text', () => {
    const wrapper = mount(Labelled, {
      slots: { helpText: 'Guidance' }
    })
    // The slot WRAPS the styled block rather than replacing it: rich copy
    // still has to read as help text, which is the whole reason it goes here
    // rather than in the default slot.
    const block = wrapper
      .findAll('div')
      .find((el) => el.classes().some((name) => name.includes('helpText')))
    expect(block?.text()).toBe('Guidance')
  })

  it('prefers the slot over the prop', () => {
    const wrapper = mount(Labelled, {
      props: { helpText: 'From the prop' },
      slots: { helpText: 'From the slot' }
    })
    expect(wrapper.text()).toContain('From the slot')
    expect(wrapper.text()).not.toContain('From the prop')
  })

  it('renders no help text block when given neither', () => {
    const wrapper = mount(Labelled, { props: { label: 'Field' } })
    expect(wrapper.html()).not.toContain('helpText')
  })
})

describe('Choice help text', () => {
  it('takes a slot', () => {
    const wrapper = mount(Choice, { slots: { helpText: 'Guidance' } })
    expect(wrapper.text()).toContain('Guidance')
  })

  it.each([
    { name: 'Checkbox', component: Checkbox },
    { name: 'RadioButton', component: RadioButton }
  ])('$name forwards it', ({ component }) => {
    const wrapper = mount(component, {
      props: { label: 'Skip acceptance' },
      slots: { helpText: 'Goes straight to scheduled' }
    })
    expect(wrapper.text()).toContain('Goes straight to scheduled')
  })

  it.each([
    { name: 'Checkbox', component: Checkbox },
    { name: 'RadioButton', component: RadioButton }
  ])('$name keeps the prop working without one', ({ component }) => {
    const wrapper = mount(component, {
      props: { label: 'Skip acceptance', helpText: 'Prop guidance' }
    })
    expect(wrapper.text()).toContain('Prop guidance')
  })
})
