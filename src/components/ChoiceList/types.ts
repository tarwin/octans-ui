import type { VNode } from 'vue'

/**
 * How a `ChoiceList` draws its choices — one per line, or joined into a row of
 * segments. Both are the same radio group underneath.
 */
export type ChoiceListAppearanceType = 'list' | 'segmented'

/**
 * One choice in a `ChoiceList`.
 */
export interface ChoiceListOptionType {
  label: string
  value: any
  /**
   * Secondary text shown beneath the label, always visible.
   */
  helpText?: string
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string
  disabled?: boolean
  readonly?: boolean
  /**
   * Extra content revealed beneath this choice **only while it is selected** —
   * the follow-up question a choice opens up ("Other: ___", a date range once
   * "Scheduled" is picked). Not a description; that is `helpText`.
   *
   * A string, or a VNode for anything richer.
   */
  revealedContent?: string | VNode
}
