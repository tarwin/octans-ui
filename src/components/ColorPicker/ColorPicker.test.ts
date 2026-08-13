import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ColorPicker from './ColorPicker.vue'

/** The last value the component emitted, or undefined if it never did. */
function emitted(wrapper: ReturnType<typeof mount>) {
  const events = wrapper.emitted('update:modelValue') as
    Array<[string]> | undefined
  return events?.[events.length - 1]?.[0]
}

const mountPicker = (props: Record<string, unknown> = {}) =>
  mount(ColorPicker, { props: { modelValue: '#5f63e8', ...props } })

const textField = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find('input[aria-label="Colour value"]')

/**
 * `setValue` fires both `input` and `change`, which is exactly the sequence a
 * real committed edit produces — so it needs no follow-up `trigger('change')`.
 */
const typeColor = (wrapper: ReturnType<typeof mount>, value: string) =>
  textField(wrapper).setValue(value)

describe('ColorPicker', () => {
  it('shows the value it was given, unchanged', () => {
    // Mounting must not emit — a picker that rewrites its own value on mount
    // marks a pristine form dirty just by being rendered.
    const wrapper = mountPicker()
    expect((textField(wrapper).element as HTMLInputElement).value).toBe(
      '#5f63e8'
    )
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('accepts any format in the text field', async () => {
    const wrapper = mountPicker()
    await typeColor(wrapper, 'hsl(120 100% 50%)')
    // It adopts the format it was handed rather than forcing its own.
    expect(emitted(wrapper)).toBe('hsl(120 100% 50%)')
  })

  it('puts back the known value when the text is not a colour', async () => {
    // Leaving unparseable text sitting above handles that disagree with it is
    // worse than overwriting what was typed.
    const wrapper = mountPicker()
    await typeColor(wrapper, 'not a colour')
    expect(emitted(wrapper)).toBeUndefined()
    expect((textField(wrapper).element as HTMLInputElement).value).toBe(
      '#5f63e8'
    )
  })

  it('leaves a value it cannot parse alone rather than replacing it', () => {
    // A theme token may legitimately hold `var(--octans-primary)`.
    const wrapper = mountPicker({ modelValue: 'var(--octans-primary)' })
    expect((textField(wrapper).element as HTMLInputElement).value).toBe(
      'var(--octans-primary)'
    )
  })

  it('converts when the format switcher changes', async () => {
    const wrapper = mountPicker()
    await wrapper.find('select[aria-label="Colour format"]').setValue('rgb')
    expect(emitted(wrapper)).toBe('rgb(95 99 232)')
  })

  it('hides the format switcher when the format is pinned', () => {
    const wrapper = mountPicker({ format: 'oklch' })
    expect(wrapper.find('select[aria-label="Colour format"]').exists()).toBe(
      false
    )
  })

  it('emits in the pinned format regardless of what came in', async () => {
    const wrapper = mountPicker({ format: 'rgb' })
    await typeColor(wrapper, '#ff0000')
    expect(emitted(wrapper)).toBe('rgb(255 0 0)')
  })

  it('narrows the switcher without pinning it', () => {
    const wrapper = mountPicker({ formats: ['hex', 'rgb'] })
    const options = wrapper.findAll('select[aria-label="Colour format"] option')
    expect(options.map((o) => o.attributes('value'))).toEqual(['hex', 'rgb'])
  })

  describe('alpha', () => {
    it('is off by default, and cannot leak a transparent value out', async () => {
      const wrapper = mountPicker({ modelValue: '#5f63e880' })
      expect(wrapper.find('[aria-label="Opacity"]').exists()).toBe(false)

      await typeColor(wrapper, 'rgb(255 0 0 / 0.2)')
      expect(emitted(wrapper)).toBe('rgb(255 0 0)')
    })

    it('shows the opacity track and keeps alpha when enabled', async () => {
      const wrapper = mountPicker({ modelValue: '#5f63e880', alpha: true })
      const track = wrapper.find('[aria-label="Opacity"]')
      expect(track.exists()).toBe(true)
      expect(track.attributes('aria-valuenow')).toBe('50')
    })

    it('drops transparency if alpha is switched off after the fact', async () => {
      const wrapper = mountPicker({ modelValue: '#5f63e880', alpha: true })
      await wrapper.setProps({ alpha: false })
      expect(emitted(wrapper)).toBe('#5f63e8')
    })
  })

  describe('keyboard', () => {
    it('moves the hue with the arrow keys', async () => {
      const wrapper = mountPicker({ modelValue: '#ff0000' })
      const hue = wrapper.find('[aria-label="Hue"]')
      expect(hue.attributes('aria-valuenow')).toBe('0')

      await hue.trigger('keydown', { key: 'ArrowRight' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('4')

      // Shift takes the bigger step, which is the usual slider convention.
      await hue.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('40')
    })

    it('jumps to the ends with Home and End', async () => {
      const wrapper = mountPicker({ modelValue: '#00ff00' })
      const hue = wrapper.find('[aria-label="Hue"]')
      await hue.trigger('keydown', { key: 'End' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('360')
      await hue.trigger('keydown', { key: 'Home' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('0')
    })

    it('ignores keys it does not handle', async () => {
      const wrapper = mountPicker()
      await wrapper.find('[aria-label="Hue"]').trigger('keydown', { key: 'a' })
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    it('moves saturation and brightness across the square', async () => {
      const wrapper = mountPicker({ modelValue: '#808080' })
      const area = wrapper.find('[aria-label^="Saturation and brightness"]')
      await area.trigger('keydown', { key: 'ArrowRight' })
      // Grey has no saturation, so one step right is the first colour it has
      // had — and the hue it uses must be the one already on the wheel, not a
      // hue re-derived from a colour that never had one.
      expect(emitted(wrapper)).not.toBe('#808080')
    })
  })

  describe('hue preservation', () => {
    it('keeps the hue when the colour drops to black', async () => {
      // Dragging to the bottom of the square and back up must not come back at
      // red, having thrown away the hue being worked on.
      const wrapper = mountPicker({ modelValue: '#00a2ff' })
      const before = wrapper
        .find('[aria-label="Hue"]')
        .attributes('aria-valuenow')

      await wrapper.setProps({ modelValue: '#000000' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe(before)
    })

    it('keeps the hue when the colour drops to grey', async () => {
      const wrapper = mountPicker({ modelValue: '#00a2ff' })
      const before = wrapper
        .find('[aria-label="Hue"]')
        .attributes('aria-valuenow')

      await wrapper.setProps({ modelValue: '#888888' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe(before)
    })

    it('takes the hue from a colour that actually has one', async () => {
      const wrapper = mountPicker({ modelValue: '#808080' })
      await wrapper.setProps({ modelValue: '#ff0000' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('0')
      await wrapper.setProps({ modelValue: '#00ff00' })
      expect(
        wrapper.find('[aria-label="Hue"]').attributes('aria-valuenow')
      ).toBe('120')
    })
  })

  describe('swatches', () => {
    it('applies a swatch when clicked', async () => {
      const wrapper = mountPicker({ swatches: ['#0b7a4b', '#be123c'] })
      const buttons = wrapper.findAll('button[aria-label="#0b7a4b"]')
      expect(buttons).toHaveLength(1)
      await buttons[0].trigger('click')
      expect(emitted(wrapper)).toBe('#0b7a4b')
    })

    it('renders nothing when there are none', () => {
      const wrapper = mountPicker()
      expect(wrapper.find('button[aria-label^="#"]').exists()).toBe(false)
    })
  })

  it('hides the text row entirely with hideInput', () => {
    const wrapper = mountPicker({ hideInput: true })
    expect(textField(wrapper).exists()).toBe(false)
  })

  it('does not respond to the keyboard when disabled', async () => {
    const wrapper = mountPicker({ disabled: true })
    await wrapper.find('[aria-label="Hue"]').trigger('keydown', {
      key: 'ArrowRight'
    })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
