import type { ColorPickerProps } from '@/components/ColorPicker'
import type { PopperPlacementType } from '@/components/Popper'
import type { Gradient, GradientType } from '@/utils/gradient'

/**
 * What the field is allowed to hold.
 *
 * - `color` — a single colour, emitted as a string.
 * - `gradient` — a gradient, emitted as a `Gradient` object.
 * - `both` — either, with a switch in the popover. Read the value's type to
 *   tell them apart, or use `isGradient()`.
 */
export type ColorSelectorMode = 'color' | 'gradient' | 'both'

/**
 * What you click to open the picker.
 *
 * - `button` — the swatch inside a bordered control, alongside the value.
 *   A form field, and what it looks like next to a `TextField`.
 * - `swatch` — the colour and nothing else. No border, no padding, no value
 *   text. For a toolbar, a table cell, or anywhere a field would be too much
 *   furniture around one colour.
 * - `input` — the same bordered control, with the value in a text field you can
 *   type into. The swatch beside it still opens the picker.
 */
export type ColorSelectorTriggerType = 'button' | 'swatch' | 'input'

/**
 * The one colour field. `ColorPicker` and `GradientPicker` are the bare
 * surfaces it wraps — the same relationship `DatePicker` has to `Calendar`.
 */
export interface ColorSelectorProps extends Omit<
  ColorPickerProps,
  'modelValue'
> {
  /**
   * A colour string, or a `Gradient` — see `mode`.
   */
  modelValue?: string | Gradient | null
  /**
   * Whether this field holds a colour, a gradient, or either. Defaults to
   * `color`.
   */
  mode?: ColorSelectorMode
  /**
   * Label for the control.
   */
  label?: string | false | null
  /**
   * Error text to show below the control.
   */
  error?: string | false | null
  /**
   * Help text to show below the control.
   */
  helpText?: string | false | null
  /**
   * Renders help text as raw HTML. Use with caution.
   */
  helpTextHtml?: string | false | null
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string | false | null
  /**
   * Where the picker opens relative to the trigger.
   */
  placement?: PopperPlacementType
  /**
   * What you click to open the picker. `swatch` strips the control back to the
   * colour itself; `input` lets the value be typed.
   *
   * @default 'button'
   */
  trigger?: ColorSelectorTriggerType
  /**
   * Stretch the control to the width of its container, so it lines up with the
   * `TextField`s around it in a form.
   *
   * Nothing to stretch under `trigger="swatch"`, which is a swatch and no box.
   *
   * @default false
   */
  fullWidth?: boolean
  /**
   * Size of the trigger swatch — a number of pixels, or any CSS length.
   *
   * Worth raising with `trigger="swatch"`: the default 20px is right beside a
   * value inside a bordered control, and small as a target when the swatch is
   * the whole control.
   *
   * @default 20
   */
  swatchSize?: number | string
  /**
   * Show the value on the trigger next to its swatch — the colour itself, or a
   * summary of the gradient.
   *
   * Ignored by `trigger="swatch"`, which is the colour and nothing else.
   */
  showValue?: boolean
  /**
   * Text shown on the trigger when there is no value.
   */
  placeholder?: string
  /**
   * Offer a button that clears the value back to empty.
   */
  clearable?: boolean
  /**
   * Show the value but do not allow it to be changed.
   */
  readonly?: boolean
  /**
   * Add each colour you pick to the front of `swatches`, so the palette
   * remembers what has been used. Pair it with `v-model:swatches` to keep the
   * list outside the field — shared between several of them, or persisted.
   *
   * A colour is remembered when the popover CLOSES, not while you drag: every
   * position on the saturation square emits as you cross it, and remembering
   * those would fill the palette with colours nobody chose. Gradients are never
   * remembered; the palette is a list of colours.
   *
   * @default false
   */
  rememberSwatches?: boolean
  /**
   * The most swatches to keep. Unset means no limit.
   *
   * Set this when `swatches` is a recently-used list, and leave it unset when
   * it is a palette you curated — the cap drops entries off the END, which is
   * where a curated palette keeps the colours it was given.
   */
  maxSwatches?: number

  // --- gradient options, forwarded to GradientPicker ----------------------
  /** Which gradient shapes to offer. */
  types?: GradientType[]
  /** Hide the shape and angle controls. */
  hideShape?: boolean
  /** Hide the interpolation space control. */
  hideSpace?: boolean
  /** Fewest stops the user may leave. Never below 2. */
  minStops?: number
  /** Most stops the user may add. */
  maxStops?: number
  /** Hold the leftmost stop at 0%. See `GradientPickerProps.pinStart`. */
  pinStart?: boolean
  /** Hold the rightmost stop at 100%. */
  pinEnd?: boolean
}
