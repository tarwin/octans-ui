<script lang="ts" setup>
import { Labelled } from '@/components/Labelled'
import { computed, reactive } from 'vue'
import type { CalendarHeatmapProps, CalendarHeatmapSeries } from './types'

const props = withDefaults(defineProps<CalendarHeatmapProps>(), {
  // An empty grid is a better "no data yet" than a TypeError. Everything
  // downstream already copes: the range falls back to the last year ending
  // today, and zero active series draws every cell in `emptyColor`.
  data: () => [],
  series: () => [],
  weekStartsOn: 0,
  emptyColor: 'var(--octans-surface-sunken)',
  cellSize: 12,
  cellGap: 3,
  contiguousHover: true,
  cellRadius: 2,
  dividerColor: 'var(--octans-surface)',
  showMonths: true,
  monthLabels: 'all',
  monthSeparators: false,
  monthSeparatorColor: 'var(--octans-border-strong)',
  showWeekdays: true,
  showLegend: true,
  tooltip: true
})

const DAY_MS = 86400000
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]
const MONTH_NAMES_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

// Parse a `YYYY-MM-DD` string as a UTC midnight Date so all date maths is
// timezone-independent.
function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1))
}

function toKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function addDays(date: Date, n: number): Date {
  return new Date(date.getTime() + n * DAY_MS)
}

// Map of date string -> values object, merging the `value` shorthand into the
// first series' key.
const dataMap = computed(() => {
  const firstKey = props.series[0]?.key
  const map = new Map<string, Record<string, number>>()
  for (const point of props.data) {
    const values: Record<string, number> = { ...(point.values ?? {}) }
    if (point.value != null && firstKey && values[firstKey] == null) {
      values[firstKey] = point.value
    }
    map.set(point.date, values)
  }
  return map
})

// Largest value seen per series — used to derive thresholds when not supplied.
const seriesMax = computed(() => {
  const max: Record<string, number> = {}
  for (const series of props.series) max[series.key] = 0
  for (const values of dataMap.value.values()) {
    for (const series of props.series) {
      const v = values[series.key]
      if (typeof v === 'number' && v > max[series.key]) max[series.key] = v
    }
  }
  return max
})

function thresholdsFor(series: CalendarHeatmapSeries): number[] {
  if (series.thresholds?.length) return series.thresholds
  const max = seriesMax.value[series.key] || 0
  const steps = series.colors.length
  // colors.length - 1 evenly spaced boundaries up to max.
  return Array.from({ length: steps - 1 }, (_, i) =>
    Math.ceil((max * (i + 1)) / steps)
  )
}

function hasValue(
  series: CalendarHeatmapSeries,
  values?: Record<string, number>
): boolean {
  const v = values?.[series.key]
  return typeof v === 'number' && v > 0
}

// Series toggled off via the legend. The cell layout follows the count of the
// series that remain active, so hiding e.g. one of four switches quadrants to
// stripes.
const hiddenKeys = reactive(new Set<string>())
const activeSeries = computed(() =>
  props.series.filter((s) => !hiddenKeys.has(s.key))
)

function isHidden(key: string): boolean {
  return hiddenKeys.has(key)
}

function toggleSeries(key: string) {
  if (hiddenKeys.has(key)) hiddenKeys.delete(key)
  else hiddenKeys.add(key)
}

// Resolve the colour for a series given a day's values; `emptyColor` when the
// value is missing or non-positive.
function colorFor(
  series: CalendarHeatmapSeries,
  values?: Record<string, number>
): string {
  const v = values?.[series.key]
  if (typeof v !== 'number' || v <= 0) return props.emptyColor
  const thresholds = thresholdsFor(series)
  let i = 0
  while (i < thresholds.length && v > thresholds[i]) i++
  return series.colors[Math.min(i, series.colors.length - 1)]
}

