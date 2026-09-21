import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import DatePicker from './DatePicker.vue'

const settle = async () => {
  await nextTick()
  await nextTick()
}

const mountPicker = (props: Record<string, unknown> = {}) =>
  mount(DatePicker, {
    props: { modelValue: '2024-05-06 00:00:00', autoOpen: true, ...props },
    global: { stubs: { transition: false } },
    attachTo: document.body
  })

afterEach(() => {
  document.body.replaceChildren()
})

/** The sheet, when it is shown — `v-show` keeps a closed one in the DOM. */
const sheet = () => {
  const el = document.querySelector<HTMLElement>('[data-popover-sheet]')
  return el && el.style.display !== 'none' ? el : null
}

describe('DatePicker on a phone', () => {
  it('opens the calendar in a sheet on tap, without the keyboard', async () => {
    const wrapper = mountPicker({ sheet: true })
    const input = wrapper.find('input')
    expect(input.attributes('inputmode')).toBe('none')

    // Focus alone does not open it: focus comes back to the field when the
    // sheet closes, and opening on it again would reopen the sheet.
    await input.trigger('focus')
    await settle()
    expect(sheet()).toBeNull()

    await input.trigger('click')
    await settle()
    expect(sheet()).not.toBeNull()
    expect(sheet()!.textContent).toContain('May 2024')
    wrapper.unmount()
  })

  it('stays an anchored panel on a desktop viewport by default', async () => {
    const wrapper = mountPicker()
    const input = wrapper.find('input')
    expect(input.attributes('inputmode')).toBeUndefined()

    await input.trigger('focus')
    await settle()
    expect(sheet()).toBeNull()
    expect(wrapper.findComponent({ name: 'PopoverContent' }).exists()).toBe(
      true
    )
    wrapper.unmount()
  })
})
