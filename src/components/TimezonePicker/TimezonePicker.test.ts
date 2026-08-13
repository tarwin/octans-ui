import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { TimezonePicker } from './index'
import { UiProvider } from '@/components/UiProvider'

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(TimezonePicker, {
    props,
    global: { components: { UiProvider } },
    attachTo: document.body
  })
}

/** The clickable NavField surface. */
function field(wrapper: ReturnType<typeof mountPicker>) {
  return wrapper
    .findAll('div')
    .find((d) => /NavField/.test(d.classes().join(' ')))!
}

describe('TimezonePicker', () => {
  it('renders a resolved name and offset for the bound value', async () => {
    const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
    await flushPromises()
    const text = wrapper.text()
    expect(text).toContain('Sydney, Australia')
    // Name comes from Intl, not a bundled table.
    expect(text).toMatch(/Australian Eastern Time|GMT\+1[01]/)
    wrapper.unmount()
  })

  it('opens on the FIRST click', async () => {
    // Regression guard: an earlier version kicked off an async country load
    // inside open(), and the modal did not appear until a second click.
    const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
    await flushPromises()
    await field(wrapper).trigger('click')
    await nextTick()
    expect(wrapper.findComponent({ name: 'Modal' }).props('visible')).toBe(true)
    wrapper.unmount()
  })

  it('opens on the first click with groupByCountry, despite the async load', async () => {
    const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
    await flushPromises()
    await field(wrapper).trigger('click')
    await nextTick()
    expect(wrapper.findComponent({ name: 'Modal' }).props('visible')).toBe(true)

    // …and STAYS open once the country list resolves. The country <Select>
    // mounts late, and an earlier version had that late mount close the modal
    // again — which looked exactly like "the first click does nothing".
    await flushPromises()
    await nextTick()
    expect(wrapper.findComponent({ name: 'Modal' }).props('visible')).toBe(true)
    wrapper.unmount()
  })

  it('resolves the country for the bound zone when grouping', async () => {
    const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
    await flushPromises()
    await field(wrapper).trigger('click')
    await flushPromises()
    // The Location select should have picked AU from the lazy-loaded map.
    const selects = wrapper.findAllComponents({ name: 'Select' })
    expect(selects.length).toBe(2)
    expect(selects[0].props('modelValue')).toBe('AU')
    wrapper.unmount()
  })

  it('shows the Location field by default', async () => {
    // Two-step country → timezone is the default flow: it turns ~420 zones
    // into a country's handful.
    const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
    await flushPromises()
    await field(wrapper).trigger('click')
    await flushPromises()
    expect(wrapper.findAllComponents({ name: 'Select' }).length).toBe(2)
    wrapper.unmount()
  })

  it('drops to a single searchable list with groupByCountry: false', async () => {
    const wrapper = mountPicker({
      modelValue: 'Australia/Sydney',
      groupByCountry: false
    })
    await flushPromises()
    await field(wrapper).trigger('click')
    await flushPromises()
    const selects = wrapper.findAllComponents({ name: 'Select' })
    expect(selects.length).toBe(1)
    // …and that one list covers every zone, not just one country's.
    expect(selects[0].props('options').length).toBeGreaterThan(100)
    wrapper.unmount()
  })

  it('emits a guess on mount only when `guess` is set', async () => {
    const without = mountPicker({})
    await flushPromises()
    expect(without.emitted('update:modelValue')).toBeUndefined()
    without.unmount()

    const withGuess = mountPicker({ guess: true })
    await flushPromises()
    const emitted = withGuess.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(typeof emitted![0][0]).toBe('string')
    withGuess.unmount()
  })

  it('does not open when disabled or readonly', async () => {
    for (const props of [{ disabled: true }, { readonly: true }]) {
      const wrapper = mountPicker({ modelValue: 'Australia/Sydney', ...props })
      await flushPromises()
      await field(wrapper).trigger('click')
      await nextTick()
      expect(wrapper.findComponent({ name: 'Modal' }).props('visible')).toBe(
        false
      )
      wrapper.unmount()
    }
  })

  describe('inline mode', () => {
    it('renders the fields directly, with no summary field or modal', async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true
      })
      await flushPromises()
      expect(wrapper.findComponent({ name: 'Modal' }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: 'NavField' }).exists()).toBe(false)
      expect(wrapper.findAllComponents({ name: 'Select' }).length).toBe(2)
      wrapper.unmount()
    })

    it('emits immediately on selection — there is no Update step', async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true
      })
      await flushPromises()
      const zoneSelect = wrapper.findAllComponents({ name: 'Select' })[1]
      zoneSelect.vm.$emit('update:modelValue', 'Australia/Perth')
      await nextTick()
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([
        'Australia/Perth'
      ])
      wrapper.unmount()
    })

    it("emits when the country changes, moving to that country's first zone", async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true
      })
      await flushPromises()
      const countrySelect = wrapper.findAllComponents({ name: 'Select' })[0]
      countrySelect.vm.$emit('update:modelValue', 'FR')
      await nextTick()
      const emitted = wrapper.emitted('update:modelValue')?.at(-1)?.[0]
      expect(emitted).toMatch(/^Europe\//)
      wrapper.unmount()
    })

    it('does NOT emit on selection in modal mode until Update is pressed', async () => {
      // The modal keeps its draft semantics — this is the difference that
      // makes inline mode worth having as a separate flag.
      const wrapper = mountPicker({ modelValue: 'Australia/Sydney' })
      await flushPromises()
      await field(wrapper).trigger('click')
      await flushPromises()
      const zoneSelect = wrapper.findAllComponents({ name: 'Select' })[1]
      zoneSelect.vm.$emit('update:modelValue', 'Australia/Perth')
      await nextTick()
      expect(wrapper.emitted('update:modelValue')).toBeUndefined()
      wrapper.unmount()
    })

    it('renders a single field when grouping is off', async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true,
        groupByCountry: false
      })
      await flushPromises()
      expect(wrapper.findAllComponents({ name: 'Select' }).length).toBe(1)
      wrapper.unmount()
    })

    it('passes disabled through to the fields', async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true,
        disabled: true
      })
      await flushPromises()
      for (const select of wrapper.findAllComponents({ name: 'Select' })) {
        expect(select.props('disabled')).toBe(true)
      }
      wrapper.unmount()
    })

    it('tracks external changes to modelValue', async () => {
      const wrapper = mountPicker({
        modelValue: 'Australia/Sydney',
        inline: true
      })
      await flushPromises()
      await wrapper.setProps({ modelValue: 'Europe/Paris' })
      await flushPromises()
      const zoneSelect = wrapper.findAllComponents({ name: 'Select' })[1]
      expect(zoneSelect.props('modelValue')).toBe('Europe/Paris')
      wrapper.unmount()
    })
  })
})
