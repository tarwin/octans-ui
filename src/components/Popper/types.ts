export type PopperPlacementType =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'

export interface PopperProps {
  visible?: boolean
  placement?: PopperPlacementType
  teleportTo?: string
  disabled?: boolean
  // collisionBoundary?:string
  /**
   * Toggles the popper content automatically on trigger click. Defaults to
   * `true`.
   *
   * Set this to `false` whenever the trigger drives visibility itself — via
   * the `show`/`hide`/`toggle` slot props, or by opening on an event that
   * precedes the click (`focus`, `mouseenter`). Otherwise the automatic
   * toggle runs *in addition* to your handler and cancels it out, leaving a
   * trigger that looks dead.
   */
  autoTriggerToggle?: boolean
  /**
   * Close the popper content automatically on outside click
   */
  autoHide?: boolean
  /**
   * Open the popper content on hover (pointer enter) and close it shortly
   * after the pointer leaves both the trigger and the content. Designed for
   * cascading sub-menus, so hovering a descendant keeps its ancestors open.
   */
  hover?: boolean
  zIndex?: number
}
