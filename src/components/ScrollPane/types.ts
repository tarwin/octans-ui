export type ScrollPaneDirectionType = 'vertical' | 'horizontal' | 'both'

export interface ScrollPaneProps {
  /**
   * Which way the content scrolls.
   *
   * - `"vertical"` — up and down (default)
   * - `"horizontal"` — left and right
   * - `"both"` — either
   *
   * The overflow indicators follow: a horizontal pane fades its left and right
   * edges rather than its top and bottom.
   */
  direction?: ScrollPaneDirectionType
  /**
   * Stops the scroll from continuing onto the page once this pane reaches its
   * end (`overscroll-behavior: contain`). Also suppresses the rubber-band
   * bounce and pull-to-refresh inside the pane.
   *
   * Off by default, because chaining to the page is the browser's own
   * behaviour and is often what you want for a pane sitting in normal page
   * flow. Turn it on for panes inside a modal, sheet or dropdown, where
   * scrolling the page underneath is never intended.
   */
  contain?: boolean
  /**
   * Fades the edges where there is more content off screen.
   *
   * On by default. Turn it off for panes where the fade fights the design —
   * over an image, or where a border already says where the content stops.
   *
   * A `disabled` pane never shows them regardless: it cannot be scrolled, so
   * an indicator would be pointing at content the user has no way to reach.
   *
   * The fade colour is `--octans-shadow-overflow`, overridable per pane with
   * `--ScrollPane-indicatorColor`.
   */
  indicators?: boolean
  /**
   * Applies CSS padding to the scrollable container.
   */
  padding?: string
  /**
   * Set to a reactive value to refresh the overflow indicators whenever it
   * changes.
   *
   * Rarely needed: the pane observes its own size and its content's, so
   * content that grows or shrinks is picked up automatically. This is for
   * changes that move the scroll extent without changing either box.
   */
  watch?: unknown
  /**
   * Disables scrolling by setting the CSS `overflow` of the content to
   * `hidden`.
   */
  disabled?: boolean
  /**
   * Applies a class name to the scrollable container.
   */
  containerClass?: string
  /**
   * Applies styles to the scrollable container.
   */
  containerStyle?: Record<string, string>
}
