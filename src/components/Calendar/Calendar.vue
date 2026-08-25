<script lang="ts" setup>
import { Button } from '@/components/Button'
import { dayjs, inTimezone, pad } from '@/utils'
import type { Dayjs } from 'dayjs'
import { computed, ref, watch } from 'vue'
import type {
  CalendarCellType,
  CalendarMarkerType,
  CalendarProps
} from './types'
import { $t } from '@/utils/translate'

const props = withDefaults(defineProps<CalendarProps>(), {
  type: 'date',
  modelFormat: 'YYYY-MM-DD HH:mm:ss',
  minTime: '00:00',
  maxTime: '23:59'
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'close'): void
}>()

/** Today, in whatever zone the calendar has been told to think in. */
const today = computed(() => inTimezone(undefined, props.timezone))

/**
 * The week start, as a day number. The LOCALE decides it — `setLocale('fr')`
 * already moves the grid to Monday — and `weekStartsOn` is the per-instance
 * override for a calendar that has to disagree with the viewer.
 */
const weekStart = computed(
  () => props.weekStartsOn ?? dayjs.localeData().firstDayOfWeek()
)

const minDate = computed(() =>
  props.minDate == null ? null : dayjs(props.minDate as never).startOf('day')
)
const maxDate = computed(() =>
  props.maxDate == null ? null : dayjs(props.maxDate as never).endOf('day')
)

/**
 * Markers bucketed by the day they fall on, so a cell is one lookup rather
 * than a scan of the whole list per cell — 42 cells × every marker adds up on
 * a calendar of bookings.
 */
const markersByDay = computed(() => {
  const map = new Map<string, CalendarMarkerType[]>()
  for (const marker of props.markers ?? []) {
    const key = dayjs(marker.date as never).format('YYYY-MM-DD')
    const list = map.get(key)
    if (list) list.push(marker)
    else map.set(key, [marker])
  }
  return map
})

/**
 * `disableDate` and the range both apply — the range is the common case
 * expressed directly, not a replacement for the predicate.
 */
function isOutOfRange(date: Dayjs, unit: 'day' | 'month' | 'year' = 'day') {
  const min = minDate.value
  const max = maxDate.value
  // Compared at the cell's own granularity: a March cell is reachable if ANY
  // of March is, otherwise a `minDate` mid-month would hide the month you
  // have to click through to get to the days after it.
  if (min && date.endOf(unit).isBefore(min)) return true
  if (max && date.startOf(unit).isAfter(max)) return true
  return false
}

function isDisabled(date: Dayjs, unit: 'day' | 'month' | 'year' = 'day') {
  if (isOutOfRange(date, unit)) return true
  return !!props.disableDate && props.disableDate(date)
}

const viewDate = ref<Dayjs>(today.value)
const selectedDate = ref<Dayjs>()
const view = ref(props.type)

const viewData = computed<{
  cells: CalendarCellType[]
  cellMargin: number
  columns: number
  headers?: string[]
  title: string
}>(() => {
  if (view.value === 'date' || view.value === 'datetime') {
    return dateData.value
  } else if (view.value === 'month') {
    return monthData.value
  } else {
    return yearData.value
  }
})

const dateData = computed(() => {
  const cells: CalendarCellType[] = []
  // Wound back to `weekStart` by hand rather than with `startOf('week')`,
  // which reads the locale and so cannot honour the `weekStartsOn` override.
  const monthStart = viewDate.value.clone().startOf('month')
  let date = monthStart.subtract(
    (monthStart.day() - weekStart.value + 7) % 7,
    'day'
  )
  const now = today.value
  for (let i = 0; i < 42; i++) {
    const isSamePeriod = date.isSame(viewDate.value, 'month')
    const markers = markersByDay.value.get(date.format('YYYY-MM-DD'))
    cells.push({
      value: date.format('YYYY-MM-DD'),
      label: date.format('D'),
      isSelected:
        isSamePeriod &&
        selectedDate.value &&
        date.isSame(selectedDate.value, 'day'),
      isCurrent: isSamePeriod && date.isSame(now, 'day'),
      isOtherPeriod: !isSamePeriod,
      isDisabled: isDisabled(date),
      markers: isSamePeriod ? markers : undefined
    })
    date = date.add(1, 'day')
  }
  // Built off a known Sunday rather than `dayjs().weekday(i)`, which is itself
  // locale-relative and would fight the override.
  const sunday = dayjs('2024-01-07')
  const headers: string[] = []
  for (let i = 0; i < 7; i++) {
    headers.push(sunday.add((weekStart.value + i) % 7, 'day').format('ddd'))
  }
  return {
    cells,
    cellMargin: 0,
    columns: 7,
    headers,
    title: viewDate.value.format('MMMM YYYY')
  }
})