const endDateObj = computed(() => {
  if (props.endDate) return parseDate(props.endDate)
  // Latest date present in the data, else today.
  let latest = ''
  for (const point of props.data) {
    if (point.date > latest) latest = point.date
  }
  if (latest) return parseDate(latest)
  const now = new Date()
  return parseDate(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  )
})

const startDateObj = computed(() =>
  props.startDate ? parseDate(props.startDate) : addDays(endDateObj.value, -364)
)

// The grid as an array of week-columns, each holding 7 day cells (top = the
// `weekStartsOn` day). Days outside [start, end] are flagged `inRange: false`.
const weeks = computed(() => {
  const start = startDateObj.value
  const end = endDateObj.value
  const weekEndDay = (props.weekStartsOn + 6) % 7

  let gStart = start
  while (gStart.getUTCDay() !== props.weekStartsOn) gStart = addDays(gStart, -1)
  let gEnd = end
  while (gEnd.getUTCDay() !== weekEndDay) gEnd = addDays(gEnd, 1)

  const result: Array<
    Array<{
      key: string
      date: Date
      inRange: boolean
      values?: Record<string, number>
    }>
  > = []
  let cur = gStart
  while (cur.getTime() <= gEnd.getTime()) {
    const col = []
    for (let r = 0; r < 7; r++) {
      const key = toKey(cur)
      col.push({
        key,
        date: cur,
        inRange:
          cur.getTime() >= start.getTime() && cur.getTime() <= end.getTime(),
        values: dataMap.value.get(key)
      })
      cur = addDays(cur, 1)
    }
    result.push(col)
  }
  return result
})

// Month label per week-column — set on the first week whose top day enters a
// new month.
// Stepped separator lines that hug the real month boundary. A month's first day
// can fall part-way down a week column, so the line runs down the right edge of
// that column for the days still in the previous month, steps across at the 1st,
// then continues down the left edge for the days in the new month. Drawn as an
// SVG overlay positioned over the cells.
const monthSeparatorLines = computed(() => {
  if (!props.monthSeparators) return null
  const cw = props.cellSize
  const g = props.cellGap
  const pitch = cw + g
  const cols = weeks.value.length
  const lastCol = cols - 1
  const H = 7 * cw + 6 * g
  const W = cols * pitch - g
  // Gap centres to the left / right of column `c`, and above row `r`.
  const xLeft = (c: number) => c * pitch - g / 2
  const xRight = (c: number) => c * pitch + cw + g / 2
  const yStep = (r: number) => r * pitch - g / 2

  const lines: string[] = []
  weeks.value.forEach((week, c) => {
    week.forEach((cell, r) => {
      if (cell.date.getUTCDate() !== 1) return
      const pts: Array<[number, number]> = []
      if (r === 0) {
        // Month starts at the top of the column — a straight line on its left.
        if (c === 0) return
        pts.push([xLeft(c), 0], [xLeft(c), H])
      } else {
        // Top segment on the right edge separates the previous month's days in
        // this column from the next column (omitted at the trailing edge).
        if (c < lastCol) pts.push([xRight(c), 0])
        pts.push([xRight(c), yStep(r)], [xLeft(c), yStep(r)], [xLeft(c), H])
      }
      lines.push(pts.map(([x, y]) => `${x},${y}`).join(' '))
    })
  })
  return { width: W, height: H, lines }
})

// Start / end month-year labels for the `range` display mode.
const rangeLabels = computed(() => {
  const fmt = (d: Date) =>
    `${MONTH_NAMES_FULL[d.getUTCMonth()]}, ${d.getUTCFullYear()}`
  return { start: fmt(startDateObj.value), end: fmt(endDateObj.value) }
})

