export type NavigationThemeType = 'dark' | 'light'

/**
 * A whole menu an item drills down into — the settings-area pattern, where a
 * click replaces the menu and a Back control returns to the one before.
 */
export interface NavigationSubMenuType {
  /** Heading shown above the sub-menu's sections, under the Back control. */
  title?: string
  sections: NavigationSectionType[]
}

/**
 * Where the min/max control sits when `allowMinimize` is on.
 *
 * - `edge` — a floating chevron button hugging the sidebar's right edge, and
 *   the default: reachable in both states, out of the content's way.
 * - `top` — inline in the title row, beside the logo or title.
 * - `bottom` — a full-width row at the very bottom, below the footer.
 */
export type NavigationMinimizePositionType = 'edge' | 'top' | 'bottom'

export interface NavigationProps {
  // default 'light'
  theme?: NavigationThemeType
  allowMinimize?: boolean
  title?: string
  location?: string
  sections?: NavigationSectionType[]
  /**
   * Use to stop navigation of links by automatically calling
   * `event.preventDefault` on clicks. Useful programmattic navigation while
   * without needing to remove URLs from item defintiions.
   */
  preventDefault?: boolean
  /**
   * Reserves the top of the menu for the `logo` slot — and, when minimized,
   * the `logoMin` slot, for a square mark that fits the icon rail.
   */
  logo?: boolean
  /**
   * Label on the control that leaves a drilled-into sub-menu.
   *
   * @default 'Back'
   */
  backLabel?: string
  /**
   * Marks the active item with an accent treatment: accent-coloured text and
   * icon, a soft tinted fill, and a bar on the row's left edge. `true` draws
   * it in the primary colour; a CSS colour
   * string (`'#e07a30'`, `'var(--octans-tertiary)'`) draws it in that colour.
   * Also themeable per-container via `--ui-nav-highlightColor`.
   *
   * @default false
   */
  highlight?: boolean | string
  /**
   * Where the min/max control sits — see `NavigationMinimizePositionType`.
   *
   * @default 'edge'
   */
  minimizePosition?: NavigationMinimizePositionType
  /**
   * A full-height brand stripe down the menu's far-left edge, so the
   * organisation's colour runs the whole window edge.
   * `true` draws it in the primary colour; a CSS colour string in that colour.
   * Also themeable per-container via `--ui-nav-accentStripeColor`.
   *
   * @default false
   */
  accentStripe?: boolean | string
}

export interface NavigationSectionType {
  id: string
  title?: string
  /**
   * An Iconify name shown before the section title. Also what represents the
   * section while the menu is minimized, so sections stay tellable-apart on
   * the icon rail.
   */
  icon?: string
  action?: {
    icon: string
  }
  items?: NavigationPrimaryItemType[]
}

export interface NavigationSecondaryItemType {
  // A unique ID for the item. Matched against `location` to decide which item
  // is active, so it is identity rather than a selectable value.
  id: string
  // Display text
  label: string
  // String or Vue Router Location
  // TODO: support Location?
  url?: string
  // Displays text in a badge at the end of the label
  badge?: string
  // Forces the item into the active state instead of relying on matching routes
  active?: boolean
  // Called with the item when it is clicked. Named to match `ActionType` and
  // `ActionListItemType`, which every other clickable list in the library uses.
  onAction?: (item: NavigationSecondaryItemType) => void
}

export interface NavigationPrimaryItemType extends NavigationSecondaryItemType {
  icon?: string
  // Forces the item into the active state instead of relying on matching routes
  items?: NavigationSecondaryItemType[]
  /**
   * A whole menu this item drills down into, replacing the current one with a
   * Back control at the top. Clicking the item opens the menu instead of
   * navigating — `url` and `onAction` are ignored when this is set.
   */
  subMenu?: NavigationSubMenuType
}

export interface NavigationSectionProps {
  // default 'light'
  theme?: NavigationThemeType
  section: NavigationSectionType
  location?: string
  hasPrimaryIcons?: boolean
  min?: boolean
  highlight?: boolean
}

export interface NavigationItemProps {
  // default 'light'
  theme?: NavigationThemeType
  item: NavigationPrimaryItemType
  isSubItem?: boolean
  location?: string
  hasPrimaryIcons?: boolean
  min?: boolean
  highlight?: boolean
}
