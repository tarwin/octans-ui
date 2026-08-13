/**
 * How much room the divider keeps around itself.
 *
 * The scale is `Stack`'s, deliberately — a screen built from both should have
 * one rhythm, not two that nearly agree. Leaving it unset is the same 16px
 * `Stack` uses by default.
 */
export type DividerSpacingType =
  'none' | 'extraTight' | 'tight' | 'loose' | 'extraLoose'

/**
 * Where the label sits along the line.
 *
 * `left` and `right` keep a short run of line on the near side; `start` and
 * `end` put the label outside the line entirely, so it begins or ends the
 * divider.
 *
 * ```
 * start    Label ─────────────────────
 * left     ──── Label ────────────────
 * center   ───────── Label ───────────
 * right    ──────────────── Label ────
 * end      ───────────────────── Label
 * ```
 *
 * The row follows the writing direction, so under `dir="rtl"` every one of
 * these mirrors — `left` and `start` sit where reading begins, on the right.
 */
export type DividerPlacementType = 'start' | 'left' | 'center' | 'right' | 'end'

export interface DividerProps {
  /**
   * Draws the rule down instead of across, for separating things sitting side
   * by side. It takes the height of whatever it is stacked against — inside a
   * `Stack` that is the tallest item — and falls back to one line of text where
   * there is nothing to stretch to.
   *
   * @default false
   */
  vertical?: boolean
  /**
   * Room left on both sides of the line: above and below when horizontal,
   * left and right when vertical.
   *
   * Margins, not padding, so a divider between two elements that already have
   * their own spacing collapses into it rather than adding to it.
   *
   * @default undefined (16px)
   */
  spacing?: DividerSpacingType
  /**
   * Where the label sits, when there is one. Ignored without slot content,
   * since there is nothing to place.
   *
   * `'start'` and `'end'` drop the line on the label's near side altogether,
   * rather than leaving the short run `'left'` and `'right'` keep.
   *
   * @default 'center'
   */
  placement?: DividerPlacementType
  /**
   * Draws the line dashed. A shortcut for `--Divider-style`, which also takes
   * `dotted` or anything else `border-style` accepts.
   *
   * @default false
   */
  dashed?: boolean
  /**
   * Pulls the line out through its container's padding so it meets the edges —
   * what a divider inside a `CardSection` usually wants, since the card's own
   * section rules run edge to edge.
   *
   * `true` uses 16px, matching `CardSection`'s padding. A number is pixels and
   * a string is any CSS length, for containers padded differently.
   *
   * @default false
   */
  bleed?: boolean | number | string
}
