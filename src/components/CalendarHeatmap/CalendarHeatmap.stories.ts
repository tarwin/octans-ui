import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { CalendarHeatmapDataPoint } from './types'
import CalendarHeatmap from './CalendarHeatmap.vue'

const meta = {
  title: 'Components/Data Display/CalendarHeatmap',
  component: CalendarHeatmap,
  tags: ['autodocs']
} satisfies Meta<typeof CalendarHeatmap>

export default meta
type Story = StoryObj<typeof meta>

const END = '2026-06-30'
const END_MS = Date.UTC(2026, 5, 30)

// Generate `days` of patchy demo data ending at END — each key is 0 (empty) on
// roughly a third of days, otherwise a 1–100 value.
function gen(days: number, ...keys: string[]): CalendarHeatmapDataPoint[] {
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(END_MS - i * 86400000).toISOString().slice(0, 10),
    values: Object.fromEntries(
      keys.map((k, j) => [
        k,
        Math.sin(i * 1.3 + j * 2) > 0.2
          ? Math.round(Math.abs(Math.sin(i + j * 2)) * 99) + 1
          : 0
      ])
    )
  }))
}

const GREEN = ['#c6e48b', '#7bc96f', '#239a3b', '#196127']
const ORANGE = ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600']
const BLUE = ['#aacbee', '#6aa3dd', '#2f7bc6', '#0b4f8a']
const PURPLE = ['#d6bce8', '#b585d6', '#9450c0', '#6a2b96']

// `data` is the same shape in every example — one entry per day — so the docs
// source for each story references it as a variable instead of dumping the
// whole generated array.
const DATA_NOTE = `// data: [{ date: '2026-06-30', values: { commits: 9 } }, ...]`

// Override the "Show code" snippet so it focuses on the props that matter.
function source(code: string) {
  return { docs: { source: { code } } }
}

/**
  Pass `data` (one entry per day) and a single `series` describing the colour
  ramp. This example uses a one-month range.
 */
export const Default: Story = {
  args: {
    label: 'Contributions',
    data: gen(30, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    startDate: '2026-06-01',
    endDate: END
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Contributions"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  start-date="2026-06-01"
  end-date="2026-06-30"
/>`)
}

/**
  A full year of data, GitHub contribution style.
 */
export const Year: Story = {
  args: {
    label: 'Contributions',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Contributions"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
/>`)
}

/**
  Pass two entries in `series` to show two metrics on the same calendar. Each
  cell is split diagonally — the first series fills the cell (bottom-right) and
  the second overlays the top-left triangle. Here that is acquisitions against
  outbound loans on the same calendar.
 */
export const TwoSeries: Story = {
  args: {
    label: 'Collection activity',
    data: gen(365, 'acquisitions', 'loans'),
    series: [
      { key: 'acquisitions', label: 'Acquisitions', colors: GREEN },
      { key: 'loans', label: 'Loans out', colors: ORANGE }
    ],
    endDate: END,
    cellSize: 16
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { acquisitions: 12, loans: 4 } }, ...]
<CalendarHeatmap
  label="Collection activity"
  :data="data"
  :series="[
    { key: 'acquisitions', label: 'Acquisitions', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    { key: 'loans',        label: 'Loans out',    colors: ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600'] }
  ]"
  :cell-size="16"
/>`)
}

/**
  Three series render as equal vertical stripes within each cell.
 */
export const ThreeSeries: Story = {
  args: {
    label: 'Three metrics',
    data: gen(365, 'acquisitions', 'loans', 'tours'),
    series: [
      { key: 'acquisitions', label: 'Acquisitions', colors: GREEN },
      { key: 'loans', label: 'Loans out', colors: ORANGE },
      { key: 'tours', label: 'Guided tours', colors: BLUE }
    ],
    endDate: END,
    cellSize: 18
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { acquisitions: 12, loans: 4, tours: 8 } }, ...]
<CalendarHeatmap
  label="Three metrics"
  :data="data"
  :series="[
    { key: 'acquisitions', label: 'Acquisitions', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    { key: 'loans',        label: 'Loans out',    colors: ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600'] },
    { key: 'tours',        label: 'Guided tours', colors: ['#aacbee', '#6aa3dd', '#2f7bc6', '#0b4f8a'] }
  ]"
  :cell-size="18"
/>`)
}

