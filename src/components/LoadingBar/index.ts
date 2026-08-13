import { computed } from 'vue'
import { ensureHost } from './host'
import { doneProgress, loadingBarState, startProgress } from './store'

export { default as LoadingBar } from './LoadingBar.vue'
export type { LoadingBarProps } from './types'

/**
 * The global page-load trickle, also exposed as `$ui.progress`. Call `start()`
 * when a navigation or long fetch begins and `done()` when it lands; the bar
 * creeps toward 99% on its own in between.
 *
 * Renders in any mounted `<LoadingBar>` — `GlobalNav` includes one — and when
 * none exists, a bar fixed to the top of the viewport is mounted on first use,
 * so nothing has to be placed in the page for this to work.
 */
export const progress = {
  /** The current bar position, 0–100. 0 means idle. Reactive — a getter into
   * the shared store, so it works in computeds and templates. */
  get value() {
    return loadingBarState.value
  },
  start() {
    ensureHost()
    startProgress()
  },
  done() {
    doneProgress()
  }
}

/**
 * Composable form of `$ui.progress` — the same shared trickle, with the
 * position as a ref, so destructuring keeps it reactive.
 */
export function useProgress() {
  return {
    /** The current bar position, 0–100. 0 means idle. */
    value: computed(() => loadingBarState.value),
    start: progress.start,
    done: progress.done
  }
}
