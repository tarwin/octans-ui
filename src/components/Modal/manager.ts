import { markRaw, reactive, type Component, type ComputedRef } from 'vue'
import type * as Api from './api/types'

/**
 * One open modal. `alertModal()` and friends push one of these and hand back a
 * promise; `<ModalHost>` renders whatever is in the array.
 */
export interface ModalEntry {
  id: number
  /** `AlertModal`, `ConfirmModal`, … — always `markRaw`d. */
  component: Component
  opts: Api.ModalOptions
  /** Drives the enter/leave transition. Setting it false starts the close. */
  visible: boolean
  /**
   * Closes this modal the way its own "X" button would — so a confirm resolves
   * `false` rather than `undefined`. Registered by the `<Modal>` inside, since
   * only it knows what closing means for that flavour.
   */
  requestClose?: () => void
  /** Focuses this modal's dialog. Registered by the `<Modal>` inside. */
  focus?: () => void
}

export interface ModalStackContext {
  /** 0 for the first modal open, 1 for one opened on top of it, and so on. */
  depth: ComputedRef<number>
  register: (handlers: { requestClose: () => void; focus: () => void }) => void
}

/** Present when a `<Modal>` is being rendered by a `<ModalHost>`. */
export const MODAL_STACK = Symbol('octans.modalStack')

export class ModalManager {
  nextId: number
  entries: ModalEntry[]
  /** How many `<ModalHost>`s are currently rendering these entries. */
  hosts: number
  private settled: Set<number>
  private resolvers: Map<number, (result?: any) => void>
  private hostWatchers: Set<() => void>

  constructor() {
    this.nextId = 0
    // Reactive here rather than in the host, for the same reason the toast
    // manager is: this is what the imperative API writes to, and it has to stay
    // reactive whether or not a host happens to be mounted.
    this.entries = reactive([]) as ModalEntry[]
    this.hosts = 0
    this.settled = new Set()
    this.resolvers = new Map()
    this.hostWatchers = new Set()
  }

  add(
    component: Component,
    opts: Api.ModalOptions,
    resolve: (result?: any) => void
  ): ModalEntry {
    const entry: ModalEntry = {
      id: this.nextId++,
      // `opts` can hold a VNode as its content, and a component definition in a
      // reactive array is a Vue warning of its own. Neither ever changes, so
      // neither needs proxying.
      component: markRaw(component),
      opts: markRaw(opts),
      visible: false
    }
    this.resolvers.set(entry.id, resolve)
    this.entries.push(entry)
    return this.entries[this.entries.length - 1]
  }

  /** Starts the enter transition. Entries are added hidden. */
  show(id: number) {
    const entry = this.entries.find((candidate) => candidate.id === id)
    if (entry) entry.visible = true
  }

  /** Starts the leave transition. The entry goes when the transition ends. */
  hide(id: number) {
    const entry = this.entries.find((candidate) => candidate.id === id)
    if (entry) entry.visible = false
  }

  /**
   * How a `<Modal>` hands back the two things the host cannot work out for
   * itself: what closing means for this flavour of modal, and how to focus it.
   */
  register(
    id: number,
    handlers: { requestClose: () => void; focus: () => void }
  ) {
    const entry = this.entries.find((candidate) => candidate.id === id)
    if (!entry) return
    entry.requestClose = handlers.requestClose
    entry.focus = handlers.focus
  }

  /**
   * Resolves the promise the API handed back. Called on the action, and again
   * as a backstop when the modal leaves — a modal that goes away without an
   * action still has to settle rather than leave its caller awaiting forever.
   */
  settle(id: number, result?: any) {
    if (this.settled.has(id)) return
    this.settled.add(id)
    this.resolvers.get(id)?.(result)
    this.resolvers.delete(id)
  }

  remove(id: number) {
    const index = this.entries.findIndex((entry) => entry.id === id)
    if (index === -1) return
    this.entries.splice(index, 1)
    this.settled.delete(id)
    this.resolvers.delete(id)
  }

  /**
   * The modal ESC should close and focus should return to — the last one that
   * is not already on its way out.
   */
  get top(): ModalEntry | undefined {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      if (this.entries[i].visible) return this.entries[i]
    }
    return undefined
  }

  addHost() {
    this.hosts++
    for (const watcher of this.hostWatchers) watcher()
  }

  removeHost() {
    this.hosts = Math.max(0, this.hosts - 1)
  }

  watchHosts(fn: () => void) {
    this.hostWatchers.add(fn)
    return () => {
      this.hostWatchers.delete(fn)
    }
  }
}

/**
 * The open modals, shared by every `<ModalHost>`.
 *
 * Each imperative modal used to be its own `createApp` in its own container,
 * which made them independent but left them unable to coordinate: N modals drew
 * N backdrops that compounded into a darker and darker page, stacked at exactly
 * the same coordinates, and each added its own window-level ESC listener, so one
 * Escape closed all of them at once.
 */
export const modals = new ModalManager()