/**
  Four series render as 2×2 quadrants (top-left, top-right, bottom-left,
  bottom-right in series order).
 */
export const FourSeries: Story = {
  args: {
    label: 'Four metrics',
    data: gen(365, 'acquisitions', 'loans', 'tours', 'conservation'),
    series: [
      { key: 'acquisitions', label: 'Acquisitions', colors: GREEN },
      { key: 'loans', label: 'Loans out', colors: ORANGE },
      { key: 'tours', label: 'Guided tours', colors: BLUE },
      { key: 'conservation', label: 'Conservation', colors: PURPLE }
    ],
    endDate: END,
    cellSize: 20
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { acquisitions: 12, loans: 4, tours: 8, conservation: 2 } }, ...]
<CalendarHeatmap
  label="Four metrics"
  :data="data"
  :series="[
    { key: 'acquisitions', label: 'Acquisitions', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    { key: 'loans',        label: 'Loans out',    colors: ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600'] },
    { key: 'tours',        label: 'Guided tours', colors: ['#aacbee', '#6aa3dd', '#2f7bc6', '#0b4f8a'] },
    { key: 'conservation', label: 'Conservation', colors: ['#d6bce8', '#b585d6', '#9450c0', '#6a2b96'] }
  ]"
  :cell-size="20"
/>`)
}

/**
  Supply explicit `thresholds` (one fewer than `colors`) to control the bucket
  boundaries instead of the auto-derived even split.
 */
export const CustomThresholds: Story = {
  args: {
    label: 'Visitors',
    data: gen(365, 'visitors'),
    series: [
      {
        key: 'visitors',
        label: 'Visitors',
        colors: GREEN,
        thresholds: [10, 40, 80]
      }
    ],
    endDate: END
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { visitors: 73 } }, ...]
<CalendarHeatmap
  label="Visitors"
  :data="data"
  :series="[{ key: 'visitors', label: 'Visitors', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'], thresholds: [10, 40, 80] }]"
/>`)
}

/**
  Customise the cell size, gap, radius, empty colour and where the week starts.
 */
export const Styling: Story = {
  args: {
    label: 'Monday start, larger cells',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    weekStartsOn: 1,
    cellSize: 18,
    cellGap: 4,
    cellRadius: 4,
    emptyColor: '#f0f1f3'
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Monday start, larger cells"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :week-starts-on="1"
  :cell-size="18"
  :cell-gap="4"
  :cell-radius="4"
  empty-color="#f0f1f3"
/>`)
}

/**
  Set `month-labels="range"` to show only the start and end month / year at each
  end, instead of a label above every month.
 */
export const RangeLabels: Story = {
  args: {
    label: 'Collection activity',
    data: gen(365, 'acquisitions', 'loans'),
    series: [
      { key: 'acquisitions', label: 'Acquisitions', colors: GREEN },
      { key: 'loans', label: 'Loans out', colors: ORANGE }
    ],
    endDate: END,
    monthLabels: 'range'
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { acquisitions: 12, loans: 4 } }, ...]
<CalendarHeatmap
  label="Collection activity"
  :data="data"
  :series="[
    { key: 'acquisitions', label: 'Acquisitions', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    { key: 'loans',        label: 'Loans out',    colors: ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600'] }
  ]"
  month-labels="range"
/>`)
}

/**
  Each cell's hover target extends halfway into the surrounding gap, so the
  targets tile with no dead space and dragging across the calendar never drops
  the tooltip. That is the default; `:contiguous-hover="false"` restores hit
  areas that stop at the painted edge.

  The exaggerated `cell-gap` here makes the difference easy to feel — hover
  along a row and watch the tooltip. Nothing about the drawn cells changes.
 */
export const ContiguousHover: Story = {
  args: {
    label: 'Contiguous hover (default) — try the gaps between cells',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    cellSize: 14,
    cellGap: 8
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Contiguous hover (default) — try the gaps between cells"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :cell-size="14"
  :cell-gap="8"
/>`)
}

/**
  The same calendar with `contiguous-hover` off. The cells look identical, but
  the gaps are now dead space.
 */
export const NoContiguousHover: Story = {
  args: {
    label: 'Hit areas stop at the painted edge',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    cellSize: 14,
    cellGap: 8,
    contiguousHover: false
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Hit areas stop at the painted edge"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :cell-size="14"
  :cell-gap="8"
  :contiguous-hover="false"
/>`)
}

