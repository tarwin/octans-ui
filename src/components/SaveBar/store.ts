import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  readonly,
  ref
} from 'vue'
import type { SaveBarStateType } from './types'

/**
 * The single store behind `$ui.saveBar`, every mounted `<SaveBar>`, and
 * `useSaveBar()`. It replaces a window-event bus whose `removeEventListener`
 * wrapped the handler in a fresh closure — so removal never removed anything
 * and every unmount leaked its listener.
 */
const state = ref<SaveBarStateType>('unchanged')

const saveHandlers = new Set<() => void>()
const discardHandlers = new Set<() => void>()

export const saveBarState = readonly(state)

/**
 * The save bar's state and actions, also exposed as `$ui.saveBar`.
 *
 * The app owns the state: `setState('changed')` shows the bar, and after a
 * save lands, `setState('unchanged')` hides it — `save()` only announces the
 * click. Subscribe with `onSave`/`onDiscard`, or `useSaveBar()` inside a
 * component, which unsubscribes itself on unmount.
 */
export const saveBar = {
  /** The current state. Reactive — a getter into the shared store. */
  get state() {
    return state.value
  },
  setState(value: SaveBarStateType) {
    state.value = value
  },
  /** Announce a save click to every `onSave` subscriber. The bar's Save
   * button calls this; call it yourself to trigger the same flow. */
  save() {
    for (const handler of [...saveHandlers]) handler()
  },
  /** Announce a discard click to every `onDiscard` subscriber. */
  discard() {
    for (const handler of [...discardHandlers]) handler()
  },
  /** Returns an unsubscribe function. */
  onSave(handler: () => void) {
    saveHandlers.add(handler)
    return () => {
      saveHandlers.delete(handler)
    }
  },
  /** Returns an unsubscribe function. */
  onDiscard(handler: () => void) {
    discardHandlers.add(handler)
    return () => {
      discardHandlers.delete(handler)
    }
  }
}

export interface UseSaveBarOptionsType {
  /** Called when the user clicks Save. */
  onSave?: () => void
  /** Called when the user confirms a discard. */
  onDiscard?: () => void
}

/**
 * Composable form of `$ui.saveBar`, with the state as a ref so destructuring
 * keeps it reactive. Handlers passed here are unsubscribed automatically when
 * the calling component unmounts.
 *
 * ```ts
 * const { setState } = useSaveBar({
 *   onSave: async () => {
 *     setState('saving')
 *     await save()
 *     setState('unchanged')
 *   },
 *   onDiscard: () => reset()
 * })
 * watch(dirty, (d) => setState(d ? 'changed' : 'unchanged'))
 * ```
 */
export function useSaveBar(options: UseSaveBarOptionsType = {}) {
  const offs: Array<() => void> = []
  if (options.onSave) offs.push(saveBar.onSave(options.onSave))
  if (options.onDiscard) offs.push(saveBar.onDiscard(options.onDiscard))
  if (offs.length && getCurrentInstance()) {
    onBeforeUnmount(() => {
      for (const off of offs) off()
    })
  }
  return {
    /** The current state. */
    state: computed(() => state.value),
    setState: saveBar.setState,
    save: saveBar.save,
    discard: saveBar.discard,
    onSave: saveBar.onSave,
    onDiscard: saveBar.onDiscard
  }
}
