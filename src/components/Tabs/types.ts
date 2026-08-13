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
  // blue or purple?
  theme?: 'blue' | 'purple'
}
