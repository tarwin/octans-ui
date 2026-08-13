/**
 * A single colour ramp / metric shown on the heat map. Up to four series can
 * share one calendar, with each cell divided by series count: 2 → diagonal
 * split, 3 → vertical stripes, 4 → 2×2 quadrants.
 */
export interface CalendarHeatmapSeries {
  /**
   * Key used to look up this series' value in each data point's `values`.
   */
  key: string
  /**
   * Human-readable name shown in the legend and tooltip.
   */
  label?: string
  /**
   * The colour ramp from lowest to highest intensity, e.g.
   * `['#c6e48b', '#7bc96f', '#239a3b', '#196127']`.
   */
  colors: string[]
  /**
   * Bucket boundaries used to map a value to a colour. Should be one shorter
   * than `colors` — a value `<= thresholds[i]` uses `colors[i]`, anything above
   * the last threshold uses the last colour. When omitted, thresholds are
   * derived evenly from the maximum value in the data.
   */
  thresholds?: number[]
}

/**
 * One day of data.
 */
export interface CalendarHeatmapDataPoint {
  /**
   * The day this point represents, as `YYYY-MM-DD`.
   */
  date: string
  /**
   * Value per series, keyed by `CalendarHeatmapSeries.key`. Missing or `<= 0` values
   * render as empty.
   */
  values?: Record<string, number>
  /**
   * Convenience shorthand for single-series heat maps — used as the value for
   * the first series when `values` is not provided.
   */
  value?: number
}

export interface CalendarHeatmapProps {
  /**
   * Label to display above the heat map.
   */
  label?: string | false
  /**
   * Error text to show below the control.
   */
  error?: string | false | null
  /**
   * Help text to show below the control.
   */
  helpText?: string | false
  /**
   * Renders help text as raw HTML. Use with caution.
   */
  helpTextHtml?: string | false
  /**
   * Renders a help icon next to the label which links to an external page.
   */
  helpLink?: string | false
  /**
   * The data to plot, one entry per day.
   *
   * Defaults to empty, which draws the calendar grid in `emptyColor` — the
   * right thing to show while a fetch is in flight, and better than an error.
   */
  data?: CalendarHeatmapDataPoint[]
  /**
   * One to four colour ramps / metrics to display. Each cell is divided by the
   * number of series: 2 → diagonal split, 3 → vertical stripes, 4 → 2×2
   * quadrants. Beyond four, the first four are used.
   *
   * Defaults to empty, which draws an empty grid.
   */
  series?: CalendarHeatmapSeries[]
  /**
   * First day to show, as `YYYY-MM-DD`. Defaults to one year before `endDate`.
   */
  startDate?: string
  /**
   * Last day to show, as `YYYY-MM-DD`. Defaults to the latest date in `data`,
   * or today.
   */
  endDate?: string
  /**
   * Day the week starts on — `0` Sunday (default) through `6` Saturday.
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Colour used for days with no value.
   */
  emptyColor?: string
  /**
   * Width / height of each cell in px.
   */
  cellSize?: number
  /**
   * Gap between cells in px. Set to `0` for a solid grid with no gaps at all.
   */
  cellGap?: number
  /**
   * Whether each cell's hover / tooltip target extends halfway into the
   * surrounding gap, so the targets tile with no dead space between them.
   * Defaults to `true`.
   *
   * The cells still *look* the same — only the hit area grows. Without this,
   * dragging the pointer across the calendar makes the tooltip flicker off
   * every time it crosses a gap, which is the more annoying default.
   *
   * Has no effect when `cellGap` is `0`.
   */
  contiguousHover?: boolean
  /**
   * Corner radius of each cell in px.
   */
  cellRadius?: number
  /**
   * Colour of the thin divider line between the two triangles when two series
   * are shown.
   */
  dividerColor?: string
  /**
   * Show the month labels along the top.
   */
  showMonths?: boolean
  /**
   * How the top labels are displayed when `showMonths` is on.
   *
   * - `"all"` — a label above each month (default)
   * - `"range"` — only the start and end month / year, at each end
   */
  monthLabels?: 'all' | 'range'
  /**
   * Draw a thin vertical separator line between months.
   */
  monthSeparators?: boolean
  /**
   * Colour of the month separator lines.
   */
  monthSeparatorColor?: string
  /**
   * Show the weekday labels down the left.
   */
  showWeekdays?: boolean
  /**
   * Show the legend(s) below the grid.
   */
  showLegend?: boolean
  /**
   * Show a tooltip on each cell (via the global `data-ui-tooltip` style).
   */
  tooltip?: boolean
  /**
   * Build the tooltip text for a day. Receives the date and the resolved values
   * for every series.
   */
  tooltipFormatter?: (args: {
    date: string
    values: Record<string, number>
  }) => string
}
