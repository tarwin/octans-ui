/**
 * Keeps Tab inside an overlay.
 *
 * The overlay is not a `<dialog>`, so the browser does not know that the page
 * behind it is off limits: Tab from its last control would walk out into the
 * page under the backdrop. `trapTab` is a keydown handler for the overlay's
 * root; it only ever sees Tab presses while focus is inside that root, so it
 * leaves a popover or select menu portalled elsewhere alone.
 */

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]'
].join(',')

/**
 * The elements Tab visits inside `root`, in document order. `tabindex="-1"`
 * is focusable by script but not by Tab, so it is left out — that is what the
 * overlay's own root carries, and it must not count as a stop.
 */
export function tabbableWithin(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      !el.closest('[inert]') &&
      !el.closest('[hidden]')
  )
}

/**
 * Wraps a Tab press that would leave `root` back round to the other end.
 * Returns true when it handled the key.
 */
export function trapTab(event: KeyboardEvent, root: HTMLElement): boolean {
  if (event.key !== 'Tab') return false
  const stops = tabbableWithin(root)
  if (stops.length === 0) {
    // Nothing to go to: keep focus on the root itself rather than let it
    // leave.
    event.preventDefault()
    root.focus()
    return true
  }
  const first = stops[0]
  const last = stops[stops.length - 1]
  const active = document.activeElement
  if (event.shiftKey) {
    if (active === first || active === root || !root.contains(active)) {
      event.preventDefault()
      last.focus()
      return true
    }
  } else if (active === last || active === root || !root.contains(active)) {
    event.preventDefault()
    first.focus()
    return true
  }
  return false
}
