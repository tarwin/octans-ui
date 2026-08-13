import { createApp, type App } from 'vue'
import ToastManager from './ToastManager.vue'
import { manager } from './manager'

let app: App | null = null
let container: HTMLElement | null = null

/**
 * Removes the auto-mounted host. `app.unmount()` is a real teardown — leave
 * transitions are skipped but every `onUnmounted` runs — so nothing is left
 * behind on the page or in memory.
 */
export function teardownHost() {
  app?.unmount()
  container?.remove()
  app = null
  container = null
}

// A `<ToastManager>` in the consumer's own tree renders the same items as the
// auto-mounted one, so keeping both would draw every toast twice. Theirs wins:
// it is the one that can take props. Deferred to a microtask so the unmount
// does not run inside the other component's mount flush.
manager.watchHosts(() => {
  if (app && manager.hosts > 1) queueMicrotask(teardownHost)
})

/**
 * Mounts the default host the first time a toast is shown.
 *
 * Does nothing if the consumer already has a `<ToastManager>` of their own, and
 * nothing at all without a DOM — `toast()` under SSR still records the item, it
 * just has nowhere to draw it until the client takes over.
 */
export function ensureHost() {
  if (typeof document === 'undefined') return
  if (app || manager.hosts > 0) return
  container = document.createElement('div')
  // Cosmetic now. It used to be the lookup key for the whole API.
  container.id = 'uiToastManager'
  document.body.appendChild(container)
  app = createApp(ToastManager)
  app.mount(container)
}