const monthColumns = computed(() => {
  const labels = Array<string>(weeks.value.length).fill('')

  // Candidate column for each month change (the first week entering a month).
  const candidates: Array<{ col: number; name: string }> = []
  let prevMonth = -1
  weeks.value.forEach((week, col) => {
    const month = week[0].date.getUTCMonth()
    if (month !== prevMonth) {
      prevMonth = month
      candidates.push({ col, name: MONTH_NAMES[month] })
    }
  })

  // Drop labels that would sit too close together (the leading partial month is
  // the usual culprit). When two collide the later one wins, shifting the label
  // to where that month actually starts.
  const minGap = Math.max(2, Math.ceil(28 / (props.cellSize + props.cellGap)))
  const kept: Array<{ col: number; name: string }> = []
  for (const candidate of candidates) {
    const last = kept[kept.length - 1]
    if (last && candidate.col - last.col < minGap)
      kept[kept.length - 1] = candidate
    else kept.push(candidate)
  }

  for (const { col, name } of kept) labels[col] = name
  return labels
})

// Which weekday rows get a label — every other row (e.g. Mon/Wed/Fri for a
// Sunday start).
const weekdayLabels = computed(() =>
  Array.from({ length: 7 }, (_, row) =>
    row % 2 === 1 ? WEEKDAY_NAMES[(props.weekStartsOn + row) % 7] : ''
  )
)

const rootStyle = computed(() => ({
  '--hm-cell': `${props.cellSize}px`,
  '--hm-gap': `${props.cellGap}px`,
  '--hm-radius': `${props.cellRadius}px`,
  '--hm-sep': props.monthSeparatorColor
}))

// Contiguous mode replaces the flex gaps with a transparent border of half a
// gap on every cell, so hit areas tile edge to edge while the painted cell is
// unchanged. That shifts the painted grid down-right by half a gap inside its
// container, which the month / weekday labels and the separator overlay have to
// compensate for — hence one flag rather than styling the cell in isolation.
//
// Pointless when there is no gap to fill, and skipping it there keeps the
// simpler box model for the common `cell-gap="0"` case.
const contiguous = computed(() => props.contiguousHover && props.cellGap > 0)

type CellCtx = { inRange: boolean; values?: Record<string, number> }

// How a cell is drawn, by series count:
//   0–1 series ........ solid colour
//   2 series .......... diagonal split (or solid when only one has a value)
//   3 series .......... vertical stripes
//   4+ series ......... 2×2 quadrants (first four series)
function cellLayout(
  cell: CellCtx
): 'empty' | 'solid' | 'split' | 'stripes' | 'quadrants' {
  if (!cell.inRange) return 'empty'
  const series = activeSeries.value
  const n = series.length
  // No active series (all toggled off) still shows the empty-coloured grid.
  if (n <= 1) return 'solid'
  if (n === 2) {
    const both =
      hasValue(series[0], cell.values) && hasValue(series[1], cell.values)
    return both ? 'split' : 'solid'
  }
  if (n === 3) return 'stripes'
  return 'quadrants'
}

// Colour for the solid / split layouts. For two series where only one has a
// value, the present series fills the whole cell.
function cellSolidColor(cell: CellCtx): string {
  const series = activeSeries.value
  const s0 = series[0]
  if (!s0) return props.emptyColor
  const s1 = series[1]
  if (s1 && !hasValue(s0, cell.values) && hasValue(s1, cell.values)) {
    return colorFor(s1, cell.values)
  }
  return colorFor(s0, cell.values)
}

function cellStyle(cell: CellCtx): Record<string, string> {
  const layout = cellLayout(cell)
  if (layout === 'empty') return { background: 'transparent' }
  if (layout === 'split') {
    const series = activeSeries.value
    const c0 = colorFor(series[0], cell.values)
    const c1 = colorFor(series[1], cell.values)
    return {
      backgroundColor: c0,
      backgroundImage: `linear-gradient(to bottom right, ${c1} calc(50% - 1px), ${props.dividerColor}, transparent calc(50% + 1px))`
    }
  }
  // Stripes / quadrants paint via the inner segments wrapper (which holds the
  // divider-coloured background behind the 1px gaps).
  if (layout === 'stripes' || layout === 'quadrants') {
    return {}
  }
  return { backgroundColor: cellSolidColor(cell) }
}

