import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Popover } from './index'

const settle = async () => {
  await nextTick()
  await nextTick()
}

const mountPopover = (props: Record<string, unknown>) =>
  mount(Popover, {
    props: { visible: true, ...props },
    slots: {
      trigger: '<button id="open">Open</button>',
      default: `<template #default="{ sheet }">
        <div id="body" :data-sheet="sheet"><button id="ok">OK</button></div>
      </template>`
    },
    global: { stubs: { transition: false } },
    attachTo: document.body
  })

/** The sheet, when it is shown — `v-show` keeps a closed one in the DOM. */
const sheet = () => {
  const el = document.querySelector<HTMLElement>('[data-popover-sheet]')
  return el && el.style.display !== 'none' ? el : null
}
const scrim = () =>
  sheet()?.previousElementSibling as HTMLElement | null | undefined

afterEach(() => {
  document.body.replaceChildren()
})

describe('Popover sheet', () => {
  it('shows the content in a bottom sheet when forced', async () => {
    const wrapper = mountPopover({ sheet: true })
    await settle()
    expect(sheet()).not.toBeNull()
    expect(sheet()!.getAttribute('aria-modal')).toBe('true')
    expect(sheet()!.querySelector('#body')).not.toBeNull()
    // The slot is told, so content that dresses itself can undress.
    expect(document.getElementById('body')!.dataset.sheet).toBe('true')
    // Nothing is anchored: the reka content is not rendered at all.
    expect(wrapper.findComponent({ name: 'PopoverContent' }).exists()).toBe(
      false
    )
    wrapper.unmount()
  })

  it('stays an anchored panel by default', async () => {
    const wrapper = mountPopover({})
    await settle()
    expect(sheet()).toBeNull()
    expect(wrapper.findComponent({ name: 'PopoverContent' }).exists()).toBe(
      true
    )
    expect(document.getElementById('body')!.dataset.sheet).toBe('false')
    wrapper.unmount()
  })

  it("follows the viewport for 'mobile'", async () => {
    // jsdom's matchMedia never matches, so this is the desktop case.
    const desktop = mountPopover({ sheet: 'mobile' })
    await settle()
    expect(sheet()).toBeNull()
    desktop.unmount()

    // jsdom has no matchMedia at all, so stand one in that matches the
    // phone width.
    const original = window.matchMedia
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('max-width'),
        media: query,
        addEventListener() {},
        removeEventListener() {}
      }) as unknown as MediaQueryList) as typeof window.matchMedia
    const phone = mountPopover({ sheet: 'mobile' })
    await settle()
    expect(sheet()).not.toBeNull()
    phone.unmount()
    window.matchMedia = original
  })

  it('takes focus, locks the page and closes from the scrim or Escape', async () => {
    const wrapper = mountPopover({ sheet: true, autoHide: true })
    await settle()
    expect(document.activeElement).toBe(sheet())
    expect(document.body.style.overflow).toBe('hidden')

    scrim()!.click()
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])

    await wrapper.setProps({ visible: true })
    await settle()
    sheet()!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
    )
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])
    wrapper.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('leaves the sheet open on the scrim without autoHide', async () => {
    const wrapper = mountPopover({ sheet: true })
    await settle()
    scrim()!.click()
    expect(wrapper.emitted('update:visible') ?? []).not.toContainEqual([false])
    wrapper.unmount()
  })

  it('keeps Tab inside the sheet', async () => {
    const wrapper = mountPopover({ sheet: true })
    await settle()
    const ok = document.getElementById('ok')!
    ok.focus()
    sheet()!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      })
    )
    // The only stop wraps round to itself rather than out to the page.
    expect(document.activeElement).toBe(ok)
    wrapper.unmount()
  })
})
