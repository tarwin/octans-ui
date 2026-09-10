import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { CalendarHeatmap } from '../CalendarHeatmap'
import { Checkbox } from '../Checkbox'
import { Choice } from '../Choice'
import { ChoiceList } from '../ChoiceList'
import { ColorSelector } from '../ColorSelector'
import { DatePicker } from '../DatePicker'
import { FileInput } from '../FileInput'
import { Icon } from '../Icon'
import { NavField } from '../NavField'
import { OtpInput } from '../OtpInput'
import { RadioButton } from '../RadioButton'
import { RangeSlider } from '../RangeSlider'
import { Rating } from '../Rating'
import { SegmentedControl } from '../SegmentedControl'
import { Select } from '../Select'
import { TextField } from '../TextField'
import { TimePicker } from '../TimePicker'
import { TimezonePicker } from '../TimezonePicker'
import { ToggleSwitch } from '../ToggleSwitch'
import { Labelled } from './index'

const LINK = 'https://example.com/markdown'
const MARKDOWN = 'mdi:language-markdown'

/** True when any `Icon` inside the wrapper was asked for `name`. */
function drewIcon(wrapper: any, name: string) {
  return wrapper
    .findAllComponents(Icon)
    .some((icon: any) => icon.props('icon') === name)
}

/**
 * `helpLink` used to hard-code an information icon and say nothing on hover,
 * so a field wanting to advertise something specific — "this box takes
 * markdown" — had to replace the whole label through the slot to get one
 * icon changed. Every wrapper is listed because the props are only useful if
 * they reach `Labelled` from wherever the caller is: an unforwarded prop
 * fails silently, landing in `$attrs` on some inner element.
 */
const CONTROLS: { name: string; component: any; props?: object }[] = [
  { name: 'TextField', component: TextField },
  { name: 'Select', component: Select },
  { name: 'DatePicker', component: DatePicker },
  { name: 'TimePicker', component: TimePicker },
  { name: 'TimezonePicker', component: TimezonePicker },
  { name: 'RangeSlider', component: RangeSlider },
  { name: 'ToggleSwitch', component: ToggleSwitch },
  { name: 'FileInput', component: FileInput },
  { name: 'ColorSelector', component: ColorSelector },
  { name: 'CalendarHeatmap', component: CalendarHeatmap },
  { name: 'SegmentedControl', component: SegmentedControl },
  { name: 'OtpInput', component: OtpInput },
  { name: 'NavField', component: NavField },
  { name: 'Rating', component: Rating },
  { name: 'Checkbox', component: Checkbox },
  { name: 'RadioButton', component: RadioButton },
  { name: 'ChoiceList', component: ChoiceList }
]

describe.each(CONTROLS)('$name help link', ({ component, props }) => {
  it('draws the information icon by default', () => {
    const wrapper = mount(component, {
      props: { label: 'Field', helpLink: LINK, ...props }
    })
    expect(drewIcon(wrapper, 'mdi:information')).toBe(true)
  })

  it('forwards helpLinkIcon and helpLinkTooltip', () => {
    const wrapper = mount(component, {
      props: {
        label: 'Field',
        helpLink: LINK,
        helpLinkIcon: MARKDOWN,
        helpLinkTooltip: 'Supports markdown',
        ...props
      }
    })
    expect(drewIcon(wrapper, MARKDOWN)).toBe(true)
    const link = wrapper.get(`a[href="${LINK}"]`)
    expect(link.attributes('data-ui-tooltip')).toBe('Supports markdown')
    expect(link.attributes('data-ui-tooltip-position')).toBe('top')
  })
})

describe('Labelled help link', () => {
  it('leaves the tooltip attributes off when there is no tooltip', () => {
    // The global tooltip CSS keys off the attribute's presence, so an empty
    // one would draw a blank bubble on hover.
    const wrapper = mount(Labelled, {
      props: { label: 'Field', helpLink: LINK }
    })
    const link = wrapper.get('a')
    expect(link.attributes('data-ui-tooltip')).toBeUndefined()
    expect(link.attributes('data-ui-tooltip-position')).toBeUndefined()
  })

  it('draws no icon at all without a help link', () => {
    const wrapper = mount(Labelled, {
      props: { label: 'Field', helpLinkIcon: MARKDOWN }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(drewIcon(wrapper, MARKDOWN)).toBe(false)
  })

  it('opens the link in a new tab', () => {
    const wrapper = mount(Labelled, {
      props: { label: 'Field', helpLink: LINK }
    })
    expect(wrapper.get('a').attributes('target')).toBe('_blank')
  })
})

describe('Choice help link', () => {
  it('takes the same icon and tooltip as Labelled', () => {
    const wrapper = mount(Choice, {
      props: {
        label: 'Send email',
        helpLink: LINK,
        helpLinkIcon: MARKDOWN,
        helpLinkTooltip: 'Supports markdown'
      }
    })
    expect(drewIcon(wrapper, MARKDOWN)).toBe(true)
    expect(wrapper.get('a').attributes('data-ui-tooltip')).toBe(
      'Supports markdown'
    )
  })
})

describe('ChoiceList per-choice help link', () => {
  it('gives each choice its own icon and tooltip', () => {
    const wrapper = mount(ChoiceList, {
      props: {
        label: 'Notify me',
        options: [
          {
            label: 'By email',
            value: 'email',
            helpLink: LINK,
            helpLinkIcon: MARKDOWN,
            helpLinkTooltip: 'Supports markdown'
          }
        ]
      }
    })
    expect(drewIcon(wrapper, MARKDOWN)).toBe(true)
    expect(wrapper.get(`a[href="${LINK}"]`).attributes('data-ui-tooltip')).toBe(
      'Supports markdown'
    )
  })
})
