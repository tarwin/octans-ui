import type {
  SaveBarProps,
  SaveBarStateType,
  SaveBarTranslationsType
} from '@/components/SaveBar'

/**
 * Whether the sidebar sits beside the nav or below it. Consumed by `AppFrame`
 * to decide the grid layout.
 */
export type GlobalNavLayoutModeType = 'default' | 'alternate'

export type GlobalNavThemeType = 'light' | 'dark'

export interface GlobalNavPrefixTitleActionType {
  /** Text to render. Optional if `icon` is given. */
  label?: string
  /** An Iconify name, e.g. `mdi:cog`. */
  icon?: string
  /** Called when the action is clicked. */
  onAction?: () => void
}

/** @deprecated The save bar is its own component now — use
 * `SaveBarTranslationsType` from `@octans/ui`. */
export type GlobalNavSaveBarTranslationsType = SaveBarTranslationsType

/** @deprecated The save bar is its own component now — use `SaveBarProps`
 * from `@octans/ui`. */
export type GlobalNavSaveBarProps = SaveBarProps

export interface GlobalNavProps {
  /** Title text shown at the left of the bar, after any prefix actions. */
  title?: string
  /**
   * Actions rendered before the title — typically breadcrumb-style navigation
   * back up to a parent page.
   */
  prefixTitleActions?: GlobalNavPrefixTitleActionType[]
  /** Draws a divider between each prefix action and the title. */
  prefixTitleSeparator?: boolean
  /**
   * Called when the title is clicked. Supplying it also gives the title
   * button styling. `@click-title` compiles to this same prop.
   */
  onClickTitle?: () => void
  /** Reserves space for the `logo` slot. */
  logo?: boolean
  /**
   * Colour scheme for the bar. `dark` (the default) draws the bar in its own
   * chrome colours — `--octans-surface-nav` / `--octans-text-on-nav`, which a
   * theme can override; `light` follows the app surface instead.
   */
  theme?: GlobalNavThemeType
  /**
   * Whether the bar spans the full width (`default`) or starts to the right
   * of a full-height sidebar (`alternate`). Inside an `AppFrame` this is read
   * from the frame's `layout` automatically — set it only for standalone use.
   */
  layoutMode?: GlobalNavLayoutModeType
  /**
   * Save bar state. Usually left alone and driven through `$ui.saveBar` /
   * `useSaveBar()` instead.
   */
  saveBarState?: SaveBarStateType
  /** Overrides for the save bar's built-in strings. */
  saveBarTranslations?: SaveBarTranslationsType
  /**
   * Ask for confirmation before a discard. Passed through to the `SaveBar`.
   *
   * @default true
   */
  saveBarConfirmDiscard?: boolean
}
