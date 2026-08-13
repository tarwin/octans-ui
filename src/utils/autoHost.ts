import { createApp, type App, type Component } from 'vue'

/**
 * The bookkeeping behind "works with nothing mounted": counts how many outlet
 * components are currently rendering a piece of global UI, so the auto-mounted
 * fallback host knows when it is needed and when to stand down. The pattern
 * comes from `ToastManager` — see the comments in its `host.ts`.
 */
export interface HostRegistryType {
  readonly count: number
  add(): void
  remove(): void
  /** Notified whenever an outlet mounts. Returns an unsubscribe function. */
  watch(fn: () => void): () => void
}

export function createHostRegistry(): HostRegistryType {
  let count = 0
  const watchers = new Set<() => void>()
  return {
    get count() {
      return count
    },
    add() {
      count++
      for (const watcher of watchers) watcher()
    },
    remove() {
      count = Math.max(0, count - 1)
    },
    watch(fn) {
      watchers.add(fn)
      return () => {
        watchers.delete(fn)
      }
    }
  }
}

/**
 * An auto-mounted host for one outlet component. `ensure()` mounts it on first
 * use so the imperative API works with nothing placed in the page; an outlet
 * the consumer mounts themselves takes over, and the auto host retires.
 *
 * `app.unmount()` is a real teardown — every `onUnmounted` runs — so nothing
 * is left behind on the page or in memory.
 */
export function createAutoHost(
  registry: HostRegistryType,
  id: string,
  component: Component,
  props?: Record<string, unknown>
) {
  let app: App | null = null
  let container: HTMLElement | null = null

  function teardown() {
    app?.unmount()
    container?.remove()
    app = null
    container = null
  }

  // The auto host's own outlet counts too, so "someone else is rendering this"
  // is `count > 1`. Deferred to a microtask so the unmount does not run inside
  // the other component's mount flush.
  registry.watch(() => {
    if (app && registry.count > 1) {
      queueMicrotask(() => {
        if (app && registry.count > 1) teardown()
      })
    }
  })

  function ensure() {
    if (typeof document === 'undefined') return
    if (app || registry.count > 0) return
    container = document.createElement('div')
    container.id = id
    document.body.appendChild(container)
    app = createApp(component, props)
    app.mount(container)
  }

  return { ensure, teardown }
}
