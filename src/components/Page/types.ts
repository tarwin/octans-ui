import type { ActionType, BadgeType } from '../types'

export interface BreadcrumbType {
  label: string
  disabled?: boolean
  url?: string
  onAction?(): void
}

export interface ActionGroupType {
  title: string
  icon?: string
  actions: ActionType[]
}

export interface PageProps {
  /**
   * The main heading of the page.
   */
  title?: string
  /**
   * The secondary heading of the page.
   */
  subtitle?: string
  /**
   * Optional show help icon next to page title
   * Emits 'clickHelp' event
   */
  includeHelp?: boolean
  /**
   * Optional badge to display at the end of the title. See `Badge` component.
   */
  badge?: BadgeType
  /**
   * An array of breadcrumbs.
   */
  breadcrumbs?: BreadcrumbType[]
  /**
   * The main page action.
   */
  primaryAction?: ActionType
  /**
   * Optional secondary actions. These actions and the action groups are
   * displayed below the page header and collapse into a dropdown on small
   * screens.
   */
  secondaryActions?: ActionType[]
  /**
   * A group of secondary actions. These are listed after the main secondary
   * actions. These appear as sections when the secondary actions are collapsed.
   */
  actionGroups?: ActionGroupType[]
  /**
   * The width preset of the page. Content is centred at the preset's
   * max-width; the widths themselves are the `--octans-page-width[-narrow|
   * -wide]` tokens, so an application can retune every page at once.
   *
   * Options:
   *
   *   - `narrow` — 720px. Settings pages, forms, focused reading.
   *   - `default` — 1100px.
   *   - `wide` — 1400px. Dense tables and dashboards.
   *   - `fullWidth` — no max-width at all.
   */
  size?: 'narrow' | 'default' | 'wide' | 'fullWidth'
  /**
   * Shows a page-level loader.
   */
  loading?: boolean
  /**
   * Sets the Global Nav's Save Bar state to "changed".
   */
  changed?: boolean
  /**
   * Sets the Global Nav's Save Bar state to "saving".
   */
  saving?: boolean
}
