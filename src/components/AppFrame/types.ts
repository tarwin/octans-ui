import type { GlobalNavLayoutModeType } from '../GlobalNav/types'

/**
 * How the frame arranges its chrome.
 *
 * - `topbar` — the bar runs the full width; the sidebar sits under it on the
 *   left. The default.
 * - `sidebar` — the sidebar owns the full height of the window; the bar
 *   starts to its right.
 * - `sidebarOnly` — `sidebar`, minus the bar. The save bar and loading bar
 *   move to the top of the content area, since there is no bar to host them.
 */
export type AppFrameLayoutType = 'topbar' | 'sidebar' | 'sidebarOnly'

/**
 * What collapsing the sidebar means.
 *
 * - `rail` — it narrows to an icon rail; `Navigation`'s own chevron drives it.
 * - `hide` — it disappears entirely and the toggle moves into the
 *   `GlobalNav`. Hovering that toggle while hidden peeks the sidebar as an
 *   overlay.
 */
export type AppFrameSidebarCollapseType = 'rail' | 'hide'

export interface AppFrameProps {
  /**
   * Shows a loader over the content area.
   */
  loading?: boolean
  /**
   * The layout preset — see `AppFrameLayoutType`. Components inside the frame
   * (`GlobalNav`, `Navigation`) read it from context, so it is set here and
   * nowhere else.
   *
   * @default 'topbar'
   */
  layout?: AppFrameLayoutType
  /**
   * @deprecated Use `layout` — `'default'` is `'topbar'`, `'alternate'` is
   * `'sidebar'`. Ignored when `layout` is set.
   */
  layoutMode?: GlobalNavLayoutModeType
  /**
   * Collapses the sidebar. Also driven from inside by `Navigation`'s
   * minimize chevron (`allowMinimize`), or — with `sidebarCollapse: 'hide'` —
   * by the toggle in the `GlobalNav`.
   */
  sidebarMin?: boolean
  /**
   * What collapsing means — see `AppFrameSidebarCollapseType`.
   *
   * @default 'rail'
   */
  sidebarCollapse?: AppFrameSidebarCollapseType
}
