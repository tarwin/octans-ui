<script lang="ts" setup>
import { Labelled } from '@/components/Labelled'
import { computed, onMounted, ref, watch } from 'vue'
import type { OtpInputProps } from './types'

const props = withDefaults(defineProps<OtpInputProps>(), {
  length: 4,
  separator: '-',
  modelValue: ''
})

// Total number of cells — derived from `groups` when provided, else `length`.
const cellCount = computed(() =>
  props.groups?.length
    ? props.groups.reduce((sum, n) => sum + n, 0)
    : props.length
)

// 0-based indices of cells that have a separator rendered after them.
const separatorAfter = computed(() => {
  const set = new Set<number>()
  if (props.groups?.length) {
    let acc = 0
    for (let g = 0; g < props.groups.length - 1; g++) {
      acc += props.groups[g]
      set.add(acc - 1)
    }
  }
  return set
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  /**
   * Fired when every cell is filled.
   */
  (e: 'complete', value: string): void
  (e: 'focus', event: FocusEvent, index: number): void
  (e: 'blur', event: FocusEvent, index: number): void
}>()

// One entry per cell. The source of truth while editing; `modelValue` is kept
// in sync via `commit()` / the `watch` below.
const tokens = ref<string[]>([])
const inputs = ref<(HTMLInputElement | null)[]>([])

function setInputRef(el: any, index: number) {
  inputs.value[index] = el as HTMLInputElement | null
}

// Pattern used to validate each typed/pasted character. `null` means "allow
// anything".
const allowPattern = computed<RegExp | null>(() => {
  if (props.integerOnly) return /[0-9]/
  if (props.allowedChars instanceof RegExp) return props.allowedChars
  if (typeof props.allowedChars === 'string' && props.allowedChars.length) {
    // Treat the string as an explicit set of characters.
    const escaped = props.allowedChars.replace(/[\\\]^-]/g, '\\$&')
    return new RegExp('[' + escaped + ']')
  }
  return null
})

function isAllowed(char: string): boolean {
  const pattern = allowPattern.value
  return pattern ? pattern.test(char) : true
}

// Force casing (if configured) before validation, so e.g. a lowercase keypress
// can satisfy an uppercase `allowedChars` set.
function transformChar(char: string): string {
  if (!char) return char
  if (props.casing === 'upper') return char.toUpperCase()
  if (props.casing === 'lower') return char.toLowerCase()
  return char
}

watch(
  [() => props.modelValue, () => cellCount.value, () => props.casing],
  () => {
    const chars = (props.modelValue ?? '').toString().split('')
    tokens.value = Array.from({ length: cellCount.value }, (_, i) =>
      transformChar(chars[i] ?? '')
    )
  },
  { immediate: true }
)

function commit() {
  const value = tokens.value.join('')
  emit('update:modelValue', value)
  if (value.length === cellCount.value && tokens.value.every((t) => t !== '')) {
    emit('complete', value)
  }
}

function focusCell(index: number) {
  const el = inputs.value[index]
  if (el) {
    el.focus()
    el.select?.()
  }
}

function onInput(event: Event, index: number) {
  const el = event.target as HTMLInputElement
  // Take the most recent character in case more than one slipped in.
  const char = transformChar(el.value.slice(-1))

  if (char && !isAllowed(char)) {
    // Reject — revert the displayed value to the stored token.
    el.value = tokens.value[index] ?? ''
    return
  }

  tokens.value[index] = char
  // Normalise the displayed value (e.g. when the browser kept extra chars).
  el.value = char
  commit()

  if (char && index < cellCount.value - 1) {
    focusCell(index + 1)
  }
}

function onKeydown(event: KeyboardEvent, index: number) {
  switch (event.key) {
    case 'Backspace':
      event.preventDefault()
      if (tokens.value[index]) {
        tokens.value[index] = ''
        commit()
      } else if (index > 0) {
        tokens.value[index - 1] = ''
        commit()
        focusCell(index - 1)
      }
      break
    case 'Delete':
      event.preventDefault()
      tokens.value[index] = ''
      commit()
      break
    case 'ArrowLeft':
      event.preventDefault()
      if (index > 0) focusCell(index - 1)
      break
    case 'ArrowRight':
      event.preventDefault()
      if (index < cellCount.value - 1) focusCell(index + 1)
      break
  }
}

