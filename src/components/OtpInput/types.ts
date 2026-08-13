export interface OtpInputProps {
  /**
   * Label to display above the input.
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
   * The current value — the characters across all cells joined into a string.
   */
  modelValue?: string | null
  /**
   * Number of input cells to render. Ignored when `groups` is set.
   */
  length?: number
  /**
   * Render the cells in visual groups separated by `separator`, e.g.
   * `[4, 4]` produces `####-####`. The cells still behave as one input — focus,
   * paste and backspace flow across the separators and the value remains the
   * concatenated characters (no separators). Overrides `length`.
   */
  groups?: number[]
  /**
   * Text shown between groups when `groups` is set.
   */
  separator?: string
  /**
   * Hide entered characters (PIN style) by rendering them as a password input.
   */
  mask?: boolean
  /**
   * Restrict input to digits `0-9`. Also sets a numeric on-screen keyboard on
   * mobile. Takes precedence over `allowedChars`.
   */
  integerOnly?: boolean
  /**
   * Restrict which characters may be entered.
   *
   * - A `string` is treated as the explicit set of allowed characters, e.g.
   *   `"0123456789ABCDEF"`.
   * - A `RegExp` is tested against each individual character, e.g.
   *   `/[0-9a-f]/i` for case-insensitive hex.
   *
   * Ignored when `integerOnly` is set. When omitted, any character is allowed.
   */
  allowedChars?: string | RegExp
  /**
   * Force entered characters to a case. Applied before `allowedChars` /
   * `integerOnly` validation, so e.g. `casing="upper"` lets a user type `a`
   * to satisfy an `"ABCDEF"` set.
   *
   * - `"upper"` — uppercase everything
   * - `"lower"` — lowercase everything
   */
  casing?: 'upper' | 'lower'
  /**
   * Disable all cells.
   */
  disabled?: boolean
  /**
   * Make all cells read-only.
   */
  readonly?: boolean
  /**
   * Focus the first cell when the component mounts.
   */
  autoFocus?: boolean
  /**
   * Center the cells within the available width instead of left-aligning
   * them.
   */
  centered?: boolean
}
