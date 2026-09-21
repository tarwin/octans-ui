import type { BadgeProgressType, BadgeStatusType } from '../types'

export interface TabType {
  /**
   * Identifies the tab. Matched against the `selected` prop, and emitted with
   * `update:selected`.
   */
  value: string
  label: string
  /** An Iconify name (`mdi:inbox`), drawn before the label. */
  icon?: string
  disabled?: boolean
  badge?: string
  badgeStatus?: BadgeStatusType
  badgeProgress?: BadgeProgressType
}

export interface TabsProps {
  /** The `value` of the currently selected tab. */
  selected?: string
  tabs?: TabType[]
  /**
   * How the selected tab is marked.
   *
   * - `underline` — a rule under the label
   * - `bar` — a thicker rounded bar sitting on the divider
   *
   * Was `theme`, with the values `blue` and `purple`. Neither ever set a
   * colour: both draw from the theme's own tokens, and the only difference
   * was the shape of this indicator.
   */
  indicator?: 'underline' | 'bar'
  /**
   * What happens when the tabs are wider than the strip.
   *
   * - `menu` — the tabs that do not fit move into a menu at the end of the
   *   strip, in order; the button stands in for the selected tab when that
   *   is one of them
   * - `scroll` — the strip scrolls sideways, and the selected tab is kept
   *   in view
   */
  overflow?: 'menu' | 'scroll'
  /**
   * With `overflow: 'scroll'`, fades the edge of the strip where there are
   * more tabs off screen. On by default; turn it off where the fade fights
   * the design.
   */
  scrollIndicators?: boolean
  /**
   * Whether the overflow menu and its button show each tab as the strip
   * does — icon, badge or the `tab` slot — rather than the bare label.
   */
  menuContent?: boolean
}