/**
  `cell-gap="0"` removes the gaps entirely for a solid grid. `contiguous-hover`
  has nothing to do in this mode and is ignored.
 */
export const NoGap: Story = {
  args: {
    label: 'No gaps',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    cellGap: 0,
    cellRadius: 0
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="No gaps"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :cell-gap="0"
  :cell-radius="0"
/>`)
}

/**
  Set `month-separators` to draw a thin line between months. Customise its colour
  with `month-separator-color`.
 */
export const MonthSeparators: Story = {
  args: {
    label: 'Contributions',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    monthSeparators: true
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Contributions"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :month-separators="true"
/>`)
}

/**
  Limit the calendar to an explicit window with `start-date` / `end-date`.
 */
export const DateRange: Story = {
  args: {
    label: 'Q2 2026',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    startDate: '2026-04-01',
    endDate: '2026-06-30'
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Q2 2026"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  start-date="2026-04-01"
  end-date="2026-06-30"
/>`)
}

/**
  With two series, `divider-color` sets the thin line between the two triangles
  (defaults to white). Useful on a non-white background.
 */
export const CustomDivider: Story = {
  args: {
    label: 'Dark divider',
    data: gen(365, 'acquisitions', 'loans'),
    series: [
      { key: 'acquisitions', label: 'Acquisitions', colors: GREEN },
      { key: 'loans', label: 'Loans out', colors: ORANGE }
    ],
    endDate: END,
    cellSize: 16,
    dividerColor: '#212b36'
  },
  parameters:
    source(`// data: [{ date: '2026-06-30', values: { acquisitions: 12, loans: 4 } }, ...]
<CalendarHeatmap
  label="Dark divider"
  :data="data"
  :series="[
    { key: 'acquisitions', label: 'Acquisitions', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] },
    { key: 'loans',        label: 'Loans out',    colors: ['#ff9d5c', '#ff8b3d', '#ff781f', '#ff6600'] }
  ]"
  :cell-size="16"
  divider-color="#212b36"
/>`)
}

/**
  Hide the chrome with \`show-months\`, \`show-weekdays\` and \`show-legend\` set
  to \`false\` for a compact, grid-only heat map.
 */
export const Bare: Story = {
  args: {
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    showMonths: false,
    showWeekdays: false,
    showLegend: false
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :show-months="false"
  :show-weekdays="false"
  :show-legend="false"
/>`)
}

/**
  Customise the hover tooltip with \`tooltip-formatter\`, which receives the day
  and the resolved values for each series and returns the tooltip text.
 */
export const CustomTooltip: Story = {
  args: {
    label: 'Custom tooltip (hover a cell)',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    tooltipFormatter: ({
      date,
      values
    }: {
      date: string
      values: Record<string, number>
    }) =>
      `${values.commits} commit${values.commits === 1 ? '' : 's'} on ${date}`
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Custom tooltip (hover a cell)"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :tooltip-formatter="({ date, values }) =>
    \\\`\\\${values.commits} commit\\\${values.commits === 1 ? '' : 's'} on \\\${date}\\\`"
/>`)
}

/**
  Set \`tooltip\` to \`false\` to disable the native hover tooltips entirely.
 */
export const NoTooltip: Story = {
  args: {
    label: 'No tooltip',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END,
    tooltip: false
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="No tooltip"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
  :tooltip="false"
/>`)
}

/**
  The component is wrapped in \`Labelled\`, so it accepts \`label\`, \`help-text\`,
  \`help-link\` and \`error\` just like the form inputs.
 */
export const WithHelpAndError: Story = {
  args: {
    label: 'Contributions',
    helpText: 'Each cell is one day; darker means more activity.',
    helpLink: 'https://example.com/docs',
    error: 'Live sync failed — showing cached data',
    data: gen(365, 'commits'),
    series: [{ key: 'commits', label: 'Commits', colors: GREEN }],
    endDate: END
  },
  parameters: source(`${DATA_NOTE}
<CalendarHeatmap
  label="Contributions"
  help-text="Each cell is one day; darker means more activity."
  help-link="https://example.com/docs"
  error="Live sync failed — showing cached data"
  :data="data"
  :series="[{ key: 'commits', label: 'Commits', colors: ['#c6e48b', '#7bc96f', '#239a3b', '#196127'] }]"
/>`)
}
