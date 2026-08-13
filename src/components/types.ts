export type ActionTypeType =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'plain'
  | 'link'

/**
 * The colour role a button (or similar action) draws from. Orthogonal to the
 * action TYPE, which sets its visual weight — any role can ride any type.
 */
export type ActionColorType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

export type ActionTooltipPositionType = 'top' | 'bottom' | 'right' | 'left'

export interface ActionType {
  label: string
  type?: ActionTypeType
  // See Icon component.
  icon?: string
  disabled?: boolean
  url?: string
  tooltip?: string
  tooltipPosition?: ActionTooltipPositionType
  external?: boolean
  visible?: boolean
  /**
   * Called when the action is chosen. Takes no arguments — an action knows
   * what it acts on, because you closed over it when you built the action.
   *
   * Components that DO have something to hand back declare their own action
   * type saying so, rather than widening this one: `DataTableRowActionType`
   * passes the row, `DataTableBulkActionType` the selected rows, and
   * `NavigationSecondaryItemType` the item.
   */
  onAction?(): void
}

/**
 * An action bound to one thing — a table row, a list entry — which receives
 * that thing when chosen.
 *
 * `ActionType` with a typed argument rather than a looser `ActionType`: the
 * argument is the whole reason these exist, so it belongs in the type where
 * an editor will offer it.
 */
export interface ActionWithSubjectType<T> extends Omit<ActionType, 'onAction'> {
  onAction?(subject: T): void
}

export interface BadgeType {
  label: string
  progress?: BadgeProgressType
  size?: BadgeSizeType
  status?: BadgeStatusType
}

export type BadgeProgressType = `incomplete` | `partiallyComplete` | `complete`

// `attention` is the pre-rename word for the amber state — accepted as an
// alias of `warning` so old call sites keep meaning what they meant.
export type BadgeStatusType =
  `info` | `success` | `warning` | `error` | `attention` | `new`

export type BadgeSizeType = `small` | `medium`

/**
 * The status of a badge overlaid on an icon or a button, as distinct from
 * `BadgeStatusType` which belongs to the standalone Badge component.
 */
export type IconBadgeStatusType = `info` | `success` | `warning` | `error`

/**
 * The long form of a button badge. The short form is a bare string: either a
 * status (`badge="warning"`) or some text, optionally coloured with
 * `badgeStatus` (`badge="3" badge-status="error"`).
 */
export interface IconBadgeType {
  /**
   * Text to show in a pill on the corner of the button, e.g. a count. Without
   * it the badge is drawn as a small glyph on the button's icon instead.
   */
  text?: string | number
  status?: IconBadgeStatusType
  /**
   * An Iconify name to use for the glyph instead of the status default.
   */
  icon?: string
  /**
   * A colour to use instead of the status default.
   */
  color?: string
}