const monthData = computed(() => {
  const cells: CalendarCellType[] = []
  for (let i = 0; i < 12; i++) {
    const date = viewDate.value.clone().month(i).startOf('month')
    cells.push({
      value: date.format('YYYY-MM-DD'),
      label: date.format('MMM'),
      isSelected:
        selectedDate.value && date.isSame(selectedDate.value, 'month'),
      isDisabled: isDisabled(date, 'month')
    })
  }
  return {
    cells,
    cellMargin: 10,
    columns: 4,
    title: viewDate.value.format('YYYY')
  }
})

const yearData = computed(() => {
  const startYear = Math.floor(viewDate.value.year() / 10) * 10
  const cells: CalendarCellType[] = []
  for (let i = 0; i < 10; i++) {
    const date = dayjs(`${startYear + i}-01-01`)
    cells.push({
      value: date.format('YYYY-MM-DD'),
      label: date.format('YYYY'),
      isSelected: selectedDate.value && date.isSame(selectedDate.value, 'year'),
      isDisabled: isDisabled(date, 'year')
    })
  }
  const startDate = startYear + '-01-01'
  const endDate = startYear + 9 + '-01-01'
  const title =
    dayjs(startDate).format('YYYY') + ' — ' + dayjs(endDate).format('YYYY')
  return {
    cells,
    cellMargin: 10,
    columns: 4,
    title
  }
})

const selectedHour = computed(() => {
  return selectedDate.value?.hour()
})

const selectedMinute = computed(() => {
  return selectedDate.value?.minute()
})

const hours = computed(() => {
  const minParts = props.minTime.split(':')
  const maxParts = props.maxTime.split(':')
  const hours = []
  for (let i = 0; i < 24; i++) {
    const label = pad(i)
    hours.push({
      label,
      value: i,
      disabled: label < minParts[0] || label > maxParts[0]
    })
  }
  return hours
})

const minutes = computed(() => {
  const hour = selectedHour.value
  const minutes = []
  for (let i = 0; i < 60; i++) {
    const label = pad(i)
    // Midnight is hour 0, so the "is there an hour?" test has to be an
    // explicit undefined check. A falsiness test read 0 as "no hour" and fell
    // back to an empty string, and '' sorts before '00:00' — which disabled
    // every minute of the hour the calendar opens on by default.
    const compare = hour === undefined ? null : `${pad(hour)}:${label}`
    minutes.push({
      label,
      value: i,
      disabled:
        compare !== null && (compare < props.minTime || compare > props.maxTime)
    })
  }
  return minutes
})

function clampDate(date: Dayjs) {
  const minParts = props.minTime.split(':')
  const maxParts = props.maxTime.split(':')
  const compare = date.format('HH:mm')
  if (compare < props.minTime) {
    date = date.clone().set({
      hour: minParts[0],
      minute: minParts[1]
    })
  } else if (compare > props.maxTime) {
    date = date.clone().set({
      hour: maxParts[0],
      minute: maxParts[1]
    })
  }
  return date
}

function navigate(amount: number, isMinor: boolean) {
  let months = amount * 12
  if ((view.value === 'date' || view.value === 'datetime') && isMinor) {
    months = amount
  } else if (view.value === 'year') {
    months = amount * 120
  }
  viewDate.value = viewDate.value.clone().add(months, 'month')
}

function navigateType() {
  if (view.value === 'date' || view.value === 'datetime') {
    view.value = 'month'
  } else if (view.value === 'month') {
    view.value = 'year'
  }
}

