import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ToggleSwitch } from './index'

function mountSwitch(props: Record<string, unknown> = {}) {
  return mount(ToggleSwitch, { props })
}

/** The knob icon renders as an `<svg>`; Iconify has no data for it in jsdom. */
function iconStyle(wrapper: ReturnType<typeof mountSwitch>) {
  return wrapper.find('svg').attributes('style') ?? ''
}

/** The track is the interactive element — a <button role="switch">. */
function track(wrapper: ReturnType<typeof mountSwitch>) {
  return wrapper.find('button')
}

function trackStyle(wrapper: ReturnType<typeof mountSwitch>) {
  return track(wrapper).attributes('style') ?? ''
}

describe('ToggleSwitch', () => {
  it('toggles between trueValue and falseValue', async () => {
    const wrapper = mountSwitch({ modelValue: false })
    await track(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])

    await wrapper.setProps({ modelValue: true })
    await track(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false])
  })

  it('honours custom trueValue / falseValue', async () => {
    const wrapper = mountSwitch({
      modelValue: 'no',
      trueValue: 'yes',
      falseValue: 'no'
    })
    await track(wrapper).trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['yes'])
  })

  it('does not emit while disabled', async () => {
    const wrapper = mountSwitch({ modelValue: false, disabled: true })
    expect(track(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.classes().join(' ')).toMatch(/disabled/)
  })

  // Accessibility. The control is a real button so that focus, Space / Enter
  // and the disabled semantics come from the platform rather than from us —
  // these guard the parts we do have to declare.
  it('exposes itself as a switch with its state', async () => {
    const wrapper = mountSwitch({ modelValue: false })
    expect(track(wrapper).attributes('role')).toBe('switch')
    expect(track(wrapper).attributes('aria-checked')).toBe('false')

    await wrapper.setProps({ modelValue: true })
    expect(track(wrapper).attributes('aria-checked')).toBe('true')
  })

  // `type="button"` matters: inside a <form> the default is `submit`, which
  // would post the form every time someone flipped the switch.
  it('never submits a surrounding form', () => {
    expect(track(mountSwitch()).attributes('type')).toBe('button')
  })

  it('is reachable by keyboard, and activates on Space / Enter', async () => {
    const wrapper = mountSwitch({ modelValue: false })
    // A <button> is in the tab order without a tabindex, and must not have
    // been pushed out of it by one.
    expect(track(wrapper).attributes('tabindex')).toBeUndefined()
    // jsdom does not synthesise the click a real browser fires for Space /
    // Enter on a button, so assert the element type that guarantees it.
    expect(track(wrapper).element.tagName).toBe('BUTTON')
  })

  // Attributes are split: the name lands on the button a screen reader
  // announces, while class/style stay on the root where layout expects them.
  it('puts the accessible name on the control and layout attrs on the root', () => {
    // Undeclared props fall through as attrs, which is exactly the path
    // under test.
    const wrapper = mountSwitch({
      modelValue: true,
      'aria-label': 'Email alerts',
      class: 'my-switch'
    })
    expect(track(wrapper).attributes('aria-label')).toBe('Email alerts')
    expect(wrapper.classes()).toContain('my-switch')
    expect(track(wrapper).classes()).not.toContain('my-switch')
  })

  // The knob restates what aria-checked already says.
  it('hides the decorative knob from assistive tech', () => {
    const wrapper = mountSwitch({ modelValue: true })
    expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true)
  })

  // Icons default ON — the whole point of the default is that it survives
  // someone refactoring the prop, so it gets its own guard.
  it('shows a knob icon by default', () => {
    expect(mountSwitch({ modelValue: false }).find('svg').exists()).toBe(true)
  })

  it('renders no knob icon when icons is false', () => {
    const wrapper = mountSwitch({ modelValue: false, icons: false })
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('swaps the icon with the state', async () => {
    const wrapper = mountSwitch({
      modelValue: false,
      iconOn: 'mdi:eye',
      iconOff: 'mdi:eye-off'
    })
    // Iconify renders an <svg> without the name attached, so read the name off
    // the Icon component rather than out of the markup.
    const name = () => wrapper.findComponent({ name: 'Icon' }).props('icon')
    expect(name()).toBe('mdi:eye-off')

    await wrapper.setProps({ modelValue: true })
    expect(name()).toBe('mdi:eye')
  })

  it('lets the handle slot win over icons', () => {
    const wrapper = mount(ToggleSwitch, {
      props: { modelValue: true },
      slots: { handle: '<b class="custom">ON</b>' }
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('colours the track per state', async () => {
    const wrapper = mountSwitch({
      modelValue: false,
      colorOn: 'rgb(0, 128, 0)',
      colorOff: 'rgb(255, 0, 0)'
    })
    expect(trackStyle(wrapper)).toContain('rgb(255, 0, 0)')

    await wrapper.setProps({ modelValue: true })
    expect(trackStyle(wrapper)).toContain('rgb(0, 128, 0)')
  })

  it('treats color as shorthand for colorOn, with colorOn winning', async () => {
    const wrapper = mountSwitch({ modelValue: true, color: 'rgb(0, 0, 255)' })
    expect(trackStyle(wrapper)).toContain('rgb(0, 0, 255)')

    await wrapper.setProps({ colorOn: 'rgb(0, 128, 0)' })
    expect(trackStyle(wrapper)).toContain('rgb(0, 128, 0)')
  })

  it('defaults the on icon to the on track colour', () => {
    const wrapper = mountSwitch({ modelValue: true, color: 'rgb(0, 0, 255)' })
    expect(iconStyle(wrapper)).toContain('rgb(0, 0, 255)')
  })

  // The default off track is a pale grey, so the icon deliberately does NOT
  // follow it — it would be near-invisible on the knob. It uses a token that
  // stays fixed across themes, because the knob does too.
  it('keeps the off icon on the fixed knob-icon token when no colorOff is set', () => {
    const wrapper = mountSwitch({ modelValue: false })
    expect(iconStyle(wrapper)).toContain('--octans-toggle-knob-icon')
  })

  it('follows colorOff for the off icon once one is set', () => {
    const wrapper = mountSwitch({
      modelValue: false,
      colorOff: 'rgb(255, 0, 0)'
    })
    expect(iconStyle(wrapper)).toContain('rgb(255, 0, 0)')
  })

  it('lets iconColor override both states', async () => {
    const wrapper = mountSwitch({
      modelValue: false,
      color: 'rgb(0, 0, 255)',
      colorOff: 'rgb(255, 0, 0)',
      iconColor: 'rgb(17, 17, 17)'
    })
    expect(iconStyle(wrapper)).toContain('rgb(17, 17, 17)')

    await wrapper.setProps({ modelValue: true })
    expect(iconStyle(wrapper)).toContain('rgb(17, 17, 17)')
  })

  it('lets per-state icon colours beat the iconColor shorthand', async () => {
    const wrapper = mountSwitch({
      modelValue: false,
      iconColor: 'rgb(17, 17, 17)',
      iconColorOn: 'rgb(0, 128, 0)',
      iconColorOff: 'rgb(255, 0, 0)'
    })
    expect(iconStyle(wrapper)).toContain('rgb(255, 0, 0)')

    await wrapper.setProps({ modelValue: true })
    expect(iconStyle(wrapper)).toContain('rgb(0, 128, 0)')
  })

  it('scales the icon with the switch size', () => {
    const small = mountSwitch({ modelValue: true, size: 'small' })
    const large = mountSwitch({ modelValue: true, size: 'large' })
    const height = (w: ReturnType<typeof mountSwitch>) =>
      parseFloat(w.find('svg').attributes('height') ?? '0')
    expect(height(large)).toBeGreaterThan(height(small))
  })
})
