import { reactive } from 'vue'
import type {
  ToastManagerConfig,
  ToastManagerItemType,
  ToastTone
} from './types'

export const TONE_ICONS: Record<ToastTone, string> = {
  success: 'mdi:check-circle-outline',
  warning: 'mdi:alert-outline',
  error: 'mdi:close-circle-outline',
  info: 'mdi:information-outline'
}

interface TimerState {
  handle: ReturnType<typeof setTimeout>
  startedAt: number
  remaining: number
}

export class Manager {
  nextId: number
  items: ToastManagerItemType[]
  /** `toast.configure()` defaults. A mounted host falls back to its own props
   * for anything not set here. */
  config: ToastManagerConfig
  timers: Map<number, TimerState>
  /** How many `<ToastManager>`s are currently rendering these items. */
  hosts: number
  private hostWatchers: Set<() => void>

  constructor() {
    this.nextId = 0
    // Reactive here rather than in the component: the singleton below is what
    // `toast()` writes to, and it has to stay reactive whether or not anything
    // is mounted. `timers` stays a plain Map deliberately — nothing renders
    // from it, so there is no reason to pay for proxying it.
    this.items = reactive([]) as ToastManagerItemType[]
    this.config = reactive({})
    this.timers = new Map()
    this.hosts = 0
    this.hostWatchers = new Set()
  }

  addItem(data: Partial<ToastManagerItemType>): ToastManagerItemType {
    // The item must be made reactive here so that the object we return is
    // the same object the template renders from — mutations on the returned
    // toast instance (progress, loading, content, ...) must trigger updates.
    // In vue2 pushing into an observed array made `item` itself reactive,
    // in vue3 the raw object would stay inert.
    const item: ToastManagerItemType = reactive({
      title: '',
      loading: false,
      duration: 4500,
      ...data,
      _id: this.nextId++,
      remove: () => this.removeItem(item)
    })
    if (item.tone && !item.icon) {
      item.icon = TONE_ICONS[item.tone]
    }
    // Remove the default `duration` if the user has not explicitly defined a
    // duration and is using the `progress` or `loading` features.
    if (
      !data.duration &&
      (typeof item.progress === 'number' ||
        item.loading ||
        (Array.isArray(item.actions) && item.actions.length))
    ) {
      item.duration = 0
    }
    if (item.duration) {
      this.startTimer(item, item.duration)
    }
    this.items.push(item)
    return item
  }

  startTimer(item: ToastManagerItemType, duration?: number) {
    this.clearTimer(item)
    const ms = duration ?? (item.duration || 4500)
    this.timers.set(item._id, {
      handle: setTimeout(() => this.removeItem(item), ms),
      startedAt: Date.now(),
      remaining: ms
    })
  }

  // Hovering a toast pauses its auto-hide so the user can finish reading;
  // the timer resumes with the remaining time on mouse leave.
  pauseTimer(item: ToastManagerItemType) {
    const timer = this.timers.get(item._id)
    if (timer) {
      clearTimeout(timer.handle)
      timer.remaining -= Date.now() - timer.startedAt
    }
  }

  resumeTimer(item: ToastManagerItemType) {
    const timer = this.timers.get(item._id)
    if (timer) {
      if (timer.remaining > 0) {
        timer.startedAt = Date.now()
        timer.handle = setTimeout(() => this.removeItem(item), timer.remaining)
      } else {
        this.removeItem(item)
      }
    }
  }

  clearTimer(item: ToastManagerItemType) {
    const timer = this.timers.get(item._id)
    if (timer) {
      clearTimeout(timer.handle)
      this.timers.delete(item._id)
    }
  }

  removeItem(item: ToastManagerItemType) {
    this.clearTimer(item)
    const index = this.items.indexOf(item)
    if (index >= 0) {
      this.items.splice(index, 1)
    }
  }

  clearAll() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer.handle)
    }
    this.timers.clear()
    // Emptied in place, not reassigned: every mounted host renders from this
    // exact array, so swapping it would leave them all drawing the old one.
    this.items.splice(0)
  }

  configure(config: ToastManagerConfig) {
    Object.assign(this.config, config)
  }

  addHost() {
    this.hosts++
    for (const watcher of this.hostWatchers) watcher()
  }

  removeHost() {
    this.hosts = Math.max(0, this.hosts - 1)
  }

  /** Notified whenever a host mounts. Used by `ensureHost()` to retire its own
   * auto-mounted host once the consumer supplies one. */
  watchHosts(fn: () => void) {
    this.hostWatchers.add(fn)
    return () => {
      this.hostWatchers.delete(fn)
    }
  }
}

/**
 * The single store every `toast()` call writes to, and every mounted
 * `<ToastManager>` reads from.
 *
 * State lives here rather than inside the component on purpose. It used to be
 * the other way round, which meant `toast()` had to find a component instance
 * by DOM id, read Vue's private `_vnode` off the element and call through
 * `component.exposed` — and a `<ToastManager>` in the consumer's own tree was
 * invisible to it, so their props were silently ignored in favour of a second,
 * auto-mounted manager.
 */
export const manager = new Manager()
