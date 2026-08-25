import type { PageProps } from '@/components/Page'

export interface SkeletonPageProps {
  /**
   * The width preset, forwarded to the `Page` underneath.
   *
   * Set it to whatever the real page uses. That is the whole reason this
   * renders a real `Page` rather than a loose stack of shapes — a skeleton at
   * a different width moves the content sideways the moment it swaps out.
   */
  size?: PageProps['size']
  /**
   * Draws a placeholder where the page title will be. On by default; turn it
   * off for a page whose title you already know and can render for real.
   */
  title?: boolean
  /**
   * Draws a button-shaped placeholder in the header, for a page that has a
   * primary action.
   */
  primaryAction?: boolean
  /**
   * How many skeleton cards to stack in the body. Ignored when the default
   * slot is used.
   */
  cards?: number
}
