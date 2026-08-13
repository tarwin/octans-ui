import { createApp, type App } from 'vue'
import ModalHost from './ModalHost.vue'
import { modals } from './manager'

let app: App | null = null
let container: HTMLElement | null = null

export function teardownHost() {
  app?.unmount()
  container?.remove()
  app = null
  container = null
}

// A `<ModalHost>` in the consumer's own tree renders the same entries as the
// auto-mounted one, so keeping both would draw every modal twice. Theirs wins:
// it is the one inside their app, with their plugins and provides. Deferred to
// a microtask so the unmount does not run inside their mount flush.
modals.watchHosts(() => {
  if (app && modals.hosts > 1) queueMicrotask(teardownHost)
})

export function ensureHost() {
  if (typeof document === 'undefined') return
  if (app || modals.hosts > 0) return
  container = document.createElement('div')
  container.className = 'octans-modal-host'
  document.body.appendChild(container)
  app = createApp(ModalHost)
  app.mount(container)
}