// Segment colours for the stripes / quadrants layouts (empty for solid/split).
function cellColors(cell: CellCtx): string[] {
  const layout = cellLayout(cell)
  if (layout === 'stripes') {
    return activeSeries.value.slice(0, 3).map((s) => colorFor(s, cell.values))
  }
  if (layout === 'quadrants') {
    return activeSeries.value.slice(0, 4).map((s) => colorFor(s, cell.values))
  }
  return []
}

function cellTitle(cell: {
  key: string
  inRange: boolean
  values?: Record<string, number>
}): string | undefined {
  if (!props.tooltip || !cell.inRange) return undefined
  const series = activeSeries.value
  if (!series.length) return undefined
  const values: Record<string, number> = {}
  for (const s of series) {
    values[s.key] = cell.values?.[s.key] ?? 0
  }
  if (props.tooltipFormatter) {
    return props.tooltipFormatter({ date: cell.key, values })
  }
  // Single line — the CSS tooltip (data-ui-tooltip) renders the attribute text
  // as-is and does not break on newlines.
  const parts = series.map((s) => `${s.label ?? s.key}: ${values[s.key]}`)
  return `${cell.key} · ${parts.join(', ')}`
}

// Legend swatches for a series: emptyColor followed by the full ramp.
function legendSwatches(series: CalendarHeatmapSeries): string[] {
  return [props.emptyColor, ...series.colors]
}
</script>

<template>
  <Labelled
    :label="label"
    :error="error"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div
      :class="[
        'UIElement',
        $style.CalendarHeatmap,
        contiguous && $style.CalendarHeatmap__contiguous
      ]"
      :style="rootStyle"
    >
      <div :class="$style.CalendarHeatmap_grid">
        <div :class="$style.CalendarHeatmap_corner" />
        <div
          v-if="showMonths && monthLabels === 'range'"
          :class="[
            $style.CalendarHeatmap_months,
            $style.CalendarHeatmap_months__range
          ]"
        >
          <span :class="$style.CalendarHeatmap_rangeLabel">{{
            rangeLabels.start
          }}</span>
          <span :class="$style.CalendarHeatmap_rangeLabel">{{
            rangeLabels.end
          }}</span>
        </div>
        <div
          v-else-if="showMonths"
          :class="$style.CalendarHeatmap_months"
        >
          <div
            v-for="(month, w) in monthColumns"
            :key="w"
            :class="$style.CalendarHeatmap_month"
          >
            {{ month }}
          </div>
        </div>
        <div
          v-else
          :class="$style.CalendarHeatmap_months"
        />

        <div
          v-if="showWeekdays"
          :class="$style.CalendarHeatmap_weekdays"
        >
          <div
            v-for="(day, row) in weekdayLabels"
            :key="row"
            :class="$style.CalendarHeatmap_weekday"
          >
            {{ day }}
          </div>
        </div>
        <div
          v-else
          :class="$style.CalendarHeatmap_weekdays"
        />

        <div :class="$style.CalendarHeatmap_weeks">
          <svg
            v-if="monthSeparatorLines"
            :class="$style.CalendarHeatmap_separators"
            :width="monthSeparatorLines.width"
            :height="monthSeparatorLines.height"
            :viewBox="`0 0 ${monthSeparatorLines.width} ${monthSeparatorLines.height}`"
          >
            <polyline
              v-for="(pts, i) in monthSeparatorLines.lines"
              :key="i"
              :points="pts"
              fill="none"
              :stroke="monthSeparatorColor"
              stroke-width="1"
              shape-rendering="crispEdges"
            />
          </svg>
          <div
            v-for="(week, w) in weeks"
            :key="w"
            :class="$style.CalendarHeatmap_week"
          >
            <div
              v-for="cell in week"
              :key="cell.key"
              :class="[
                $style.CalendarHeatmap_cell,
                cell.inRange && $style.CalendarHeatmap_cell__interactive
              ]"
              :style="cellStyle(cell)"
              :data-ui-tooltip="cellTitle(cell)"
              :data-ui-tooltip-position="cellTitle(cell) ? 'top' : undefined"
            >
              <div
                v-if="cellColors(cell).length"
                :class="[
                  $style.CalendarHeatmap_segments,
                  cellLayout(cell) === 'stripes' &&
                    $style.CalendarHeatmap_segments__stripes,
                  cellLayout(cell) === 'quadrants' &&
                    $style.CalendarHeatmap_segments__quadrants
                ]"
                :style="{ background: dividerColor }"
              >
                <span
                  v-for="(color, i) in cellColors(cell)"
                  :key="i"
                  :class="$style.CalendarHeatmap_seg"
                  :style="{ background: color }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showLegend && series.length"
        :class="$style.CalendarHeatmap_legends"
      >
        <button
          v-for="entry in series"
          :key="entry.key"
          type="button"
          :class="[
            $style.CalendarHeatmap_legend,
            isHidden(entry.key) && $style.CalendarHeatmap_legend__off
          ]"
          :aria-pressed="!isHidden(entry.key)"
          :title="
            isHidden(entry.key)
              ? `Show ${entry.label ?? entry.key}`
              : `Hide ${entry.label ?? entry.key}`
          "
          @click="toggleSeries(entry.key)"
        >
          <span
            v-if="entry.label"
            :class="$style.CalendarHeatmap_legendLabel"
          >
            {{ entry.label }}
          </span>
          <span :class="$style.CalendarHeatmap_legendText">Less</span>
          <span
            v-for="(swatch, i) in legendSwatches(entry)"
            :key="i"
            :class="$style.CalendarHeatmap_legendSwatch"
            :style="{ backgroundColor: swatch }"
          />
          <span :class="$style.CalendarHeatmap_legendText">More</span>
        </button>
      </div>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.CalendarHeatmap {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  font-family: $defaultFontFamily;
}

