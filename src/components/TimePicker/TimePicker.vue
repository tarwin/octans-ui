<script setup lang="ts">
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { Popper } from '@/components/Popper'
import { dayjs, pad } from '@/utils'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { TimePickerProps } from './types'

/**
 * **TimePicker** allows selecting a time value. On desktop it renders an
 * inline text input with keyboard support (type digits, use up/down arrows to
 * step the hour/minute, left/right to move between parts) and an AM/PM toggle.
 * On touch devices it falls back to the native `<input type="time">`.
 *
 * If you need to work with both dates and times, use
 * [DatePicker](/?path=/docs/components-forms-datepicker--docs) instead.
 */
const props = withDefaults(defineProps<TimePickerProps>(), {
  label: '',
  error: '',
  placeholder: '',
  prefixIcon: true,
  modelValue: '00:00:00',
  modelFormat: 'HH:mm:ss',
  minTime: '00:00',
  maxTime: '23:59',
  width: 'full',
  is24Hour: false,
  minuteStep: 15,
  minuteStepStrict: false,
  disabled: false,
  readonly: false,
  clearable: false,
  autoOpen: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const timeInput = useTemplateRef<HTMLInputElement>('timeInput')
const amButtonRef = useTemplateRef<HTMLButtonElement>('amButton')
const pmButtonRef = useTemplateRef<HTMLButtonElement>('pmButton')

const hour = ref(0)
const minute = ref(0)
const isEmpty = ref(false)
const isMobile = ref(false)

const isEditable = computed(() => !props.disabled && !props.readonly)

onMounted(() => {
  isMobile.value =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
})

const parseModelValue = (value: string | null | undefined) => {
  if (!value) {
    // No value: render an empty field rather than defaulting to 12:00 AM.
    isEmpty.value = true
    hour.value = 0
    minute.value = 0
    return
  }
  isEmpty.value = false
  const mDate = dayjs(value, props.modelFormat, true)
  if (mDate.isValid()) {
    hour.value = mDate.hour()
    minute.value = mDate.minute()
    return
  }
  // Fall back to a permissive split if the value doesn't match modelFormat.
  const [h = 0, m = 0] = value.split(':').map(Number)
  hour.value = isNaN(h) ? 0 : h
  minute.value = isNaN(m) ? 0 : m
}

// When editing begins on an empty field, seed it with a baseline value so the
// keyboard handlers have a populated `HH:MM` string to work with.
const ensurePopulated = () => {
  if (isEmpty.value) {
    isEmpty.value = false
    hour.value = 0
    minute.value = 0
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    parseModelValue(newValue)
  },
  { immediate: true }
)

const isAm = computed(() => hour.value < 12)

const formattedTime = computed(() => {
  let displayHour = hour.value
  if (!props.is24Hour) {
    if (hour.value === 0) {
      displayHour = 12 // 12 AM
    } else if (hour.value > 12) {
      displayHour = hour.value - 12 // PM hours
    }
  }
  const h = String(displayHour).padStart(2, '0')
  const m = String(minute.value).padStart(2, '0')
  return `${h}:${m}`
})

// What the text input actually shows: blank when the field is empty.
const displayValue = computed(() => (isEmpty.value ? '' : formattedTime.value))

// A format-mask hint shown when the field is empty and no explicit
// `placeholder` is provided. The AM/PM slot is rendered separately by the
// toggle (as `--`), so the input mask only covers the time itself.
const localizedPlaceholder = '--:--'

// 24 hour value (`HH:mm`) used by the native mobile input.
const nativeTimeValue = computed(() =>
  isEmpty.value ? '' : `${pad(hour.value)}:${pad(minute.value)}`
)

const errorMessage = computed(() => {
  // Don't validate range on an empty field.
  if (isEmpty.value) return props.error
  const current = `${pad(hour.value)}:${pad(minute.value)}`
  const min = props.minTime?.substring(0, 5)
  const max = props.maxTime?.substring(0, 5)
  if (min && current < min) {
    return `Must be on or after ${min}`
  }
  if (max && current > max) {
    return `Must be on or before ${max}`
  }
  return props.error
})

const emitUpdate = () => {
  const mDate = dayjs().hour(hour.value).minute(minute.value).second(0)
  emit('update:modelValue', mDate.format(props.modelFormat))
}

const clearValue = () => {
  if (!isEditable.value) return
  emit('update:modelValue', null)
}

const handleArrow = (
  event: KeyboardEvent,
  direction: 'up' | 'down' | 'left' | 'right'
) => {
  if (!timeInput.value || !isEditable.value) return

  const cursorPosition = timeInput.value.selectionStart ?? 0
  const selectionEnd = timeInput.value.selectionEnd ?? 0

  if (['left', 'right'].includes(direction)) {
    // no selection
    if (selectionEnd === cursorPosition) {
      // at end of input
      if (direction === 'right' && cursorPosition === 5) {
        if (!props.is24Hour) {
          const btn = isAm.value ? amButtonRef.value : pmButtonRef.value
          btn?.focus()
        }
      }
    }
    return
  }

  ensurePopulated()

  const directionStep = direction === 'up' ? 1 : -1

  if (cursorPosition <= 2) {
    // In hour part
    hour.value = (hour.value + directionStep + 24) % 24
  } else {
    // In minute part
    const oldMinute = minute.value
    if (event.shiftKey) {
      // Finely adjust by 1 when shift is held
      const newMinute = minute.value + directionStep
      minute.value = (newMinute + 60) % 60
      if (newMinute >= 60 || newMinute < 0) {
        hour.value = (hour.value + directionStep + 24) % 24
      }
    } else {
      // Snap to the closest minute chunk
      const step = props.minuteStep
      if (directionStep > 0) {
        // 'up'
        minute.value = (Math.floor(oldMinute / step) * step + step) % 60
        if (minute.value <= oldMinute) {
          // Wrapped around
          hour.value = (hour.value + 1 + 24) % 24
        }
      } else {
        // 'down'
        minute.value = (Math.ceil(oldMinute / step) * step - step + 60) % 60
        if (minute.value >= oldMinute) {
          // Wrapped around
          hour.value = (hour.value - 1 + 24) % 24
        }
      }
    }
  }
  emitUpdate()

  nextTick(() => {
    if (timeInput.value) {
      timeInput.value.setSelectionRange(cursorPosition, selectionEnd)
    }
  })
}

const handleLeftArrowFromAmPm = (event: KeyboardEvent) => {
  // set selection to end of input
  const inp = timeInput.value
  if (!inp) return
  inp.focus()
  inp.setSelectionRange(5, 5)
  event.preventDefault()
}

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!isEditable.value) {
    // Keep the displayed value in sync and bail.
    input.value = displayValue.value
    return
  }
  ensurePopulated()
  const cursorPosition = input.selectionStart ?? 0
  const typedChar = (event as InputEvent).data
  let nextCursorPosition = cursorPosition

  if (typedChar === ':' || typedChar === ' ') {
    // User typed a separator
    if (cursorPosition <= 3) {
      // If at the end of the hour part, advance to the start of the minute part
      nextCursorPosition = 3
    } else {
      nextCursorPosition = nextCursorPosition - 1
    }
    // Prevent the separator from being inserted and stop further processing.
    event.preventDefault()
  } else if (typedChar && /[0-9]/.test(typedChar)) {
    const num = parseInt(typedChar, 10)
    if (cursorPosition <= 2) {
      // Typing in hour part (pos 1 or 2)
      const displayHour = parseInt(formattedTime.value.substring(0, 2), 10)
      let newHourStr: string

      if (cursorPosition === 1 && num > (props.is24Hour ? 2 : 1)) {
        newHourStr = `0${num}`
        nextCursorPosition = 3
      } else {
        const currentHourChars = String(displayHour).padStart(2, '0')
        newHourStr =
          cursorPosition === 1
            ? `${num}${currentHourChars[1]}`
            : `${currentHourChars[0]}${num}`
      }
      let h = parseInt(newHourStr, 10)

      if (props.is24Hour) {
        hour.value = Math.min(h, 23)
      } else {
        h = Math.max(1, Math.min(h, 12))
        if (isAm.value) {
          hour.value = h === 12 ? 0 : h
        } else {
          hour.value = h === 12 ? 12 : h + 12
        }
      }
    } else {
      // Typing in minute part (pos 3, 4, or 5)
      const currentMinuteStr = String(minute.value).padStart(2, '0')
      let newMinuteStr: string
      if (cursorPosition <= 4) {
        // On the colon or first minute digit
        newMinuteStr = `${num}${currentMinuteStr[1]}`
        nextCursorPosition = 4
      } else {
        newMinuteStr = `${currentMinuteStr[0]}${num}`
      }
      minute.value = Math.min(parseInt(newMinuteStr, 10), 59)
    }
  } else if (
    typedChar &&
    !props.is24Hour &&
    ['a', 'p'].includes(typedChar.toLowerCase())
  ) {
    if (typedChar.toLowerCase() === 'a') {
      setAmPm('am')
    } else {
      setAmPm('pm')
    }
    nextCursorPosition = nextCursorPosition - 1
    // at end of input
    if (nextCursorPosition === 5) {
      nextTick(() => {
        const btn = isAm.value ? amButtonRef.value : pmButtonRef.value
        btn?.focus()
      })
    }
  }

  emitUpdate()

  // Restore the formatted value and cursor position.
  nextTick(() => {
    input.value = formattedTime.value
    input.setSelectionRange(nextCursorPosition, nextCursorPosition)
  })
}

