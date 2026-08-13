import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import SaveBar from './SaveBar.vue'
import { saveBar, useSaveBar } from './store'

afterEach(() => {
  saveBar.setState('unchanged')
})

describe('saveBar store', () => {
  it('unsubscribes handlers — the window-event version never could', () => {
    const handler = vi.fn()
    const off = saveBar.onSave(handler)

    saveBar.save()
    expect(handler).toHaveBeenCalledTimes(1)

    off()
    saveBar.save()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('useSaveBar unsubscribes its handlers when the component unmounts', () => {
    const onSave = vi.fn()
    const Host = defineComponent({
      setup() {
        useSaveBar({ onSave })
        return () => null
      }
    })

    const wrapper = mount(Host)
    saveBar.save()
    expect(onSave).toHaveBeenCalledTimes(1)

    wrapper.unmount()
    saveBar.save()
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})

describe('SaveBar', () => {
  it('follows the global state when no state prop is given', async () => {
    const wrapper = mount(SaveBar)
    expect(wrapper.find('button').exists()).toBe(false)

    saveBar.setState('changed')
    await nextTick()
    expect(wrapper.text()).toContain('Unsaved Changes')

    saveBar.setState('unchanged')
    await nextTick()
    expect(wrapper.find('button').exists()).toBe(false)

    wrapper.unmount()
  })

  it('lets the state prop override the global state', async () => {
    const wrapper = mount(SaveBar, { props: { state: 'changed' } })
    expect(wrapper.text()).toContain('Unsaved Changes')

    wrapper.unmount()
  })

  it('announces a save to subscribers and emits', async () => {
    const onSave = vi.fn()
    const off = saveBar.onSave(onSave)
    saveBar.setState('changed')

    const wrapper = mount(SaveBar)
    await nextTick()

    const save = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'))
    await save!.trigger('click')

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('save')).toHaveLength(1)

    off()
    wrapper.unmount()
  })

  it('discards immediately when confirmDiscard is off', async () => {
    const onDiscard = vi.fn()
    const off = saveBar.onDiscard(onDiscard)

    const wrapper = mount(SaveBar, {
      props: { state: 'changed', confirmDiscard: false }
    })
    const discard = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Discard'))
    await discard!.trigger('click')

    expect(onDiscard).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('discard')).toHaveLength(1)

    off()
    wrapper.unmount()
  })

  it('disables both buttons while saving', async () => {
    const wrapper = mount(SaveBar, { props: { state: 'saving' } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      expect(button.attributes('disabled')).toBeDefined()
    }

    wrapper.unmount()
  })
})