.CalendarHeatmap_grid {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  column-gap: 4px;
  row-gap: 4px;
}

.CalendarHeatmap_corner {
  grid-column: 1;
  grid-row: 1;
}

.CalendarHeatmap_months {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  height: 12px;
}

.CalendarHeatmap_month {
  width: calc(var(--hm-cell) + var(--hm-gap));
  flex: 0 0 auto;
  font-size: 10px;
  line-height: 12px;
  color: $textSubduedColor;
  white-space: nowrap;
  overflow: visible;
}

.CalendarHeatmap_months__range {
  justify-content: space-between;
  height: auto;
}

.CalendarHeatmap_rangeLabel {
  font-size: 12px;
  line-height: 1.2;
  color: $textSubduedColor;
  white-space: nowrap;
}

.CalendarHeatmap_weekdays {
  grid-column: 1;
  grid-row: 2;
  display: flex;
  flex-direction: column;
  gap: var(--hm-gap);
  padding-right: 4px;
}

.CalendarHeatmap_weekday {
  height: var(--hm-cell);
  font-size: 10px;
  line-height: var(--hm-cell);
  color: $textSubduedColor;
  white-space: nowrap;
  text-align: right;
}

.CalendarHeatmap_weeks {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  display: flex;
  gap: var(--hm-gap);
}

// Stepped month-separator overlay; sits on top of the cells but lets pointer
// events (tooltips) pass through.
.CalendarHeatmap_separators {
  position: absolute;
  top: 0;
  left: 0;
  overflow: visible;
  pointer-events: none;
}

.CalendarHeatmap_week {
  display: flex;
  flex-direction: column;
  gap: var(--hm-gap);
}

.CalendarHeatmap_cell {
  position: relative;
  width: var(--hm-cell);
  height: var(--hm-cell);
  border-radius: var(--hm-radius);
}

