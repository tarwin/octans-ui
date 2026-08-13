import type { ColorFormat } from '@/utils/color'

/**
 * How a swatch is drawn — the rounded square that matches the rest of the
 * library's controls, or a dot.
 *
 * A circle is not only decoration: a round swatch is unmistakably "a colour"
 * rather than "a small button", which matters most where the swatch is the
 * whole control and has no border or label around it.
 */
export type ColorSwatchShape = 'square' | 'circle'

export interface ColorPickerProps {
  /**
   * The current colour, in any form `parseColor` understands — `#rgb`,
   * `#rrggbbaa`, `rgb()`, `hsl()`, `oklab()`, `oklch()` or `transparent`.
   *
   * A value that cannot be parsed is left in the text field untouched rather
   * than being replaced, so a half-typed colour is not destroyed as you type.
   */
  modelValue?: string | null
  /**
   * Offer an alpha slider, and allow emitting colours with transparency.
   *
   * Off by default: most colours in a design system are opaque, and a stray
   * `#ffffff00` is an unpleasant surprise for whatever consumes the value.
   */
  alpha?: boolean
  /**
   * Pin the output to one format. When omitted the picker emits in whichever
   * format the incoming value was written in, falling back to hex — so it does
   * not quietly rewrite an `oklch()` theme into hex.
   */
  format?: ColorFormat
  /**
   * Which formats the switcher offers. Ignored when `format` pins the output.
   */
  formats?: ColorFormat[]
  /**
   * Preset colours shown as a row of swatches under the controls.
   */
  swatches?: string[]
  /**
   * Shape of those swatches.
   *
   * @default 'square'
   */
  swatchShape?: ColorSwatchShape
  /**
   * Offer the screen eyedropper. Hidden anyway in browsers without the
   * `EyeDropper` API, which at the time of writing means Firefox and Safari.
   */
  eyedropper?: boolean
  /**
   * Offer a button that opens the operating system's own colour dialog, for
   * users who want their platform picker and its recent colours.
   */
  systemPicker?: boolean
  /**
   * Hide the text field and format switcher, leaving only the visual controls.
   */
  hideInput?: boolean
  disabled?: boolean
}
