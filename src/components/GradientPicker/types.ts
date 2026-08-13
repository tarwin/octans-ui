import type { ColorSwatchShape } from '@/components/ColorPicker'
import type { Gradient, GradientType } from '@/utils/gradient'

export interface GradientPickerProps {
  /**
   * The gradient being edited. Treated as immutable — every change emits a new
   * object rather than mutating this one.
   */
  modelValue?: Gradient | null
  /**
   * Allow stop colours to carry transparency.
   */
  alpha?: boolean
  /**
   * Which gradient shapes to offer. With one entry the control is hidden and
   * that shape is used.
   */
  types?: GradientType[]
  /**
   * Hide the shape and angle controls.
   *
   * For when only the colours along the gradient matter and how it would be
   * painted does not — generating a colour ramp, for instance, samples
   * positions and never draws the gradient itself.
   */
  hideShape?: boolean
  /**
   * Hide the interpolation space control.
   */
  hideSpace?: boolean
  /**
   * Fewest stops the user may leave. Never below 2 — one stop is not a
   * gradient.
   */
  minStops?: number
  /**
   * Most stops the user may add.
   */
  maxStops?: number
  /**
   * Hold the leftmost stop at 0%, and the rightmost at 100%.
   *
   * For a gradient that has to span its whole range — a colour ramp, a
   * progress track, anything sampled end to end — where a stop dragged inward
   * would leave a flat run of colour at the edge.
   *
   * The constraint is on the ENDS, not on a particular stop: whichever stop is
   * currently outermost is the one held. So removing a pinned stop pulls the
   * next one out to the edge rather than leaving a gap.
   */
  pinStart?: boolean
  /** See `pinStart`. */
  pinEnd?: boolean
  /**
   * Preset colours offered when editing a stop's colour.
   */
  swatches?: string[]
  /**
   * Shape of those swatches, and of the stop's own colour trigger.
   *
   * @default 'square'
   */
  swatchShape?: ColorSwatchShape
  /**
   * Edit the selected stop's colour with an always-visible picker instead of a
   * swatch that opens one.
   *
   * Worth setting when the gradient picker is itself inside a popover. Nesting
   * works — the panels stack, and ESC closes them one at a time — but a third
   * floating layer is a small target to reach across and easy to lose track of.
   * Editing the colour in place avoids it.
   */
  inlineColor?: boolean
  disabled?: boolean
}
