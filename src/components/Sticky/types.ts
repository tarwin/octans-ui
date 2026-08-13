export interface StickyProps {
  /**
   * Distance to hold from the pinned edge. A number is pixels; a string is
   * passed to CSS untouched, so `'2rem'`, `'var(--octans-space-4)'` and
   * `'calc(100% - 8px)'` all work.
   *
   * @default 0
   */
  offset?: number | string
  /**
   * Which edge to pin against. `'bottom'` is for footer action bars.
   *
   * @default 'top'
   */
  position?: 'top' | 'bottom'
  /**
   * Renders the content in normal flow instead of pinning it, so stickiness can
   * be dropped at a breakpoint without unmounting anything. `stuck` stays
   * `false` while disabled.
   *
   * @default false
   */
  disabled?: boolean
}