const selectPart = () => {
  if (!timeInput.value) return
  const pos = timeInput.value.selectionStart ?? 0
  if (pos <= 2) {
    timeInput.value.setSelectionRange(0, 2)
  } else {
    timeInput.value.setSelectionRange(3, 5)
  }
}

// Snap the minute to the nearest `minuteStep` multiple, carrying into the hour
// when it rounds up to 60.
const snapMinuteToStep = () => {
  const step = props.minuteStep
  if (!step || step <= 0) return
  const snapped = Math.round(minute.value / step) * step
  if (snapped >= 60) {
    minute.value = snapped % 60
    hour.value = (hour.value + Math.floor(snapped / 60)) % 24
  } else {
    minute.value = snapped
  }
}

const handleBlur = () => {
  // Don't revive a cleared field on blur.
  if (isEmpty.value) return
  if (props.minuteStepStrict) {
    snapMinuteToStep()
  }
  emitUpdate()
}

const setAmPm = (val: 'am' | 'pm', focusOtherButton = false) => {
  if (!isEditable.value) return
  if (val === 'am' && !isAm.value) {
    hour.value -= 12
  } else if (val === 'pm' && isAm.value) {
    hour.value += 12
  }
  if (focusOtherButton) {
    nextTick(() => {
      if (val === 'am') {
        amButtonRef.value?.focus()
      } else {
        pmButtonRef.value?.focus()
      }
    })
  }
  emitUpdate()
}

