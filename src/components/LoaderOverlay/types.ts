export interface LoaderOverlayProps {
  /**
   * Shows the overlay directly, independent of `$ui.loader`. The overlay is
   * visible when either this is true or `$ui.loader.show()` has been called.
   *
   * @default false
   */
  visible?: boolean
  /**
   * Text under the spinner when the overlay was shown by the `visible` prop,
   * or when `$ui.loader.show()` was called without a message.
   *
   * @default 'Loading...'
   */
  message?: string
  /**
   * Cover the whole viewport rather than the nearest positioned ancestor.
   * This is what the auto-mounted overlay uses; the one inside `AppFrame`
   * covers only the content area, leaving the nav usable.
   *
   * @default false
   */
  fullscreen?: boolean
}
