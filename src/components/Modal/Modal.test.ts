import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { alertModal, confirmModal } from './index'
import { teardownHost } from './host'
import { modals } from './manager'
import ModalHost from './ModalHost.vue'

const settle = async () => {
  await nextTick()
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 0))
}

// The leave transition resolves on a rAF tick, so teardown lands a frame or
// two after the click rather than on the next microtask.
const waitFor = async (predicate: () => boolean) => {
  for (let attempt = 0; attempt < 50 && !predicate(); attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

const hosts = () => document.querySelectorAll('.octans-modal-host').length
const dialogs = () =>
  document.querySelectorAll('[class*="dialog_"][tabindex]').length
// Only the sheet itself — the transition classes carry the same prefix.
const backdrops = () =>
  [...document.querySelectorAll('div')].filter((el) =>
    [...el.classList].some((name) => /^_?backdrop_/.test(name))
  ).length

const clickButton = async (label: string) => {
  const button = [...document.querySelectorAll('button')].find(
    (el) => el.textContent?.trim() === label
  )
  if (!button) {
    throw new Error(
      `No button labelled "${label}". Present: ${[
        ...document.querySelectorAll('button')
      ]
        .map((el) => el.textContent?.trim())
        .join(', ')}`
    )
  }
  button.click()
  await settle()
}

const pressEscape = async () => {
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
  )
  await settle()
}

afterEach(async () => {
  for (const entry of [...modals.entries]) modals.remove(entry.id)
  teardownHost()
  await nextTick()
  document.body.replaceChildren()
})

describe('imperative modal API', () => {
  // Regression: every modal used to render into `document.body`, so opening a
  // second one patched over the first — it vanished from the page and its
  // promise never settled, hanging any `await` on it forever.
  it('keeps concurrent modals independent', async () => {
    const first = confirmModal({
      title: 'FIRST',
      primaryActionLabel: 'YES-A',
      secondaryActionLabel: 'NO-A'
    })
    await settle()

    const second = confirmModal({
      title: 'SECOND',
      primaryActionLabel: 'YES-B',
      secondaryActionLabel: 'NO-B'
    })
    await settle()

    expect(document.body.textContent).toContain('FIRST')
    expect(document.body.textContent).toContain('SECOND')

    // Answer the second, then the first — each promise gets its own result.
    await clickButton('NO-B')
    expect(await second).toBe(false)
    expect(document.body.textContent).toContain('FIRST')

    await clickButton('YES-A')
    expect(await first).toBe(true)
  })

  it('mounts one host, however many modals are open', async () => {
    expect(hosts()).toBe(0)

    const first = confirmModal({ title: 'ONE', primaryActionLabel: 'OK-1' })
    const second = confirmModal({ title: 'TWO', primaryActionLabel: 'OK-2' })
    await settle()

    expect(hosts()).toBe(1)
    expect(dialogs()).toBe(2)

    await clickButton('OK-2')
    await clickButton('OK-1')
    await Promise.all([first, second])
    await waitFor(() => modals.entries.length === 0)

    // The host stays — it is the page's, not any one modal's — but nothing is
    // left in it.
    expect(modals.entries).toHaveLength(0)
    expect(dialogs()).toBe(0)
  })

  // Each modal used to draw its own backdrop at 0.32 opacity, so two of them
  // compounded to roughly 0.54 and the page darkened per modal.
  it('draws one backdrop for the whole stack', async () => {
    confirmModal({ title: 'ONE', primaryActionLabel: 'OK-1' })
    await settle()
    expect(backdrops()).toBe(1)

    confirmModal({ title: 'TWO', primaryActionLabel: 'OK-2' })
    confirmModal({ title: 'THREE', primaryActionLabel: 'OK-3' })
    await settle()

    expect(dialogs()).toBe(3)
    expect(backdrops()).toBe(1)
  })

  it('stacks each modal above and below the one before it', async () => {
    alertModal({ title: 'BOTTOM' })
    alertModal({ title: 'TOP' })
    await settle()

    const styles = [
      ...document.querySelectorAll<HTMLElement>('[class*="dialog_"][tabindex]')
    ].map((el) => el.style.zIndex)

    expect(styles).toEqual(['2001', '2002'])
  })

  // Every modal used to add its own window-level ESC listener, so one Escape
  // press closed all of them at once.
  it('closes only the top modal on Escape', async () => {
    const first = confirmModal({
      title: 'FIRST',
      primaryActionLabel: 'YES-A',
      secondaryActionLabel: 'NO-A'
    })
    const second = confirmModal({
      title: 'SECOND',
      primaryActionLabel: 'YES-B',
      secondaryActionLabel: 'NO-B'
    })
    await settle()

    await pressEscape()

    // A confirm closed by ESC cancels, so it resolves false rather than
    // undefined — the host asks the modal to close rather than deciding for it.
    expect(await second).toBe(false)
    expect(document.body.textContent).toContain('FIRST')

    await waitFor(() => modals.entries.length === 1)
    expect(modals.entries).toHaveLength(1)

    await pressEscape()
    expect(await first).toBe(false)
  })

  it('returns focus to the modal underneath when one closes', async () => {
    alertModal({ title: 'BOTTOM' })
    await settle()
    alertModal({ title: 'TOP', primaryActionLabel: 'CLOSE-TOP' })
    await settle()

    await clickButton('CLOSE-TOP')
    await waitFor(() => modals.entries.length === 1)
    await settle()

    const focused = document.activeElement as HTMLElement
    expect(focused.getAttribute('tabindex')).toBe('-1')
    expect(focused.textContent).toContain('BOTTOM')
  })

  it('renders through a <ModalHost> the consumer mounted', async () => {
    const host = mount(ModalHost, { attachTo: document.body })
    await settle()

    alertModal({ title: 'THEIR-HOST' })
    await settle()

    // No auto-mounted host: the consumer's is the one with their app context.
    expect(hosts()).toBe(0)
    expect(dialogs()).toBe(1)
    expect(document.body.textContent).toContain('THEIR-HOST')

    host.unmount()
  })

  it('retires its own host when one is mounted later, keeping the modals', async () => {
    alertModal({ title: 'SURVIVOR' })
    await settle()
    expect(hosts()).toBe(1)

    const host = mount(ModalHost, { attachTo: document.body })
    await settle()

    expect(hosts()).toBe(0)
    // Drawn once, by the consumer's host — and it outlived the swap because the
    // entry never belonged to a host in the first place.
    expect(dialogs()).toBe(1)
    expect(document.body.textContent).toContain('SURVIVOR')

    host.unmount()
  })
})
