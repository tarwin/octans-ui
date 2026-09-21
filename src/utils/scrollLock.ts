/**
 * Stops the page scrolling behind an overlay.
 *
 * Reference counted, because a modal can open over another modal: the page
 * is locked while ANY of them holds a lock, and only the last release puts
 * things back. Each `lockScroll()` returns its own release, which is safe to
 * call twice — a component that unmounts mid-transition releases once from
 * its leave hook and once from unmount, and must not release someone else's.
 *
 * Hiding the scrollbar makes the page a scrollbar wider, so its content jumps
 * sideways as the overlay opens. That width is put back as padding for as
 * long as the lock is held.
 */
let locks = 0
let saved: { overflow: string; paddingRight: string } | null = null

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (locks === 0) {
    const body = document.body
    saved = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    if (scrollbar > 0) {
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${current + scrollbar}px`
    }
    body.style.overflow = 'hidden'
  }
  locks++

  let released = false
  return () => {
    if (released) return
    released = true
    locks--
    if (locks > 0 || !saved) return
    document.body.style.overflow = saved.overflow
    document.body.style.paddingRight = saved.paddingRight
    saved = null
  }
}

/** For tests. */
export function scrollLockCount() {
  return locks
}