function select(cell: CalendarCellType) {
  if (cell.isDisabled) {
    return
  }
  if (view.value === props.type) {
    // Update selected value
    updateValue(
      dayjs(cell.value).set({
        hour: selectedHour.value,
        minute: selectedMinute.value
      })
    )
  } else {
    // Change view
    viewDate.value = dayjs(cell.value)
    if (view.value === 'year') {
      view.value = 'month'
    } else if (view.value === 'month') {
      view.value = props.type
    }
  }
}

function selectTime(event: any, unit: 'hour' | 'minute') {
  const number = parseInt(event.target?.value || 0, 10)
  const date = selectedDate.value?.clone().set({
    hour: selectedHour.value,
    minute: selectedMinute.value,
    [unit]: number
  })
  if (date) {
    updateValue(date)
  }
}

function updateValue(date: Dayjs) {
  const value = clampDate(date.clone())
  if (props.type !== 'datetime') {
    value.startOf('day')
  }
  /**
   * Emitted when a value is selected.
   *
   * @event change
   * @property {string} value
   */
  emit('update:modelValue', value.format(props.modelFormat))
}

/**
 * The markers' tooltips, joined. `aria-hidden` on the dots plus a real `title`
 * here means the day is announced once, with its reason, rather than as a
 * number followed by three anonymous decorations.
 */
function markerTitle(cell: CalendarCellType) {
  const tooltips = (cell.markers ?? [])
    .map((marker) => marker.tooltip)
    .filter(Boolean)
  return tooltips.length ? tooltips.join(', ') : undefined
}

function close() {
  /**
   * Emitted when the user clicks the "close" button near the time picker.
   */
  emit('close')
}

watch(
  () => props.modelValue,
  (value) => {
    // TODO: not sure if this line is right...
    let date = dayjs(value).isValid() && dayjs(value, props.modelFormat, true)
    if (!date || !date.isValid()) {
      date = today.value.startOf('day')
    }
    const clamped = clampDate(date)
    viewDate.value = clamped.clone()
    selectedDate.value = clamped.clone()
  },
  { immediate: true }
)
</script>

