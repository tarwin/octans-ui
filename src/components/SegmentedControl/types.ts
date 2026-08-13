import type { ActionTooltipPositionType } from '../types'

/**
 * Visual size of the control, on `Button`'s scale — a segmented control sitting
 * next to a button in a toolbar should be the same height as it, and the only
 * way to promise that is to share the numbers.
 */
export type SegmentedControlSizeType = 'small' | 'medium' | 'large'

/**
 * One segment.
 *
 * `label` and `icon` are both optional, but a segment with neither is a blank
 * box — give it at least one. An icon on its own says nothing to a screen
 * reader, so pair it with `tooltip`, which is used as the segment's accessible
 * name when there is no label.
 */
export interface SegmentedOptionType {
  /**
   * What the control emits when this segment is picked. Compared with the model
   * by `===`, so objects must be the same reference, not an equal one.
   */
  value: any
  label?: string
  /**
   * An Iconify name (`mdi:calendar-today`), drawn before the label.
   */
  icon?: string
  disabled?: boolean
  /**
   * Shown on hover. Also becomes the segment's accessible name when there is no
   * `label`, which is what makes an icon-only control usable.
   */
  tooltip?: string
}

export interface SegmentedControlProps {
  /**
   * The segments to render.
   *
   * Defaulted rather than required: options usually arrive from a fetch, and
   * the first render should be an empty control, not a crash.
   */
  options?: SegmentedOptionType[]
  /**
   * The selected value / `v-model`. A value matching no option leaves every
   * segment unselected, which is a legitimate empty state rather than an error.
   */
  modelValue?: any
  /**
   * @default 'medium'
   */
  size?: SegmentedControlSizeType
  /**
   * Stretches the control to its container and gives every segment an equal
   * share of it. Without this each segment is as wide as its own content.
   *
   * @default false
   */
  fullWidth?: boolean
  /**
   * Stacks the segments instead of running them across. Worth it for four or
   * more long labels, where a row would either wrap or truncate.
   *
   * @default false
   */
  vertical?: boolean
  /**
   * Disables every segment. Individual segments have their own `disabled`.
   *
   * @default false
   */
  disabled?: boolean
  /**
   * Shows the selection but refuses to change it. Unlike `disabled` the control
   * keeps its normal colour and stays focusable, so the value can still be read
   * out — which is the point.
   *
   * @default false
   */
  readonly?: boolean
  /**
   * The `name` shared by the underlying radio inputs. Generated when unset,
   * which is what makes the segments a real radio group: one tab stop, arrow
   * keys between them, and "2 of 4" announced.
   *
   * Only worth setting to submit the value with a plain HTML form — the
   * control is still driven by `modelValue`, not by the form.
   */
  name?: string
  /**
   * Which side of a segment its `tooltip` opens on. `top` by default, which
   * keeps it clear of the row rather than covering the segment it describes and
   * its neighbours.
   *
   * @default 'top'
   */
  tooltipPosition?: ActionTooltipPositionType
  /**
   * The group's accessible name when there is no visible `label` — a view
   * switcher in a toolbar being the usual case. Ignored when `label` is a
   * string, which is used instead.
   */
  ariaLabel?: string
  /**
   * A visible label above the control, making it a form field. Leave it unset
   * for a toolbar control and name the group with `ariaLabel` instead.
   */
  label?: string | false | null
  /**
   * An error message shown beneath the control.
   */
  error?: string | false | null
  /**
   * Secondary text beneath the control.
   */
  helpText?: string | false | null
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string
}
