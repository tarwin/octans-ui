import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { toast } from './index'
import { teardownHost } from './host'
import { manager } from './manager'
import ToastManager from './ToastManager.vue'

const autoHost = () => document.getElementById('uiToastManager')
// One per stack that has toasts in it, per mounted host — so two of these for
// one toast means it is being drawn twice.
const stacks = () => document.querySelectorAll('[role="status"]').length

const flush = async () => {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

afterEach(() => {
  toast.clearAll()
  teardownHost()
  manager.configure({
    position: undefined,
    offset: undefined,
    contrasting: undefined
  })
  document.body.replaceChildren()
})

describe('toast()', () => {
  it('mounts a host on first use', async () => {
    expect(autoHost()).toBeNull()

    toast({ title: 'AUTO-MOUNTED' })
    await flush()

    expect(autoHost()).not.toBeNull()
    expect(stacks()).toBe(1)
    expect(document.body.textContent).toContain('AUTO-MOUNTED')
  })

  // The state used to live inside the component, reached via a `_vnode` lookup
  // on a DOM id — so a <ToastManager> in the consumer's own tree was invisible
  // to `toast()`, which quietly mounted a second one and ignored their props.
  it('renders through a <ToastManager> the consumer mounted', async () => {
    const host = mount(ToastManager, { attachTo: document.body })
    await flush()

    toast({ title: 'THEIR-HOST' })
    await flush()

    expect(autoHost()).toBeNull()
    expect(stacks()).toBe(1)
    expect(document.body.textContent).toContain('THEIR-HOST')

    host.unmount()
  })

  it('retires its own host when one is mounted later, keeping the toasts', async () => {
    toast({ title: 'SURVIVOR' })
    await flush()
    expect(autoHost()).not.toBeNull()

    const host = mount(ToastManager, { attachTo: document.body })
    await flush()

    expect(autoHost()).toBeNull()
    // Drawn once, by the consumer's host — and it outlived the swap because
    // the item never belonged to a component in the first place.
    expect(stacks()).toBe(1)
    expect(document.body.textContent).toContain('SURVIVOR')

    host.unmount()
  })

  it('clears every toast', async () => {
    toast({ title: 'ONE' })
    toast({ title: 'TWO' })
    await flush()
    expect(manager.items).toHaveLength(2)

    toast.clearAll()
    await flush()

    expect(manager.items).toHaveLength(0)
    expect(stacks()).toBe(0)
  })

  it('configures without mounting anything', () => {
    // `toast.configure()` had to mount a host just to reach the component it
    // stored its config on. It is plain state now, so calling it early — at
    // app startup, say — no longer puts a div in the page.
    toast.configure({ position: 'n' })

    expect(autoHost()).toBeNull()
    expect(manager.config.position).toBe('n')
  })

  it('lets configure() win over the props of a mounted host', async () => {
    toast.configure({ position: 'nw' })
    const host = mount(ToastManager, {
      attachTo: document.body,
      props: { position: 'se' }
    })
    toast({ title: 'POSITIONED' })
    await flush()

    const stack = document.querySelector('[role="status"]')
    expect(stack?.className).toContain('Stack_nw')

    host.unmount()
  })
})