// --- Dropdown selector (opened by clicking the clock icon) ----------------

// The hour shown in the 12 hour dropdown (1-12).
const displayHour12 = computed(() => {
  if (hour.value === 0) return 12
  if (hour.value > 12) return hour.value - 12
  return hour.value
})

const hourOptions = computed(() => {
  const minH = parseInt(props.minTime.substring(0, 2), 10)
  const maxH = parseInt(props.maxTime.substring(0, 2), 10)
  const options: { value: number; label: string; disabled: boolean }[] = []
  if (props.is24Hour) {
    for (let i = 0; i < 24; i++) {
      options.push({ value: i, label: pad(i), disabled: i < minH || i > maxH })
    }
  } else {
    for (let i = 1; i <= 12; i++) {
      options.push({ value: i, label: pad(i), disabled: false })
    }
  }
  return options
})

const minuteOptions = computed(() => {
  const step = props.minuteStep > 0 ? props.minuteStep : 1
  const values = new Set<number>()
  for (let i = 0; i < 60; i += step) values.add(i)
  // Always include the current minute so the select reflects an off-step value.
  values.add(minute.value)
  const min = props.minTime.substring(0, 5)
  const max = props.maxTime.substring(0, 5)
  return [...values]
    .sort((a, b) => a - b)
    .map((v) => {
      const compare = `${pad(hour.value)}:${pad(v)}`
      return {
        value: v,
        label: pad(v),
        disabled: compare < min || compare > max
      }
    })
})

const onSelectHour = (event: Event) => {
  ensurePopulated()
  const num = parseInt((event.target as HTMLSelectElement).value, 10)
  if (props.is24Hour) {
    hour.value = num
  } else if (isAm.value) {
    hour.value = num === 12 ? 0 : num
  } else {
    hour.value = num === 12 ? 12 : num + 12
  }
  emitUpdate()
}