function onPaste(event: ClipboardEvent, index: number) {
  event.preventDefault()
  if (props.readonly || props.disabled) return
  const text = event.clipboardData?.getData('text') ?? ''
  const chars = text.split('').map(transformChar).filter(isAllowed)
  if (!chars.length) return

  let cursor = index
  for (const char of chars) {
    if (cursor >= cellCount.value) break
    tokens.value[cursor] = char
    cursor++
  }
  commit()
  focusCell(Math.min(cursor, cellCount.value - 1))
}

function onFocus(event: FocusEvent, index: number) {
  ;(event.target as HTMLInputElement).select?.()
  emit('focus', event, index)
}

function onBlur(event: FocusEvent, index: number) {
  emit('blur', event, index)
}

function focus() {
  focusCell(0)
}

defineExpose({ focus })

onMounted(() => {
  if (props.autoFocus) focus()
})
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
        $style.OtpInput,
        disabled && $style.isDisabled,
        centered && $style.isCentered
      ]"
      role="group"
      :aria-label="label || undefined"
    >
      <template
        v-for="(token, index) in tokens"
        :key="index"
      >
        <input
          :ref="(el) => setInputRef(el, index)"
          :class="[
            $style.OtpInput_cell,
            error && $style.OtpInput_cell__hasError
          ]"
          :type="mask ? 'password' : 'text'"
          :value.prop="token"
          :disabled="disabled"
          :readonly="readonly"
          :inputmode="integerOnly ? 'numeric' : 'text'"
          :aria-label="`Character ${index + 1}`"
          maxlength="1"
          autocomplete="one-time-code"
          autocapitalize="off"
          spellcheck="false"
          @input="(e) => onInput(e, index)"
          @keydown="(e) => onKeydown(e, index)"
          @paste="(e) => onPaste(e, index)"
          @focus="(e) => onFocus(e, index)"
          @blur="(e) => onBlur(e, index)"
        />
        <span
          v-if="separatorAfter.has(index)"
          :class="$style.OtpInput_separator"
          aria-hidden="true"
          >{{ separator }}</span
        >
      </template>
    </div>
  </Labelled>
</template>

<style lang="scss" module>
@import '../../styles/variables';

$cellSize: 40px;
$shadowBorderFocus: 0 0 0 1px $focusColor;
$shadowBorderError: 0 0 0 1px $errorColor;

.OtpInput {
  display: flex;
  align-items: center;
  gap: $s2;
}

.isCentered {
  justify-content: center;
}

.OtpInput_separator {
  display: flex;
  align-items: center;
  align-self: stretch;
  color: $textSubduedColor;
  font-size: 18px;
  user-select: none;
}

.OtpInput_cell {
  width: $cellSize;
  height: $cellSize;
  padding: 0;
  text-align: center;
  font-size: 18px;
  font-family: var(--octans-font);

  background: var(--octans-surface);
  // Inputs do not inherit colour from the theme.
  color: var(--octans-text);
  border: 1px solid $inputBorderColor;
  border-radius: $inputBorderRadius;
  box-shadow: $inputShadowInner;

  &:focus {
    outline: none;
    z-index: 1;
    border-color: $focusColor;
    box-shadow: $inputShadowInner, $shadowBorderFocus;
  }

  &:disabled {
    background: $inputDisabledBgColor;
    cursor: $inputDisabledCursor;
  }

  &:read-only {
    background: $inputReadonlyBgColor;
    box-shadow: none;
    cursor: $inputReadonlyCursor;
  }
}

.OtpInput_cell__hasError {
  background: $inputErrorBgColor;
  border-color: $inputErrorBorderColor;

  &:focus {
    box-shadow: $inputShadowInner, $shadowBorderError;
  }
}
</style>