.CalendarHeatmap_cell__interactive:hover {
  outline: 1px solid var(--hm-sep, var(--octans-border-strong));
  // Sit above neighbouring cells so the outline isn't clipped by them.
  z-index: 1;
}

// --- contiguous hover -----------------------------------------------------
// Each cell gains a transparent border of half a gap, and the flex gaps go to
// zero. The border box then measures one full pitch, so neighbouring hit areas
// meet exactly, while `background-clip: padding-box` keeps the *painted* cell
// at `--hm-cell` — visually identical to the gapped layout.
//
// `box-sizing` has to be overridden: the library sets `border-box` on
// everything under `.UIElement`, which would shrink the painted cell by the
// border instead of growing the hit area around it.
.CalendarHeatmap__contiguous {
  .CalendarHeatmap_weeks,
  .CalendarHeatmap_week {
    gap: 0;
  }

  .CalendarHeatmap_cell {
    box-sizing: content-box;
    border: calc(var(--hm-gap) / 2) solid transparent;
    background-clip: padding-box;
    // `border-radius` describes the border box, and the painted box is inset
    // from it by the border. Inflate the radius by that inset so the *visible*
    // corner still comes out at `--hm-radius`.
    border-radius: calc(var(--hm-radius) + var(--hm-gap) / 2);
  }

  // Sized to the painted box, so it takes the painted radius, not the cell's
  // inflated one — `inherit` would over-round it by half a gap.
  .CalendarHeatmap_segments {
    border-radius: var(--hm-radius);
  }

  // The outline is drawn around the border box, which is half a gap out from
  // the paint. Pull it back so hover still traces the visible cell.
  .CalendarHeatmap_cell__interactive:hover {
    outline-offset: calc(var(--hm-gap) / -2);
  }

  // The painted grid now starts half a gap in from the container's origin.
  // Everything positioned against that origin shifts to match, so the labels
  // and separators stay aligned to the cells rather than to the hit areas.
  .CalendarHeatmap_months {
    padding-left: calc(var(--hm-gap) / 2);
  }

  .CalendarHeatmap_weekdays {
    padding-top: calc(var(--hm-gap) / 2);
  }

  .CalendarHeatmap_separators {
    top: calc(var(--hm-gap) / 2);
    left: calc(var(--hm-gap) / 2);
  }
}

// Inner wrapper for the multi-series segments. It (not the cell) clips to the
// rounded corners, so the cell can keep its tooltip pseudo-elements unclipped.
.CalendarHeatmap_segments {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
}

// 3 series — equal vertical stripes.
.CalendarHeatmap_segments__stripes {
  display: flex;
  gap: 1px;
}

// 4 series — 2×2 quadrants.
.CalendarHeatmap_segments__quadrants {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1px;
}

.CalendarHeatmap_seg {
  flex: 1;
  min-width: 0;
}

.CalendarHeatmap_legends {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 16px;
  margin-top: 6px;
}

.CalendarHeatmap_legend {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin: 0;
  padding: 2px 4px;
  font-size: 10px;
  font-family: inherit;
  color: $textSubduedColor;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: var(--octans-surface-hover);
  }
  &:focus-visible {
    outline: 2px solid var(--octans-focus-ring);
    outline-offset: 1px;
  }
}

// Toggled off — dim the whole entry to show the series is hidden.
.CalendarHeatmap_legend__off {
  opacity: 0.4;

  .CalendarHeatmap_legendLabel {
    text-decoration: line-through;
  }
}

.CalendarHeatmap_legendLabel {
  margin-right: 4px;
  color: var(--octans-text);
}

.CalendarHeatmap_legendText {
  margin: 0 2px;
}

.CalendarHeatmap_legendSwatch {
  width: var(--hm-cell);
  height: var(--hm-cell);
  border-radius: var(--hm-radius);
}
</style>
