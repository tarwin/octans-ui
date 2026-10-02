import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Modal, confirmModal } from '@/components/Modal'
import { teardownHost } from '@/components/Modal/host'
import { modals } from '@/components/Modal/manager'
import { Popover } from '@/components/Popover'
import { Select } from '@/components/Select'
import Sheet from './Sheet.vue'

const settle = async () => {
  await nextTick()
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
}

const waitFor = async (predicate: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !predicate(); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

/** A real key press lands on the focused element and bubbles from there. */
const pressEscape = async (target: Element = document.activeElement!) => {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      bubbles: true,
      cancelable: true
    })
  )
  await settle()
}

const isOpen = (title: string) =>
  [...document.querySelectorAll('[role="dialog"]')].some((el) =>
    el.textContent?.includes(title)
  )

/**
 * Sheets driven the way an app drives them: `visible` is the caller's, and
 * only an `update` from the sheet turns it off.
 */
const mountSheets = (
  titles: string[],
  props: Record<string, unknown> = {},
  slot?: () => unknown
) => {
  const open = ref(titles.map(() => false))
  const events: string[][] = titles.map(() => [])
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        titles.map((title, i) =>
          h(
            Sheet,
            {
              title,
              visible: open.value[i],
              animateInDuration: 0,
              animateOutDuration: 0,
              ...props,
              onUpdate: (v: boolean) => {
                events[i].push(`update:${v}`)
                open.value[i] = v
              },
              onClose: () => events[i].push('close')
            },
            slot
          )
        )
    }),
    { global: { stubs: { transition: false } }, attachTo: document.body }
  )
  const show = async (i: number) => {
    open.value[i] = true
    await settle()
  }
  return { wrapper, open, events, show }
}

afterEach(async () => {
  for (const entry of [...modals.entries]) modals.remove(entry.id)
  teardownHost()
  await nextTick()
  document.body.replaceChildren()
  ;(window as any).uiSheetStack?.splice(0)
})

describe('Sheet Escape', () => {
  it('closes a visible sheet the way the close button does', async () => {
    const { wrapper, events, show } = mountSheets(['ONE'])
    await show(0)
    expect(isOpen('ONE')).toBe(true)

    await pressEscape()
    expect(events[0]).toEqual(['update:false', 'close'])
    expect(isOpen('ONE')).toBe(false)
    wrapper.unmount()
  })

  it('ignores Escape when closeOnEscape is false', async () => {
    const { wrapper, events, show } = mountSheets(['ONE'], {
      closeOnEscape: false
    })
    await show(0)
    await pressEscape()
    expect(events[0]).toEqual([])
    expect(isOpen('ONE')).toBe(true)
    wrapper.unmount()
  })

  it('ignores Escape while loading', async () => {
    const { wrapper, events, show } = mountSheets(['ONE'], { loading: true })
    await show(0)
    await pressEscape()
    expect(events[0]).toEqual([])
    wrapper.unmount()
  })

  it('ignores Escape while hidden', async () => {
    const { wrapper, events } = mountSheets(['ONE'])
    await settle()
    await pressEscape(document.body)
    expect(events[0]).toEqual([])
    wrapper.unmount()
  })

  it('closes one stacked sheet per press, top first', async () => {
    const { wrapper, events, show } = mountSheets(['BOTTOM', 'TOP'])
    await show(0)
    await show(1)

    await pressEscape()
    expect(events[1]).toEqual(['update:false', 'close'])
    expect(events[0]).toEqual([])
    expect(isOpen('BOTTOM')).toBe(true)

    await pressEscape()
    expect(events[0]).toEqual(['update:false', 'close'])
    wrapper.unmount()
  })

  it('still works once focus has left the sheet', async () => {
    const { wrapper, events, show } = mountSheets(['ONE'])
    await show(0)
    ;(document.activeElement as HTMLElement).blur()
    expect(document.activeElement).toBe(document.body)

    await pressEscape(document.body)
    expect(events[0]).toEqual(['update:false', 'close'])
    wrapper.unmount()
  })

  it('gives focus back to the opener', async () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    opener.focus()

    const { wrapper, show } = mountSheets(['ONE'])
    await show(0)
    expect(document.activeElement).not.toBe(opener)

    await pressEscape()
    await waitFor(() => document.activeElement === opener)
    expect(document.activeElement).toBe(opener)
    wrapper.unmount()
  })

  it('lets a modal opened from the sheet take the key', async () => {
    const { wrapper, events, show } = mountSheets(['SHEET'])
    await show(0)

    const answer = confirmModal({ title: 'MODAL', primaryActionLabel: 'OK' })
    await settle()

    await pressEscape()
    expect(await answer).toBe(false)
    expect(events[0]).toEqual([])
    await waitFor(() => modals.entries.length === 0)

    await pressEscape()
    expect(events[0]).toEqual(['update:false', 'close'])
    wrapper.unmount()
  })

  it('lets a template <Modal> over the sheet take the key', async () => {
    const modalOpen = ref(false)
    const { wrapper, events, show } = mountSheets(['SHEET'], {}, () =>
      h(
        Modal,
        {
          title: 'MODAL',
          visible: modalOpen.value,
          onClose: () => (modalOpen.value = false)
        },
        () => 'Body'
      )
    )
    await show(0)
    modalOpen.value = true
    await settle()

    await pressEscape()
    expect(modalOpen.value).toBe(false)
    expect(events[0]).toEqual([])

    // Straight away, while the modal may still be animating out.
    await pressEscape()
    expect(events[0]).toEqual(['update:false', 'close'])
    wrapper.unmount()
  })

  it('lets an open popover inside the sheet take the key', async () => {
    const popoverOpen = ref(true)
    const { wrapper, events, show } = mountSheets(['SHEET'], {}, () =>
      h(
        Popover,
        {
          visible: popoverOpen.value,
          'onUpdate:visible': (v: boolean) => (popoverOpen.value = v)
        },
        {
          trigger: () => h('button', 'Open'),
          default: () => h('button', { id: 'inside' }, 'Inside')
        }
      )
    )
    await show(0)
    await waitFor(() => !!document.querySelector('[data-dismissable-layer]'))
    expect(document.querySelector('[data-dismissable-layer]')).not.toBeNull()

    await pressEscape()
    expect(events[0]).toEqual([])
    expect(isOpen('SHEET')).toBe(true)
    wrapper.unmount()
  })

  it('lets an open select inside the sheet take the key', async () => {
    const { wrapper, events, show } = mountSheets(['SHEET'], {}, () =>
      h(Select, {
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' }
        ],
        teleport: false
      })
    )
    await show(0)
    const control = document.querySelector<HTMLElement>(
      '[role="dialog"] [class*="control"]'
    )!
    control.focus()
    control.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        bubbles: true
      })
    )
    await settle()
    const dropdown = () =>
      document.querySelector('[role="dialog"] [class*="Dropdown"]')
    expect(dropdown()).not.toBeNull()

    await pressEscape(control)
    expect(dropdown()).toBeNull()
    expect(events[0]).toEqual([])

    await pressEscape(control)
    expect(events[0]).toEqual(['update:false', 'close'])
    wrapper.unmount()
  })

  it('stops listening when unmounted while open', async () => {
    const { wrapper, events, show } = mountSheets(['ONE'])
    await show(0)
    wrapper.unmount()
    await pressEscape(document.body)
    expect(events[0]).toEqual([])
  })
})
