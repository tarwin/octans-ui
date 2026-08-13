import type { ActionType } from '../types'

export type SheetEdgeType = 'right' | 'left' | 'top' | 'bottom'

export interface SheetProps {
  /**
   * Title shown in the sheet header.
   */
  title?: string
  /**
   * Whether the sheet is open. Toggle this to show or hide the sheet.
   *
   * @default false
   */
  visible?: boolean
  /**
   * Which edge the sheet slides in from.
   *
   * `"left"` and `"right"` size the sheet by width and stretch it full height;
   * `"top"` and `"bottom"` size it by height and stretch it full width.
   *
   * @default 'right'
   */
  edge?: SheetEdgeType
  /**
   * Size of the sheet along the axis it slides on, in pixels — its width for a
   * left or right sheet, its height for a top or bottom one. Clamped to the
   * screen when the sheet becomes the active (foreground) sheet.
   *
   * @default 700
   */
  size?: number
  /**
   * How many pixels of a background sheet remain visible (peek out) from
   * behind the sheets stacked on top of it.
   *
   * @default 100
   */
  peek?: number
  /**
   * Adds padding around the sheet content and constrains it to a comfortable
   * reading width.
   */
  padded?: boolean
  /**
   * Duration of the open (slide/fade-in) animation in milliseconds.
   * Set to `0` to open instantly with no animation.
   *
   * @default 700
   */
  animateInDuration?: number
  /**
   * Duration of the close (slide/fade-out) animation in milliseconds.
   * Set to `0` to close instantly with no animation.
   *
   * @default 700
   */
  animateOutDuration?: number
  /**
   * Minimum `z-index` used for the sheet. Stacked sheets increment from here.
   *
   * @default 1000
   */
  minIndex?: number
  /**
   * Accent color for the sheet, shown as a strip along the top of the header.
   * Accepts any CSS color value, e.g. `"red"`, `"#2196F3"`, `"rgb(0,0,0)"`.
   */
  color?: string
  /**
   * Classes to add to the sheet element.
   */
  containerClass?: Record<string, string> | string
  /**
   * Classes to add to the sheet content element.
   */
  contentClass?: Record<string, string> | string
  /**
   * Shows a spinner over the whole sheet and prevents closing.
   *
   * @default false
   */
  loading?: boolean
  /**
   * The main sheet action, displayed at the upper right corner
   * of the sheet
   */
  primaryAction?: ActionType
  /**
   * Optional secondary actions. These actions and the action groups are
   * displayed left of the primary action button
   */
  secondaryActions?: ActionType[]
}
