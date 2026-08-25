import type { BadgeProgressType, BadgeStatusType } from '../types'

export interface TabType {
  /**
   * Identifies the tab. Matched against the `selected` prop, and emitted with
   * `update:selected`.
   */
  value: string
  label: string
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
}
