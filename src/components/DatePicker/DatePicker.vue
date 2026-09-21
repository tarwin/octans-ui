<script lang="ts" setup>
import { Calendar } from '@/components/Calendar'
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { Popover } from '@/components/Popover'
import { dayjs } from '@/utils'
import { computed, ref, watch } from 'vue'
import type { DatePickerProps } from './types'

const props = withDefaults(defineProps<DatePickerProps>(), {
  disabled: false,
  readonly: false,
  type: 'date',
  modelFormat: 'YYYY-MM-DD HH:mm:ss',
  minTime: '00:00',
  maxTime: '23:59',
  clearable: false,
  autoOpen: true,
  sheet: 'mobile'
})

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | null): void
}>()

const inputValue = ref<string | null>()

const displayFormat = computed(() => {
  const type = props.type
  if (type === 'datetime') {
    return 'L LT'
  } else if (type === 'date') {
    return 'L'
  } else if (type === 'month') {
    return 'YYYY-MM'
  }
  return 'YYYY'
})

const usageFormat = computed(() => {
  return displayFormat.value
    .split(' ')
    .map((token) => {
      try {
        // seems like this can error in dayjs
        return dayjs.localeData().longDateFormat(token)
      } catch {
        return token
      }
    })
    .join(' ')
})

const errorMessage = computed(() => {
  if (inputValue.value) {
    const mDate = dayjs(inputValue.value, displayFormat.value, true)
    if (!mDate.isValid()) {
      return `Invalid date format, please use ${usageFormat.value}`
    }
  }
  return props.error
})

function setFromInput(text: string, hide: () => void) {
  const mDate = dayjs(text, displayFormat.value, true)
  if (mDate.isValid()) {
    const value = mDate.format(props.modelFormat)
    /**
     * Emitted when a value is selected.
     *
     * @event change
     * @property {string} value
     */
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', null)
  }
  hide()
}

function setFromCalendar(date: string, hide: () => void) {
  emit('update:modelValue', date)
  if (props.type !== 'datetime') {
    hide()
  }
}

function clearValue() {
  if (!props.readonly && !props.disabled) {
    emit('update:modelValue', null)
  }
}

function attemptShow(showFn: () => void, force = false) {
  if (!props.disabled && !props.readonly && (force || props.autoOpen)) {
    showFn()
  }
}

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      const formatted = dayjs(value, props.modelFormat, true).format(
        displayFormat.value
      )
      inputValue.value = formatted
    } else {
      inputValue.value = value
    }
  },
  { immediate: true }
)
</script>

<template>
  <Labelled
    :label="label"
    :error="errorMessage"
    :help-text="helpText"
    :help-text-html="helpTextHtml"
    :help-link="helpLink"
    :help-link-icon="helpLinkIcon"
    :help-link-tooltip="helpLinkTooltip"
    :required="required"
  >
    <!--
      Forwarded rather than left to the props alone: a label often needs a
      control beside it, and help text is often rich copy. Both are guarded,
      because `Labelled` prefers a slot that merely EXISTS over the matching
      prop — forwarding unconditionally would blank out `label` and
      `help-text` for every caller that uses them as props.
    -->
    <template
      v-if="$slots.label"
      #label="labelProps"
    >
      <slot
        name="label"
        v-bind="labelProps"
      ></slot>
    </template>
    <template
      v-if="$slots.helpText"
      #helpText
    >
      <slot name="helpText"></slot>
    </template>
    <Popover
      placement="bottom-start"
      ref="popper"
      auto-hide
      :auto-trigger-toggle="false"
      :zIndex="2005"
      :sheet="sheet"
    >
      <!--
        In the sheet form the field is a button in all but name: the sheet
        takes focus, so it opens on the tap (click) rather than on focus —
        focus comes BACK to the field when the sheet closes, and opening on
        it again would reopen the sheet at once — and `inputmode="none"`
        keeps the phone's keyboard down, since the calendar is the way in.
      -->
      <template #trigger="{ show, hide, sheet: inSheet }">
        <div :class="$style.DatePicker_inputWrapper">
          <div
            v-if="clearable"
            :class="[
              $style.DatePicker_clearAction,
              (readonly || disabled) && $style.DatePicker_clearActionDisabled
            ]"
            @click="clearValue"
          >
            <Icon icon="mdi:close-circle" />
          </div>
          <div
            v-if="!autoOpen"
            :class="[$style.DatePicker_openAction]"
            @click="attemptShow(show, true)"
          >
            <Icon icon="mdi:calendar-today" />
          </div>
          <input
            :class="[
              $style.DatePicker_input,
              errorMessage && $style.DatePicker_input__hasError
            ]"
            :value="inputValue"
            :placeholder="placeholder"
            :disabled="disabled"
            :readonly="readonly"
            :aria-required="required || undefined"
            :inputmode="inSheet ? 'none' : undefined"
            @input="inputValue = ($event?.target as HTMLInputElement)?.value"
            @change="
              setFromInput(($event?.target as HTMLInputElement).value, hide)
            "
            @click="attemptShow(show)"
            @focus="inSheet || attemptShow(show)"
            @keydown.enter="
              setFromInput(($event?.target as HTMLInputElement).value, hide)
            "
            @keydown.tab="hide"
            type="text"
          />
        </div>
      </template>
      <template #default="{ hide, sheet: inSheet }">
        <div
          :class="[
            $style.DatePicker_popper,
            inSheet && $style.DatePicker_popper__sheet
          ]"
        >
          <Calendar
            :type="type"
            :model-format="modelFormat"
            :modelValue="modelValue"
            :disable-date="disableDate"
            :min-time="minTime"
            :max-time="maxTime"
            :min-date="minDate"
            :max-date="maxDate"
            :week-starts-on="weekStartsOn"
            :markers="markers"
            :timezone="timezone"
            @update:modelValue="setFromCalendar($event, hide)"
            @close="hide"
          />
        </div>
      </template>
    </Popover>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';
@import '../../styles/mixins';

.DatePicker_inputWrapper {
  position: relative;
}

.DatePicker_clearAction {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $inputMinHeight;
  height: $inputMinHeight;
  color: var(--octans-text-subdued);

  &:hover {
    cursor: pointer;
    color: var(--octans-text);
  }
  &.DatePicker_clearActionDisabled {
    pointer-events: none !important;
  }
}

.DatePicker_openAction {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: $inputMinHeight;
  height: $inputMinHeight;
  color: var(--octans-text-subdued);

  &:hover {
    cursor: pointer;
    color: var(--octans-text);
  }

  .DatePicker_clearAction + & {
    right: 25px;
  }
}

.DatePicker_input {
  &:read-only {
    @include inputBaseReadonly;
  }
  &:disabled {
    @include inputBaseDisabled;
  }
  @include input;
}

.DatePicker_input__hasError {
  @include inputBaseError;

  &:focus {
    @include inputBaseErrorFocus;
  }
}

.DatePicker_popper {
  margin: 8px 0;
  padding: 16px;
  background: var(--octans-surface);
  border: 1px solid var(--octans-border);
  border-radius: var(--octans-radius-field);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

// In the sheet the surface, border and shadow are the sheet's own, and the
// calendar spreads to the full width so the day cells grow into thumb-sized
// targets instead of staying at their desktop 280px.
.DatePicker_popper__sheet {
  margin: 0;
  padding: 0;
  background: none;
  border: 0;
  box-shadow: none;

  > * {
    width: 100%;
    // Fills a phone. When the sheet is forced on a wider screen the calendar
    // is centred instead of stretching seven cells across the whole width.
    max-width: 420px;
    margin: 0 auto;
  }
}
</style>
