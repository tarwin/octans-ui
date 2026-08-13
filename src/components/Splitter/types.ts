export type SplitterDirectionType = 'horizontal' | 'vertical'

/**
 * What the gutter draws by default.
 *
 * - `"line"` — a hairline down the middle of the gutter
 * - `"grip"` — the hairline plus a centred grab bar, for gutters people are
 *   meant to notice and reach for
 * - `"none"` — nothing at all, still draggable; for a gutter you are styling
 *   from the pane edges instead
 *
 * The `handle` slot replaces whichever of these is chosen.
 */
export type SplitterHandleType = 'line' | 'grip' | 'none'

/**
 * A pane size: a number of pixels, or any CSS length as a string.
 *
 * Pixels and percentages survive a drag — hand it `240` and it stays a number
 * of pixels, hand it `"30%"` and it keeps expressing itself as a percentage of
 * the container, so the layout stays responsive. Other units (`"20rem"`,
 * `"calc(…)"`, `"var(…)"`) work as a starting size, but the model emits pixels
 * once dragged: converting 500px back into rem means assuming a font size that
 * can change underneath us, and a wrong assumption is worse than a plain
 * number.
 *
 * The `resize` event always carries both units, whatever this is.
 */
export type SplitterSizeType = number | string

/** What `resize` reports, in both units, every time the split moves. */
export interface SplitterResizeType {
  /** The start pane's size along the split axis, in pixels. */
  px: number
  /** The same size as a percentage of the container, `0`–`100`. */
  percent: number
  /** Whether the start pane is currently collapsed. */
  collapsed: boolean
}

export interface SplitterProps {
  /**
   * The size of the START pane — the end pane takes whatever is left, so only
   * one of the two is ever stated. Two-way bindable with `v-model:size`.
   *
   * @default '50%'
   */
  size?: SplitterSizeType
  /**
   * Which way the panes sit.
   *
   * - `"horizontal"` — side by side, split by a vertical gutter (default)
   * - `"vertical"` — stacked, split by a horizontal gutter
   *
   * For three panes or more, nest a Splitter inside a pane of another. The
   * inner ratio then stays put when the outer one is dragged, which is what
   * you want for a sidebar beside a split editor.
   *
   * @default 'horizontal'
   */
  direction?: SplitterDirectionType
  /**
   * The smallest the start pane may be dragged to, as a number of pixels or a
   * CSS length. Applied as real CSS, so the browser resolves the unit and the
   * pane cannot render smaller than this even if the container shrinks.
   *
   * Percentages and absolute lengths both work. `calc()` is applied but not
   * understood by the drag clamp, so avoid it here.
   *
   * @default 0
   */
  min?: SplitterSizeType
  /**
   * The largest the start pane may be dragged to. Same units as `min`.
   *
   * @default the container, less the gutter
   */
  max?: SplitterSizeType
  /**
   * Stops the gutter being dragged or focused, and greys it out. The panes
   * hold their current sizes.
   */
  disabled?: boolean
  /**
   * Lets the start pane be shut completely by dragging past its minimum, by
   * pressing Enter on the gutter, or by binding `collapsed`.
   *
   * The gutter stays put and stays grabbable when the pane is shut, so there
   * is always something to pull it back out with.
   */
  collapsible?: boolean
  /**
   * Whether the start pane is currently shut. Two-way bindable with
   * `v-model:collapsed`. Only meaningful alongside `collapsible`.
   */
  collapsed?: boolean
  /**
   * How far past its minimum the gutter must be dragged before the pane snaps
   * shut, in pixels. Also how far it must be dragged back out to reopen.
   *
   * The gap exists so a pane with a `min` of 200 does not sit at 200 and then
   * vanish the moment the pointer crosses 199.
   *
   * @default 40
   */
  snap?: number
  /**
   * Reflows the panes only when the drag ends. While dragging, a line follows
   * the pointer to show where the split will land.
   *
   * For panes whose content is expensive to lay out — a wide DataTable, a
   * chart, an embedded map — where reflowing every frame stutters.
   */
  deferred?: boolean
  /**
   * Remembers the size and collapsed state under this key in `localStorage`,
   * and restores them on mount.
   *
   * Storage being unavailable (private browsing, a full quota, an embedded
   * context) is not treated as an error: the splitter works for this session
   * and forgets afterwards.
   */
  storageKey?: string
  /**
   * How far each arrow-key press moves the gutter, in pixels. Holding Shift
   * moves five times as far.
   *
   * Deliberately independent of `snapTo`: the keyboard is the precise
   * instrument, so a coarse drag grid does not have to make the arrows coarse
   * too. Set both to the same value where you want them to agree.
   *
   * @default 10
   */
  step?: number
  /**
   * Quantises DRAGGING to fixed increments — a number of pixels, or a
   * percentage of the container as a string. The gutter then lands only on
   * multiples of it.
   *
   * Unset, dragging is continuous. It does not affect the keyboard (see
   * `step`), nor `Home` and `End`, which go to the exact bounds, nor a
   * double-click reset, which goes to the exact `size` given.
   *
   * Not to be confused with `snap`, which is the distance a pane must be
   * dragged past its minimum before it shuts.
   */
  snapTo?: number | string
  /**
   * What the gutter draws when the `handle` slot is not used.
   *
   * @default 'line'
   */
  handle?: SplitterHandleType
  /**
   * How thick the grabbable band is, as a number of pixels or a CSS length.
   * The gutter still takes only its own width in the layout — this widens the
   * hit target over the panes on either side without moving anything.
   *
   * Worth raising for touch, where a nine-pixel target is a poor one. The cost
   * is that the pane content immediately either side of the gutter stops being
   * clickable, so do not overdo it next to interactive edges.
   *
   * @default the gutter's own width, i.e. no overhang
   */
  hitArea?: number | string
  /**
   * Whether double-clicking the gutter returns it to the `size` it was given
   * on mount, reopening the pane if it was shut.
   *
   * @default true
   */
  resetOnDoubleClick?: boolean
  /**
   * The accessible name of the gutter, which is a focusable control in its own
   * right. Name it after what it resizes — "Resize the sidebar" — wherever
   * more than one splitter shares a screen.
   *
   * @default 'Resize panes'
   */
  label?: string
}
