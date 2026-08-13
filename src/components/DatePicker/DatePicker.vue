<script lang="ts" setup>
import { Calendar } from '@/components/Calendar'
import { Icon } from '@/components/Icon'
import { Labelled } from '@/components/Labelled'
import { Popper } from '@/components/Popper'
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
  autoOpen: true
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
  >
    <Popper
      placement="bottom-start"
      ref="popper"
      auto-hide
      :auto-trigger-toggle="false"
      :zIndex="2005"
    >
      <template #trigger="{ show, hide }">
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
            @input="inputValue = ($event?.target as HTMLInputElement)?.value"
            @change="
              setFromInput(($event?.target as HTMLInputElement).value, hide)
            "
            @click="attemptShow(show)"
            @focus="attemptShow(show)"
            @keydown.enter="
              setFromInput(($event?.target as HTMLInputElement).value, hide)
            "
            @keydown.tab="hide"
            type="text"
          />
        </div>
      </template>
      <template #default="{ hide }">
        <div :class="$style.DatePicker_popper">
          <Calendar
            :type="type"
            :model-format="modelFormat"
            :modelValue="modelValue"
            :disable-date="disableDate"
            :min-time="minTime"
            :max-time="maxTime"
            @update:modelValue="setFromCalendar($event, hide)"
            @close="hide"
          />
        </div>
      </template>
    </Popper>
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
</style>
