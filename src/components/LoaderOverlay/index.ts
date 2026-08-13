import { computed } from 'vue'
import { ensureHost } from './host'
import { hideLoader, loaderState, showLoader } from './store'

export { default as LoaderOverlay } from './LoaderOverlay.vue'
export type { LoaderOverlayProps } from './types'

/**
 * The global blocking loader, also exposed as `$ui.loader`. `show()` covers
 * the page with a dimmed overlay and a spinner until `hide()`.
 *
 * Renders in any mounted `<LoaderOverlay>` — `AppFrame` includes one covering
 * its content area — and when none exists, a full-viewport overlay is mounted
 * on first use, so nothing has to be placed in the page for this to work.
 */
export const loader = {
  /** Whether the overlay is currently showing. Reactive. */
  get visible() {
    return loaderState.visible
  },
  show(message?: string) {
    ensureHost()
    showLoader(message)
  },
  hide() {
    hideLoader()
  }
}

/**
 * Composable form of `$ui.loader` — the same shared overlay state, with
 * `visible` as a ref, so destructuring keeps it reactive.
 */
export function useLoader() {
  return {
    /** Whether the overlay is currently showing. */
    visible: computed(() => loaderState.visible),
    show: loader.show,
    hide: loader.hide
  }
}
