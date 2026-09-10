export type PopoverPlacementType =
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

export interface PopoverProps {
  visible?: boolean
  placement?: PopoverPlacementType
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
  /**
   * Paints the content: surface colour, border, corner radius and a shadow.
   *
   * Off by default, and deliberately so — a popover hands the content slot
   * straight through, so anything that already dresses itself (an
   * `ActionListMenu`, a date picker, a card) would end up with two borders and
   * two shadows. Turn it on for bring-your-own-content overlays, which would
   * otherwise render transparent over the page.
   *
   * The styles land on the content's own root element and are defined with
   * `:where()`, so any rule of your own still wins.
   */
  surface?: boolean
  zIndex?: number
}
