import ToastManager from './ToastManager.vue'
import { TONE_ICONS, manager } from './manager'
import { ensureHost } from './host'
import type { ToastManagerConfig, ToastManagerItemType } from './types'

/**
 * Shows a toast, and returns it. The returned object is reactive: assigning to
 * `title`, `content`, `progress` or `loading` updates the toast on screen, and
 * `remove()` dismisses it.
 *
 * A host is mounted on first use, so nothing has to be placed in the page for
 * this to work. Render a `<ToastManager>` yourself if you want to control the
 * position with props — `toast()` will use it.
 */
function toast(opts: Partial<ToastManagerItemType>): ToastManagerItemType {
  ensureHost()
  return manager.addItem(opts)
}

toast.clearAll = () => {
  manager.clearAll()
}

/**
 * Sets manager-wide defaults — `position`, `offset` and `contrasting`. These
 * win over the props of a mounted `<ToastManager>`, which is what makes them
 * useful for the auto-mounted host, since that one can't be given props.
 */
toast.configure = (config: ToastManagerConfig) => {
  manager.configure(config)
}

type ToastPromiseState =
  | string
  | Partial<ToastManagerItemType>
  | ((value: any) => string | Partial<ToastManagerItemType>)

function resolveState(
  state: ToastPromiseState | undefined,
  value: any,
  fallbackTitle: string
): Partial<ToastManagerItemType> {
  if (typeof state === 'function') {
    state = state(value)
  }
  if (typeof state === 'string') {
    return { title: state }
  }
  return state || { title: fallbackTitle }
}

/**
 * Shows a loading toast that follows the promise: it morphs into a `success`
 * tone toast when the promise resolves, or a `error` one when it rejects,
 * then auto-hides. Each state accepts a title string, toast props, or a
 * function of the resolved value / rejection reason returning either.
 */
toast.promise = <T>(
  promise: Promise<T>,
  opts: {
    loading: string | Partial<ToastManagerItemType>
    success?: ToastPromiseState
    error?: ToastPromiseState
  }
): ToastManagerItemType => {
  const loading = resolveState(opts.loading, undefined, 'Loading..')
  const item = toast({ loading: true, ...loading })
  const settle = (
    state: Partial<ToastManagerItemType>,
    tone: 'success' | 'error'
  ) => {
    Object.assign(item, {
      loading: false,
      progress: undefined,
      tone,
      icon: TONE_ICONS[tone],
      ...state
    })
    const duration = state.duration ?? 4500
    if (duration) {
      manager.startTimer(item, duration)
    }
  }
  promise.then(
    (value) => settle(resolveState(opts.success, value, 'Done'), 'success'),
    (error) =>
      settle(resolveState(opts.error, error, 'Something went wrong'), 'error')
  )
  return item
}

export { toast, ToastManager }
// `ToastProps` is deliberately absent: it belongs to the internal `Toast.vue`,
// which is not exported, so a consumer has nothing to use it on.
export type {
  ToastItemType,
  ToastManagerItemType,
  ToastManagerConfig,
  ToastActionType,
  ToastPosition,
  ToastTone
} from './types'