const onSelectMinute = (event: Event) => {
  ensurePopulated()
  minute.value = parseInt((event.target as HTMLSelectElement).value, 10)
  emitUpdate()
}

const onSelectMeridiem = (event: Event) => {
  ensurePopulated()
  setAmPm((event.target as HTMLSelectElement).value as 'am' | 'pm')
}

const handleMobileInput = (event: Event) => {
  if (!isEditable.value) return
  const input = event.target as HTMLInputElement
  if (!input.value) {
    // Native time input was cleared.
    isEmpty.value = true
    emit('update:modelValue', null)
    return
  }
  isEmpty.value = false
  const [h = 0, m = 0] = input.value.split(':').map(Number)
  hour.value = isNaN(h) ? 0 : h
  minute.value = isNaN(m) ? 0 : m
  emitUpdate()
}
</script>

<template>
  <Labelled
    :label="label"
    :error="errorMessage"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
  >
    <div
      v-if="isMobile"
      :class="[
        $style.TimeInputWrapper,
        width === 'full' && $style.TimeInputWrapper__full,
        errorMessage && $style.hasError
      ]"
    >
      <div
        v-if="prefixIcon"
        :class="$style.PrefixIcon"
      >
        <Icon icon="mdi:clock-outline" />
      </div>
      <input
        type="time"
        :value="nativeTimeValue"
        :disabled="disabled"
        :readonly="readonly"
        :class="[$style.TimeInput, $style.NativeTimeInput]"
        @input="handleMobileInput"
        @blur="handleBlur"
      />
      <div
        v-if="clearable && isEditable"
        :class="[$style.ClearAction, isEmpty && $style.isHidden]"
        @click="clearValue"
      >
        <Icon icon="mdi:close-circle" />
      </div>
    </div>
    <div
      v-else
      :class="[
        $style.TimeInputWrapper,
        width === 'full' && $style.TimeInputWrapper__full,
        errorMessage && $style.hasError
      ]"
    >
      <Popper
        v-if="prefixIcon"
        placement="bottom-start"
        auto-trigger-toggle
        auto-hide
        :disabled="!isEditable"
        :z-index="2005"
      >
        <template #trigger>
          <div
            :class="[
              $style.PrefixIcon,
              isEditable && $style.PrefixIcon__clickable
            ]"
          >
            <Icon icon="mdi:clock-outline" />
          </div>
        </template>
        <div :class="$style.Dropdown">
          <select
            :class="$style.TimeSelect"
            :value="is24Hour ? hour : displayHour12"
            @change="onSelectHour"
          >
            <option
              v-for="opt in hourOptions"
              :key="opt.value"
              :value="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </option>
          </select>
          <select
            :class="$style.TimeSelect"
            :value="minute"
            @change="onSelectMinute"
          >
            <option
              v-for="opt in minuteOptions"
              :key="opt.value"
              :value="opt.value"
              :disabled="opt.disabled"
            >
              {{ opt.label }}
            </option>
          </select>
          <select
            v-if="!is24Hour"
            :class="$style.TimeSelect"
            :value="isAm ? 'am' : 'pm'"
            @change="onSelectMeridiem"
          >
            <option value="am">AM</option>
            <option value="pm">PM</option>
          </select>
        </div>
      </Popper>
      <input
        ref="timeInput"
        type="text"
        :value="displayValue"
        :placeholder="placeholder || localizedPlaceholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="$style.TimeInput"
        @input="handleInput"
        @keydown.up.prevent="handleArrow($event, 'up')"
        @keydown.down.prevent="handleArrow($event, 'down')"
        @keydown.right="handleArrow($event, 'right')"
        @keydown.left="handleArrow($event, 'left')"
        @click="selectPart"
        @blur="handleBlur"
      />

      <div
        v-if="!is24Hour"
        :class="[$style.AmPmToggle, $style.AmPmTogglePlain]"
      >
        <span
          v-if="isEmpty"
          :class="$style.AmPmPlaceholder"
        >
          --
        </span>
        <button
          v-if="!isEmpty && isAm"
          ref="amButton"
          type="button"
          :disabled="!isEditable"
          @keydown.up.prevent="setAmPm('pm', true)"
          @keydown.down.prevent="setAmPm('pm', true)"
          @keydown.p.prevent="setAmPm('pm', true)"
          @keydown.left="handleLeftArrowFromAmPm"
          @keydown.backspace="handleLeftArrowFromAmPm"
          @keydown.delete="handleLeftArrowFromAmPm"
          @click="setAmPm('pm')"
        >
          AM
        </button>
        <button
          v-if="!isEmpty && !isAm"
          ref="pmButton"
          type="button"
          :disabled="!isEditable"
          @keydown.up.prevent="setAmPm('am', true)"
          @keydown.down.prevent="setAmPm('am', true)"
          @keydown.a.prevent="setAmPm('am', true)"
          @keydown.left="handleLeftArrowFromAmPm"
          @keydown.backspace="handleLeftArrowFromAmPm"
          @keydown.delete="handleLeftArrowFromAmPm"
          @click="setAmPm('am')"
        >
          PM
        </button>
      </div>

      <div
        v-if="clearable && isEditable"
        :class="[$style.ClearAction, isEmpty && $style.isHidden]"
        @click="clearValue"
      >
        <Icon icon="mdi:close-circle" />
      </div>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

