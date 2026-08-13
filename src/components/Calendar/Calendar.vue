<script lang="ts" setup>
import { Button } from '@/components/Button'
import { dayjs, pad } from '@/utils'
import type { Dayjs } from 'dayjs'
import { computed, ref, watch } from 'vue'
import type { CalendarCellType, CalendarProps } from './types'
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

const viewDate = ref<Dayjs>(dayjs())
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
  let date = viewDate.value.clone().startOf('month').startOf('week')
  const today = dayjs()
  for (let i = 0; i < 42; i++) {
    const isSamePeriod = date.isSame(viewDate.value, 'month')
    cells.push({
      value: date.format('YYYY-MM-DD'),
      label: date.format('D'),
      isSelected:
        isSamePeriod &&
        selectedDate.value &&
        date.isSame(selectedDate.value, 'day'),
      isCurrent: isSamePeriod && date.isSame(today, 'day'),
      isOtherPeriod: !isSamePeriod,
      isDisabled: props.disableDate && props.disableDate(date)
    })
    date = date.add(1, 'day')
  }
  const headers: string[] = []
  for (let i = 0; i < 7; i++) {
    headers.push(dayjs().weekday(i).format('ddd'))
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
      isDisabled: props.disableDate && props.disableDate(date)
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
      isDisabled: props.disableDate && props.disableDate(date)
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
        compare !== null &&
        (compare < props.minTime || compare > props.maxTime)
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
      date = dayjs().startOf('day')
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
        @click="select(cell)"
      >
        {{ cell.label }}
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
