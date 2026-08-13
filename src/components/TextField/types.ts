import type { CSSProperties } from 'vue'
import type { MaskTokens } from 'maska'

export interface TextFieldProps {
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
   * The control value.
   */
  modelValue?: string | number | null
  /**
   * Hint to display in the input.
   */
  placeholder?: string
  /**
   * Allow multiple lines of input.
   */
  multiline?: boolean | string | number
  /**
   * Maximum character length for the input.
   */
  maxLength?: number
  /**
   * Text to display before the input value.
   */
  prefix?: string
  /**
   * Text to display after the input value.
   */
  suffix?: string
  /**
   * Determines the alignment of the text in the input: `"left" | "center" | "right"`.
   */
  align?: 'left' | 'center' | 'right'
  /**
   * By default the text field will display any text. Can use:
   *
   * - email
   * - number
   * - password
   * - text
   * - tel
   */
  type?: 'email' | 'number' | 'password' | 'text' | 'tel'
  /**
   * For number inputs this is the minimum value allowed.
   */
  min?: number
  /**
   * For number inputs this is the maximum value allowed.
   */
  max?: number
  /**
   * For number inputs this amount incremented using the stepper.
   */
  step?: number
  /**
   * Disable the input.
   */
  disabled?: boolean
  /**
   * Set input `autocomplete` value
   */
  autocomplete?: string
  /**
   * Disable editing of the input.
   */
  readonly?: boolean
  /**
   * Makes font monospace
   */
  monospace?: boolean
  /**
   * Additional styles for the input element.
   */
  inputStyle?: CSSProperties
  /**
   * The model value to emit when the text input is cleared by the user.
   */
  emptyValue?: string | number | null
  /**
   * Apply an input mask. Single-line only — ignored when `multiline` is set.
   *
   * Uses [maska](https://beholdr.github.io/maska/) tokens:
   *
   * - `#` — a digit (`0-9`)
   * - `@` — a letter (`a-z`, `A-Z`)
   * - `*` — alphanumeric
   *
   * e.g. `"(###) ###-####"`, `"##/##/####"`, `"@@-####"`.
   */
  mask?: string
  /**
   * When a `mask` is set, emit the unmasked (raw) value via
   * `update:modelValue` instead of the masked value. The displayed input
   * stays masked regardless.
   */
  unmask?: boolean
  /**
   * Override or extend the mask tokens. See the `mask` prop for the defaults.
   */
  maskTokens?: MaskTokens
  /**
   * Eager masking — inserts fixed mask characters as soon as you reach them
   * while typing, rather than waiting for the next input character.
   */
  maskEager?: boolean
  /**
   * Reverse the mask direction. Useful for numeric masks where digits should
   * fill from the right (e.g. thousands separators).
   */
  maskReversed?: boolean
}
