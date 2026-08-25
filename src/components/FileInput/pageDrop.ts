/**
 * Whole-page file dropping, for `<FileInput dropOnPage>`.
 *
 * The page is a SINGLE target — there is one window, and a file dropped on it
 * can only go to one place — so this is a claim, not a subscription. The first
 * input to ask gets it; a second is refused and warned about, rather than both
 * quietly receiving the same file or the last one to mount silently winning.
 *
 * The listeners live on `window` and are attached only while someone holds the
 * claim, so a page with no `dropOnPage` input pays nothing.
 */

export interface PageDropHandlers {
  /** Fires when a file drag enters or leaves the page entirely. */
  onDragChange(dragging: boolean): void
  onDrop(files: FileList): void
}

let holder: object | null = null
let handlers: PageDropHandlers | null = null

/**
 * `dragenter`/`dragleave` fire for every element the pointer crosses, so a
 * drag moving over the page emits a stream of both. Counting them and only
 * reacting at zero is what distinguishes "left the page" from "moved onto a
 * child element", which a bare `dragleave` cannot tell apart.
 */
let depth = 0

/**
 * A drag of selected text or a link also fires these events. Only a drag
 * carrying files should light the page up.
 *
 * `types` rather than `items` or `files`: during a drag the browser withholds
 * the payload for security, and `types` is the one part it will answer.
 */
function hasFiles(event: DragEvent): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

function setDragging(dragging: boolean) {
  handlers?.onDragChange(dragging)
}

function onDragEnter(event: DragEvent) {
  if (!hasFiles(event)) return
  event.preventDefault()
  depth += 1
  if (depth === 1) setDragging(true)
}

function onDragOver(event: DragEvent) {
  // Without this the browser refuses the drop and NAVIGATES to the file
  // instead, replacing the app with a PDF viewer. It is the single most
  // important line in the file.
  if (!hasFiles(event)) return
  event.preventDefault()
}

function onDragLeave(event: DragEvent) {
  if (!hasFiles(event)) return
  depth = Math.max(0, depth - 1)
  if (depth === 0) setDragging(false)
}

function onDrop(event: DragEvent) {
  if (!hasFiles(event)) return
  event.preventDefault()
  depth = 0
  setDragging(false)
  const files = event.dataTransfer?.files
  if (files?.length) handlers?.onDrop(files)
}

const EVENTS = [
  ['dragenter', onDragEnter],
  ['dragover', onDragOver],
  ['dragleave', onDragLeave],
  ['drop', onDrop]
] as const

/**
 * Claims the page for `token`. Returns `false` — and warns — when another
 * input already holds it, in which case that input keeps the page and this
 * one behaves as though `dropOnPage` were not set.
 */
export function claimPageDrop(token: object, next: PageDropHandlers): boolean {
  if (holder && holder !== token) {
    console.warn(
      '[octans] Two FileInputs both set `dropOnPage`. The page can only ' +
        'deliver a dropped file to one of them, so the first one to mount ' +
        'keeps it and this one falls back to its own drop zone.'
    )
    return false
  }
  holder = token
  handlers = next
  if (typeof window === 'undefined') return true
  for (const [name, fn] of EVENTS) {
    window.addEventListener(name, fn as EventListener)
  }
  return true
}

export function releasePageDrop(token: object) {
  if (holder !== token) return
  holder = null
  handlers = null
  depth = 0
  if (typeof window === 'undefined') return
  for (const [name, fn] of EVENTS) {
    window.removeEventListener(name, fn as EventListener)
  }
}