.TimeInputWrapper {
  display: inline-flex;
  align-items: center;
  border: 1px solid $inputBorderColor;
  border-radius: var(--octans-radius-field);
  padding: 0;
  background: var(--octans-surface);

  &:focus-within {
    border-color: $focusColor;
    box-shadow: 0 0 0 1px $focusColor;
  }

  &.hasError {
    border-color: $errorColor;

    &:focus-within {
      box-shadow: 0 0 0 1px $errorColor;
    }
  }

  &.TimeInputWrapper__full {
    display: flex;
    width: 100%;

    .TimeInput {
      flex: 1 1 auto;
      width: auto;
    }
  }
}

.TimeInput {
  // An `<input>` inherits neither font nor colour; `font-size` below still
  // wins, being the later declaration.
  font: inherit;
  font-size: 1rem;
  padding: 8px;
  border: none;
  /* Fits `HH:mm` plus the horizontal padding (box-sizing: border-box). */
  width: 4em;
  text-align: center;
  background: transparent;
  // Form controls inherit neither background nor colour. The wrapper carries
  // the surface, so this only needs the text — without it the digits stayed
  // the user agent's black over a dark field.
  color: var(--octans-text);

  &:focus {
    outline: none;
  }

  &:disabled {
    background: transparent;
    // Explicit, since an authored `color` opts out of the user agent's own
    // dimming of a disabled control.
    color: var(--octans-text-disabled);
    cursor: $inputDisabledCursor;
  }
}

.NativeTimeInput {
  width: 90px;
}

.AmPmToggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  border-left: 1px solid $inputBorderColor;

  &.AmPmTogglePlain {
    border-left: none;
  }

  button {
    font: inherit;
    border: none;
    background: transparent;
    // As with `.TimeInput` — a `<button>` starts from `buttontext`, not from
    // the surrounding text colour.
    color: var(--octans-text);
    cursor: pointer;
    font-size: 0.75rem;
    line-height: 1.4;
    padding: 0;

    &:disabled {
      color: var(--octans-text-disabled);
      cursor: $inputDisabledCursor;
    }
  }
}

.AmPmPlaceholder {
  font-size: 0.75rem;
  color: var(--octans-text-subdued);
}

.isHidden {
  visibility: hidden;
}

.PrefixIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px 0 8px;
  color: var(--octans-text-subdued);
}

.PrefixIcon__clickable {
  cursor: pointer;

  &:hover {
    color: var(--octans-text);
  }
}

.Dropdown {
  display: flex;
  gap: 8px;
  margin: 8px 0;
  padding: 12px;
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-field);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.TimeSelect {
  font: inherit;
  min-width: 50px;
  padding: 3px 10px;
  font-size: 16px;
  border: 1px solid $inputBorderColor;
  border-radius: var(--octans-radius-field);
  background: var(--octans-surface);
  // A `<select>` does not inherit `color` either. The `<option>` list it opens
  // is drawn by the OS and takes its cue from `color-scheme` instead, which
  // `tokens.scss` now sets per theme.
  color: var(--octans-text);
}

.ClearAction {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  color: var(--octans-text-subdued);

  &:hover {
    cursor: pointer;
    color: var(--octans-text);
  }
}
</style>
