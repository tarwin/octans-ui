import type { ActionType } from '../types'
export interface PageActionsProps {
  /**
   * The main page action options.
   *
   * Optional, though it is the reason to reach for this component — omit it and
   * only the secondary actions render, which is what you want while the primary
   * action is still being resolved.
   */
  primaryAction?: ActionType
  /**
   * Optional secondary actions. These actions and the action groups are
   * displayed below the page header and collapse into a dropdown on small
   * screens.
   */
  secondaryActions?: ActionType[]
}
