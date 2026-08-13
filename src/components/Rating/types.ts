export interface RatingProps {
  /**
   * Label to display above the control.
   */
  label?: string | false
  /**
   * Error text to show below the control.
   */
  error?: string | false | null
  /**
   * Help text to show below the control.
   */
  helpText?: string | false
  /**
   * Renders help text as raw HTML. Use with caution.
   */
  helpTextHtml?: string | false
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string | false
  /**
   * The current rating value. `null` or `0` means unrated.
   */
  modelValue?: number | null
  /**
   * Number of icons to render.
   */
  stars?: number
  /**
   * Allow half-step selection, e.g. `2.5`. Fractional values are always
   * displayed regardless of this setting (useful for read-only averages);
   * this only controls click/hover/keyboard granularity.
   */
  allowHalf?: boolean
  /**
   * Display only — disables interaction but keeps full opacity.
   */
  readonly?: boolean
  /**
   * Disable the control (dimmed, non-interactive).
   */
  disabled?: boolean
  /**
   * Clicking the icon matching the current value resets it to `0`.
   */
  clearable?: boolean
  /**
   * Icon name for the empty (unfilled) icon.
   */
  emptyIcon?: string
  /**
   * Icon name for the full (filled) icon.
   */
  fullIcon?: string
  /**
   * Colour of empty icons.
   */
  emptyColor?: string
  /**
   * Colour of filled icons.
   */
  fullColor?: string
  /**
   * Colour of filled icons while hovering. Defaults to `fullColor`.
   */
  hoverColor?: string
  /**
   * Icon size in pixels.
   */
  size?: number
  /**
   * Show a tooltip with the rating value on hover. When interactive it shows
   * the value under the pointer (what clicking would select); when `disabled`
   * or `readonly` it shows the current value.
   */
  tooltip?: boolean
}
