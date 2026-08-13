import { inject, type InjectionKey } from 'vue'
import type { AppFrameLayoutType, AppFrameSidebarCollapseType } from './types'

/**
 * What `AppFrame` tells the chrome mounted inside it. `GlobalNav` reads the
 * layout so it no longer needs its own copy of the prop, and `Navigation`
 * drives the sidebar collapse through it — one prop on one component instead
 * of the same value wired to three.
 */
export interface AppFrameLayoutContextType {
  /** The resolved layout preset. */
  readonly layout: AppFrameLayoutType
  /** Whether the sidebar is collapsed (to its icon rail, or hidden entirely —
   * see `sidebarCollapse`). */
  readonly sidebarMin: boolean
  /** Collapse or expand the sidebar. `Navigation`'s minimize chevron calls
   * this, so the frame's column animates with it. */
  setSidebarMin(value: boolean): void
  /** What collapsing means: `rail` narrows to icons, `hide` removes the
   * sidebar and moves the toggle into the `GlobalNav`. */
  readonly sidebarCollapse: AppFrameSidebarCollapseType
  /** While the sidebar is hidden, hovering the GlobalNav toggle "peeks" it as
   * an overlay. Read by the frame; set by the toggle's hover. */
  readonly peek: boolean
  setPeek(value: boolean): void
  /** True below the responsive breakpoint, where the sidebar is a drawer. */
  readonly narrow: boolean
  /** Whether the drawer is open. Only meaningful while `narrow`. */
  readonly drawerOpen: boolean
  /** Open/close the sidebar drawer; no argument toggles. `GlobalNav`'s
   * hamburger calls this. */
  toggleDrawer(open?: boolean): void
  /** Whether the frame has sidebar content at all. */
  readonly hasSidebar: boolean
}

export const appFrameLayoutKey: InjectionKey<AppFrameLayoutContextType> =
  Symbol('OctansAppFrameLayout')

/**
 * The `AppFrame` layout context, or `null` outside one. Chrome components use
 * this to coordinate with the frame while still working standalone.
 */
export function useAppFrameLayout(): AppFrameLayoutContextType | null {
  return inject(appFrameLayoutKey, null)
}