<template>
  <div :class="['UIElement', $style.Calendar]">
    <div :class="$style.Nav">
      <Button
        :class="$style.NavButton"
        style="margin-right: 0px"
        type="link"
        icon="mdi:chevron-double-left"
        @click="navigate(-1, false)"
      />
      <Button
        v-if="view === 'date' || view === 'datetime'"
        :class="$style.NavButton"
        type="link"
        icon="mdi:chevron-left"
        @click="navigate(-1, true)"
      />
      <div
        :class="[
          $style.Nav_title,
          view !== 'year' && $style.Nav_title__canNavigate
        ]"
        @click="navigateType"
      >
        {{ viewData.title }}
      </div>
      <Button
        v-if="view === 'date' || view === 'datetime'"
        :class="$style.NavButton"
        type="link"
        icon="mdi:chevron-right"
        @click="navigate(1, true)"
      />
      <Button
        :class="$style.NavButton"
        style="margin-left: 0px"
        type="link"
        icon="mdi:chevron-double-right"
        @click="navigate(1, false)"
      />
    </div>
    <div
      :class="$style.Cells"
      :style="{
        '--columns': viewData.columns,
        '--cell-margin': viewData.cellMargin
      }"
    >
      <template v-if="viewData.headers">
        <div
          v-for="(text, index) in viewData.headers"
          :key="index"
          :class="$style.CellHeader"
        >
          {{ text }}
        </div>
      </template>
      <div
        v-for="cell in viewData.cells"
        :key="cell.value"
        :class="[
          $style.Cell,
          cell.isSelected && $style.Cell__selected,
          cell.isCurrent && $style.Cell__current,
          cell.isOtherPeriod && $style.Cell__otherPeriod,
          cell.isDisabled && $style.Cell__disabled
        ]"
        :title="markerTitle(cell)"
        @click="select(cell)"
      >
        {{ cell.label }}
        <span
          v-if="cell.markers?.length"
          :class="$style.Markers"
          aria-hidden="true"
        >
          <span
            v-for="(marker, index) in cell.markers.slice(0, 3)"
            :key="index"
            :class="$style.Marker"
            :style="{ background: marker.color || 'var(--octans-primary)' }"
          ></span>
        </span>
      </div>
    </div>
    <div
      v-if="type === 'datetime'"
      :class="$style.TimePicker"
    >
      <select
        :class="$style.TimeSelect"
        :value="selectedHour"
        @change="selectTime($event, 'hour')"
      >
        <option
          v-for="hour in hours"
          :key="hour.value"
          :value="hour.value"
          :disabled="hour.disabled"
        >
          {{ hour.label }}
        </option>
      </select>
      <select
        :class="$style.TimeSelect"
        :value="selectedMinute"
        @change="selectTime($event, 'minute')"
      >
        <option
          v-for="minute in minutes"
          :key="minute.value"
          :value="minute.value"
          :disabled="minute.disabled"
        >
          {{ minute.label }}
        </option>
      </select>
      <button
        :class="$style.ConfirmButton"
        @click="close"
      >
        {{ $t('ui.modal.close') }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$selectedColor: var(--octans-primary);
$subTextColor: var(--octans-text-subdued);
$hoverBgColor: var(--octans-surface-hover);

.Calendar {
  width: 280px;
}

// Dots sit UNDER the number, inside the cell's own box, so a marked day is
// the same size as an unmarked one and the grid stays a grid.
.Markers {
  position: absolute;
  bottom: 3px;
  left: 0;
  right: 0;
  display: flex;
  gap: 2px;
  justify-content: center;
  // Capped at three in the template — past that they stop being countable and
  // start being a smear.
  pointer-events: none;
}

.Marker {
  width: 4px;
  height: 4px;
  border-radius: var(--octans-radius-full);
}

.Nav {
  display: flex;
  align-items: center;
}
.Nav_title {
  flex: 1;
  margin: 0 10px;
  padding: 5px 0;
  border-radius: var(--octans-radius-field);
  color: var(--octans-text);
  font-weight: 600;
  text-align: center;
  cursor: default;
}
.Nav_title__canNavigate {
  cursor: pointer;
  border-radius: var(--octans-radius-field);
  &:hover {
    background: $hoverBgColor;
  }
}
.NavButton {
  color: var(--octans-text-subdued);
}

.Cells {
  display: flex;
  flex-wrap: wrap;
}

.Cell,
.CellHeader {
  position: relative;
  width: calc(100% / var(--columns));
  // margin-left: -1px;
  // margin-top: -1px;
  padding: 9px;
  border-radius: var(--octans-radius-field);
  color: var(--octans-text);
  font-weight: 500;
  text-align: center;
}

.Cell {
  margin: calc(var(--cell-margin) * 1px) 0px;

  &:hover {
    background: $hoverBgColor;
    cursor: pointer;
  }

  &.Cell__disabled {
    background: var(--octans-surface-sunken);
    color: var(--octans-text-disabled);
    cursor: not-allowed;
  }
}
.Cell__selected {
  background: $selectedColor;
  color: var(--octans-surface);

  &:hover {
    background: color-mix(in srgb, #{$selectedColor} 90%, black);
  }
}
.Cell__otherPeriod {
  color: $subTextColor;
  font-weight: 400;
}
.Cell__current {
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    display: block;
    width: 100%;
    height: 100%;
    border: 2px solid $focusColor;
    border-radius: var(--octans-radius-field);
  }

  &.Cell__disabled {
    color: $subTextColor;
    &::after {
      border-color: color-mix(in srgb, #{$subTextColor} 60%, transparent);
    }
  }
}

.CellHeader {
  color: var(--octans-text-subdued);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.TimePicker {
  display: flex;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--octans-surface-hover);
  font-size: 16px;
}

.TimeSelect {
  min-width: 50px;
  margin-right: 8px;
  padding: 3px 10px;
  font-size: 16px;
  border: none;
  border-radius: var(--octans-radius-field);
  background: $hoverBgColor;
}

.ConfirmButton {
  margin-left: auto;
  background: var(--octans-surface-hover);
  border: none;
  border-radius: var(--octans-radius-field);
  padding: 5px 10px;
  font-size: 16px;

  &:hover {
    background: var(--octans-border);
    cursor: pointer;
  }
}
</style>
