export interface TimePickerProps {
  /**
   * Label to display above the input.
   */
  label?: string | false
  /**
   * Error text to show below the control. Validation errors (e.g. min/max
   * time) take precedence over this value. Accepts `false` so it can be fed
   * directly from a condition, e.g. `:error="hasError && 'Some message'"`.
   */
  error?: string | false
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
   * Hint to display in the input when it is empty. Defaults to a format mask,
   * e.g. `"--:-- --"` (12 hour) or `"--:--"` (24 hour).
   */
  placeholder?: string
  /**
   * Shows a clock icon before the input. Defaults to `true`.
   */
  prefixIcon?: boolean
  /**
   * Disable the input.
   */
  disabled?: boolean
  /**
   * Disable editing of the input.
   */
  readonly?: boolean
  /**
   * The model time value formatted according to `modelFormat`.
   */
  modelValue?: string | null
  /**
   * Format of the underlying value.
   *
   * @see https://day.js.org/docs/en/display/format
   */
  modelFormat?: string
  /**
   * Restricts the minimum time that can be selected (`HH:mm`).
   */
  minTime?: string
  /**
   * Restricts the maximum time that can be selected (`HH:mm`).
   */
  maxTime?: string
  /**
   * Shows a button at the end of the input which allows the value to be
   * cleared.
   */
  clearable?: boolean
  /**
   * Controls the width of the input.
   *
   * - `full` (default): fills the width of its container, like other form
   *   fields.
   * - `auto`: sizes to its content.
   */
  width?: 'auto' | 'full'
  /**
   * Renders the input in 24 hour mode (hides the AM/PM toggle).
   */
  is24Hour?: boolean
  /**
   * The number of minutes to step by when using the up/down arrow keys.
   */
  minuteStep?: number
  /**
   * When `true`, the minute value snaps to the nearest `minuteStep` multiple
   * when the field loses focus.
   */
  minuteStepStrict?: boolean
  /**
   * @deprecated No longer used. The picker is now an inline input and does not
   * open a popper. Kept for backwards compatibility.
   */
  autoOpen?: boolean
}
