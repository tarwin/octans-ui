import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setDateFormat } from '@/utils'
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
  setDateFormat(undefined)
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

describe('DatePicker date format', () => {
  const field = (props: Record<string, unknown> = {}) =>
    mountPicker({
      modelValue: '2024-05-06',
      modelFormat: 'YYYY-MM-DD',
      type: 'date',
      autoOpen: false,
      ...props
    })
  const shown = (wrapper: ReturnType<typeof mountPicker>) =>
    (wrapper.find('input').element as HTMLInputElement).value

  it('uses the locale until told otherwise', () => {
    expect(shown(field())).toBe('05/06/2024')
  })

  it('follows setDateFormat, including a field already on screen', async () => {
    const wrapper = field()
    setDateFormat('DD/MM/YYYY')
    await settle()
    expect(shown(wrapper)).toBe('06/05/2024')
    setDateFormat(undefined)
    await settle()
    expect(shown(wrapper)).toBe('05/06/2024')
  })

  it('lets one field override the library-wide format', () => {
    setDateFormat('DD/MM/YYYY')
    expect(shown(field({ dateFormat: 'YYYY-MM-DD' }))).toBe('2024-05-06')
  })

  it('reads typed text in that format', async () => {
    setDateFormat('DD/MM/YYYY')
    const wrapper = field()
    const input = wrapper.find('input')
    await input.setValue('10/11/2024')
    await input.trigger('keydown', { key: 'Enter' })
    await input.trigger('change')
    await settle()
    expect(wrapper.emitted('update:modelValue')!.at(-1)).toEqual(['2024-11-10'])
  })

  it('names the format it wants when typed text is wrong', async () => {
    setDateFormat('D MMM YYYY')
    const wrapper = field()
    await wrapper.find('input').setValue('nonsense')
    await settle()
    expect(wrapper.text()).toContain('please use D MMM YYYY')
    expect(wrapper.text()).not.toContain('undefined')
  })

  it('puts the time after the date on a datetime field', () => {
    setDateFormat('DD/MM/YYYY')
    expect(
      shown(
        field({
          type: 'datetime',
          modelValue: '2024-05-06 13:30:00',
          modelFormat: 'YYYY-MM-DD HH:mm:ss'
        })
      )
    ).toBe('06/05/2024 1:30 PM')
  })

  it('leaves month and year fields alone', () => {
    setDateFormat('DD/MM/YYYY')
    expect(shown(field({ type: 'month' }))).toBe('2024-05')
    expect(shown(field({ type: 'year' }))).toBe('2024')
  })
})
